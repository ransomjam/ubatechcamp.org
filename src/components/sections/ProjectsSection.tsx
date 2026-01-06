import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AutoCarousel } from "@/components/ui/auto-carousel";
import { ExternalLink, Github, Star, Users, Code } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";

const projects = [
  {
    title: "AgriConnect Mobile App",
    description: "Connecting farmers with buyers through a mobile marketplace platform",
    category: "Mobile Development",
    technologies: ["Flutter", "Firebase", "Google Maps API"],
    team: "Team Alpha",
    github: "#",
    demo: "#",
    featured: true,
    stars: 45,
  },
  {
    title: "EduTrack Learning Platform",
    description: "AI-powered learning management system for Cameroon schools",
    category: "Web Development",
    technologies: ["React", "Node.js", "PostgreSQL", "AI/ML"],
    team: "Team Beta",
    github: "#",
    demo: "#",
    featured: true,
    stars: 38,
  },
  {
    title: "HealthBot Assistant",
    description: "WhatsApp chatbot providing basic health information and appointment booking",
    category: "AI/Chatbot",
    technologies: ["Python", "NLP", "WhatsApp API", "FastAPI"],
    team: "Team Gamma",
    github: "#",
    demo: "#",
    featured: false,
    stars: 29,
  },
  {
    title: "Smart Transport Tracker",
    description: "Real-time public transport tracking system for Bamenda",
    category: "IoT & Web",
    technologies: ["Flutter", "Python", "IoT", "Google Maps"],
    team: "Team Delta",
    github: "#",
    demo: "#",
    featured: false,
    stars: 52,
  },
  {
    title: "FinTech Savings App",
    description: "Micro-savings platform with gamification for young professionals",
    category: "Mobile Development",
    technologies: ["React Native", "Node.js", "MongoDB", "Stripe"],
    team: "Team Epsilon",
    github: "#",
    demo: "#",
    featured: true,
    stars: 41,
  },
  {
    title: "E-Voting System",
    description: "Secure blockchain-based voting platform for student elections",
    category: "Blockchain",
    technologies: ["React", "Solidity", "Web3", "Ethereum"],
    team: "Team Zeta",
    github: "#",
    demo: "#",
    featured: false,
    stars: 33,
  },
  {
    title: "Medical Management System",
    description: "Digital health records and hospital management platform",
    category: "Web Development",
    technologies: ["React", "Express", "PostgreSQL", "React Query"],
    team: "Team Sigma",
    github: "#",
    demo: "#",
    featured: true,
    stars: 42,
  },
  {
    title: "University Management System",
    description: "Comprehensive platform for student records, courses and grading",
    category: "Web Development",
    technologies: ["React", "Node.js", "Prisma", "MySQL"],
    team: "Team Omega",
    github: "#",
    demo: "#",
    featured: true,
    stars: 56,
  },
  {
    title: "School Management System",
    description: "Management tool for primary and secondary school administrations",
    category: "Web Development",
    technologies: ["TypeScript", "Next.js", "Supabase"],
    team: "Team Kappa",
    github: "#",
    demo: "#",
    featured: false,
    stars: 31,
  },
  {
    title: "E-commerce Web & Mobile",
    description: "Multi-vendor marketplace with seamless web and mobile synchronization",
    category: "Fullstack & Mobile",
    technologies: ["Next.js", "React Native", "Tailwind", "Stripe"],
    team: "Team Iota",
    github: "#",
    demo: "#",
    featured: true,
    stars: 48,
  },
  {
    title: "Inventory System",
    description: "Real-time stock tracking and inventory management for businesses",
    category: "Web Development",
    technologies: ["React", "Firebase", "Redux", "Charts.js"],
    team: "Team Theta",
    github: "#",
    demo: "#",
    featured: false,
    stars: 27,
  },
];

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-12 md:py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary bg-primary/5 backdrop-blur-md px-4 py-1.5">
            Student Projects
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="gradient-text">Innovation in Action</span>
          </h2>
        </div>

        <AutoCarousel>
          {projects.map((project, index) => (
            <Card
              key={index}
              className="bg-card p-0 w-[280px] snap-start flex-shrink-0 hover:scale-105 transition-all border-primary/30 overflow-hidden"
            >
              {/* Project icon header */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,168,255,0.1),transparent_50%)]"></div>
                <Code className="w-16 h-16 text-primary/60 relative z-10" />
                {project.featured && (
                  <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Project details */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground line-clamp-1">{project.title}</h3>
                  <div className="flex items-center text-primary ml-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm ml-1">{project.stars}</span>
                  </div>
                </div>

                <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary text-xs">
                  {project.category}
                </Badge>

                <p className="text-foreground/70 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center text-foreground/60 text-xs mb-4">
                  <Users className="w-3 h-3 mr-1" />
                  <span>{project.team}</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span key={i} className="text-xs bg-primary/10 text-foreground px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-primary/30 text-primary hover:bg-primary/10">
                    <Github className="w-3 h-3 mr-1" />
                    Code
                  </Button>
                  <Button size="sm" className="flex-1 bg-primary hover:bg-primary-hover">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Demo
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </AutoCarousel>
      </div>
    </section>
  );
};
