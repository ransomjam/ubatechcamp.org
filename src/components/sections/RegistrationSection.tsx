import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle, MessageCircle, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROGRAM_OPTIONS } from "@/lib/programs";
import { toast } from "sonner";
import { submitNewsletterSubscription } from "@/lib/db";
import { submitToGoogleSheets } from "@/lib/googleSheets";
import { api } from "@/lib/api";
import { generateInvoice } from "@/lib/invoice";
import { PAYMENT_CONFIG, formatAmount } from "@/lib/payment-config";

interface RegistrationSectionProps {
  initialProgram?: string;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({ initialProgram }) => {
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "University of Bamenda",
    institutionOther: "",
    schoolFaculty: "",
    fieldOfStudy: "",
    program: "",
    attendanceMode: "onCampus",
    recommendationCode: "",
    educationLevel: "Level 200"
  });

  useEffect(() => {
    if (initialProgram) {
      setFormData(prev => ({ ...prev, program: initialProgram }));
    }
  }, [initialProgram]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    // Open a blank window immediately to preserve the user gesture and avoid popup blockers.
    // We'll navigate it to the provider checkout URL once the backend returns it.
    const checkoutWindow = window.open('', '_blank');
    try {
      console.log('Registration submit: VITE_API_BASE_URL=', import.meta.env.VITE_API_BASE_URL);
      // 1) Create registration on server (status: pending_payment)
      const res = await api.createRegistration({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || "",
        program: formData.program || "",
        payment_plan: "default",
        education_level: formData.educationLevel || undefined,
        recommendation_code: formData.recommendationCode || undefined
      } as any);

      // Handle both standard success and 409 conflict (returned as object with id)
      const regId = res?.id || null;
      setRegistrationId(regId);

      // 2) Ask backend to create a FAPSHI payment and return checkout URL (amount: 100 XAF)
      const pay = await api.createFapshiPayment({ 
        registration_id: regId, 
        amount_cents: PAYMENT_CONFIG.REGISTRATION_FEE_XAF, 
        currency: "XAF", 
        phone: formData.phone || undefined,
        email: formData.email 
      });
      console.log('createFapshiPayment response:', pay);
      setPaymentId(pay.payment_id);

      // 3) Navigate the previously opened window (if available) to the checkout URL.
      try {
        if (checkoutWindow && !checkoutWindow.closed) {
          try {
            checkoutWindow.location.href = pay.checkout_url;
            toast.success("Checkout opened — complete payment to confirm registration.");
          } catch (navErr) {
            console.error('Failed to navigate checkout window', navErr);
            // fallback: open a new window/tab
            const fw = window.open(pay.checkout_url, "_blank");
            if (fw) toast.success("Checkout opened — complete payment to confirm registration.");
            else toast.error('Unable to open checkout window. Copy this URL and open manually: ' + pay.checkout_url);
          }
        } else {
          // popup was blocked early; try opening now (may still be blocked)
          const nw = window.open(pay.checkout_url, "_blank");
          if (nw) {
            toast.success("Checkout opened — complete payment to confirm registration.");
          } else {
             // If both failed, we must at least tell the user
             toast.error("Popup blocked! Please allow popups or click here to pay:", {
               action: {
                 label: "Open Payment",
                 onClick: () => window.open(pay.checkout_url, "_blank")
               },
               duration: 10000
             });
          }
        }
      } catch (err) {
        console.error('checkout open/navigation error', err);
      }

      // 4) Poll payment status (mock-friendly). timeout ~2 minutes
      setIsWaitingPayment(true);
      let attempts = 0;
      const maxAttempts = 60; // 60 * 2s = 120s
      const interval = setInterval(async () => {
        attempts += 1;
        try {
          const status = await api.getPaymentStatus(pay.payment_id);
          if (status.status === "succeeded") {
            console.log('Payment succeeded, switching to success phase');
            clearInterval(interval);
            setIsWaitingPayment(false);
            setPhase("success");
            toast.success("Payment confirmed — registration successful.");
            
            // still record to sheets in background for compatibility
            try {
              void submitToGoogleSheets("WAITLIST", {
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                institution: formData.institution === "Others" ? formData.institutionOther : formData.institution,
                school_faculty: formData.schoolFaculty,
                field_of_study: formData.fieldOfStudy,
                mode_of_attendance: formData.attendanceMode,
                program: formData.program,
                recommendation_code: formData.recommendationCode,
                education_level: formData.educationLevel,
              });
            } catch (sheetErr) {
              console.warn('Google Sheets background sync failed:', sheetErr);
            }
            setIsSubmitting(false);
          } else if (status.status === "failed") {
            clearInterval(interval);
            setIsWaitingPayment(false);
            setIsSubmitting(false);
            toast.error("Payment failed or was cancelled. Please try again.");
          } else {
            // still pending; continue polling
            if (attempts >= maxAttempts) {
              clearInterval(interval);
              setIsWaitingPayment(false);
              setIsSubmitting(false);
              toast.error("Payment not completed in time. Please retry.");
            }
          }
        } catch (err: any) {
          // ignore intermittent polling errors
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            setIsWaitingPayment(false);
            setIsSubmitting(false);
            toast.error("Unable to confirm payment. Please contact support.");
          }
        }
      }, 2000);
    } catch (err: any) {
      console.error("Registration/payment error", err);
      // Close the blank window if we haven't navigated it yet
      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.close();
      }
      
      // Handle CORS errors specifically
      if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
        toast.error("Connection error: Please check your internet connection or try again later. If the issue persists, contact support.");
      } else {
        toast.error(err?.message || "Failed to start registration/payment. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <section id="registration" className="relative py-8 px-4 bg-gradient-to-b from-background via-background/95 to-background overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Phase 1: Announcement */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
            Register Now
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Registrations Are Open
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            Complete the registration form below to secure your spot.
          </p>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-primary to-primary-glow rounded-full" />
        </div>

        {phase === "form" ? (
          /* Phase 2: Registration Form */
          <Card className="bg-card/40 backdrop-blur-md border-primary/20 overflow-hidden max-w-xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Registration Form
                </h3>
                <p className="text-muted-foreground">
                  Please provide your details to complete registration.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-foreground">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-1 bg-background/50 border-primary/20 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 bg-background/50 border-primary/20 focus:border-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label htmlFor="phone" className="text-foreground">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 bg-background/50 border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="institution" className="text-foreground">Institution</Label>
                    <Select value={formData.institution} onValueChange={(v) => setFormData({ ...formData, institution: v })}>
                      <SelectTrigger className="bg-background/50 border-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-primary/20">
                        <SelectItem value="University of Bamenda">University of Bamenda</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.institution === 'Others' && (
                      <Input
                        id="institutionOther"
                        type="text"
                        placeholder="Please specify institution"
                        value={formData.institutionOther}
                        onChange={(e) => setFormData({ ...formData, institutionOther: e.target.value })}
                        className="mt-2 bg-background/50 border-primary/20 focus:border-primary"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="schoolFaculty" className="text-foreground">School / Faculty</Label>
                      <Select value={formData.schoolFaculty} onValueChange={(v) => setFormData({ ...formData, schoolFaculty: v })}>
                        <SelectTrigger className="bg-background/50 border-primary/20">
                          <SelectValue placeholder="Select School / Faculty" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-primary/20">
                          <SelectItem value="Faculty of Arts">Faculty of Arts</SelectItem>
                          <SelectItem value="Faculty of Education">Faculty of Education</SelectItem>
                          <SelectItem value="Faculty of Science">Faculty of Science</SelectItem>
                          <SelectItem value="Faculty of Economics and Management Sciences">Faculty of Economics and Management Sciences</SelectItem>
                          <SelectItem value="Faculty of Law and Political Science">Faculty of Law and Political Science</SelectItem>
                          <SelectItem value="Faculty of Health Sciences">Faculty of Health Sciences</SelectItem>
                          <SelectItem value="Higher Teachers’ Training College (HTTC)">Higher Teachers’ Training College (HTTC)</SelectItem>
                          <SelectItem value="Higher Technical Teachers’ Training College (HTTTC)">Higher Technical Teachers’ Training College (HTTTC)</SelectItem>
                          <SelectItem value="National Higher Polytechnic Institute (NAHPI)">National Higher Polytechnic Institute (NAHPI)</SelectItem>
                          <SelectItem value="College of Technology (COLTECH)">College of Technology (COLTECH)</SelectItem>
                          <SelectItem value="Higher Institute of Commerce and Management (HICM)">Higher Institute of Commerce and Management (HICM)</SelectItem>
                          <SelectItem value="Higher Institute of Transport and Logistics (HITL)">Higher Institute of Transport and Logistics (HITL)</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-2">
                        <Label htmlFor="fieldOfStudy" className="text-foreground">Field of Study (Department)</Label>
                        <Input
                          id="fieldOfStudy"
                          type="text"
                          placeholder="Enter your department (e.g., Computer Science)"
                          value={formData.fieldOfStudy}
                          onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                          className="mt-1 bg-background/50 border-primary/20 focus:border-primary"
                        />
                      </div>
                  </div>
                </div>

                <div className="mt-2">
                  <Label htmlFor="program" className="text-foreground">Program of Interest</Label>
                  <Select value={formData.program} onValueChange={(v) => setFormData({ ...formData, program: v })}>
                    <SelectTrigger className="bg-background/50 border-primary/20">
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-primary/20">
                      {PROGRAM_OPTIONS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="educationLevel" className="text-foreground">Education Level</Label>
                    <Select value={formData.educationLevel} onValueChange={(v) => setFormData({ ...formData, educationLevel: v })}>
                      <SelectTrigger className="bg-background/50 border-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-primary/20">
                        <SelectItem value="Level 200">Level 200</SelectItem>
                        <SelectItem value="Level 300">Level 300</SelectItem>
                        <SelectItem value="Level 400">Level 400</SelectItem>
                        <SelectItem value="Level 500">Level 500</SelectItem>
                        <SelectItem value="Level 600">Level 600</SelectItem>
                        <SelectItem value="Level 700">Level 700</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="attendanceMode" className="text-foreground">Preferred Attendance Mode</Label>
                    <Select value={formData.attendanceMode} onValueChange={(v) => setFormData({ ...formData, attendanceMode: v })}>
                      <SelectTrigger className="bg-background/50 border-primary/20">
                        <SelectValue placeholder="Select attendance mode" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-primary/20">
                        <SelectItem value="onCampus">On Campus</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-2">
                  <Label htmlFor="recommendationCode" className="text-foreground">Recommendation Code</Label>
                  <Input
                    id="recommendationCode"
                    type="text"
                    placeholder="Enter recommendation code (Optional)"
                    value={formData.recommendationCode}
                    onChange={(e) => setFormData({ ...formData, recommendationCode: e.target.value })}
                    className="mt-1 bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>

                {/* duplicate education level removed */}
                <div className="text-sm text-muted-foreground mb-2">Registration fee: <span className="font-semibold text-foreground">{formatAmount(PAYMENT_CONFIG.REGISTRATION_FEE_XAF)} XAF</span> — you'll be redirected to secure checkout to complete payment.</div>
                <Button 
                  type="submit" 
                  variant={isSubmitting ? "submitting" : "default"}
                  className="w-full text-primary-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Register"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Phase 3 & 4: Success + WhatsApp */
          <Card className="bg-card/40 backdrop-blur-md border-primary/20 overflow-hidden max-w-xl mx-auto">
            <CardContent className="p-8 text-center">
              {/* Phase 3: Success Message */}
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Registration Successful
                </h3>
                <p className="text-muted-foreground mb-6">
                  Important Steps: Download your Payment Receipt and Join the WhatsApp group for program updates.
                </p>
                <Button 
                  onClick={() => generateInvoice({
                    fullName: formData.fullName,
                    email: formData.email,
                    program: formData.program,
                    amount: PAYMENT_CONFIG.REGISTRATION_FEE_XAF,
                    transId: paymentId || 'N/A',
                    date: new Date().toLocaleDateString()
                  })}
                  className="bg-primary hover:bg-primary/90 text-white font-bold"
                >
                  Download Receipt
                </Button>
              </div>

              {/* Phase 4: WhatsApp Engagement */}
              <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex flex-col items-center gap-2 mb-4">
                  <span className="font-semibold text-foreground">Join WhatsApp group for program updates.</span>
                </div>
                <a
                  href="https://chat.whatsapp.com/BmeER1UQhIsISliCYaPXLl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto">
                    {/* Real WhatsApp SVG Icon */}
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-5 h-5 mr-2 fill-current" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.048c0 2.12.553 4.189 1.603 6.002L0 24l6.163-1.617a11.831 11.831 0 005.883 1.565h.005c6.637 0 12.048-5.413 12.051-12.049a11.83 11.83 0 00-3.65-8.528"/>
                    </svg>
                    Join Now
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};
