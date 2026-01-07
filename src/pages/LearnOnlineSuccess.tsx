import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";

const LearnOnlineSuccess = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Success Message */}
          <Card className="mb-8 p-8 glass-card max-w-3xl mx-auto text-center">
            <CheckCircle className="w-20 h-20 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              🎉 Thank you!
            </h1>
            <div className="space-y-4 text-foreground/80">
              <p className="text-xl">
                You now have access to Learn Online.
              </p>
              <p className="text-lg">
                Please <strong className="text-primary">sign up or sign in</strong> inside the embedded course section below and <strong className="text-primary">register for your preferred courses</strong>.
              </p>
              <p className="text-base text-foreground/70">
                Your access will be activated shortly.
              </p>
            </div>
          </Card>

          {/* Instructions */}
          <div className="max-w-3xl mx-auto mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Next Steps:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-card border-primary/20">
                <div className="text-3xl font-bold text-primary mb-2">1</div>
                <p className="text-sm text-foreground/80">
                  Sign in to the Odoo platform below
                </p>
              </Card>
              <Card className="p-4 bg-card border-primary/20">
                <div className="text-3xl font-bold text-primary mb-2">2</div>
                <p className="text-sm text-foreground/80">
                  Browse available courses
                </p>
              </Card>
              <Card className="p-4 bg-card border-primary/20">
                <div className="text-3xl font-bold text-primary mb-2">3</div>
                <p className="text-sm text-foreground/80">
                  Register and start learning
                </p>
              </Card>
            </div>
          </div>

          {/* Embedded Odoo Platform */}
          <div className="w-full mx-auto">
            <div className="relative w-full bg-card border border-border rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://edu-ubatechcamp.odoo.com/"
                title="UBa Tech Camp eLearning Platform"
                className="w-full h-[calc(5000vh-300px)] min-h-[600px]"
                style={{ border: 'none' }}
                loading="lazy"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>

            {/* Fallback Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-foreground/70 mb-3">
                If you cannot see the courses above, use the button below:
              </p>
              <Button 
                variant="outline" 
                asChild
                className="border-primary/30"
              >
                <a 
                  href="https://edu-ubatechcamp.odoo.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <span>Open Odoo in New Tab</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LearnOnlineSuccess;
