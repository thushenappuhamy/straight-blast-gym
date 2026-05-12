'use client';

import React, { useEffect, useState } from 'react';
import AddBookingModal from '@/components/admin/AddBookingModal';
import Toast from '@/src/components/ui/Toast';

interface Booking {
  _id: string;
  memberId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  trainerId: {
    _id: string;
    name: string;
  };
  type: 'STRENGTH' | 'CARDIO' | 'NUTRITION' | 'HYPERTROPHY';
  fee: number;
  dateTime: string;
  status: 'UPCOMING' | 'IN SESSION' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

const getTypeStyle = (type: string) => {
  const styles: Record<string, { background?: string; color?: string }> = {
    STRENGTH: { background: 'var(--primary)', color: 'black' },
    CARDIO: { background: 'rgba(255,255,255,0.04)', color: 'var(--foreground)' },
    NUTRITION: { background: 'rgba(255,255,255,0.04)', color: 'var(--foreground)' },
    HYPERTROPHY: { background: 'rgba(255,255,255,0.04)', color: 'var(--foreground)' },
  };
  return styles[type] || { background: 'rgba(255,255,255,0.04)', color: 'var(--foreground)' };
};

const getStatusStyle = (status: string) => {
  const styles: Record<string, { color: string }> = {
    UPCOMING: { color: 'var(--primary-light)' },
    'IN SESSION': { color: 'var(--primary)' },
    COMPLETED: { color: '#22c55e' },
    CANCELLED: { color: '#ef4444' },
  };
  return styles[status] || { color: 'var(--muted-foreground)' };
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    memberId: '',
    trainerId: '',
    type: 'STRENGTH',
    fee: '',
    dateTime: '',
    status: 'UPCOMING',
    notes: '',
  });

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      console.log('📅 [ADMIN BOOKINGS] Fetching...');
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('❌ [ADMIN BOOKINGS] No token found in localStorage');
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('🔑 [ADMIN BOOKINGS] Token found, length:', token.length);

      const response = await fetch('/api/admin/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📥 [ADMIN BOOKINGS] Response status:', response.status);

      if (!response.ok) {
        let errorMsg = 'Failed to fetch bookings';
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {
          errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('✅ [ADMIN BOOKINGS] Loaded:', data.data?.length || 0, 'bookings');
      setBookings(data.data || []);
      setError('');
    } catch (err: any) {
      console.error('❌ [ADMIN BOOKINGS] Error:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch trainers and members for dropdowns
  const fetchSelectData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [trainersRes, membersRes] = await Promise.all([
        fetch('/api/admin/trainers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/members', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const trainersData = await trainersRes.json();
      const membersData = await membersRes.json();

      if (!trainersRes.ok) {
        console.error('❌ Failed to fetch trainers:', trainersData.error);
        setTrainers([]);
      } else {
        setTrainers(trainersData.data || []);
      }

      if (!membersRes.ok) {
        console.error('❌ Failed to fetch members:', membersData.error);
        setMembers([]);
      } else {
        setMembers(membersData.data || []);
      }
    } catch (err) {
      console.error('❌ Error fetching select data:', err);
      setTrainers([]);
      setMembers([]);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchSelectData();
  }, []);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setFormData({
      memberId: '',
      trainerId: '',
      type: 'STRENGTH',
      fee: '',
      dateTime: '',
      status: 'UPCOMING',
      notes: '',
    });
    setEditingBooking(null);
  };

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleAddBookingSuccess = () => {
    setShowAddModal(false);
    fetchBookings();
  };

  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      memberId: booking.memberId._id,
      trainerId: booking.trainerId._id,
      type: booking.type,
      fee: booking.fee.toString(),
      dateTime: new Date(booking.dateTime).toISOString().slice(0, 16),
      status: booking.status,
      notes: booking.notes || '',
    });
    setShowEditModal(true);
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId: formData.memberId,
          trainerId: formData.trainerId,
          type: formData.type,
          fee: parseFloat(formData.fee),
          dateTime: new Date(formData.dateTime).toISOString(),
          status: formData.status,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      console.log('✅ [ADMIN BOOKINGS] Created:', data.data);
      setBookings([...bookings, data.data]);
      setToast({ message: 'Booking created successfully!', type: 'success' });
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      console.error('❌ [ADMIN BOOKINGS] Error:', err);
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBooking) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/bookings/${editingBooking._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId: formData.memberId,
          trainerId: formData.trainerId,
          type: formData.type,
          fee: parseFloat(formData.fee),
          dateTime: new Date(formData.dateTime).toISOString(),
          status: formData.status,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [UPDATE BOOKING] Response error:', { status: response.status, data });
        throw new Error(data.error || 'Failed to update booking');
      }

      console.log('✅ [ADMIN BOOKINGS] Updated:', data.data);
      setBookings(bookings.map((b) => (b._id === editingBooking._id ? data.data : b)));
      setToast({ message: 'Booking updated successfully!', type: 'success' });
      setShowEditModal(false);
      resetForm();
    } catch (err: any) {
      console.error('❌ [ADMIN BOOKINGS] Error:', err);
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete booking');
      }

      console.log('✅ [ADMIN BOOKINGS] Deleted');
      setBookings(bookings.filter((b) => b._id !== id));
      setToast({ message: 'Booking deleted successfully!', type: 'success' });
    } catch (err: any) {
      console.error('❌ [ADMIN BOOKINGS] Error:', err);
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  const getStats = () => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const todayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.dateTime);
      return bookingDate.toDateString() === today.toDateString();
    });

    const monthBookings = bookings.filter(b => {
      const bookingDate = new Date(b.dateTime);
      return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear;
    });

    return [
      { icon: '📅', value: monthBookings.length.toString(), label: 'This Month', subtext: null, subtextColor: '' },
      { icon: '✅', value: todayBookings.length.toString(), label: "Today's Sessions", subtext: todayBookings.filter(b => b.status === 'COMPLETED').length + ' completed', subtextColor: 'primary' },
      { icon: '⏳', value: bookings.filter(b => b.status === 'UPCOMING').length.toString(), label: 'Upcoming', subtext: null, subtextColor: '' },
      { icon: '✖️', value: bookings.filter(b => b.status === 'CANCELLED').length.toString(), label: 'Cancellations', subtext: 'Total', subtextColor: 'text-red-500' },
    ];
  };

  const statCards = getStats();

  const filtered = bookings.filter((b) => {
    if (!b.memberId || !b.trainerId) return false;
    const memberName = `${b.memberId.firstName || ''} ${b.memberId.lastName || ''}`.toLowerCase();
    const trainerName = (b.trainerId.name || '').toLowerCase();
    const matchSearch = memberName.includes(search.toLowerCase()) || trainerName.includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header */}
      <div className="flex items-center justify-between p-6 mb-8" style={{ borderBottom: '2px solid var(--primary)', background: 'linear-gradient(90deg, rgba(0,0,0,0.12), transparent)' }}>
        <div className="max-w-7xl mx-auto flex-1">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--primary)' }}>
            Manage Bookings
          </div>
          <h1 className="text-4xl font-black uppercase" style={{ color: 'var(--foreground)' }}>Bookings</h1>
        </div>
        <button
          onClick={handleAddClick}
          className="text-black font-black text-sm uppercase px-6 py-3 transition-all shadow-lg"
          style={{ background: 'var(--primary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-light)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
        >
          + ADD BOOKING
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="p-6 relative overflow-hidden" style={{ background: 'var(--card)' }}>
              <div className="text-3xl mb-3 opacity-40" style={{ color: 'rgba(255,255,255,0.3)' }}>{card.icon}</div>
              <div className="text-5xl font-black mb-2" style={{ color: 'var(--primary)' }}>{card.value}</div>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>{card.label}</div>
              {card.subtext && (
                <div className="text-sm font-bold" style={card.subtextColor === 'primary' ? { color: 'var(--primary)' } : {}}>{card.subtext}</div>
              )}
            </div>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 font-bold">
            ❌ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg font-bold">📅 Loading bookings...</p>
          </div>
        )}

        {/* Bookings Table */}
        {!loading && (
          <div className="bg-white shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-black uppercase tracking-tight">All Bookings</h2>
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search member or trainer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border text-sm"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: 'var(--card)' }}>
                  <tr>
                    {['Booking ID', 'Member', 'Trainer', 'Date & Time', 'Type', 'Fee', 'Status', 'Actions'].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider"
                        style={{ color: 'var(--primary)' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-bold">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        {/* Booking ID */}
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 text-xs">
                          BK-{booking._id.slice(-6).toUpperCase()}
                        </td>
                        {/* Member */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--primary)' }}>
                              <span className="text-black font-black text-sm">{booking.memberId.firstName[0]}</span>
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{booking.memberId.firstName} {booking.memberId.lastName}</span>
                          </div>
                        </td>
                        {/* Trainer */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-sm">
                          {booking.trainerId.name}
                        </td>
                        {/* Date & Time */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-sm">
                          {new Date(booking.dateTime).toLocaleString()}
                        </td>
                        {/* Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider`} style={getTypeStyle(booking.type)}>
                            {booking.type}
                          </span>
                        </td>
                        {/* Fee */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium text-sm">
                          LKR {booking.fee.toLocaleString()}
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-bold uppercase tracking-wider" style={getStatusStyle(booking.status)}>
                            {booking.status}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(booking)}
                              className="text-xs font-bold uppercase px-3 py-1 border border-blue-400 text-blue-600 hover:bg-blue-50 tracking-wider"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking._id)}
                              className="text-xs font-bold uppercase px-3 py-1 border border-red-400 text-red-600 hover:bg-red-50 tracking-wider"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-500">
              Showing {filtered.length} of {bookings.length} bookings
            </div>
          </div>
        )}
      </div>

      {/* Add Booking Modal - Professional 3-Step Form */}
      {showAddModal && (
        <AddBookingModal
          members={members}
          trainers={trainers}
          onClose={handleCloseModal}
          onSuccess={handleAddBookingSuccess}
        />
      )}

      {/* Edit Booking Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="rounded-2xl border-2 max-w-2xl w-full p-8" style={{ background: 'var(--card)', borderColor: 'rgba(255,255,255,0.04)' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-6" style={{ borderBottom: '2px solid rgba(255,255,255,0.04)' }}>
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>Management</p>
                <h2 className="text-3xl font-black uppercase tracking-tight" style={{ color: 'var(--foreground)' }}>Edit Booking</h2>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-3xl font-black transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateBooking} className="space-y-6">
              {/* Member Selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Member *</label>
                <select
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  className="w-full px-4 py-2 border-2 outline-none font-bold"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                  required
                >
                  <option value="">Select a member...</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.firstName} {m.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trainer Selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Trainer *</label>
                <select
                  value={formData.trainerId}
                  onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                  className="w-full px-4 py-2 border-2 outline-none font-bold"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                  required
                >
                  <option value="">Select a trainer...</option>
                  {trainers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Type */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border-2 outline-none font-bold"
                    style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                    required
                  >
                    <option value="STRENGTH">Strength</option>
                    <option value="CARDIO">Cardio</option>
                    <option value="NUTRITION">Nutrition</option>
                    <option value="HYPERTROPHY">Hypertrophy</option>
                  </select>
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full px-4 py-2 border-2 outline-none font-bold"
                    style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                    required
                  />
                </div>

                {/* Fee */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">Fee (LKR) *</label>
                  <input
                    type="number"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    placeholder="5000"
                    className="w-full px-4 py-2 border-2 outline-none font-bold"
                    style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 outline-none font-bold"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="IN SESSION">In Session</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full px-4 py-2 border-2 outline-none font-bold"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
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
                  ✓ Update Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
