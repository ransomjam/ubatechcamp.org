import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AutoCarousel } from "@/components/ui/auto-carousel";
import { OptimizedImage } from "@/components/ui/optimized-image";
import endOfTrainingImage from "@/assets/newphotos/End of training.png";
import engrJamImage from "@/assets/newphotos/Engr Jam.png";
import exams02Image from "@/assets/newphotos/Exams 02.jpg";
import instructorsMomentsImage from "@/assets/newphotos/Intructors moments.png";
import moderatorKateImage from "@/assets/newphotos/Moderator Mrs Kate.png";
import practicalSessionsImage from "@/assets/newphotos/Practical sessions.png";
import techTalkExpImage from "@/assets/newphotos/Tech Talk experience.png";
import techTalkImage from "@/assets/newphotos/Tech Talk.png";
import techTalkMCImage from "@/assets/newphotos/Tech talk with MC.png";
import exams03Image from "@/assets/newphotos/exams 03.jpg";
import exams04Image from "@/assets/newphotos/exams 04.jpg";
import examsImage from "@/assets/newphotos/exams.jpg";
import panelFonImage from "@/assets/newphotos/panel with Mr Fon.png";
import practicalsImage from "@/assets/newphotos/practicals.jpg";
import writtenExamsImage from "@/assets/newphotos/written Exams.jpg";
import dataanalysisImage from "@/assets/gallery/dataanalysis.jpg";
import graduationImage from "@/assets/gallery/graduation.jpg";
import teamImage from "@/assets/gallery/teamwork.jpg";
import welcomeImage from "@/assets/gallery/welcome.jpg";
import pitchImage from "@/assets/gallery/pitch.jpg";
import flutterImage from "@/assets/gallery/flutter.jpg";
import machineImage from "@/assets/gallery/machine.jpg";
import reactImage from "@/assets/gallery/react.jpg";
import excelImage from "@/assets/gallery/excel.jpg";
import mlImage from "@/assets/gallery/ml.jpg";

const galleryItems = [
  { id: 1, title: "Hands-On Practical Sessions", image: practicalSessionsImage },
  { id: 2, title: "Student Practical Work", image: practicalsImage },
  { id: 3, title: "End of Cohort Training", image: endOfTrainingImage },
  { id: 4, title: "Industry Expert Panel Discussion", image: panelFonImage },
  { id: 5, title: "Technical Mentorship Session", image: techTalkExpImage },
  { id: 6, title: "Professional Development Workshop", image: techTalkImage },
  { id: 7, title: "Interactive Tech Talk", image: techTalkMCImage },
  { id: 8, title: "Instructor Mentorship Moments", image: instructorsMomentsImage },
  { id: 9, title: "Program Coordinator Mrs. Kate", image: moderatorKateImage },
  { id: 10, title: "Engineering Innovation Session", image: engrJamImage },
  { id: 11, title: "Written Examination", image: writtenExamsImage },
  { id: 12, title: "Assessment and Evaluation", image: examsImage },
  { id: 13, title: "Skills Assessment Session", image: exams02Image },
  { id: 14, title: "Technical Skills Evaluation", image: exams03Image },
  { id: 15, title: "Final Examination Period", image: exams04Image },
  { id: 16, title: "Mobile Development Training", image: flutterImage },
  { id: 17, title: "Data Management Workshop", image: excelImage },
  { id: 18, title: "Data Analysis Fundamentals", image: dataanalysisImage },
  { id: 19, title: "Machine Learning Workshop", image: machineImage },
  { id: 20, title: "Advanced ML Techniques", image: mlImage },
  { id: 21, title: "React Development Training", image: reactImage },
  { id: 22, title: "Final Project Presentations", image: pitchImage },
  { id: 23, title: "Team Collaboration Projects", image: teamImage },
  { id: 24, title: "Statistical Analysis Training", image: welcomeImage },
  { id: 25, title: "Graduation Ceremony 2024", image: graduationImage },
];

export const GallerySection = () => {
  return (
    <section id="gallery" className="py-8 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Gallery
          </h2>
        </motion.div>

        <AutoCarousel cardWidth={220} gap={16}>
          {galleryItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden w-[220px] snap-start flex-shrink-0 hover:scale-105 transition-all bg-card border-primary/30"
            >
              <div className="relative h-56 overflow-hidden bg-muted">
                <OptimizedImage 
                  src={item.image} 
                  alt={item.title}
                  width={220}
                  height={224}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              </div>
              <CardContent className="p-3 bg-card">
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
              </CardContent>
            </Card>
          ))}
        </AutoCarousel>
      </div>
    </section>
  );
};