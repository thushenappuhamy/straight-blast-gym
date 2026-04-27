"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Scale, Flame, CheckCircle2, TrendingUp, BarChart3, Pill, User as UserIcon, UtensilsCrossed, Check, Zap } from 'lucide-react';
import PlanGenerationModal from "@/src/components/PlanGenerationModal";
import WorkoutPlanDisplay from "@/src/components/WorkoutPlanDisplay";
import MealPlanDisplay from "@/src/components/MealPlanDisplay";

// Stat Card Component
function StatCard({
  icon,
  value,
  label,
  sublabel,
  highlight,
}: {
  icon: string;
  value: string;
  label: string;
  sublabel?: string;
  highlight?: string;
}) {
  const getIcon = (iconName: string) => {
    const iconProps = { size: 28, className: 'text-[#F4D03F]' };
    switch(iconName) {
      case 'calendar': return <Calendar {...iconProps} />;
      case 'scale': return <Scale {...iconProps} />;
      case 'flame': return <Flame {...iconProps} />;
      case 'chart': return <BarChart3 {...iconProps} />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-2">{getIcon(icon)}</div>
      <div className="text-4xl font-black text-[#1A1816] mb-1">{value}</div>
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {label}
        {sublabel && <br />}
        {sublabel}
      </div>
      {highlight && (
        <div className={`text-xs font-bold mt-2 flex items-center gap-1 ${highlight.includes("Normal") || highlight.includes("Complete") ? "text-green-600" : "text-[#F4D03F]"}`}>
          {highlight.includes("✓") && <Check size={14} className="inline" />}
          {highlight.replace('✓', '').trim()}
        </div>
      )}
    </div>
  );
}

// Workout Card Component
function WorkoutCard({
  day,
  dayLabel,
  title,
  exercises,
  duration,
  status,
}: {
  day: string;
  dayLabel: string;
  title: string;
  exercises: string;
  duration: string;
  status: "done" | "today" | "upcoming";
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#F9F9F9] rounded-lg">
      <div className={`px-3 py-2 rounded text-xs font-black uppercase ${
        status === "done" ? "bg-[#1A1816] text-white" :
        status === "today" ? "bg-[#F4D03F] text-[#1A1816]" :
        "bg-gray-300 text-gray-600"
      }`}>
        {dayLabel}
      </div>
      <div className="flex-1">
        <div className="font-bold text-[#1A1816]">{title}</div>
        <div className="text-xs text-gray-500">{exercises} · {duration}</div>
      </div>
      <div className={`text-xs font-bold uppercase flex items-center gap-1 ${
        status === "done" ? "text-green-600" :
        status === "today" ? "text-[#F4D03F]" :
        "text-gray-400"
      }`}>
        {status === "done" && (
          <>
            <Check size={14} />
            Done
          </>
        )}
        {status === "today" && (
          <>
            <Flame size={14} />
            Today
          </>
        )}
        {status === "upcoming" && "Upcoming"}
      </div>
    </div>
  );
}

// Quick Action Button
function QuickAction({ icon, label, href }: { icon: string; label: string; href?: string }) {
  const getIcon = (iconName: string) => {
    const iconProps = { size: 24, className: 'text-[#F4D03F]' };
    switch(iconName) {
      case 'chart': return <BarChart3 {...iconProps} />;
      case 'pill': return <Pill {...iconProps} />;
      case 'user': return <UserIcon {...iconProps} />;
      case 'food': return <UtensilsCrossed {...iconProps} />;
      default: return null;
    }
  };

  const content = (
    <>
      <div className="mb-2">{getIcon(icon)}</div>
      <span className="text-xs font-bold text-[#1A1816] uppercase tracking-wider">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href}>
        <div className="flex flex-col items-center justify-center p-4 bg-[#F9F9F9] rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
          {content}
        </div>
      </Link>
    );
  }

  return (
    <button className="flex flex-col items-center justify-center p-4 bg-[#F9F9F9] rounded-lg hover:bg-gray-200 transition-colors">
      {content}
    </button>
  );
}

