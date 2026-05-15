"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Scale,
  Dumbbell,
  UtensilsCrossed,
  Pill,
  User,
  Medal,
  Package,
  LogOut,
  MoonStar,
  SunMedium,
} from 'lucide-react';

type ThemeMode = "dark" | "light";

interface DashboardSidebarProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const mainNavItems = [
  { icon: "chart", label: "Dashboard", href: "/dashboard" },
  { icon: "scale", label: "BMI Calculator", href: "/bmi-calculator" },
  { icon: "dumbbell", label: "My Workouts", href: "/dashboard/workouts" },
  { icon: "utensils", label: "Meal Plans", href: "/dashboard/meals" },
];

const serviceNavItems = [
  { icon: "pill", label: "Supplement Shop", href: "/shop" },
  { icon: "user", label: "Book a Trainer", href: "/dashboard/trainers" },
  { icon: "medal", label: "Membership", href: "/dashboard/membership" },
];

const accountNavItems = [
  { icon: "user", label: "My Profile", href: "/dashboard/profile" },
  { icon: "package", label: "My Orders", href: "/dashboard/my-orders" },
];

function getIcon(iconName: string) {
  const iconProps = { size: 20, className: 'text-current' };
  switch (iconName) {
    case 'chart': return <BarChart3 {...iconProps} />;
    case 'scale': return <Scale {...iconProps} />;
    case 'dumbbell': return <Dumbbell {...iconProps} />;
    case 'utensils': return <UtensilsCrossed {...iconProps} />;
    case 'pill': return <Pill {...iconProps} />;
    case 'user': return <User {...iconProps} />;
    case 'medal': return <Medal {...iconProps} />;
    case 'package': return <Package {...iconProps} />;
    default: return null;
  }
}

export function DashboardSidebar({ theme, onThemeChange }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDark = theme === "dark";
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserPlan(data.user?.plan?.toLowerCase() || 'basic');
          setUserStatus(data.user?.membershipStatus?.toLowerCase() || 'pending');
        }
      } catch (error) {
        console.error('Error fetching user for sidebar:', error);
      }
    };
    fetchUser();
  }, []);

  const filteredNavItems = mainNavItems.filter(item => {
    // Hide Workouts and Meal Plans for basic members OR if membership is not active
    if (userPlan === 'basic' || userStatus !== 'active') {
      return item.label !== "My Workouts" && item.label !== "Meal Plans";
    }
    return true;
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } finally {
      router.push('/login');
    }
  };

  const toggleTheme = () => {
    onThemeChange(isDark ? "light" : "dark");
  };

  const shellClasses = isDark
    ? "bg-[#0b0b0b] border-white/10 text-white"
    : "bg-white border-slate-200 text-slate-900 shadow-xl shadow-slate-200/50";

  const backdropClasses = isDark
    ? "bg-[radial-gradient(circle_at_top,rgba(230,60,47,0.12),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_36px)] opacity-80"
    : "bg-[radial-gradient(circle_at_top,rgba(230,60,47,0.03),transparent_38%)] opacity-40";

  const sectionLabelClasses = isDark
    ? "text-white/35"
    : "text-slate-400 font-bold";

  const itemBaseClasses = isDark
    ? "text-white/70 hover:bg-white/5 hover:text-white"
    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

  const itemActiveClasses = isDark
    ? "bg-[#E63C2F] text-white shadow-[0_10px_30px_rgba(230,60,47,0.22)]"
    : "bg-slate-100 text-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-200";

  const mutedText = isDark ? "text-white/45" : "text-slate-400";

  const toggleButtonClasses = isDark
    ? "border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm";

  return (
    <aside className={`relative flex min-h-screen w-72 flex-col overflow-hidden border-r ${shellClasses}`}>
      <div className={`pointer-events-none absolute inset-0 ${backdropClasses}`} />

      <div className={`relative z-10 border-b p-6 ${isDark ? "border-white/10" : "border-[#E5E5E5]"}`}>
        <div className="flex items-center gap-3">
          <img
            src="/logo_new.jpeg"
            alt="SBG Logo"
            className={`h-12 w-12 rounded-full border ${isDark ? "border-[#E63C2F]/40" : "border-[#E5E5E5]"}`}
          />
          <div className="flex flex-col leading-none">
            <span className={`font-black text-lg tracking-[0.3em] uppercase ${isDark ? "text-[#F5F5F5]" : "text-[#1A1A1A]"}`}>SBG</span>
            <span className={`text-[10px] uppercase tracking-[0.35em] ${mutedText}`}>Member Portal</span>
          </div>
        </div>
      </div>

      <nav className="relative z-10 flex flex-1 flex-col p-4">
        <div className="mb-6">
          <span className={`px-3 text-[10px] font-black uppercase tracking-[0.4em] ${sectionLabelClasses}`}>Main</span>
          <ul className="mt-3 space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded px-3 py-3 text-sm font-medium transition-colors ${pathname === item.href ? itemActiveClasses : itemBaseClasses}`}
                >
                  <span>{getIcon(item.icon)}</span>
                  <span className="uppercase tracking-wider">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <span className={`px-3 text-[10px] font-black uppercase tracking-[0.4em] ${sectionLabelClasses}`}>Services</span>
          <ul className="mt-3 space-y-1">
            {serviceNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded px-3 py-3 text-sm font-medium transition-colors ${pathname === item.href ? itemActiveClasses : itemBaseClasses}`}
                >
                  <span>{getIcon(item.icon)}</span>
                  <span className="uppercase tracking-wider">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className={`px-3 text-[10px] font-black uppercase tracking-[0.4em] ${sectionLabelClasses}`}>Account</span>
          <ul className="mt-3 space-y-1">
            {accountNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded px-3 py-3 text-sm font-medium transition-colors ${pathname === item.href ? itemActiveClasses : itemBaseClasses}`}
                >
                  <span>{getIcon(item.icon)}</span>
                  <span className="uppercase tracking-wider">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto space-y-3 pt-6">
          <button
            onClick={toggleTheme}
            className={`flex w-full items-center gap-3 rounded px-3 py-3 text-sm font-black uppercase tracking-[0.28em] transition-colors ${toggleButtonClasses}`}
          >
            <span>{isDark ? <SunMedium size={18} className="text-current" /> : <MoonStar size={18} className="text-current" />}</span>
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded px-3 py-3 text-sm font-black uppercase tracking-[0.28em] transition-colors ${isDark ? "text-white/70 hover:bg-[#E63C2F]/15 hover:text-white" : "text-[#666666] hover:bg-black/5 hover:text-[#1A1A1A]"}`}
          >
            <span><LogOut size={18} className="text-current" /></span>
            <span>Log Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
