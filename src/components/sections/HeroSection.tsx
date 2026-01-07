import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, ArrowRight, Clock } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useNetwork } from "@/hooks/use-network";
import heroImage from "@/assets/hero.png";
import logoImage from "@/assets/uba-tech-camp-logo-new.png";
import endOfTrainingImage from "@/assets/newphotos/End of training.png";
import engrJamImage from "@/assets/newphotos/Engr Jam.png";
import practicalSessionsImage from "@/assets/newphotos/Practical sessions.png";
import techTalkExpImage from "@/assets/newphotos/Tech Talk experience.png";
import techTalkImage from "@/assets/newphotos/Tech Talk.png";
import panelFonImage from "@/assets/newphotos/panel with Mr Fon.png";
import moderatorKateImage from "@/assets/newphotos/Moderator Mrs Kate.png";
import practicalsImage from "@/assets/newphotos/practicals.jpg";

const galleryImages = [
  practicalSessionsImage,
  practicalsImage,
  endOfTrainingImage,
];

export const HeroSection = () => {
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const { isSlow } = useNetwork();
  const fullText = "█ WELCOME TO UBaTECH CAMP █";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, isSlow ? 6000 : 3000);
    return () => clearInterval(interval);
  }, [isSlow]);

  useEffect(() => {
    if (isSlow) {
      setTypedText(fullText);
      return;
    }

    let currentIndex = 0;
    let typingInterval: NodeJS.Timeout;
    let pauseTimeout: NodeJS.Timeout;

    const startTyping = () => {
      currentIndex = 0;
      setTypedText("");
      
      typingInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setTypedText(fullText.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          // Pause for 2 seconds, then restart
          pauseTimeout = setTimeout(() => {
            startTyping();
          }, 2000);
        }
      }, 5000);
    };

    startTyping();

    // Cursor blink animation
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
      clearTimeout(pauseTimeout);
    };
  }, [isSlow]);

  const scrollToRegistration = () => {
    setShowAboutDialog(false);
    const registrationSection =
      document.querySelector('[id="registration"]') ||
      document.querySelector("section:has(form)");
    if (registrationSection) {
      registrationSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center pt-20 md:pt-16 pb-6 px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 hero-gradient">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,85,184,0.15),transparent_50%)]"></div>
      </div>

      {/* Gallery Slideshow Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        {galleryImages.map((image, index) => (
          <OptimizedImage 
            key={index}
            src={image} 
            alt={`UBa Tech Camp ${index + 1}`}
            width={1920}
            height={1080}
            priority={index === 0}
            className={`absolute w-full h-full object-cover object-center transition-opacity duration-50000 ${
              index === currentImageIndex ? 'opacity-50' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background/60"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center">
          {/* Logo */}
          <OptimizedImage 
           src={logoImage} 
            alt="UBa Tech Camp Logo"
           width={128}
            height={128}
            priority={true}
            //className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 md:mb-4 mt-8 md:mt-0 drop-shadow-[0_0_20px_rgba(0,85,184,0.5)]"
          />

          <div className="px-6 py-2 mb-8 md:mb-6 relative max-w-md mx-auto">
            <h1 className="text-sm sm:text-base md:text-xl font-bold text-primary dark:text-white text-center tracking-wider" style={{ fontFamily: 'monospace', textShadow: '0 4px 8px rgba(0, 85, 184, 0.7)' }}>
              {typedText}
              {showCursor && <span className="animate-pulse">|</span>}
            </h1>
          </div>

          <div className="flex flex-row gap-2 justify-center mb-10 md:mb-8 px-4 max-w-md mx-auto">
            <Button
              size="sm"
              onClick={scrollToRegistration}
              className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs sm:text-sm px-3 sm:px-4 py-2 font-semibold rounded-lg flex-1"
            >
              Register Now
              <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary/10 text-xs sm:text-sm px-3 sm:px-4 py-2 font-semibold rounded-lg flex-1"
              onClick={() => setShowAboutDialog(true)}
            >
              Learn More
            </Button>
          </div>
        </div>

          {/* Next Edition Card */}
          <div className="glass-card p-3 max-w-md mx-auto">
            <div className="text-center mb-2">
              <p className="text-xs text-muted-foreground mb-1">Next Edition Starts</p>
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <p className="text-base md:text-lg font-bold text-primary">16th February, 2026</p>
              </div>
            </div>
            
            <div className="w-full h-px bg-border/50 mb-2"></div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <div className="inline-block p-1 rounded-full bg-primary/10">
                  <Clock className="w-3 h-3 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground">Duration</p>
                  <p className="text-xs font-semibold text-foreground">4 Weeks</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className="inline-block p-1 rounded-full bg-primary/10">
                  <MapPin className="w-3 h-3 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground">Location</p>
                  <p className="text-xs font-semibold text-foreground">UBa Bambili</p>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Dialog */}
      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="max-w-2xl glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-bold text-primary">About UBa Tech Camp</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">Empowering the next generation of tech leaders</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 text-foreground">
              <div>
                <h4 className="font-semibold text-lg mb-3 text-primary">Who We Are</h4>
                <p className="text-sm md:text-base leading-relaxed">
                  UBaTech Camp is a transformative tech training initiative dedicated to closing the digital skills gap at the University of Bamenda and across Cameroon. We provide practical, industry-relevant technology skills that empower students to become future-ready innovators, problem-solvers, and digital leaders shaping Cameroon's technological advancement.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-3 text-primary">Our Mission</h4>
                <p className="text-sm md:text-base leading-relaxed">
                  We help young people discover their potential in technology by giving them the skills and support they need to build, innovate, and compete in the digital world. Our goal is to make tech education accessible to everyone — so every student has the chance to learn, create solutions, and shape the future of tech in Cameroon.
                </p>
              </div>
              <Button onClick={scrollToRegistration} className="w-full bg-primary hover:bg-primary-hover glow-button">Register Now<ArrowRight className="ml-2 w-4 h-4" /></Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </section>
  );
};
