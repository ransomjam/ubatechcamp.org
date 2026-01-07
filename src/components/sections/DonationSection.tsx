import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { submitDonation } from "@/lib/db";
import { CheckCircle } from "lucide-react";
import { DonationPaymentDialog } from "@/components/DonationPaymentDialog";

const donationReasons = [
  "Laptops for students",
  "Internet connection support",
  "Training materials",
  "General support",
  "Other"
];

export const DonationSection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [donationId, setDonationId] = useState<string>("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    donorType: "individual" as "individual" | "organisation",
    organisationName: "",
    amount: "",
    reason: "",
    otherReason: "",
    phoneNumber: ""
  });

  const handleInputChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.fullName.trim()) return toast.error("Please enter your full name");
    if (!formData.email.trim()) return toast.error("Please enter your email");
    if (!formData.amount.trim()) return toast.error("Please enter donation amount");
    if (!formData.reason) return toast.error("Please select a reason for donating");
    if (formData.reason === "Other" && !formData.otherReason.trim()) {
      return toast.error("Please specify your reason");
    }
    if (formData.donorType === "organisation" && !formData.organisationName.trim()) {
      return toast.error("Please enter your organisation name");
    }

    setIsSubmitting(true);
    
    const result = await submitDonation({
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      donorType: formData.donorType,
      organisationName: formData.organisationName.trim(),
      amount: formData.amount.trim(),
      reason: formData.reason,
      otherReason: formData.otherReason.trim(),
      paymentMethod: "MTN Mobile Money",
      phoneNumber: formData.phoneNumber.trim(),
    });

    if (result.error) {
      toast.error(result.error || "Failed to submit donation");
    } else {
      if (result.id) setDonationId(result.id);
      setShowPaymentDialog(true);
      toast.success("Donation details submitted! Continue to payment…");
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <section id="donate" className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-card rounded-2xl p-8 border border-primary/20 shadow-lg text-center">
            <div className="relative inline-block mb-6">
              <CheckCircle className="w-20 h-20 text-primary mx-auto animate-scale-in" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <CheckCircle className="w-20 h-20 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4 animate-fade-in">
              Thank you! Your support is transforming lives through technology.
            </h2>
            <p className="text-muted-foreground mb-6 animate-fade-in">
              A confirmation email with your receipt will be sent shortly.
            </p>
            <Button 
              onClick={() => { 
                setIsSuccess(false); 
                setShowForm(false); 
                setFormData({
                  fullName: "", email: "", donorType: "individual", organisationName: "",
                  amount: "", reason: "", otherReason: "", phoneNumber: ""
                }); 
              }}
              className="animate-fade-in"
            >
              Make Another Donation
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="donate" className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto max-w-4xl">
        {!showForm ? (
          <div className="text-center max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl p-8 md:p-12 border border-primary/20 shadow-lg">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Help Students Learn Without Limits
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Your support provides laptops, internet, and essential materials for students who are eager to grow.
              </p>
              <p className="text-base text-primary font-medium mb-8">
                A small gift today can change a future forever.
              </p>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg"
                onClick={() => setShowForm(true)}
              >
                Support a Student
              </Button>
            </div>
          </div>
        ) : (
          <Card className="bg-card border-primary/20 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">
                Make a Donation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                      className="bg-background/50 border-primary/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="bg-background/50 border-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <Label>Donor Type *</Label>
                  <RadioGroup
                    value={formData.donorType}
                    onValueChange={(v) => handleInputChange("donorType", v)}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual" className="cursor-pointer">Individual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="organisation" id="organisation" />
                      <Label htmlFor="organisation" className="cursor-pointer">Organisation</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.donorType === "organisation" && (
                  <div>
                    <Label htmlFor="organisationName">Organisation Name *</Label>
                    <Input
                      id="organisationName"
                      value={formData.organisationName}
                      onChange={(e) => handleInputChange("organisationName", e.target.value)}
                      className="bg-background/50 border-primary/20"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (XAF) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      placeholder="e.g., 5000"
                      required
                      className="bg-background/50 border-primary/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason for Donating *</Label>
                    <Select
                      value={formData.reason}
                      onValueChange={(v) => handleInputChange("reason", v)}
                    >
                      <SelectTrigger className="bg-background/50 border-primary/20">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-primary/20">
                        {donationReasons.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.reason === "Other" && (
                  <div>
                    <Label htmlFor="otherReason">Please specify *</Label>
                    <Textarea
                      id="otherReason"
                      value={formData.otherReason}
                      onChange={(e) => handleInputChange("otherReason", e.target.value)}
                      placeholder="Tell us more..."
                      className="bg-background/50 border-primary/20"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="phoneNumber">MTN Mobile Money Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="237 6xx xxx xxx"
                    className="bg-background/50 border-primary/20"
                  />
                  <p className="text-sm text-muted-foreground mt-1">You will receive a payment prompt on this number after submitting</p>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary-hover" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Continue to Payment"}
                  </Button>
                </div>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-6 border-t border-primary/10 pt-4">
                Every donation directly supports student access to laptops, internet and essential learning tools.
              </p>
            </CardContent>
          </Card>
        )}

        <DonationPaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          onSuccess={() => {
            setShowPaymentDialog(false);
            setIsSuccess(true);
          }}
          amount={formData.amount}
          donorName={formData.fullName}
          phoneNumber={formData.phoneNumber}
          donationId={donationId}
        />
      </div>
    </section>
  );
};
