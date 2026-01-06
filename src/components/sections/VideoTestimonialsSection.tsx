import React from "react";
import { Card } from "@/components/ui/card";
import { AutoCarousel } from "@/components/ui/auto-carousel";

const videoTestimonials = [
  { id: 1, url: "https://youtube.com/shorts/vqSWlHoisSw?si=Ii3P4IQ5qKaIbE0i", title: "Student Testimonial 4" },
  { id: 2, url: "https://youtube.com/shorts/-ZwTdpthdV0?si=jgKOLLEOiPIQbas_", title: "Student Testimonial 2" },
  { id: 3, url: "https://youtu.be/23hy60TAJFI?si=DHoRHOsWcyizVdrG", title: "UBaTechCamp Experience" },
  { id: 4, url: "https://youtu.be/z3noV0XB0f8?si=iDWwA6py6knz6Beu", title: "Student Journey" },
  { id: 5, url: "https://youtube.com/shorts/3fNxufMzuyI?si=2xWwoJcDHgzFMKoT", title: "Quick Highlights" },
  { id: 6, url: "https://youtube.com/shorts/3UgQxfXHqpk?si=FwAZ8IP3gQWhEOEz", title: "Camp Moments" },
  { id: 7, url: "https://youtube.com/shorts/Wh0B4-1v9us?si=PLXsiMJPypJhTLOO", title: "Student Testimonial 3" },
  { id: 8, url: "https://youtube.com/shorts/cUgwn6M0TfI?si=0vYdDn-t3bxqSuXq", title: "Student Testimonial 5" },
  { id: 9, url: "https://youtu.be/5fj-Q_iSURA?si=WzhuNtms6KeSmpWD", title: "1st Edition Panel Discussion" },
  { id: 10, url: "https://youtube.com/shorts/DNpyew8RQdA?si=KOh2l3FmNZelu8Ri", title: "Student Testimonial 1" },
];

const getEmbedUrl = (url: string) => {
  if (url.includes("/shorts/")) {
    const videoId = url.split("/shorts/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

export const VideoTestimonialsSection = () => {
  return (
    <section className="py-8 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            UBaTechCamp Experiences
          </h2>
        </div>

        <AutoCarousel cardWidth={240} gap={16}>
          {videoTestimonials.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden w-[240px] snap-start flex-shrink-0 hover:scale-105 transition-all bg-card border-primary/30"
            >
              <div className="relative h-[427px] overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={getEmbedUrl(video.url)}
                  title={video.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </Card>
          ))}
        </AutoCarousel>
      </div>
    </section>
  );
};
