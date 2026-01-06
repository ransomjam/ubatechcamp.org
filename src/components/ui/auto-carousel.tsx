import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AutoCarouselProps {
  children: React.ReactNode;
  className?: string;
  cardWidth?: number;
  gap?: number;
  autoScroll?: boolean;
  speed?: number;
}

export const AutoCarousel = ({ 
  children, 
  className,
  cardWidth = 280,
  gap = 16,
  autoScroll = true,
  speed = 30
}: AutoCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScrollActive, setAutoScrollActive] = useState(true);

  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    let scrollPosition = 0;
    let animationId: number;
    const teaserDuration = 2000; // 2 seconds teaser
    const startTime = Date.now();

    const scroll = () => {
      if (!isPaused && scrollContainer && autoScrollActive) {
        const elapsed = Date.now() - startTime;
        
        // Stop auto-scroll after teaser duration
        if (elapsed >= teaserDuration) {
          setAutoScrollActive(false);
          cancelAnimationFrame(animationId);
          return;
        }
        
        scrollPosition += 0.5;
        
        // Reset when reaching halfway (for seamless loop)
        const maxScroll = scrollContainer.scrollWidth / 2;
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [autoScroll, isPaused, autoScrollActive]);

  return (
    <div className="relative overflow-hidden">
      <div
        ref={scrollRef}
        className={cn(
          "overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar",
          className
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="flex gap-4 min-w-max pr-[50vw]">
          {children}
        </div>
      </div>
      <p className="text-center text-xs text-foreground/60 mt-4">← Swipe to explore →</p>
    </div>
  );
};
