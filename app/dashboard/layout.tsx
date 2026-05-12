"use client";

import { DashboardSidebar } from "@/src/components/dashboard/DashboardSidebar";
import { useTheme } from "@/src/context/ThemeContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex min-h-screen transition-colors duration-300 bg-background text-foreground">
      <DashboardSidebar theme={theme} onThemeChange={setTheme} />
      <main className="flex-1 overflow-auto transition-colors duration-300 bg-background">
        {children}
      </main>
    </div>
  );
}
