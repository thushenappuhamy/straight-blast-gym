"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/src/components/dashboard/DashboardSidebar";

export default function BMICalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("sbg-dashboard-theme");
    const initialTheme = savedTheme === "light" ? "light" : "dark";
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("sbg-dashboard-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${isDark ? "bg-[#090909] text-white" : "bg-[#F5F5F5] text-[#1A1A1A]"}`}>
      <DashboardSidebar theme={theme} onThemeChange={setTheme} />
      <main className={`flex-1 overflow-auto transition-colors duration-300 ${isDark ? "bg-[radial-gradient(circle_at_top,rgba(230,60,47,0.1),transparent_32%),linear-gradient(180deg,#111111_0%,#090909_100%)]" : "bg-[radial-gradient(circle_at_top,rgba(230,60,47,0.1),transparent_30%),linear-gradient(180deg,#F5F5F5_0%,#E8E8E8_100%)]"}`}>
        {children}
      </main>
    </div>
  );
}