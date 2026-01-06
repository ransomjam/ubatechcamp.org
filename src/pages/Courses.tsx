import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Courses = () => {
  const navigate = useNavigate();
  
  // TODO: Replace with actual auth check from backend
  const isAuthenticated = false; // Mock auth state
  const hasPaidAccess = false; // Mock payment state

  useEffect(() => {
    // Redirect logic based on auth and payment status
    if (!isAuthenticated) {
      navigate("/learn-online/auth");
    } else if (!hasPaidAccess) {
      navigate("/learn-online/payment");
    }
  }, [isAuthenticated, hasPaidAccess, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Access Required Notice */}
          <Card className="p-8 glass-card text-center">
            <Lock className="w-20 h-20 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Learn Online Access Required
            </h1>
            <p className="text-lg text-foreground/80 mb-6">
              Please sign in or create an account to access our online learning platform.
            </p>
            <Button 
              onClick={() => navigate("/learn-online/auth")}
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
              size="lg"
            >
              Sign In / Sign Up
            </Button>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
