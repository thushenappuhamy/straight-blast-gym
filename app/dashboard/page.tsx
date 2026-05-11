"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Calendar,
  Scale,
  Flame,
  Check,
  BarChart3,
  Pill,
  User as UserIcon,
  UtensilsCrossed,
  Zap,
  Dumbbell,
  TrendingUp,
  Target,
} from "lucide-react";
import PlanGenerationModal from "@/src/components/PlanGenerationModal";

type StatCardProps = {
  icon: string;
  value: string;
  label: string;
  sublabel?: string;
  highlight?: string;
};

function StatCard({ icon, value, label, sublabel, highlight }: StatCardProps) {
  const iconMap: Record<string, ReactNode> = {
    calendar: <Calendar size={22} className="text-[#E63C2F]" />,
    scale: <Scale size={22} className="text-[#E63C2F]" />,
    flame: <Flame size={22} className="text-[#E63C2F]" />,
    chart: <BarChart3 size={22} className="text-[#E63C2F]" />,
  };

  return (
    <div className="rounded-[1.75rem] border border-white/10 dark:border-white/10 dark:bg-linear-to-br dark:from-white/8 dark:to-white/5 bg-linear-to-br from-[#F4D03F]/10 to-white/30 p-6 backdrop-blur-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.2)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:text-white text-[#1A1816]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E63C2F]/12 dark:bg-[#E63C2F]/12">
        {iconMap[icon]}
      </div>
      <div className="text-4xl font-black tracking-tight dark:text-white text-[#1A1816]">{value}</div>
      <div className="mt-2 text-[10px] font-black uppercase tracking-[0.35em] dark:text-white/45 text-[#6B625A]">
        {label}
        {sublabel ? <><br />{sublabel}</> : null}
      </div>
      {highlight && (
        <div className={`mt-3 text-xs font-bold uppercase tracking-[0.22em] ${highlight.includes("Normal") || highlight.includes("Complete") ? "text-emerald-400" : "text-[#E63C2F]"}`}>
          {highlight.includes("✓") && <Check size={14} className="mr-1 inline" />}
          {highlight.replace("✓", "").trim()}
        </div>
      )}
    </div>
  );
}

type WorkoutCardProps = {
  dayLabel: string;
  title: string;
  exercises: string;
  duration: string;
  status: "done" | "today" | "upcoming";
};

function WorkoutCard({ dayLabel, title, exercises, duration, status }: WorkoutCardProps) {
  const statusStyles =
    status === "done"
      ? "bg-emerald-500/15 text-emerald-400"
      : status === "today"
      ? "bg-[#E63C2F]/15 text-[#E63C2F]"
      : "dark:bg-white/10 dark:text-white/45 bg-[#E6E3DA] text-[#6B625A]";

  return (
    <div className="flex items-center gap-4 rounded-3xl border dark:border-white/8 border-[#E6E3DA] dark:bg-black/25 bg-white/50 p-4">
      <div className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.28em] ${status === "done" ? "bg-white dark:text-black text-[#1A1816]" : status === "today" ? "bg-[#E63C2F] text-white" : "dark:bg-white/10 dark:text-white/45 bg-[#E6E3DA] text-[#6B625A]"}`}>
        {dayLabel}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-black dark:text-white text-[#1A1816]">{title}</div>
        <div className="text-xs dark:text-white/45 text-[#6B625A]">{exercises} · {duration}</div>
      </div>
      <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-[0.25em] ${statusStyles}`}>
        {status === "done" && (
          <><Check size={14} /> Done</>
        )}
        {status === "today" && (
          <><Flame size={14} /> Today</>
        )}
        {status === "upcoming" && "Upcoming"}
      </div>
    </div>
  );
}

type QuickActionProps = {
  icon: string;
  label: string;
  href?: string;
};

