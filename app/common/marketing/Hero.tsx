"use client";
import type React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onAuthClick?: () => void;
}

export default function Hero({ onAuthClick }: HeroProps) {
  return (
    <div className="lg:pt-12 pt-6">
      <div className="flex flex-col items-center">
        <div className="mb-12 items-center text-center">
          <h1 className="text-4xl font-bold text-foreground">
            <span className="font-normal">Your Innovation Canvas</span>
          </h1>
          <p className="text-xl text-foreground mb-8 max-w-2xl">
            Your canvas that helps you explore, expand, and refine your ideas.
          </p>
          <div>
            <Button
              size="lg"
              className="px-8 py-4 text-lg rounded-full bg-white hover:bg-white/90 text-black hover:text-black border-0"
              onClick={onAuthClick}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
