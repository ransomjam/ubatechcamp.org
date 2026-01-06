import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { useNetwork } from "@/hooks/use-network";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  lowResSrc?: string;
  aspectRatio?: "video" | "square" | "portrait" | "auto";
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  lowResSrc,
  className,
  aspectRatio = "auto",
  priority = false,
  width,
  height,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { isSlow } = useNetwork();

  const aspectRatios = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    auto: "",
  };

  // Fallback for missing height/width to prevent layout shift if aspectRatio is provided
  const containerClasses = cn(
    "relative overflow-hidden bg-muted transition-all duration-500",
    aspectRatios[aspectRatio],
    className
  );

  return (
    <div className={containerClasses}>
      {/* Low-res placeholder or blur effect */}
      {!isLoaded && !error && (
        <div 
          className="absolute inset-0 blur-xl scale-110 bg-muted-foreground/10 animate-pulse"
          style={lowResSrc ? { backgroundImage: `url(${lowResSrc})`, backgroundSize: 'cover' } : undefined}
        />
      )}

      <picture>
        {/* Support for WebP if user has converted images */}
        <source srcSet={src.replace(/\.(png|jpg|jpeg)$/, '.webp')} type="image/webp" />
        <img
          src={isSlow && lowResSrc ? lowResSrc : src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setError(true);
            setIsLoaded(true);
          }}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-700",
            isLoaded ? "opacity-100" : "opacity-0",
            error && "hidden"
          )}
          {...props}
        />
      </picture>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs p-2 text-center">
          <span className="truncate">{alt || "Image failed to load"}</span>
        </div>
      )}
    </div>
  );
};
