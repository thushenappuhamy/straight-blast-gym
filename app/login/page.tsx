"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      const redirectPath = data.user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[#0b0b0b] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(230,60,47,0.22),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_34px)] opacity-70" />

          <div className="relative z-10 flex items-center justify-between px-8 py-6">
            <Link href="/" className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-[0.35em] text-white/75 transition-colors hover:border-[#E63C2F]/40 hover:text-white">
              <Home size={14} className="text-[#E63C2F]" />
              Home
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#E63C2F]/40 bg-black/40">
                <Image src="/logo_new.jpeg" alt="SBG Logo" width={48} height={48} className="h-full w-full object-cover" />
              </div>
              <div className="leading-none">
                <div className="text-[10px] font-semibold uppercase tracking-[0.45em] text-white/55">Straight</div>
                <div className="text-sm font-black uppercase tracking-[0.35em] text-white">Blast Gym</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#E63C2F]/30 bg-black/35 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-white/80 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#E63C2F]" />
                Negombo&apos;s combat training system
              </div>

              <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-6xl xl:text-7xl">
                Welcome
                <span className="mt-2 block text-[#E63C2F]">Back.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-white/68">
                Sign in to access your workout plans, meal plans, dashboard history, and training tools inside the SBG system.
              </p>

            </div>
          </div>
        </aside>

        <main className="relative flex items-center justify-center overflow-hidden px-6 py-12 sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(230,60,47,0.15),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_36%)]" />

          <div className="relative z-10 w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#111111] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-white/80">
                <Home size={14} className="text-[#E63C2F]" />
                Home
              </Link>
              <div className="flex items-center gap-3">
                <Image src="/logo_new.jpeg" alt="SBG Logo" width={40} height={40} className="rounded-full border border-white/10" />
                <span className="text-xs font-black uppercase tracking-[0.35em] text-white/70">SBG</span>
              </div>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#E63C2F]/35 bg-black/45 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                <Image src="/logo_new.jpeg" alt="SBG Logo" width={80} height={80} className="h-full w-full object-cover" />
              </div>
              <h2 className="mt-6 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm text-white/55">Sign in to your SBG account</p>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-[#E63C2F]/30 bg-[#E63C2F]/10 px-4 py-3 text-sm text-[#F5F5F5]">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-white/65">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-4 text-white placeholder:text-white/28 focus:border-[#E63C2F] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-white/65">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-4 text-white placeholder:text-white/28 focus:border-[#E63C2F] focus:outline-none"
                />
                <div className="mt-2 text-right">
                  <Link href="/forgot-password" className="text-sm text-white/50 transition-colors hover:text-white">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#E63C2F] px-6 py-4 text-sm font-black uppercase tracking-[0.32em] text-white shadow-[0_0_30px_rgba(230,60,47,0.24)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight size={16} />
              </button>

              <div className="relative py-3 text-center">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
                <span className="relative bg-[#111111] px-4 text-xs font-semibold uppercase tracking-[0.35em] text-white/45">
                  New to SBG?
                </span>
              </div>

              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/14 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.3em] text-white transition-colors hover:border-[#E63C2F]/40 hover:bg-white/8"
              >
                Create Account
              </Link>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}