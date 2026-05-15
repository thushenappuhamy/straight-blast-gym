'use client';

import React, { useEffect, useState } from 'react';
import Toast from '@/src/components/ui/Toast';

interface Membership {
  _id: string;
  name: string;
  description: string;
  tagline: string;
  price: number;
  duration: string;
  features: string[];
  icon?: string;
  color?: string;
  badge?: string;
  isFeatured: boolean;
  isActive: boolean;
  activeMembersCount: number;
  monthlyRevenue: number;
  createdAt: string;
}

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tagline: '',
    price: '',
    duration: 'monthly',
    features: '',
    isFeatured: false,
    isActive: true,
  });

  // Fetch memberships
  const fetchMemberships = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/memberships', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch memberships');
      }

      setMemberships(data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      tagline: '',
      price: '',
      duration: 'monthly',
      features: '',
      isFeatured: false,
      isActive: true,
    });
    setEditingMembership(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditClick = (membership: Membership) => {
    setEditingMembership(membership);
    setFormData({
      name: membership.name,
      description: membership.description,
      tagline: membership.tagline,
      price: membership.price.toString(),
      duration: membership.duration,
      features: membership.features.join('\n'),
      isFeatured: membership.isFeatured,
      isActive: membership.isActive,
    });
    setShowEditModal(true);
  };

  const handleAddMembership = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const features = formData.features
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f);

      const response = await fetch('/api/admin/memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          tagline: formData.tagline,
          price: parseFloat(formData.price),
          duration: formData.duration,
          features,
          isFeatured: formData.isFeatured,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create membership');
      }

      setToast({ message: 'Membership created successfully!', type: 'success' });
      setShowAddModal(false);
      resetForm();
      // Refetch from server to ensure sync with user pages
      await fetchMemberships();
    } catch (err: any) {
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  const handleUpdateMembership = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMembership) return;

    try {
      const token = localStorage.getItem('token');
      const features = formData.features
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f);

      const response = await fetch(`/api/admin/memberships/${editingMembership._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          tagline: formData.tagline,
          price: parseFloat(formData.price),
          duration: formData.duration,
          features,
          isFeatured: formData.isFeatured,
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update membership');
      }

      setToast({ message: 'Membership updated successfully!', type: 'success' });
      setShowEditModal(false);
      resetForm();
      // Refetch from server to ensure sync with user pages
      await fetchMemberships();
    } catch (err: any) {
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  const handleDeleteMembership = async (id: string) => {
    if (!confirm('Are you sure you want to delete this membership plan?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/memberships/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete membership');
      }

      setToast({ message: 'Membership deleted successfully!', type: 'success' });
      // Refetch from server to ensure sync with user pages
      await fetchMemberships();
    } catch (err: any) {
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header */}
      <div className="flex items-center justify-between p-6 mb-8" style={{ borderBottom: '2px solid var(--primary)', background: 'linear-gradient(90deg, rgba(0,0,0,0.2), transparent)' }}>
        <div className="max-w-7xl mx-auto flex-1">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--primary)' }}>
            Manage Memberships
          </div>
          <h1 className="text-4xl font-black uppercase" style={{ color: 'var(--foreground)' }}>Membership Plans</h1>
        </div>
        <button
          onClick={handleAddClick}
          className="text-black font-black text-sm uppercase px-6 py-3 transition-all shadow-lg"
          style={{ background: 'var(--primary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-light)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
        >
          + NEW PLAN
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 font-bold">
            ❌ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg font-bold">📊 Loading membership plans...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && memberships.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600 text-lg font-bold mb-4">No membership plans created yet</p>
            <button
              onClick={handleAddClick}
              className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase px-6 py-3 transition-all"
            >
              + CREATE FIRST PLAN
            </button>
          </div>
        )}

        {/* Memberships Grid */}
        {!loading && memberships.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map((membership) => (
              <div key={membership._id} className="overflow-hidden transition-all" style={{ border: '2px solid rgba(255,255,255,0.04)', background: 'var(--card)' }}>
                {/* Header */}
                <div className="p-4" style={membership.isFeatured ? { background: 'rgba(230,60,47,0.06)', borderBottom: '2px solid var(--primary)' } : { borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-xs font-black uppercase mb-1" style={{ color: 'var(--primary)' }}>{membership.tagline}</div>
                      <h3 className="text-xl font-black uppercase" style={{ color: 'var(--foreground)' }}>{membership.name}</h3>
                    </div>
                    {membership.isFeatured && <span className="text-sm font-black px-2 py-1" style={{ background: 'var(--primary)', color: 'black' }}>⭐ Featured</span>}
                  </div>
                  {!membership.isActive && <span className="text-xs font-bold px-2 py-1" style={{ background: '#4b4b4b', color: 'white' }}>⊘ Inactive</span>}
                </div>

                {/* Content */}
                <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>{membership.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-3 rounded" style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--foreground)' }}>
                      <p className="text-xs uppercase font-bold mb-1" style={{ color: 'var(--muted-foreground)' }}>Price</p>
                      <p className="text-lg font-black">LKR {membership.price.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded" style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--foreground)' }}>
                      <p className="text-xs uppercase font-bold mb-1" style={{ color: 'var(--muted-foreground)' }}>Duration</p>
                      <p className="text-lg font-black text-capitalize">{membership.duration}</p>
                    </div>
                  </div>

                  {/* Revenue Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <p className="text-xs uppercase font-bold" style={{ color: 'var(--muted-foreground)' }}>Members</p>
                      <p className="text-xl font-black" style={{ color: 'var(--primary)' }}>{membership.activeMembersCount}</p>
                    </div>
                    <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <p className="text-xs uppercase font-bold" style={{ color: 'var(--muted-foreground)' }}>Revenue</p>
                      <p className="text-lg font-black" style={{ color: 'var(--primary)' }}>LKR {Math.round(membership.monthlyRevenue).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Features ({membership.features.length})</p>
                  <ul className="space-y-1 text-sm">
                    {membership.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold" style={{ color: 'var(--primary)' }}>✓</span>
                        <span style={{ color: 'var(--foreground)' }}>{feature}</span>
                      </li>
                    ))}
                    {membership.features.length > 3 && <li className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>+ {membership.features.length - 3} more</li>}
                  </ul>
                </div>

                {/* Actions */}
                <div className="p-4 flex gap-2">
                  <button
                    onClick={() => handleEditClick(membership)}
                    className="flex-1 text-white font-bold text-sm uppercase py-2 transition-all"
                    style={{ background: '#2563EB' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMembership(membership._id)}
                    className="flex-1 text-white font-bold text-sm uppercase py-2 transition-all"
                    style={{ background: '#DC2626' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: 'var(--card)', border: '2px solid var(--primary)' }}>
            {/* Modal Header */}
            <div className="sticky top-0 p-6" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.04), transparent)', borderBottom: '2px solid rgba(255,255,255,0.04)' }}>
              <h2 className="text-2xl font-black text-slate-700 uppercase">{showAddModal ? 'Add New Membership Plan' : 'Edit Membership Plan'}</h2>
              <p className="text-sm text-gray-600 mt-1">{showAddModal ? 'Create a new membership plan' : 'Update membership plan details'}</p>
            </div>

            {/* Modal Form */}
            <form onSubmit={showAddModal ? handleAddMembership : handleUpdateMembership} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Plan Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Premium Plus"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 outline-none font-bold"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Tagline *</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Best Value"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 outline-none font-bold"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this membership plan"
                  required
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 outline-none font-bold"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                />
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">Price (LKR) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 outline-none font-bold"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">Duration *</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Features (one per line) *</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Unlimited gym access&#10;Personal trainer&#10;Nutrition plan"
                  required
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 outline-none font-bold text-sm"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-bold text-slate-700">⭐ Featured Plan</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-bold text-slate-700">Active</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 border-2 border-gray-400 text-gray-700 font-black uppercase py-3 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-black font-black uppercase py-3 transition-all"
                  style={{ background: 'var(--primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
                >
                  {showAddModal ? '✓ Create Plan' : '✓ Update Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
