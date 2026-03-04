import { Header } from "@/src/components/Header";
import { Hero } from "@/src/components/Hero";
import { Stats } from "@/src/components/Stats";
import { Features } from "@/src/components/Features";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1A1816] relative overflow-hidden">
      {/* Diagonal Stripes Background - Full Page */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-[300%] w-[2px] bg-[#F4D03F] transform -rotate-45"
            style={{ left: `${i * 80}px`, top: "-100%" }}
          />
        ))}
      </div>
      
      <Header />
      <main className="relative z-10">
        <Hero />
        <Stats />
        <Features />
      </main>
    </div>
  );
}
