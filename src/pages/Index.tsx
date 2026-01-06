import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { VideoTestimonialsSection } from "@/components/sections/VideoTestimonialsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
// import { DonationSection } from "@/components/sections/DonationSection"; // Temporarily hidden
import { FAQSection } from "@/components/sections/FAQSection";
import { RegistrationSection } from "@/components/sections/RegistrationSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const [selectedProgram, setSelectedProgram] = useState<string | undefined>(undefined);

  const handleRegisterProgram = (programTitle: string) => {
    setSelectedProgram(programTitle);
    const registrationSection = document.getElementById("registration");
    if (registrationSection) {
      registrationSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ProgramsSection onRegister={handleRegisterProgram} />
      <GallerySection />
      <TeamSection />
      <VideoTestimonialsSection />
      <TestimonialsSection />
      {/* <DonationSection /> */}
      <FAQSection />
      <RegistrationSection initialProgram={selectedProgram} />
      <NewsletterSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
