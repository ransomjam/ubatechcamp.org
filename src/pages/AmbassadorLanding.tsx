import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, UserPlus, LogIn, ArrowRight } from "lucide-react";
import logoImage from "@/assets/uba-tech-camp-logo-new.png";

const AmbassadorLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src={logoImage} 
              alt="UBa Tech Camp Logo"
              width="64"
              height="64"
              className="w-16 h-16 object-cover"
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4">
            UBa Tech Camp Ambassador Program
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our ambassador program and help spread tech education across Cameroon
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader className="text-center">
              <UserPlus className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Become an Ambassador</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                The UBa Tech Camp Ambassador Programme supports student engagement and onboarding
              </p>
              <Button asChild className="w-full bg-primary hover:bg-primary-hover">
                <Link to="/ambassador-apply" className="flex items-center justify-center">
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader className="text-center">
              <LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Ambassador Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Already an ambassador? Login to access your dashboard and track your progress.
              </p>
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                <Link to="/ambassador-portal" className="flex items-center justify-center">
                  Login to Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-primary mb-6">What Our Ambassadors Do</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Promote Programs</h3>
              <p className="text-sm text-muted-foreground">
                Help spread awareness about our tech training programs in your community
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Recruit Students</h3>
              <p className="text-sm text-muted-foreground">
                Connect with potential students and guide them through the registration process
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorLanding;