"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
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
            className="w-full py-4 bg-[#F4D03F] text-[#1A1816] font-black text-sm uppercase tracking-wider hover:bg-[#e5c238] transition-colors flex items-center justify-center gap-2"
          >
            Sign In
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
