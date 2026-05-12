"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  MapPin, 
  Phone, 
  Mail,
  ArrowUpRight
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", href: "#" },
      { name: "Programs", href: "#programs" },
      { name: "Plans", href: "#plans" },
      { name: "Results", href: "#results" },
    ],
    support: [
      { name: "Contact", href: "#" },
      { name: "FAQ", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Privacy Policy", href: "#" },
    ],
    social: [
      { name: "Facebook", icon: Facebook, href: "#" },
      { name: "Instagram", icon: Instagram, href: "#" },
      { name: "Twitter", icon: Twitter, href: "#" },
      { name: "YouTube", icon: Youtube, href: "#" },
    ]
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#090909] pt-20 pb-10 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#E63C2F]/5 blur-[120px]" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#E63C2F]/60 bg-[#111111] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
                <Image 
                  src="/logo_new.jpeg" 
                  alt="Straight Blast Gym" 
                  width={48} 
                  height={48} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="leading-none">
                <div className="text-[10px] font-semibold uppercase tracking-[0.45em] text-white/55">Straight</div>
                <div className="text-sm font-black uppercase tracking-[0.35em] text-[#F5F5F5]">
                  Blast Gym
                </div>
              </div>
            </Link>
            <p className="mt-6 text-sm leading-7 text-white/50 max-w-xs">
              Negombo&apos;s elite combat training system. Forge a stronger body with precision-engineered workout and nutrition plans.
            </p>
            <div className="mt-8 flex gap-4">
              {footerLinks.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:border-[#E63C2F]/50 hover:bg-[#E63C2F]/10 hover:text-[#E63C2F]"
                >
                  <item.icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Platform</h3>
            <ul className="mt-6 space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center text-sm text-white/50 transition-colors hover:text-white">
                    {link.name}
                    <ArrowUpRight size={14} className="ml-1 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Support</h3>
            <ul className="mt-6 space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center text-sm text-white/50 transition-colors hover:text-white">
                    {link.name}
                    <ArrowUpRight size={14} className="ml-1 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Contact</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/50">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#E63C2F]" />
                <span>123 Gym Street, Negombo,<br />Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/50">
                <Phone size={18} className="shrink-0 text-[#E63C2F]" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/50">
                <Mail size={18} className="shrink-0 text-[#E63C2F]" />
                <span>info@straightblastgym.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 border-t border-white/10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-medium text-white/40 uppercase tracking-[0.2em]">
            © {currentYear} Straight Blast Gym. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
