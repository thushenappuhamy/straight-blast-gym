"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-r from-[#2B2621] via-[#3D3831] to-[#5A5244] pt-32 pb-16 overflow-hidden">
      {/* Diagonal Stripes Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute h-[200%] w-[2px] bg-[#F4D03F] transform -rotate-45"
            style={{ left: `${i * 80}px`, top: "-50%" }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Subtitle */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-[2px] bg-[#F4D03F]"></div>
              <span className="text-[#F4D03F] text-xs font-bold uppercase tracking-[0.2em]">
                Negombo&apos;s Premier Combat Gym
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
              <span className="text-white">Forge Your</span>
              <br />
              <span className="text-[#F4D03F]">Strength.</span>
              <br />
              <span className="text-white">Master Your</span>
              <br />
              <span className="text-white">Body.</span>
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-base lg:text-lg leading-relaxed max-w-lg">
              AI-powered workout plans, personalized nutrition, world-class trainers, 
              and premium supplements — all in one platform built for warriors.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/signup">
                <Button variant="yellow" size="xl" className="h-14 px-10">
                  Start Your Journey
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="h-14 px-10">
                View Programs
              </Button>
            </div>
          </div>

          {/* Right Content - Logo */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative w-[400px] h-[400px] lg:w-[500px] lg:h-[500px]">
              {/* Circular Background */}
              
                {/* Yellow Circle Border */}
                
                  {/* Yellow Diagonal Stripe */}
                  
                  
                  {/* Logo */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <img 
                      src="/ChatGPT Image Mar 4, 2026, 07_32_53 PM.png" 
                      alt="SBG Logo" 
                      className="w-[500px] h-[500px] lg:w-[500px] lg:h-[500px] object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        
      
    </section>
  );
}
