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
  Bell,
  CreditCard,
  AlertTriangle
} from "lucide-react";
import PlanGenerationModal from "@/src/components/PlanGenerationModal";
import Toast from "@/src/components/ui/Toast";

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
    <div className="rounded-[1.75rem] border border-white/10 dark:border-white/10 dark:bg-linear-to-br dark:from-white/8 dark:to-white/5 bg-linear-to-br from-black/5 to-white/30 p-6 backdrop-blur-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.2)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:text-white text-[#1A1A1A]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E63C2F]/12 dark:bg-[#E63C2F]/12">
        {iconMap[icon]}
      </div>
      <div className="text-4xl font-black tracking-tight dark:text-white text-[#1A1A1A]">{value}</div>
      <div className="mt-2 text-[10px] font-black uppercase tracking-[0.35em] dark:text-white/45 text-[#888888]">
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
  onClick?: () => void;
};

function QuickAction({ icon, label, href, onClick }: QuickActionProps) {
  const iconMap: Record<string, ReactNode> = {
    chart: <Target size={20} className="text-[#E63C2F]" />,
    pill: <Pill size={20} className="text-[#E63C2F]" />,
    user: <UserIcon size={20} className="text-[#E63C2F]" />,
    food: <UtensilsCrossed size={20} className="text-[#E63C2F]" />,
  };

  const content = (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border dark:border-white/8 border-[#E5E5E5] dark:bg-white/5 bg-white/50 p-4 text-center transition-colors dark:hover:bg-white/8 hover:bg-black/5">
      <div className="mb-3">{iconMap[icon]}</div>
      <span className="text-[10px] font-black uppercase tracking-[0.32em] dark:text-white/80 text-[#1A1A1A]">{label}</span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button type="button" onClick={onClick} className="w-full">{content}</button>;
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
  const [userInfo, setUserInfo] = useState({
    name: "User",
    height: 180,
    weight: 68,
    age: 28,
    bmi: 0,
    membershipStartDate: null as string | null,
    membershipStatus: "inactive"
  });
  const [generatedPlans, setGeneratedPlans] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [dashboardHighlights, setDashboardHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasNotified, setHasNotified] = useState(false);
  const [workoutDayIndices, setWorkoutDayIndices] = useState<number[]>([]);

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
            membershipStartDate: data.user?.membershipStartDate,
            membershipStatus: data.user?.membershipStatus || "inactive"
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

          const indices: number[] = [];
          days.forEach((day: any, index: number) => {
            const isRestDay = !day.title || day.title.toLowerCase().includes('rest');
            if (!isRestDay) {
              indices.push(index);
            }

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
          setWorkoutDayIndices(indices);
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
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [currentDate]);

  useEffect(() => {
    if (notifications.length > 0 && !hasNotified) {
      setToast({
        message: `You have ${notifications.length} payment notifications!`,
        type: 'error'
      });
      setHasNotified(true);
    }
  }, [notifications, hasNotified]);

  useEffect(() => {
    if (userInfo.membershipStartDate && userInfo.membershipStatus === 'active') {
      const startDate = new Date(userInfo.membershipStartDate);
      const nextPaymentDate = new Date(startDate);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1); // Assuming monthly

      const today = new Date();
      const diffTime = nextPaymentDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const newNotifications = [];
      if (diffDays <= 7 && diffDays > 0) {
        newNotifications.push({
          id: 'payment-reminder',
          title: 'Upcoming Payment',
          message: `Your membership renewal is due in ${diffDays} days (${nextPaymentDate.toLocaleDateString()}).`,
          type: 'warning'
        });
      } else if (diffDays <= 0) {
        newNotifications.push({
          id: 'payment-overdue',
          title: 'Payment Overdue',
          message: `Your membership payment was due on ${nextPaymentDate.toLocaleDateString()}. Please settle it to avoid interruption.`,
          type: 'error'
        });
      }
      setNotifications(newNotifications);
    }
  }, [userInfo.membershipStartDate, userInfo.membershipStatus]);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-[#111111] bg-[#F7F6F2]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E63C2F] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 dark:text-white text-[#1A1816] lg:px-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-[2px] w-8 bg-[#E63C2F]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E63C2F]">
                Member Dashboard
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight dark:text-white text-[#1A1A1A] md:text-5xl">
              WELCOME BACK, <span className="text-[#E63C2F]">{userInfo.name.toUpperCase()}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 dark:bg-white/5 bg-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Bell size={24} className="dark:text-white text-[#1A1A1A]" />
              {notifications.length > 0 && (
                <span className="absolute right-3.5 top-3.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E63C2F] opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#E63C2F]"></span>
                </span>
              )}

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-16 w-80 overflow-hidden rounded-3xl border border-white/10 dark:bg-[#1A1A1A] bg-white shadow-2xl z-50">
                  <div className="border-b border-white/5 dark:bg-white/5 bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest dark:text-white text-[#1A1A1A]">Notifications</span>
                      <span className="rounded-full bg-[#E63C2F]/10 px-2 py-0.5 text-[10px] font-bold text-[#E63C2F]">{notifications.length} NEW</span>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="border-b border-white/5 px-6 py-5 transition-colors hover:bg-white/5">
                          <div className="mb-2 flex items-center gap-2">
                            {notif.type === 'error' ? <AlertTriangle size={14} className="text-[#E63C2F]" /> : <Bell size={14} className="text-amber-500" />}
                            <span className="text-xs font-black uppercase tracking-wider dark:text-white text-[#1A1A1A]">{notif.title}</span>
                          </div>
                          <p className="text-xs leading-relaxed dark:text-white/60 text-[#6B625A]">{notif.message}</p>
                          <Link href="/membership" className="mt-3 inline-block text-[10px] font-black uppercase tracking-wider text-[#E63C2F] hover:underline">
                            Settle Payment →
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-10 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full dark:bg-white/5 bg-gray-50">
                          <Check size={20} className="dark:text-white/20 text-gray-300" />
                        </div>
                        <p className="text-xs dark:text-white/40 text-gray-400">All caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </button>
            <Link href="/profile">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E63C2F] text-white shadow-[0_10px_30px_rgba(230,60,47,0.3)] transition-all hover:scale-105 active:scale-95">
                <UserIcon size={24} />
              </div>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column - Stats & Workouts */}
          <div className="lg:col-span-8">
            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            <div className="mb-10 rounded-[2.5rem] border dark:border-white/8 border-[#E5E5E5] dark:bg-black/20 bg-white/50 p-8 backdrop-blur-sm">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight dark:text-white text-[#1A1816]">
                  This Week's Workouts
                </h2>
                <Link href="/workouts" className="text-[10px] font-black uppercase tracking-widest dark:text-white/40 text-[#6B625A] hover:text-[#E63C2F]">
                  View Full Plan →
                </Link>
              </div>
              <div className="space-y-4">
                {workouts.map((workout, i) => (
                  <WorkoutCard key={i} {...workout} />
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] border dark:border-white/8 border-[#E5E5E5] dark:bg-black/20 bg-white/50 p-8 backdrop-blur-sm">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight dark:text-white text-[#1A1816]">
                  Progress Tracking
                </h2>
                <Link href="/analytics" className="text-[10px] font-black uppercase tracking-widest dark:text-white/40 text-[#6B625A] hover:text-[#E63C2F]">
                  Full Report →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                <div className="space-y-6">
                  <ProgressBar label="Weight Goal" value={userInfo.weight} max={100} displayText={`${userInfo.weight} kg → 75 kg`} />
                  <ProgressBar label="Monthly Attendance" value={24} max={30} displayText="24/30 days" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {dashboardHighlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-2xl border dark:border-white/5 border-[#E5E5E5] dark:bg-white/5 bg-white p-4">
                      <div className="h-2 w-2 rounded-full bg-[#E63C2F]" />
                      <div className="flex-1">
                        <div className="text-[10px] font-black uppercase tracking-widest dark:text-white/45 text-[#6B625A]">{item.title}</div>
                        <div className="font-black dark:text-white text-[#1A1816]">{item.value}</div>
                      </div>
                      <div className="text-[10px] dark:text-white/30 text-[#9A8F87]">{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Calendar & Actions */}
          <div className="space-y-8 lg:col-span-4">
            <div className="rounded-[2.5rem] border dark:border-white/8 border-[#E5E5E5] dark:bg-[#1A1A1A] bg-white p-8 shadow-xl">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight dark:text-white text-[#1A1816]">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
                </h2>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-[#9A8F87]">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.flat().map((day, index) => {
                  const isToday = day === currentDate.getDate();
                  const isWorkoutDay = day && workoutDayIndices.includes((index % 7));

                  return (
                    <div
                      key={index}
                      className={`relative rounded-lg py-2 text-sm transition-all ${isToday
                        ? "bg-[#E63C2F] font-black text-white shadow-[0_4px_12px_rgba(230,60,47,0.3)]"
                        : day
                          ? "dark:text-white text-[#1A1816] font-bold hover:bg-white/5"
                          : ""
                        }`}
                    >
                      <div className="text-center">{day}</div>
                      {isWorkoutDay && !isToday && (
                        <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#E63C2F]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2.5rem] border dark:border-white/8 border-[#E5E5E5] dark:bg-black/20 bg-white/50 p-8 backdrop-blur-sm">
              <h2 className="mb-8 text-xl font-black uppercase tracking-tight dark:text-white text-[#1A1816]">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <QuickAction icon="chart" label="Check BMI" href="/bmi" />
                <QuickAction icon="pill" label="Buy Supps" href="/shop" />
                <QuickAction icon="user" label="Book Trainer" href="/trainers" />
                <QuickAction icon="food" label="Meal Plan" onClick={() => setIsPlanModalOpen(true)} />
              </div>
            </div>

            {/* AI Generator Teaser */}
            <div className="group relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-[#E63C2F] to-[#BD2E26] p-8 text-white shadow-[0_20px_50px_rgba(230,60,47,0.3)]">
              <div className="relative z-10">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <Zap size={20} className="fill-white" />
                </div>
                <h3 className="mb-2 text-2xl font-black uppercase leading-tight tracking-tight">
                  Generate Your<br />AI Fitness Plan
                </h3>
                <p className="mb-6 text-sm font-medium text-white/80">
                  Custom workouts & meal plans tailored to your BMI and goals.
                </p>
                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#E63C2F] transition-all group-hover:gap-4 active:scale-95"
                >
                  Get Started <TrendingUp size={16} />
                </button>
              </div>
              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-all group-hover:scale-150" />
              <Dumbbell size={120} className="absolute -bottom-10 -right-10 rotate-12 text-white/10" />
            </div>
          </div>
        </div>
      </div>

      <PlanGenerationModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        userName={userInfo.name}
        height={userInfo.height}
        weight={userInfo.weight}
        age={userInfo.age}
        onSuccess={handlePlanSuccess}
      />
    </div>
  );
}