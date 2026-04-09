"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("📝 Email changed:", value);
    setEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("🔐 Password changed, length:", value.length);
    setPassword(value);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    console.log("🔐 Sign in button clicked");
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      console.log("📤 Sending login request...");
      console.log("📧 Email:", email);
      console.log("🔑 Password length:", password.length);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (!response.ok) {
        console.error("❌ Login failed:", data.error);
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      console.log("✅ Login successful!");
      console.log("👤 User:", data.user);
      console.log("👤 User role:", data.user?.role);
      console.log("🎟️ Token:", data.token?.substring(0, 20) + "...");

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log("✅ Token stored in localStorage");
      }

      const redirectPath = data.user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
      console.log("🔄 Will redirect to:", redirectPath);
      console.log("🔄 Current location:", window.location.href);
      console.log("🔄 About to execute window.location.href = '" + redirectPath + "'");

      // Hard redirect
      setTimeout(() => {
        console.log("⏱️ Executing redirect now...");
        window.location.href = redirectPath;
      }, 100);
    } catch (err: any) {
      console.error("❌ Error:", err);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error stack:", err.stack);
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logo.jpeg" 
            alt="SBG Logo" 
            className="w-24 h-24 rounded-full"
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl lg:text-4xl font-black text-[#1A1816] text-center mb-2 uppercase">
          Welcome Back
        </h1>
        <p className="text-gray-500 text-center mb-10">
          Sign in to your SBG account
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={handleEmailChange}
              required
              className="w-full px-4 py-4 bg-white border border-gray-300 text-[#1A1816] placeholder-gray-400 focus:outline-none focus:border-[#F4D03F] transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              required
              className="w-full px-4 py-4 bg-white border border-gray-300 text-[#1A1816] placeholder-gray-400 focus:outline-none focus:border-[#F4D03F] transition-colors"
            />
            <div className="text-right mt-2">
              <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-[#1A1816] transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#F4D03F] text-[#1A1816] font-black text-sm uppercase tracking-wider hover:bg-[#e5c238] disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? "Signing in..." : "Sign In"}
            <span>→</span>
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#F5F5F5] px-4 text-sm text-gray-500">New to SBG?</span>
            </div>
          </div>

          {/* Create Account Button */}
          <Link href="/signup">
            <button
              type="button"
              className="w-full py-4 bg-transparent border-2 border-[#F4D03F] text-[#F4D03F] font-black text-sm uppercase tracking-wider hover:bg-[#F4D03F] hover:text-[#1A1816] transition-colors"
            >
              Create Account
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}
