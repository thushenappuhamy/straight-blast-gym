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
    <div className="rounded-[1.75rem] border border-border bg-card p-6 backdrop-blur-xl shadow-xl transition-all hover:translate-y-[-4px]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
        {iconMap[icon]}
      </div>
      <div className="text-4xl font-black tracking-tight text-foreground">{value}</div>
      <div className="mt-2 text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
        {label}
        {sublabel ? <><br />{sublabel}</> : null}
      </div>
      {highlight && (
        <div className={`mt-3 text-xs font-black uppercase tracking-[0.22em] ${highlight.includes("Normal") || highlight.includes("Complete") ? "text-emerald-500" : "text-primary"}`}>
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
      ? "bg-emerald-500/10 text-emerald-500"
      : status === "today"
        ? "bg-primary/10 text-primary"
        : "bg-muted text-muted-foreground";

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 transition-all hover:bg-muted/50 group">
      <div className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.28em] transition-colors ${status === "done" ? "bg-foreground text-background" : status === "today" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
        {dayLabel}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{title}</div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{exercises} · {duration}</div>
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
    chart: <Target size={20} className="text-primary" />,
    pill: <Pill size={20} className="text-primary" />,
    user: <UserIcon size={20} className="text-primary" />,
    food: <UtensilsCrossed size={20} className="text-primary" />,
  };

  const content = (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center transition-all hover:bg-primary/10 hover:border-primary/30 group">
      <div className="mb-3 transition-transform group-hover:scale-110">{iconMap[icon]}</div>
      <span className="text-[10px] font-black uppercase tracking-[0.32em] text-foreground group-hover:text-primary transition-colors">{label}</span>
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
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{label}</span>
        <span className="text-[10px] font-black text-muted-foreground uppercase">{displayText}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(230,60,47,0.4)]" style={{ width: `${percentage}%` }} />
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
    plan: "Free",
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
            height: data.user?.height || 180,
            weight: data.user?.weight || 68,
            age: data.user?.age || 28,
            bmi: data.user?.bmi || 0,
            plan: data.user?.plan || "Free",
            membershipStartDate: data.user?.membershipStartDate,
            membershipStatus: data.user?.membershipStatus || "inactive"
          });
        }

        // Fetch notifications from DB
        const notificationsRes = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const notificationsData = await notificationsRes.json();
        if (notificationsData.success && notificationsData.data.length > 0) {
          setNotifications(notificationsData.data);
        } else {
          // Keep the existing logic for auto-generated reminders if no DB notifications
          // But maybe only if there are NO notifications in DB at all
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
          const currentDayOfWeek = currentDate.getDay();
          const dayMap: Record<string, number> = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6,
            'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
          };



          const indices: number[] = [];
          days.forEach((day: any) => {
            const isRestDay = !day.title || day.title.toLowerCase().includes('rest');
            if (!isRestDay && day.day) {
              const dIdx = dayMap[day.day.toLowerCase()];
              if (dIdx !== undefined) {
                indices.push(dIdx);
                
                // Determine status based on current day of week
                let status: "done" | "today" | "upcoming" = "upcoming";
                if (dIdx < currentDayOfWeek) {
                  status = "done";
                } else if (dIdx === currentDayOfWeek) {
                  status = "today";
                }

                extractedWorkouts.push({
                  dayLabel: day.day.substring(0, 3).toUpperCase(),
                  title: day.title || "Workout",
                  exercises: `${day.exercises?.length || 0} exercises`,
                  duration: day.duration || "60 min",
                  status: status
                });
              }
            }
          });

          // Sort extracted workouts by day of the week
          extractedWorkouts.sort((a, b) => {
            const aIdx = dayMap[a.dayLabel.toLowerCase()];
            const bIdx = dayMap[b.dayLabel.toLowerCase()];
            return (aIdx ?? 0) - (bIdx ?? 0);
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 text-foreground bg-background transition-colors duration-300 lg:px-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-[2px] w-8 bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                {userInfo.plan.toUpperCase()} MEMBER DASHBOARD
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
              WELCOME BACK, <span className="text-primary">{userInfo.name.toUpperCase()}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <Bell size={24} className="text-foreground" />
                {notifications.length > 0 && (
                  <span className="absolute right-3.5 top-3.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-20 w-80 overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="border-b border-border bg-muted/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Notifications</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{notifications.length} NEW</span>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif, idx) => (
                        <div key={notif._id || notif.id || idx} className="border-b border-border px-6 py-5 transition-colors hover:bg-muted/50 last:border-0">
                          <div className="mb-2 flex items-center gap-2">
                            {notif.type === 'error' ? <AlertTriangle size={14} className="text-primary" /> : <Bell size={14} className="text-amber-500" />}
                            <span className="text-[10px] font-black uppercase tracking-wider text-foreground">{notif.title}</span>
                          </div>
                          <p className="text-xs leading-relaxed text-muted-foreground">{notif.message}</p>
                          {(notif.link || notif.title.toLowerCase().includes('membership')) && (
                            <Link 
                              href={notif.link || "/dashboard/membership"} 
                              className="mt-3 inline-block text-[10px] font-black uppercase tracking-wider text-primary hover:underline"
                              onClick={() => setShowNotifications(false)}
                            >
                              {notif.link?.includes('membership') || notif.title.toLowerCase().includes('membership') ? 'Settle Payment' : 'View Details'} →
                            </Link>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-10 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Check size={20} className="text-muted-foreground/30" />
                        </div>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">All caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/dashboard/profile">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_30px_rgba(230,60,47,0.3)] transition-all hover:scale-105 active:scale-95">
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

            <div className="mb-10 rounded-[2.5rem] border border-border bg-card p-8 shadow-xl">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                  This Week's Workouts
                </h2>
                <Link href="/dashboard/workouts" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  View Full Plan →
                </Link>
              </div>
              <div className="space-y-4">
                {workouts.map((workout, i) => (
                  <WorkoutCard key={i} {...workout} />
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-border bg-card p-8 shadow-xl">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                  Progress Tracking
                </h2>
                <Link href="/dashboard/profile" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
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
                    <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4 transition-all hover:bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.title}</div>
                        <div className="font-black text-foreground uppercase tracking-tight">{item.value}</div>
                      </div>
                      <div className="text-[10px] font-black text-muted-foreground/60 uppercase">{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Calendar & Actions */}
          <div className="space-y-8 lg:col-span-4">
            <div className="rounded-[2.5rem] border border-border bg-card p-8 shadow-xl">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
                </h2>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-muted-foreground uppercase">{day}</div>
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
                        ? "bg-primary font-black text-white shadow-[0_4px_12px_rgba(230,60,47,0.3)]"
                        : day
                          ? "text-foreground font-black hover:bg-muted"
                          : ""
                        }`}
                    >
                      <div className="text-center">{day}</div>
                      {isWorkoutDay && !isToday && (
                        <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-border bg-card p-8 shadow-xl">
              <h2 className="mb-8 text-xl font-black uppercase tracking-tight text-foreground">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <QuickAction icon="chart" label="Check BMI" href="/bmi-calculator" />
                <QuickAction icon="pill" label="Buy Supps" href="/shop" />
                <QuickAction icon="user" label="Book Trainer" href="/dashboard/trainers" />
                <QuickAction icon="food" label="Meal Plan" href="/dashboard/meals" />
              </div>
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