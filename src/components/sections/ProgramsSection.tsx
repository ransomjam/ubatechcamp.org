import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AutoCarousel } from "@/components/ui/auto-carousel";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useNetwork } from "@/hooks/use-network";

import webDevImage from "@/assets/programs/Web Development.jpeg";
import dataScienceImage from "@/assets/programs/data science.jpeg";
import softwareEngImage from "@/assets/programs/Software Engineering.jpeg";
import officeImage from "@/assets/programs/microsoft office.jpg";
import dataAnalysisImage from "@/assets/programs/Data-analysis.jpeg";
import networkingImage from "@/assets/programs/Networking.jpeg";
import linuxAdminImage from "@/assets/programs/Linux Administration.jpeg";

const programs = [
  {
    title: "Data Analysis and Research",
    duration: "4 weeks",
    technologies: ["Excel", "Stata", "SPSS"],
    image: dataAnalysisImage,
    highlights: [
      "Data collection and cleaning",
      "Data analysis Using Excel, Stata and SPSS",
      "Interpreting research results",
      "Research writing",
      "Data Analysis implementation in Research writing"
    ],
  },
  {
    title: "Computer & MS Office Basics",
    duration: "4 weeks",
    technologies: ["Word", "Excel", "PowerPoint"],
    image: officeImage,
    highlights: [
      "Basic computer and internet skills",
      "Typing and file management",
      "Creating documents in Microsoft Word",
      "Building spreadsheets in Excel",
      "Designing slides in PowerPoint"
    ],
  },
  {
    title: "Software Engineering",
    duration: "4 weeks",
    technologies: ["Programming", "Git", "Software Design"],
    image: softwareEngImage,
    highlights: [
      "Fundamentals of programming and problem-solving",
      "Writing clean code with modern languages",
      "Building simple software applications",
      "Using Git for version control and teamwork",
      "Understanding software design and development process"
    ],
  },
  {
    title: "Web Development",
    duration: "4 weeks",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: webDevImage,
    highlights: [
      "Basics of how websites work",
      "HTML for page structure",
      "CSS for styling and layouts",
      "JavaScript for interactivity",
      "Building and publishing simple websites"
    ],
  },
  {
    title: "Data Analytics",
    duration: "4 weeks",
    technologies: ["Excel", "SQL", "Python", "Power BI"],
    image: dataScienceImage,
    highlights: [
      "Understanding data and key business metrics",
      "Cleaning and analysing datasets",
      "Using Excel, SQL, Python and Power BI",
      "Building dashboards and insights",
      "Presenting findings to support business decisions"
    ],
  },
  {
    title: "Networking",
    duration: "4 weeks",
    technologies: ["Networks", "Routers", "Security"],
    image: networkingImage,
    highlights: [
      "Computer networks and internet protocols",
      "Configuring routers, switches and network devices",
      "Network troubleshooting and maintenance",
      "Network security fundamentals"
    ],
  },
  {
    title: "Linux Administration",
    duration: "4 weeks",
    technologies: ["Bash", "Linux", "SysAdmin", "Shell"],
    image: linuxAdminImage,
    highlights: [
      "Introduction to Linux and Command Line",
      "User Management and File Permissions",
      "Shell Scripting and Automation",
      "System Monitoring and Server Management",
      "Operating System installs and configurations"
    ],
  },
];

const ProgramCard = ({ 
  program, 
  index, 
  onRegister 
}: { 
  program: typeof programs[0]; 
  index: number;
  onRegister?: (title: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isFirstCard = index === 0;
  const hasMoreHighlights = program.highlights.length > 5 && !isFirstCard;
  const visibleHighlights = isFirstCard ? program.highlights : (isExpanded ? program.highlights : program.highlights.slice(0, 5));

  useEffect(() => {
    if (!isExpanded || !cardRef.current) return;

    const handleScroll = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        // If card has scrolled past the viewport (top is above screen)
        if (rect.top < -5000) {
          setIsExpanded(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExpanded]);

  return (
    <Card
      ref={cardRef}
      key={index}
      className={`bg-card p-0 w-[240px] snap-start flex-shrink-0 hover:scale-[1.02] transition-all border-primary/30 overflow-hidden flex flex-col ${
        isExpanded ? 'h-auto' : 'h-[420px]'
      }`}
    >
      <div className="relative h-40 overflow-hidden bg-muted flex-shrink-0 group/img">
        <OptimizedImage 
          src={program.image} 
          alt={program.title}
          width={240}
          height={160}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        
        <Button 
          size="sm" 
          className="absolute top-2 right-2 h-7 text-[10px] px-2 bg-primary/90 hover:bg-primary text-white font-bold rounded-full shadow-lg backdrop-blur-sm border border-white/10"
          onClick={(e) => {
            e.stopPropagation();
            onRegister?.(program.title);
          }}
        >
          Register Now
        </Button>
      </div>
      <div className="p-3 flex flex-col flex-1 overflow-hidden">
        <h3 className="text-sm font-bold text-foreground mb-1.5">{program.title}</h3>
        <Badge variant="secondary" className="mb-2 bg-primary/20 text-foreground text-[10px] px-1.5 py-0.5 w-fit">
          {program.duration}
        </Badge>
        <div className="flex flex-wrap gap-1 mb-2">
          {program.technologies.map((tech, i) => (
            <span key={i} className="text-[10px] bg-primary/10 text-foreground px-1.5 py-0.5 rounded">
              {tech}
            </span>
          ))}
        </div>
        
        <ul className={`space-y-1 flex-1 overflow-hidden ${isFirstCard ? 'mb-0' : 'mb-2'}`}>
          {visibleHighlights.map((highlight, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start">
              <span className="text-primary mr-1">•</span>
              {highlight}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-2 flex flex-col gap-1">
          {hasMoreHighlights && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors pt-1 border-t border-primary/10"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Show More <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export const ProgramsSection = ({ onRegister }: { onRegister?: (title: string) => void }) => {
  return (
    <section id="programs" className="py-8 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Our Programs
          </h2>
        </div>

        <AutoCarousel cardWidth={240} gap={16}>
          {programs.map((program, index) => (
            <ProgramCard 
              key={index} 
              program={program} 
              index={index} 
              onRegister={onRegister}
            />
          ))}
        </AutoCarousel>
      </div>
    </section>
  );
};
