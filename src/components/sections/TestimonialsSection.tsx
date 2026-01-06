import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AutoCarousel } from "@/components/ui/auto-carousel";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import budziImage from "@/assets/ubatech_testimonials/Budzi Terence.jpg";
import desmondImage from "@/assets/ubatech_testimonials/Desmond Yembi.png";
import cynthiaImage from "@/assets/ubatech_testimonials/Kateh Cynthia.jpg";
import malesImage from "@/assets/ubatech_testimonials/Males Lambe.png";

const testimonials = [
  {
    name: "Budzi Terence",
    role: "Digital Entrepreneur",
    cohort: "2025",
    rating: 5,
    quote: "A huge shoutout and heartfelt thanks to the UBa Tech Camp for an incredible experience! Your program has truly transformed my understanding of essential computer skills, from data analysis to mastering Microsoft Excel, PowerPoint, and Publisher. I am now inspired and empowered to dive into digital entrepreneurship with confidence!",
    image: budziImage,
    achievement: "Digital Entrepreneur",
  },
  {
    name: "Desmond Yembi",
    role: "Facilitator & IT Educator",
    cohort: "2025",
    rating: 5,
    quote: "UBa Tech has really been a game changer to a lot of students who had the passion for learning IT skills that will help them not only in school but in every aspect of their life. Being a facilitator at the UBa Tech Camp handling Microsoft Excel made me understand there are still a lot of people who do not even know how to use a computer.",
    image: desmondImage,
    achievement: "Camp Facilitator",
  },
  {
    name: "Kateh Cynthia",
    role: "Tech Enthusiast",
    cohort: "2025",
    rating: 5,
    quote: "The future belongs to those who adapt and use technology wisely and UBa Tech Camp is that place for y'all. I'm so privileged to have been part of this amazing journey. At UBA TECH CAMP, individuals are impacted with knowledge and skills like data analytics, coding, PowerPoint, Microsoft Excel, IBM SPSS and more!",
    image: cynthiaImage,
    achievement: "Data Analytics Student",
  },
  {
    name: "Males Lambe",
    role: "Tech Advocate",
    cohort: "2024",
    rating: 5,
    quote: "Over the past few days, the second edition of UBa Tech Camp lit a spark in the hearts of so many students. This camp wasn't just a tech workshop. It was a safe space, a family, a launchpad. We tackled the digital divide with love, patience, and community. UBa Tech Camp is more than a training program. It's a movement of hope, inclusion, and empowerment.",
    image: malesImage,
    achievement: "Student Leader",
  },
];

const TestimonialCard = ({ testimonial, index }: { testimonial: typeof testimonials[0], index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      className="w-[200px] snap-start flex-shrink-0 bg-card border-primary/30 hover:scale-105 transition-all overflow-hidden"
    >
      <div className="relative h-32 overflow-hidden bg-muted">
        <OptimizedImage 
          src={testimonial.image} 
          alt={testimonial.name}
          width={200}
          height={128}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
      </div>
      <CardContent className="p-3 bg-card">
        <h3 className="text-sm font-bold text-foreground mb-1">{testimonial.name}</h3>
        <Badge variant="secondary" className="mb-2 bg-primary/20 text-foreground text-[10px] px-1.5 py-0.5">
          {testimonial.role}
        </Badge>
        <div className="flex items-center mb-2">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-primary text-primary" />
          ))}
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px]' : 'max-h-[45px]'}`}>
          <p className="text-foreground/80 text-[10px] leading-relaxed mb-2">
            "{testimonial.quote}"
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-primary text-primary bg-primary/10">
            {testimonial.cohort}
          </Badge>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10"
          >
            {isExpanded ? (
              <>
                Less <ChevronUp className="w-3 h-3 ml-1" />
              </>
            ) : (
              <>
                More <ChevronDown className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-12 md:py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-primary text-primary bg-primary/10">
            Success Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Alumni Testimonials
          </h2>
        </motion.div>

        <AutoCarousel cardWidth={200} gap={12}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </AutoCarousel>
      </div>
    </section>
  );
};
