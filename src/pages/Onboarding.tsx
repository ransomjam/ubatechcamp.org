import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { submitOnboardingForm } from "@/lib/db";
import { submitToGoogleSheets } from "@/lib/googleSheets";

type OnboardingPath = "current" | null;

interface FormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  document?: File;
  whatsappNumber?: string;
  currentProgram?: string;
  trainingStartDate?: string;
}

const programOptions = [
  "Data Analysis and Research",
  "Computer & MS Office Basics",
  "Software Engineering",
  "Web Development",
  "Data Analytics"
];

const Onboarding = () => {
  const [selectedPath, setSelectedPath] = useState<OnboardingPath>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
  });

  const handleInputChange = (field: keyof FormData, value: string | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    const submissionData = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      studentType: selectedPath as "current",
      whatsappNumber: formData.whatsappNumber,
      currentProgram: formData.currentProgram,
      trainingStartDate: formData.trainingStartDate,
    };

    // Primary: submit via adapter which will use Supabase/API/DB fallbacks.
    const formType = "ONBOARDING_CURRENT";
    const adapterResult = await submitToGoogleSheets(formType, submissionData);

    if (!adapterResult.success) {
      toast.error(adapterResult.error || "Failed to submit registration");
    } else {
      toast.success("Registration submitted successfully!");
      setIsSubmitted(true);
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setSelectedPath(null);
    setIsSubmitted(false);
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
              Student Onboarding
            </h1>
            <p className="text-foreground/80 text-sm md:text-base max-w-2xl mx-auto">
              Register to join our community and activate your access to training resources, 
              announcements, and eLearning services.
            </p>
          </div>

          {/* Path Selection Cards */}
          {!selectedPath && (
            <div className="flex justify-center mb-8">
              <Card 
                className="floating-card cursor-pointer border-2 hover:border-primary transition-all max-w-md"
                onClick={() => setSelectedPath("current")}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-primary">Current Students</CardTitle>
                  <CardDescription className="text-foreground/70">
                    For students currently undergoing training
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}


            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Current Student Registration</CardTitle>
                <CardDescription>
                  For students currently undergoing training. Complete this onboarding to receive 
                  class updates, resource links, and account activation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      value={formData.whatsappNumber || ""}
                      onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentProgram">Current Programme</Label>
                    <Select
                      value={formData.currentProgram || ""}
                      onValueChange={(v) => handleInputChange("currentProgram", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your programme" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-primary/20">
                        {programOptions.map((prog) => (
                          <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trainingStartDate">Training Start Date</Label>
                    <Input
                      id="trainingStartDate"
                      type="date"
                      value={formData.trainingStartDate || ""}
                      onChange={(e) => handleInputChange("trainingStartDate", e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" variant={isSubmitting ? "submitting" : "default"} className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Registration"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>Back</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {isSubmitted && (
            <Card className="border-2 border-primary">
              <CardContent className="py-12 text-center">
                <h2 className="text-2xl font-bold text-primary mb-4">Thank you for registering.</h2>
                <p className="text-foreground/80 text-base max-w-md mx-auto">
                  Your information has been received. We will review your details and contact you via email with the next steps shortly.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Bottom Notice */}
          {!isSubmitted && selectedPath && (
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                <strong>Account Activation Time:</strong> 24–48 hours<br />
                We will email you once everything is ready.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Onboarding;
