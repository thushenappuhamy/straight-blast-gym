"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Home, ShieldCheck, Dumbbell, HeartPulse, Flame, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [fitnessGoal, setFitnessGoal] = useState("muscle-gain");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "Male",
    dateOfBirth: "",
    fitnessGoal: ["muscle-gain"],
  });

  const benefits = [
    "Free BMI analysis & personalized plan",
    "Access to 50+ premium supplements online",
    "Book sessions with elite trainers",
    "Track your progress & milestones",
  ];

  const fitnessGoals = [
    { id: "muscle-gain", label: "Muscle Gain", icon: Dumbbell },
    { id: "fat-loss", label: "Fat Loss", icon: Flame },
    { id: "endurance", label: "Endurance", icon: HeartPulse },
    { id: "general-fitness", label: "General Fitness", icon: ShieldCheck },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFitnessGoalChange = (goalId: string) => {
    setFitnessGoal(goalId);
    setFormData((prev) => ({
      ...prev,
      fitnessGoal: [goalId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      router.push("/login?message=Account created successfully. Please sign in.");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
        <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[#0b0b0b] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(230,60,47,0.2),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_36px)] opacity-70" />

          <div className="relative z-10 flex items-center justify-between px-8 py-6">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-[0.35em] text-white/75 transition-colors hover:border-[#E63C2F]/40 hover:text-white">
              <Home size={14} className="text-[#E63C2F]" />
              Home
            </Link>
            <div className="flex items-center gap-3">
              <Image src="/logo_new.jpeg" alt="SBG Logo" width={44} height={44} className="rounded-full border border-[#E63C2F]/30" />
              <span className="text-xs font-black uppercase tracking-[0.35em] text-white/70">SBG</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#E63C2F]/30 bg-black/35 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-white/80 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#E63C2F]" />
                Join the SBG system
              </div>

              <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl xl:text-7xl">
                Join The
                <span className="mt-2 block text-[#E63C2F]">Squad.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-white/68">
                Create your account and unlock personalized training, nutrition guidance, and exclusive member benefits.
              </p>

            </div>
          </div>
        </aside>

        <main className="relative flex items-center justify-center overflow-hidden px-6 py-12 sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(230,60,47,0.15),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_38%)]" />

          <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#111111] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-white/80">
                <Home size={14} className="text-[#E63C2F]" />
                Home
              </Link>
              <Image src="/logo_new.jpeg" alt="SBG Logo" width={40} height={40} className="rounded-full border border-white/10" />
            </div>

            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-white/55">
                Already a member?{" "}
                <Link href="/login" className="font-semibold text-white underline decoration-[#E63C2F] decoration-2 underline-offset-4 transition-colors hover:text-[#E63C2F]">
                  Sign in here
                </Link>
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-[#E63C2F]/30 bg-[#E63C2F]/10 px-4 py-3 text-sm text-[#F5F5F5]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-white/65">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-white placeholder:text-white/28 focus:border-[#E63C2F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-white/65">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Silva"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-white placeholder:text-white/28 focus:border-[#E63C2F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-white/65">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-white placeholder:text-white/28 focus:border-[#E63C2F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-white/65">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 pr-11 text-white placeholder:text-white/28 focus:border-[#E63C2F] focus:outline-none [color-scheme:dark]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-[#E63C2F]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-white/65">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 pr-11 text-white placeholder:text-white/28 focus:border-[#E63C2F] focus:outline-none [color-scheme:dark]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-[#E63C2F]"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-white/65">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-white focus:border-[#E63C2F] focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-white/65">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-white focus:border-[#E63C2F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-xs font-black uppercase tracking-[0.35em] text-white/65">
                  Fitness Goal
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {fitnessGoals.map((goal) => {
                    const Icon = goal.icon;

                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleFitnessGoalChange(goal.id)}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold uppercase tracking-[0.24em] transition-colors ${
                          fitnessGoal === goal.id
                            ? "border-[#E63C2F] bg-[#E63C2F]/12 text-white"
                            : "border-white/10 bg-white/5 text-white/75 hover:border-[#E63C2F]/35 hover:bg-white/8"
                        }`}
                      >
                        <Icon size={16} className={fitnessGoal === goal.id ? "text-[#E63C2F]" : "text-white/50"} />
                        {goal.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#E63C2F] px-6 py-4 text-sm font-black uppercase tracking-[0.32em] text-white shadow-[0_0_30px_rgba(230,60,47,0.24)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}