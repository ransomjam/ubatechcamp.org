import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AutoCarousel } from "@/components/ui/auto-carousel";
import { Linkedin, Twitter, Github, Facebook, Mail } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";

import profImage from "@/assets/teams/prof.jpg";
import ransomImage from "@/assets/teams/jam.jpg";
import mariusImage from "@/assets/teams/markus.jpg";
import musuhImage from "@/assets/teams/musu1.jpg";
import milesImage from "@/assets/teams/males.jpg";
import yembiImage from "@/assets/teams/desmond.jpg";
import BlaiseImage from "@/assets/teams/Blaise.jpg";
import yveImage from "@/assets/teams/Yve.jpg";
import princewill from "@/assets/teams/princewill.png";
import greg from "@/assets/teams/greg.jpeg";

const allTeamMembers = [
  { name: "Engr. Jam Ransom", role: "Founder and Instructor", description: "Mining Engineer | Data Analyst | Innovator", image: ransomImage, social: { linkedin: "http://www.linkedin.com/in/jamransom", facebook: "https://www.facebook.com/jam.ransom.3" } },
  { name: "Abongni Musuh", role: "Co-founder and Instructor", description: "Strategic partner in building comprehensive tech education programs", image: musuhImage, social: { linkedin: "#", facebook: "#" } },
  { name: "Prof Anong Damian", role: "Director of Students' affairs", description: "The University of Bamenda", image: profImage, social: { linkedin: "#", facebook: "#" } },
  { name: "Engr. Lontsi", role: "Dev Instructor", description: "Computer Engineer | Data Analyst | Innovator", image: mariusImage, social: { linkedin: "http://www.linkedin.com/in/Mariuskenne", facebook: "#" } },
  { name: "Engr. Mile Lambe", role: "Networking Instructor", description: "Electrical Engineer | Computer networking trainer", image: milesImage, social: { linkedin: "#", facebook: "#" } },
  { name: "Desmond", role: "Data Science Instructor", description: "Experienced data science trainer", image: yembiImage, social: { linkedin: "#", facebook: "#" } },
  { name: "Anyu Princewill Fon", role: "Data Analysis Instructor", description: "Specialist in statistical analysis and data visualization techniques", image: princewill, social: { linkedin: "#", facebook: "#" } },
  { name: "Nanguat Blaise", role: "Student Leader", description: "SA President NAHPISA, 2023/2024", image: BlaiseImage, social: { linkedin: "#", facebook: "#" } },
  { name: "Kadjo Yve", role: "Student Leader", description: "SA President FEMSSA, 2023/2024", image: yveImage, social: { linkedin: "#", facebook: "#" } },
  { name: "K. Gregory", role: "Linux Administrator", description: "System administration and Linux infrastructure specialist", image: greg, social: { linkedin: "http://www.linkedin.com/in/Gregorywiltord", facebook: "#" } }
];

export function TeamSection() {
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <section id="team" className="bg-background py-12 md:py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Meet Our Team
          </h2>
        </motion.div>

        <AutoCarousel cardWidth={180} gap={12}>
          {allTeamMembers.map((member, index) => (
            <Card key={index} className="w-[180px] snap-start flex-shrink-0 bg-card border-primary/30 hover:scale-105 transition-all overflow-hidden">
              <div className="relative h-44 overflow-hidden bg-muted">
                <OptimizedImage
                  src={member.image}
                  alt={member.name}
                  width={180}
                  height={176}
                  style={{ 
                    objectPosition: index <= 1 ? 'center 30%' : 'center 20%', 
                    transform: index <= 1 ? 'scale(1.15)' : 'scale(1.3)' 
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              </div>
              <CardContent className="p-3 bg-card">
                <h3 className="text-sm font-bold text-foreground mb-1.5 line-clamp-2">{member.name}</h3>
                <Badge variant="secondary" className="mb-2 bg-primary/20 text-foreground text-[10px] px-1.5 py-0.5 line-clamp-1">{member.role}</Badge>
                <div className="flex gap-2 justify-center">
                  {Object.entries(member.social).map(([platform, url]) => {
                    const isFirstCard = member.name === "Engr. Jam Ransom";
                    const isClickable = isFirstCard && url !== "#";
                    
                    return (
                      <button
                        key={platform}
                        onClick={(e) => {
                          if (isClickable) {
                            window.open(url, "_blank");
                          } else {
                            e.preventDefault();
                          }
                        }}
                        className={`${isClickable ? "text-primary hover:text-primary/80 cursor-pointer" : "text-muted-foreground cursor-default"} transition-colors`}
                        aria-label={platform}
                        disabled={!isClickable}
                      >
                        {getSocialIcon(platform)}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </AutoCarousel>
      </div>
    </section>
  );
}
