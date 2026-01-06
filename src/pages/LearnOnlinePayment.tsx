import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { initiateMonetbilPayment } from "@/lib/monetbil";

const LearnOnlinePayment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    
    initiateMonetbilPayment({
      amount: 5000,
      itemRef: `learn-online-${Date.now()}`,
      onComplete: (data) => {
        setIsProcessing(false);
        if (data.status === "success") {
          toast({ title: "Payment Successful!", description: "Your access has been activated." });
          navigate("/learn-online/success");
        } else {
          toast({ title: "Payment Incomplete", description: "Please try again.", variant: "destructive" });
        }
      },
      onError: (error) => {
        setIsProcessing(false);
        toast({ title: "Payment Error", description: error?.message || "Something went wrong.", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Important Notice */}
          <Card className="mb-8 p-6 bg-card border-primary/20">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                About Learn Online Access
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                <strong className="text-primary">UBa Tech Camp training on-campus and through our free programmes remains completely free for everyone.</strong>
              </p>
              <p className="text-foreground/70 text-sm">
                Access to Learn Online requires a small token to maintain the platform and support the creation of high-quality digital learning resources.
              </p>
            </div>
          </Card>

          {/* Payment Card */}
          <Card className="p-8 glass-card">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Complete Your Payment
              </h1>
              <p className="text-foreground/70 mb-4">
                One-time access token for Learn Online
              </p>
              <div className="inline-block bg-primary/10 border border-primary/30 rounded-lg px-6 py-3">
                <p className="text-sm text-foreground/70">Amount</p>
                <p className="text-3xl font-bold text-primary">5,000 FRS</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Benefits */}
              <Card className="p-4 bg-muted/20 border-primary/20">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  What You Get:
                </h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Lifetime access to all online courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>High-quality video lessons and resources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Certificate upon course completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Support digital learning platform maintenance</span>
                  </li>
                </ul>
              </Card>

              <Button 
                onClick={handlePayment}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? "Opening Payment..." : "Pay 5,000 FRS with Mobile Money"}
              </Button>
              
              <p className="text-center text-sm text-foreground/60">
                Secure payment powered by Monetbil
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LearnOnlinePayment;
