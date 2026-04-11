"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setSuccess("");
    setResetUrl("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred");
        setLoading(false);
        return;
      }

      // Success branch
      setSuccess(data.message || "Check your email for a reset link!");
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
      setLoading(false);
    } catch (err: any) {
      setError("An error occurred. Please try again later.");
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
          Forgot Password
        </h1>
        <p className="text-gray-500 text-center mb-10">
          Enter your email to receive a password reset link
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded">
            {success}
            {resetUrl && (
              <div className="mt-3">
                <a
                  href={resetUrl}
                  className="underline font-bold"
                >
                  Open password reset link
                </a>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#F4D03F] text-[#1A1816] font-black text-sm uppercase tracking-wider hover:bg-[#e5c238] disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm font-bold text-[#1A1816] hover:underline uppercase tracking-wider">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}