function QuickAction({ icon, label, href }: QuickActionProps) {
  const iconMap: Record<string, ReactNode> = {
    chart: <Target size={20} className="text-[#E63C2F]" />,
    pill: <Pill size={20} className="text-[#E63C2F]" />,
    user: <UserIcon size={20} className="text-[#E63C2F]" />,
    food: <UtensilsCrossed size={20} className="text-[#E63C2F]" />,
  };

  const content = (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border dark:border-white/8 border-[#E6E3DA] dark:bg-white/5 bg-white/50 p-4 text-center transition-colors dark:hover:bg-white/8 hover:bg-[#F4D03F]/20">
      <div className="mb-3">{iconMap[icon]}</div>
      <span className="text-[10px] font-black uppercase tracking-[0.32em] dark:text-white/80 text-[#1A1816]">{label}</span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button type="button" className="w-full">{content}</button>;
}

type ProgressBarProps = {
  label: string;
  value: number;
  max: number;
  displayText: string;
};

function ProgressBar({ label, value, max, displayText }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold dark:text-white text-[#1A1816]">{label}</span>
        <span className="text-sm dark:text-white/50 text-[#9A8F87]">{displayText}</span>
      </div>
      <div className="h-3 rounded-full dark:bg-white/10 bg-[#E6E3DA] overflow-hidden">
        <div className="h-full rounded-full bg-[#E63C2F] transition-all duration-500" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [currentDate] = useState(new Date());
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "User", height: 180, weight: 68, age: 28, bmi: 0 });
  const [generatedPlans, setGeneratedPlans] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [dashboardHighlights, setDashboardHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch user info
        const userResponse = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (userResponse.ok) {
          const data = await userResponse.json();
          const displayName = [data.user?.firstName, data.user?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();

          setUserInfo({
            name: displayName || data.user?.name || data.user?.email?.split("@")[0] || "User",
            height: data.user?.profile?.height || 180,
            weight: data.user?.profile?.weight || 68,
            age: data.user?.profile?.age || 28,
            bmi: data.user?.bmi || 0,
          });
        }

        // Fetch BMI data
        const bmiResponse = await fetch("/api/health/bmi");
        const bmiData = await bmiResponse.json();
        
        const currentBMI = bmiData?.data?.bmi || 0;
        const bmiCategory = bmiData?.data?.category || "Unknown";
        
        // Fetch workout plans
        const plansResponse = await fetch("/api/health/generate-plan");
        const plansData = await plansResponse.json();
        
        setGeneratedPlans(plansData?.data);

        // Build stats from fetched data
        const calculatedStats = [
          { 
            icon: "calendar", 
            value: "0", 
            label: "Workouts", 
            sublabel: "This Month", 
            highlight: "Plan active ✓" 
          },
          { 
            icon: "scale", 
            value: currentBMI.toString(), 
            label: "Current BMI", 
            highlight: `${bmiCategory} ✓` 
          },
          { 
            icon: "flame", 
            value: "2,450", 
            label: "Daily Calories", 
            sublabel: "Target", 
            highlight: "↑ Muscle Gain Plan" 
          },
          { 
            icon: "chart", 
            value: "18", 
            label: "Days Left", 
            sublabel: "In Plan", 
            highlight: "60% Complete" 
          },
        ];
        setStats(calculatedStats);

        // Extract workouts from plan
        const extractedWorkouts: any[] = [];
        if (plansData?.data?.workoutPlan?.weeks?.[0]?.days) {
          const days = plansData.data.workoutPlan.weeks[0].days;
          const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
          const currentDayOfWeek = currentDate.getDay();
          
          days.forEach((day: any, index: number) => {
            if (index < 4) {
              // Determine status based on current day of week
              let status: "done" | "today" | "upcoming" = "upcoming";
              if (index < currentDayOfWeek) {
                status = "done";
              } else if (index === currentDayOfWeek) {
                status = "today";
              }
              
              extractedWorkouts.push({
                dayLabel: dayLabels[index] || `DAY ${index + 1}`,
                title: day.title || "Workout",
                exercises: `${day.exercises?.length || 0} exercises`,
                duration: day.duration || "60 min",
                status: status
              });
            }
          });
        }
        
        if (extractedWorkouts.length > 0) {
          setWorkouts(extractedWorkouts);
        } else {
          setWorkouts([
            { dayLabel: "MON", title: "Generate a plan", exercises: "Start with BMI", duration: "-- min", status: "upcoming" as const },
          ]);
        }

        // Calculate highlights
        const calculatedHighlights = [
          { title: "Training streak", value: plansData?.data?.workoutPlan ? "Active" : "No Plan", detail: "Start planning to track progress" },
          { title: "Goal pace", value: plansData?.data?.workoutPlan ? "On track" : "Pending", detail: "Generate a plan to get started" },
          { title: "Coach access", value: "Live", detail: "Book sessions from the portal" },
        ];
        setDashboardHighlights(calculatedHighlights);
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set default state if API fails
        setStats([
          { icon: "calendar", value: "--", label: "Workouts", sublabel: "This Month", highlight: "Data unavailable" },
          { icon: "scale", value: "--", label: "Current BMI", highlight: "No data" },
          { icon: "flame", value: "--", label: "Daily Calories", sublabel: "Target", highlight: "No plan" },
          { icon: "chart", value: "--", label: "Days Left", sublabel: "In Plan", highlight: "No plan" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handlePlanSuccess = (plans: any) => {
    setGeneratedPlans(plans);
  };

  // Generate calendar for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // Split into weeks
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const calendarDays = generateCalendarDays();

  // Get current day of week (0-6, 0 = Sunday)
  const getDayOfWeek = () => {
    return currentDate.getDay();
  };

  const workoutDays: number[] = [];

  return (
    <div className="min-h-screen px-6 py-8 dark:text-white text-[#1A1816] lg:px-10">
      <PlanGenerationModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        height={userInfo.height}
        weight={userInfo.weight}
        age={userInfo.age}
        userName={userInfo.name}
        onSuccess={handlePlanSuccess}
      />

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="text-white text-lg font-bold">Loading dashboard...</div>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border dark:border-white/10 border-[#E6E3DA] dark:bg-[linear-gradient(135deg,rgba(230,60,47,0.18),rgba(17,17,17,0.94))] bg-[linear-gradient(135deg,rgba(244,208,63,0.08),rgba(255,255,255,0.94))] p-6 dark:shadow-[0_20px_80px_rgba(0,0,0,0.35)] shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:backdrop-blur-xl backdrop-blur-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border dark:border-[#E63C2F]/30 border-[#F4D03F]/30 dark:bg-black/30 bg-white/50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] dark:text-white/70 text-[#6B625A]">
                Member dashboard
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tight dark:text-white text-[#1A1816] sm:text-5xl">
                Welcome Back, <span className="text-[#E63C2F]">{userInfo.name}</span>
              </h1>
              <p className="mt-3 text-sm dark:text-white/60 text-[#9A8F87] sm:text-base">
                {currentDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} — Leg Day Today!
              </p>
            </div>

            <div />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {dashboardHighlights.map((item) => (
              <div key={item.title} className="rounded-3xl border dark:border-white/10 border-[#E6E3DA] dark:bg-black/25 bg-white/50 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] dark:text-white/40 text-[#9A8F87]">{item.title}</div>
                <div className="mt-2 text-2xl font-black dark:text-white text-[#1A1816]">{item.value}</div>
                <div className="mt-2 text-sm dark:text-white/60 text-[#9A8F87]">{item.detail}</div>
              </div>
            ))}
          </div>

          {generatedPlans && (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
              ✓ Plans generated successfully. Use the sidebar to open Workout Plan or Meal Plan.
            </div>
          )}
        </section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-[2rem] border dark:border-white/10 border-[#E6E3DA] dark:bg-white/5 bg-white/50 p-6 dark:backdrop-blur-xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.25)] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-[0.28em] dark:text-white text-[#1A1816]">This Week&apos;s Workouts</h2>
                <Link href="/dashboard/workouts" className="text-xs uppercase tracking-[0.28em] dark:text-white/45 text-[#9A8F87] dark:hover:text-white hover:text-[#1A1816]">View Full Plan →</Link>
              </div>
              <div className="space-y-3">
                {workouts.map((workout, index) => (
                  <WorkoutCard key={index} {...workout} />
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border dark:border-white/10 border-[#E6E3DA] dark:bg-white/5 bg-white/50 p-6 dark:backdrop-blur-xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.25)] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-[0.28em] dark:text-white text-[#1A1816]">Progress Tracking</h2>
                <Link href="/dashboard/profile" className="text-xs uppercase tracking-[0.28em] dark:text-white/45 text-[#9A8F87] dark:hover:text-white hover:text-[#1A1816]">Full Report →</Link>
              </div>
              <ProgressBar label="Weight Goal" value={68} max={75} displayText="68 kg → 75 kg" />
              <ProgressBar label="Monthly Attendance" value={24} max={30} displayText="24/30 days" />
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border dark:border-white/10 border-[#E6E3DA] dark:bg-white/5 bg-white/50 p-6 dark:backdrop-blur-xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.25)] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <h2 className="mb-4 text-lg font-black uppercase tracking-[0.28em] dark:text-white text-[#1A1816]">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()}</h2>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day) => (
                  <div key={day} className="py-2 text-[10px] font-black tracking-[0.3em] dark:text-white/35 text-[#C4BAB1]">{day}</div>
                ))}
                {calendarDays.flat().map((day, index) => (
                  <div
                    key={index}
                    className={`rounded-lg py-2 text-sm ${
                      day === currentDate.getDate()
                        ? "bg-[#E63C2F] font-black text-white"
                        : day
                        ? "dark:text-white/55 text-[#6B625A]"
                        : ""
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border dark:border-white/10 border-[#E6E3DA] dark:bg-white/5 bg-white/50 p-6 dark:backdrop-blur-xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.25)] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <h2 className="mb-4 text-lg font-black uppercase tracking-[0.28em] dark:text-white text-[#1A1816]">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <QuickAction icon="chart" label="Check BMI" href="/bmi-calculator" />
                <QuickAction icon="pill" label="Buy Supps" href="/shop" />
                <QuickAction icon="user" label="Book Trainer" href="/dashboard/trainers" />
                <QuickAction icon="food" label="Meal Plan" href="/dashboard/meals" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
