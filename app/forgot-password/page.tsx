"use client";

import Link from "next/link";
import { useState } from "react";

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-6 right-6 z-50 rounded-lg border px-5 py-3 text-sm font-bold text-white shadow-lg ${
        type === "success" ? "border-green-500 bg-green-500/95" : "border-red-500 bg-red-500/95"
      }`}
    >
      <div className="flex items-start gap-4">
        <span>{message}</span>
        <button type="button" onClick={onClose} className="text-white/80 transition-colors hover:text-white">
          ×
        </button>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setToast({ message: "Please enter your email address", type: "error" });
      return;
    }

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
        setToast({ message: data.error || "An error occurred", type: "error" });
        setLoading(false);
        return;
      }

      setToast({ message: data.message || "Check your email for a reset link!", type: "success" });
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
      setLoading(false);
    } catch (err: any) {
      setToast({ message: "An error occurred. Please try again later.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="w-full max-w-md">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logo_new.jpeg" 
            alt="SBG Logo" 
            className="w-24 h-24 rounded-full"
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl lg:text-4xl font-black text-center mb-2 uppercase" style={{ color: 'var(--foreground)' }}>
          Forgot Password
        </h1>
        <p className="text-center mb-10" style={{ color: 'var(--muted-foreground)' }}>
          Enter your email to receive a password reset link
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--foreground)' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={handleEmailChange}
              required
              className="w-full px-4 py-4 focus:outline-none transition-colors"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-black font-black text-sm uppercase tracking-wider disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
            style={{ background: 'var(--primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {resetUrl && (
          <div className="mt-6 rounded border p-4 text-sm" style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)', color: '#bbf7d0' }}>
            <div className="font-bold">Reset link generated</div>
            <a href={resetUrl} className="mt-2 inline-block font-bold" style={{ color: 'var(--primary)' }}>
              Open password reset link
            </a>
          </div>
        )}

        {/* Back to Login Link */}
        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}