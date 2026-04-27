"use client";

import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    plan: 'basic',
    membershipStatus: 'pending'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member');
      }

      onSuccess();
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        plan: 'basic',
        membershipStatus: 'pending'
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#2B2621] w-full max-w-md rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-[#F4D03F] text-xl font-black uppercase tracking-widest">Add New Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 text-red-400 text-sm rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-1">First Name</label>
              <input 
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]" 
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Last Name</label>
              <input 
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]" 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Email</label>
            <input 
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#1A1A1A] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]" 
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Password</label>
            <input 
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#1A1A1A] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Plan</label>
              <select 
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
              >
                <option value="basic">Basic (LKR 2,500)</option>
                <option value="gold">Gold (LKR 5,000)</option>
                <option value="elite">Elite (LKR 8,000)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Status</label>
              <select 
                name="membershipStatus"
                value={formData.membershipStatus}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white uppercase text-xs font-bold tracking-wider"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#F4D03F] hover:bg-[#E5C730] text-black px-6 py-2 rounded text-xs font-black uppercase tracking-wider flex items-center gap-2"
            >
              {loading && <Loader size={14} className="animate-spin" />}
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}