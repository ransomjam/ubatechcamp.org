import { motion } from "framer-motion";
import { Target, Award, Users, TrendingUp, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const AboutSection = () => {
  const impactStats = [
    { number: "500+", label: "Students Trained", icon: Users },
    { number: "50+", label: "Projects Completed", icon: Rocket },
    { number: "10", label: "School/Faculties represented", icon: TrendingUp },
    { number: "10", label: "Volunteer", icon: Award },
  ];

  const values = [
    { 
      icon: Target, 
      title: "Who We Are", 
      description: "UBaTech Camp is a transformative tech training initiative dedicated to closing the digital skills gap at the University of Bamenda and across Cameroon. We provide practical, industry-relevant technology skills that empower students to become future-ready innovators, problem-solvers, and digital leaders shaping Cameroon's technological advancement." 
    },
    { 
      icon: Award, 
      title: "Our Mission", 
      description: "We help young people discover their potential in technology by giving them the skills and support they need to build, innovate, and compete in the digital world. Our goal is to make tech education accessible to everyone — so every student has the chance to learn, create solutions, and shape the future of tech in Cameroon." 
    },
  ];

  return (
    <section id="about" className="py-8 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="text-primary">Our Impact</span>
          </h2>
        </motion.div>

        {/* Impact Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {impactStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-4 text-center"
              >
                <div className="mb-2 inline-block p-2 rounded-full bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1 text-primary">{stat.number}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Values Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="glass-card border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground mb-1">{value.title}</h3>
                        <p className="text-sm text-muted-foreground leading-snug">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
