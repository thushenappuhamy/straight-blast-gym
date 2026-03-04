import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#2B2621]/95 backdrop-blur-sm border-b border-[#3D3831]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F4D03F] rounded-full flex items-center justify-center">
              <span className="text-black font-black text-xl">SBG</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white text-sm font-bold tracking-wider uppercase">Straight</span>
              <span className="text-[#F4D03F] text-lg font-black tracking-wider uppercase">Blast Gym</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-white hover:text-[#F4D03F] font-medium text-sm uppercase tracking-wider transition-colors">
              Home
            </Link>
            <Link href="/workouts" className="text-white hover:text-[#F4D03F] font-medium text-sm uppercase tracking-wider transition-colors">
              Workouts
            </Link>
            <Link href="/nutrition" className="text-white hover:text-[#F4D03F] font-medium text-sm uppercase tracking-wider transition-colors">
              Nutrition
            </Link>
            <Link href="/shop" className="text-white hover:text-[#F4D03F] font-medium text-sm uppercase tracking-wider transition-colors">
              Shop
            </Link>
            <Link href="/trainers" className="text-white hover:text-[#F4D03F] font-medium text-sm uppercase tracking-wider transition-colors">
              Trainers
            </Link>
            <Link href="/membership" className="text-white hover:text-[#F4D03F] font-medium text-sm uppercase tracking-wider transition-colors">
              Membership
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="lg" className="rounded-none border-[#F4D03F]">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="yellow" size="lg" className="rounded-none">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
