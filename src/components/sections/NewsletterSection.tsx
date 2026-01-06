import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, Bell, Newspaper, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { submitNewsletterSubscription } from "@/lib/db";
import { submitToGoogleSheets } from "@/lib/googleSheets";
import { toast } from "sonner";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsPending(true);

    // Primary: submit via adapter which will use Supabase/API/DB fallbacks.
    const adapterResult = await submitToGoogleSheets("NEWSLETTER", { email });

    if (!adapterResult.success) {
      toast.error(adapterResult.error || "Subscription failed");
    } else {
      toast.success("Subscribed!");
      setIsSubscribed(true);
      setEmail("");
    }
    setIsPending(false);
  };

  const benefits = [
    "Weekly tech industry insights",
    "Early access to new programs",
    "Exclusive alumni success stories",
    "Career opportunities & job alerts",
    "Free resources & learning materials",
    "Community events & workshops",
  ];

  return (
    <section className="relative py-8 px-4 bg-gradient-to-b from-background to-background/95 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-primary/90 via-primary to-primary/80 backdrop-blur-md text-white border border-primary/20 overflow-hidden shadow-[0_0_40px_rgba(0,168,255,0.3)]">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <CardHeader className="text-center pb-8 relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <Badge
              className="mb-4 bg-white/20 text-white border border-white/30 backdrop-blur-sm"
            >
              Stay Connected
            </Badge>
            <CardTitle className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              Stay Connected
            </CardTitle>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get early access to opportunities, valuable insights, and updates about our programmes.
            </p>
          </CardHeader>

          <CardContent className="space-y-8 relative z-10">
            {/* Newsletter Form */}
            {!isSubscribed ? (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                />
                <Button
                  type="submit"
                  disabled={isPending}
                  variant={isPending ? "submitting" : "default"}
                  className={!isPending ? "bg-white text-primary hover:bg-white/90 font-semibold shadow-lg" : "font-semibold shadow-lg"}
                >
                  {isPending ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            ) : (
              <div className="text-center animate-fade-in">
                <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-300" />
                <h3 className="text-2xl font-bold mb-2">You're all set!</h3>
                <p className="text-white/90 text-lg">
                  Thank you for subscribing. You'll now receive our latest news
                  and tech updates.
                </p>
              </div>
            )}

            {/* Benefits Grid - Collapsible */}
            <Collapsible open={benefitsExpanded} onOpenChange={setBenefitsExpanded}>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                    <h4 className="text-xl font-semibold">What You'll Receive</h4>
                    {benefitsExpanded ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold flex items-center">
                        <Newspaper className="w-5 h-5 mr-2" />
                        What You'll Get
                      </h5>
                      <div className="space-y-3">
                        {benefits.slice(0, 3).map((benefit, index) => (
                          <div
                            key={index}
                            className="flex items-start text-white/90"
                          >
                            <CheckCircle className="w-5 h-5 mr-3 text-white flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold flex items-center">
                        <Bell className="w-5 h-5 mr-2" />
                        Exclusive Access
                      </h5>
                      <div className="space-y-3">
                        {benefits.slice(3).map((benefit, index) => (
                          <div
                            key={index}
                            className="flex items-start text-white/90"
                          >
                            <CheckCircle className="w-5 h-5 mr-3 text-white flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

          </CardContent>
        </Card>
        </motion.div>
      </div>
    </section>
  );
};
