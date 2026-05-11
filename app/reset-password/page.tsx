"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred");
        setLoading(false);
        return;
      }

      setSuccess("Your password has been successfully reset.");
      setLoading(false);
      
      // Auto-redirect to login after short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError("An error occurred. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 text-sm rounded" style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 text-sm rounded text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#bbf7d0' }}>
          <p className="font-bold mb-2">{success}</p>
          <p>Redirecting to login...</p>
        </div>
      )}

      {/* Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--foreground)' }}>
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-4 focus:outline-none transition-colors"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--foreground)' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      {/* Back to Login Link */}
      <div className="mt-8 text-center">
        <Link href="/login" className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>
          ← Back to Login
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logo_new.jpeg" 
            alt="SBG Logo" 
            className="w-24 h-24 rounded-full"
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl lg:text-4xl font-black text-center mb-10 uppercase" style={{ color: 'var(--foreground)' }}>
          Reset Password
        </h1>
        
        <Suspense fallback={<div className="text-center py-4" style={{ color: 'var(--muted-foreground)' }}>Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}