"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNavItems = [
  { icon: "📊", label: "Dashboard", href: "/dashboard" },
  { icon: "📏", label: "BMI Calculator", href: "/dashboard/bmi" },
  { icon: "💪", label: "My Workouts", href: "/dashboard/workouts" },
  { icon: "🍽️", label: "Meal Plans", href: "/dashboard/meals" },
];

const serviceNavItems = [
  { icon: "💊", label: "Supplement Shop", href: "/shop" },
  { icon: "👤", label: "Book a Trainer", href: "/dashboard/trainers" },
  { icon: "🏅", label: "Membership", href: "/dashboard/membership" },
];

const accountNavItems = [
  { icon: "👤", label: "My Profile", href: "/dashboard/profile" },
  { icon: "📦", label: "My Orders", href: "/dashboard/orders" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#1A1816] border-r border-[#2B2621] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#2B2621]">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="SBG Logo" className="w-12 h-12 rounded-full" />
          <div className="flex flex-col leading-none">
            <span className="text-[#F4D03F] font-black text-lg">SBG</span>
            <span className="text-gray-400 text-xs uppercase tracking-wider">Member Portal</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {/* Main Section */}
        <div className="mb-6">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider px-3">Main</span>
          <ul className="mt-3 space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-[#F4D03F] text-[#1A1816]"
                      : "text-gray-300 hover:bg-[#2B2621] hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="uppercase tracking-wider">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services Section */}
        <div className="mb-6">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider px-3">Services</span>
          <ul className="mt-3 space-y-1">
            {serviceNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-[#F4D03F] text-[#1A1816]"
                      : "text-gray-300 hover:bg-[#2B2621] hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="uppercase tracking-wider">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account Section */}
        <div>
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider px-3">Account</span>
          <ul className="mt-3 space-y-1">
            {accountNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-[#F4D03F] text-[#1A1816]"
                      : "text-gray-300 hover:bg-[#2B2621] hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="uppercase tracking-wider">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
