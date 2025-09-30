'use client';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { visualNeedsData } from '@/data/industryData';

export function VisualNeedsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleIndexChange = (newIndex: number) => {
    if (newIndex === activeIndex) return;

    setIsTransitioning(true);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);

    setActiveIndex(newIndex);
  };

  return (
    <div className="text-foreground">
      <div className="max-w-7xl mx-auto p-6">
         <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-5xl font-extralight text-center mb-16 text-balance">"Bridge the gap between inspiration and execution</h2>
        <p>Accelerate product development through visual design</p>
        </div>

        <div className="flex gap-8 h-[600px]">
          {/* Side Navigation */}
          <div className="w-80 flex flex-col gap-3">
            {visualNeedsData.map((item, index) => (
              <button
                key={index}
                onClick={() => handleIndexChange(index)}
                className={cn(
                  "group relative overflow-hidden transition-all duration-500 ease-out h-20 rounded-lg",
                  "transform hover:scale-[1.02] hover:shadow-lg",
                  activeIndex === index 
                    ? "bg-accent shadow-md scale-[1.02]" 
                    : "hover:bg-accent/50 hover:shadow-sm",
                )}
                style={{
                  transitionDelay: activeIndex === index ? '0ms' : `${index * 50}ms`
                }}
              >
                <div className="relative z-10 flex items-center h-full px-4">
                  <div className="text-left">
                    <h3
                      className={cn(
                        "font-normal text-xl transition-all duration-400 ease-out transform",
                        activeIndex === index 
                          ? "text-accent-foreground translate-x-1 font-medium" 
                          : "text-foreground translate-x-0 hover:translate-x-1",
                      )}
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Active indicator with smooth slide animation */}
                <div 
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 bg-accent transition-all duration-500 ease-out transform",
                    activeIndex === index ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
                  )}
                />

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
              </button>
            ))}
          </div>

          {/* Main Display */}
          <div className="flex-1 relative overflow-hidden rounded-xl shadow-2xl">
            {/* Background images with crossfade */}
            {visualNeedsData.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-all duration-700 ease-out transform",
                  activeIndex === index 
                    ? "opacity-100 scale-100" 
                    : "opacity-0 scale-105"
                )}
              >
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            ))}

            {/* Content overlay */}
            <div className="relative z-10 h-full flex flex-col justify-end p-12">
              <div className="max-w-2xl">
                <h3 
                  className={cn(
                    "text-2xl font-normal text-balance text-white transition-all duration-500 ease-out transform",
                    isTransitioning 
                      ? "translate-y-4 opacity-0" 
                      : "translate-y-0 opacity-100"
                  )}
                  style={{ transitionDelay: '100ms' }}
                >
                  {visualNeedsData[activeIndex].title}
                </h3>
                <p 
                  className={cn(
                    "text-md text-gray-200/80 mb-6 leading-relaxed text-pretty transition-all duration-500 ease-out transform",
                    isTransitioning 
                      ? "translate-y-4 opacity-0" 
                      : "translate-y-0 opacity-100"
                  )}
                  style={{ transitionDelay: '200ms' }}
                >
                  {visualNeedsData[activeIndex].description}
                </p>
              </div>
            </div>

            {/* Subtle pulse animation on image */}
            <div className="absolute inset-0 bg-white/5 animate-pulse opacity-0 hover:opacity-100 transition-opacity duration-1000 ease-out" />
          </div>
        </div>

        {/* Bottom indicators with enhanced animations */}
        <div className="flex justify-center mt-8 gap-3">
          {visualNeedsData.map((_, index) => (
            <button
              key={index}
              onClick={() => handleIndexChange(index)}
              className={cn(
                "h-1 rounded-full transition-all duration-400 ease-out transform hover:scale-y-150",
                activeIndex === index 
                  ? "bg-accent w-12 scale-y-125" 
                  : "bg-muted w-6 hover:bg-muted-foreground/70"
              )}
              style={{
                transitionDelay: `${index * 50}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}