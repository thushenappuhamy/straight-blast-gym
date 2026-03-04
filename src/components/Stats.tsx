"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ target, suffix = "", duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            const current = Math.floor(easeOutQuad * target);
            
            setCount(current);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return (
    <div ref={ref} className="text-[#F4D03F] text-5xl lg:text-6xl font-black mb-2">
      {count}{suffix}
    </div>
  );
}

export function Stats() {
  const stats = [
    {
      target: 500,
      suffix: "+",
      label: "Active",
      sublabel: "Members",
    },
    {
      target: 12,
      suffix: "",
      label: "Expert",
      sublabel: "Trainers",
    },
    {
      target: 50,
      suffix: "+",
      label: "Supplements",
      sublabel: "",
    },
    {
      target: 98,
      suffix: "%",
      label: "Satisfaction",
      sublabel: "",
    },
  ];

  return (
    <section className="bg-[#1A1816] py-16 border-t border-[#3D3831]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              <div className="text-white text-xs uppercase tracking-[0.2em] font-bold">
                {stat.label}
              </div>
              {stat.sublabel && (
                <div className="text-white text-xs uppercase tracking-[0.2em] font-bold">
                  {stat.sublabel}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
