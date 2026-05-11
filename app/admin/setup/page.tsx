'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@sbgnegombo.lk',
    password: 'Admin@2024',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-setup-token': process.env.NEXT_PUBLIC_SETUP_TOKEN || 'sbg-setup-token-2024',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create admin');
        setLoading(false);
        return;
      }

      setSuccess('Admin user created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-6 py-12">
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
        <h1 className="text-3xl lg:text-4xl font-black text-[#1A1816] text-center mb-2 uppercase">
          Admin Setup
        </h1>
        <p className="text-gray-500 text-center mb-10">
          Create your admin account
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-3 bg-green-100 border border-green-300 text-green-700 text-sm rounded">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name */}
          <div>
            <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 bg-white border border-gray-300 text-[#1A1816] placeholder-gray-400 focus:outline-none focus:border-[#F4D03F] transition-colors"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 bg-white border border-gray-300 text-[#1A1816] placeholder-gray-400 focus:outline-none focus:border-[#F4D03F] transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#1A1816] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-4 py-4 bg-white border border-gray-300 text-[#1A1816] placeholder-gray-400 focus:outline-none focus:border-[#F4D03F] transition-colors"
            />
          </div>

          {/* Create Admin Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#F4D03F] text-[#1A1816] font-black text-sm uppercase tracking-wider hover:bg-[#e5c238] disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? "Creating..." : "Create Admin User"}
            <span>→</span>
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-8">
          ⚠️ This page should only be used during setup. Delete it in production.
        </p>
      </div>
    </div>
  );
}
