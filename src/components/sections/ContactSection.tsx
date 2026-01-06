import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";
import { ChatDialog } from "@/components/ChatDialog";
import { submitContactMessage } from "@/lib/db";
import { submitToGoogleSheets } from "@/lib/googleSheets";
import { toast } from "sonner";

const contactFormSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  subject: z.string().trim().min(1, { message: "Subject is required" }).max(200, { message: "Subject must be less than 200 characters" }),
  message: z.string().trim().min(10, { message: "Message must be at least 10 characters" }).max(1000, { message: "Message must be less than 1000 characters" }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export const ContactSection = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    // Primary: submit via adapter which will use Supabase/API/DB fallbacks.
    const adapterResult = await submitToGoogleSheets("CONTACT", {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });

    if (!adapterResult.success) {
      toast.error(adapterResult.error || "Failed to send message");
    } else {
      toast.success("Message sent successfully!");
      reset();
    }
    setIsSubmitting(false);
  };


  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["UBaDef Hall 3", "University of Bamenda", "Bambili, Cameroon"],
    },
    {
      icon: Phone,
      title: "Call/WhatsApp",
      details: ["+237 671 308 991", "Available during camp sessions"],
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["info.ubatechcamp@gmail.com", "Response within 24 hours"],
    },
    {
      icon: Clock,
      title: "Training Hours",
      details: ["Daily: 9:00 AM - 4:00 PM", "Weekend: Mini Projects", "Duration: 4 Weeks"],
    },
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", url: "#" },
    { icon: Linkedin, name: "LinkedIn", url: "#" },
  ];
  

  return (
    <section id="contact" className="relative py-20 px-4 bg-gradient-to-b from-background via-background/98 to-background overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
            Get In Touch
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Contact UBa Tech Camp
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Have questions about our programs? Need help with your application? 
            We're here to help you start your tech journey.
          </p>
          <div className="h-1 w-24 mx-auto mt-4 bg-gradient-to-r from-primary to-primary-glow rounded-full" />
        </motion.div>

        {/* Contact Form - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
            <Card className="max-w-4xl mx-auto bg-card/40 backdrop-blur-md border-primary/20 overflow-hidden">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-foreground">Send Us a Message</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you within 24 hours
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          {...register("name")}
                          className={`bg-background/50 border-primary/20 ${errors.name ? "border-destructive" : ""}`}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          {...register("email")}
                          className={`bg-background/50 border-primary/20 ${errors.email ? "border-destructive" : ""}`}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="What is this regarding?"
                        {...register("subject")}
                        className={`bg-background/50 border-primary/20 ${errors.subject ? "border-destructive" : ""}`}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        {...register("message")}
                        className={`bg-background/50 border-primary/20 ${errors.message ? "border-destructive" : ""}`}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      variant={isSubmitting ? "submitting" : "default"}
                      className={`w-full md:w-auto ${!isSubmitting ? "bg-gradient-to-r from-primary to-primary-glow hover:opacity-90" : ""}`}
                      disabled={isSubmitting}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
            </Card>
        </motion.div>

        <ChatDialog open={chatOpen} onOpenChange={setChatOpen} />
      </div>
    </section>
  );
};