// Progress Bar
function ProgressBar({ label, value, max, displayText }: { label: string; value: number; max: number; displayText: string }) {
  const percentage = (value / max) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-[#1A1816]">{label}</span>
        <span className="text-sm text-gray-500">{displayText}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#F4D03F] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [currentDate] = useState(new Date(2026, 1, 28)); // February 28, 2026
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "Thushen", height: 180, weight: 68, age: 28 });
  const [generatedPlans, setGeneratedPlans] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo({
            name: data.name || "Member",
            height: data.profile?.height || 180,
            weight: data.profile?.weight || 68,
            age: data.profile?.age || 28,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };
    
    fetchUserInfo();
  }, []);

  const handlePlanSuccess = (plans: any) => {
    setGeneratedPlans(plans);
    setActiveTab("workout-plan");
  };
  
  const stats = [
    { icon: "calendar", value: "24", label: "Workouts", sublabel: "This Month", highlight: "↑ 4 from last month" },
    { icon: "scale", value: "22.4", label: "Current BMI", sublabel: "", highlight: "Normal Range ✓" },
    { icon: "flame", value: "2,450", label: "Daily Calories", sublabel: "Target", highlight: "↑ Muscle Gain Plan" },
    { icon: "chart", value: "18", label: "Days Left in", sublabel: "Plan", highlight: "60% Complete" },
  ];

  const workouts = [
    { day: "MON", dayLabel: "MON", title: "Chest & Triceps", exercises: "8 exercises", duration: "60 min", status: "done" as const },
    { day: "TUE", dayLabel: "TUE", title: "Back & Biceps", exercises: "7 exercises", duration: "55 min", status: "done" as const },
    { day: "WED", dayLabel: "WED", title: "Legs & Glutes", exercises: "9 exercises", duration: "65 min", status: "today" as const },
    { day: "THU", dayLabel: "THU", title: "Shoulders & Core", exercises: "6 exercises", duration: "50 min", status: "upcoming" as const },
  ];

  // Calendar data for February 2026
  const calendarDays = [
    [null, null, null, null, null, null, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, null],
  ];

  const workoutDays = [3, 4, 10, 11, 17, 18, 24, 25];

  return (
    <div className="p-8">
      <PlanGenerationModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        height={userInfo.height}
        weight={userInfo.weight}
        age={userInfo.age}
        userName={userInfo.name}
        onSuccess={handlePlanSuccess}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#1A1816] uppercase mb-1">
          Welcome Back, {userInfo.name}
        </h1>
        <p className="text-gray-500">
          Tuesday, February 28, 2026 — Leg Day Today!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-6 py-3 font-black uppercase whitespace-nowrap transition-all ${
            activeTab === "dashboard"
              ? "text-[#F4D03F] border-b-2 border-[#F4D03F] -mb-2"
              : "text-gray-600 hover:text-[#1A1816]"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("generate-plan")}
          className={`px-6 py-3 font-black uppercase whitespace-nowrap transition-all ${
            activeTab === "generate-plan"
              ? "text-[#F4D03F] border-b-2 border-[#F4D03F] -mb-2"
              : "text-gray-600 hover:text-[#1A1816]"
          }`}
        >
          Generate Plan
        </button>
        <button
          onClick={() => setActiveTab("workout-plan")}
          className={`px-6 py-3 font-black uppercase whitespace-nowrap transition-all ${
            activeTab === "workout-plan"
              ? "text-[#F4D03F] border-b-2 border-[#F4D03F] -mb-2"
              : "text-gray-600 hover:text-[#1A1816]"
          }`}
          disabled={!generatedPlans}
        >
          Workout Plan
        </button>
        <button
          onClick={() => setActiveTab("meal-plan")}
          className={`px-6 py-3 font-black uppercase whitespace-nowrap transition-all ${
            activeTab === "meal-plan"
              ? "text-[#F4D03F] border-b-2 border-[#F4D03F] -mb-2"
              : "text-gray-600 hover:text-[#1A1816]"
          }`}
          disabled={!generatedPlans}
        >
          Meal Plan
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Workouts */}
        <div className="lg:col-span-2 space-y-6">
          {/* This Week's Workouts */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-[#1A1816] uppercase">This Week&apos;s Workouts</h2>
              <button className="text-sm text-gray-500 hover:text-[#1A1816] transition-colors">
                View Full Plan →
              </button>
            </div>
            <div className="space-y-3">
              {workouts.map((workout, index) => (
                <WorkoutCard key={index} {...workout} />
              ))}
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-[#1A1816] uppercase">Progress Tracking</h2>
              <button className="text-sm text-gray-500 hover:text-[#1A1816] transition-colors">
                Full Report →
              </button>
            </div>
            <ProgressBar label="Weight Goal" value={68} max={75} displayText="68 kg → 75 kg" />
            <ProgressBar label="Monthly Attendance" value={24} max={30} displayText="24/30 days" />
          </div>
        </div>

        {/* Right Column - Calendar & Quick Actions */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#1A1816] uppercase mb-4">February 2026</h2>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day) => (
                <div key={day} className="text-xs font-bold text-gray-400 py-2">{day}</div>
              ))}
              {calendarDays.flat().map((day, index) => (
                <div
                  key={index}
                  className={`py-2 text-sm rounded ${
                    day === 28
                      ? "bg-[#F4D03F] text-[#1A1816] font-black"
                      : day && workoutDays.includes(day)
                      ? "text-[#F4D03F] font-bold"
                      : day
                      ? "text-gray-600"
                      : ""
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#1A1816] uppercase mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction icon="chart" label="Check BMI" href="/bmi-calculator" />
              <QuickAction icon="pill" label="Buy Supps" />
              <QuickAction icon="user" label="Book Trainer" />
              <QuickAction icon="food" label="Meal Plan" />
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Generate Plan Tab */}
      {activeTab === "generate-plan" && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-8 text-center mb-6">
            <h2 className="text-3xl font-black text-[#1A1816] uppercase mb-3">Create Your Personal Plan</h2>
            <p className="text-gray-600 mb-6">
              Our AI will generate a personalized workout and meal plan based on your metrics and fitness goals.
              Answer a few questions to get started.
            </p>
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black uppercase py-4 px-8 rounded-lg transition-all text-lg"
            >
              Start Plan Generation →
            </button>
          </div>

          {generatedPlans && (
            <div className="bg-green-50 border-2 border-green-500 p-4 rounded-lg">
              <p className="text-green-800 font-bold">✓ Plans generated successfully! Switch to the Workout Plan or Meal Plan tabs to view your plans.</p>
            </div>
          )}
        </div>
      )}

      {/* Workout Plan Tab */}
      {activeTab === "workout-plan" && generatedPlans && (
        <WorkoutPlanDisplay plan={generatedPlans.workoutPlan} />
      )}

      {/* Meal Plan Tab */}
      {activeTab === "meal-plan" && generatedPlans && (
        <MealPlanDisplay plan={generatedPlans.mealPlan} />
      )}
    </div>
  );
}
