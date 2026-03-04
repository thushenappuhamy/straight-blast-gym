"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [fitnessGoal, setFitnessGoal] = useState("muscle-gain");

  const benefits = [
    "Free BMI analysis & personalized plan",
    "Access to 50+ premium supplements online",
    "Book sessions with elite trainers",
    "Track your progress & milestones",
  ];

  const fitnessGoals = [
    { id: "muscle-gain", label: "Muscle Gain" },
    { id: "fat-loss", label: "Fat Loss" },
    { id: "endurance", label: "Endurance" },
    { id: "general-fitness", label: "General Fitness" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Dark with diagonal stripes */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1A1816] relative overflow-hidden flex-col justify-center px-16">
        {/* Diagonal Stripes Background */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-[200%] w-1 bg-[#F4D03F]/30 transform -rotate-45"
              style={{ left: `${i * 60}px`, top: "-50%" }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <img src="/logo.jpeg" alt="SBG Logo" className="w-16 h-16 rounded-full" />
            <span className="text-white font-black text-xl uppercase">SBG</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl lg:text-6xl font-black italic mb-6">
            <span className="text-white">Join The</span>
            <br />
            <span className="text-[#F4D03F]">Squad.</span>
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-base mb-10 max-w-md">
            Create your account and unlock personalized training, nutrition guidance, and exclusive member benefits.
          </p>

          {/* Benefits List */}
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#F4D03F]" />
                <span className="text-gray-300 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side - Light with form */}
      <div className="w-full lg:w-[55%] bg-[#F5F5F5] flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-lg">
          {/* Form Header */}
          <h2 className="text-3xl lg:text-4xl font-black text-[#1A1816] mb-2 uppercase">
            Create Account
          </h2>
          <p className="text-gray-600 mb-8">
            Already a member?{" "}
            <Link href="/login" className="text-[#1A1816] underline font-medium hover:text-[#F4D03F]">
              Sign in here
            </Link>
          </p>

          {/* Form */}
          <form className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-[#1A1816] placeholder-gray-400 focus:outline-none focus:border-[#F4D03F] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Silva"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-[#1A1816] placeholder-gray-400 focus:outline-none focus:border-[#F4D03F] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-white border border-gray-300 text-[#1A1816] placeholder-gray-400 focus:outline-none focus:border-[#F4D03F] transition-colors"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-[#1A1816] placeholder-gray-400 focus:outline-none focus:border-[#F4D03F] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-[#1A1816] placeholder-gray-400 focus:outline-none focus:border-[#F4D03F] transition-colors"
                />
              </div>
            </div>

            {/* Gender and DOB */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 text-[#1A1816] focus:outline-none focus:border-[#F4D03F] transition-colors appearance-none cursor-pointer">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-[#1A1816] placeholder-gray-400 focus:outline-none focus:border-[#F4D03F] transition-colors"
                />
              </div>
            </div>

            {/* Fitness Goal */}
            <div>
              <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-3">
                Fitness Goal
              </label>
              <div className="flex flex-wrap gap-2">
                {fitnessGoals.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setFitnessGoal(goal.id)}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-full border-2 transition-colors ${
                      fitnessGoal === goal.id
                        ? "bg-[#F4D03F] border-[#F4D03F] text-[#1A1816]"
                        : "bg-white border-gray-300 text-[#1A1816] hover:border-[#F4D03F]"
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-[#F4D03F] text-[#1A1816] font-black text-sm uppercase tracking-wider hover:bg-[#e5c238] transition-colors flex items-center justify-center gap-2"
            >
              Create Account
              <span>→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
