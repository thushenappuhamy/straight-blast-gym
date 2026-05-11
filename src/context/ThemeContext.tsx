"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = window.localStorage.getItem("sbg-dashboard-theme");
    const initialTheme = savedTheme === "light" ? "light" : "dark";
    setThemeState(initialTheme);
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    window.localStorage.setItem("sbg-dashboard-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Sync with document element on initial load and theme change
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme, mounted]);

  // Prevent flash by not rendering children until mounted if relying on client-side state
  // But wait, returning children directly is usually better for SEO, we just might see a flash.
  // Since we want to ensure global state is available, we render anyway.

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
