'use client';

import React, { useEffect, useState } from 'react';
import AddBookingModal from '@/components/admin/AddBookingModal';
import Toast from '@/src/components/ui/Toast';
import ConfirmModal from '@/src/components/ui/ConfirmModal';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  Plus, 
  Edit3, 
  Trash2,
  MoreVertical,
  Filter
} from 'lucide-react';

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
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string } | null>(null);

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
    const date = new Date(booking.dateTime);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISODate = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    
    setEditingBooking(booking);
    setFormData({
      memberId: booking.memberId._id,
      trainerId: booking.trainerId._id,
      type: booking.type,
      fee: booking.fee.toString(),
      dateTime: localISODate,
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
      setBookings([data.data, ...bookings]);
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
      setConfirmModal(null);
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
      { icon: Calendar, value: monthBookings.length.toString(), label: 'This Month', subtext: null, color: 'text-[#E63C2F]', bg: 'bg-[#E63C2F]/5' },
      { icon: CheckCircle2, value: todayBookings.length.toString(), label: "Today's Sessions", subtext: todayBookings.filter(b => b.status === 'COMPLETED').length + ' completed', color: 'text-green-500', bg: 'bg-green-500/5' },
      { icon: Clock, value: bookings.filter(b => b.status === 'UPCOMING').length.toString(), label: 'Upcoming', subtext: null, color: 'text-blue-500', bg: 'bg-blue-500/5' },
      { icon: XCircle, value: bookings.filter(b => b.status === 'CANCELLED').length.toString(), label: 'Cancellations', subtext: 'Total Action Needed', color: 'text-red-500', bg: 'bg-red-500/5' },
    ];
  };

  const statCards = getStats();

  const filtered = bookings.filter((b) => {
    if (!b.memberId || !b.trainerId) return false;
    const memberName = `${b.memberId.firstName || ''} ${b.memberId.lastName || ''}`.toLowerCase();
    const trainerName = (b.trainerId.name || '').toLowerCase();
    const matchSearch = memberName.includes(search.toLowerCase()) || trainerName.includes(search.toLowerCase());
    return matchSearch;
  }).sort((a, b) => new Date(b.createdAt || b.dateTime).getTime() - new Date(a.createdAt || a.dateTime).getTime());

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans selection:bg-[#E63C2F]/30">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title="Delete Booking"
          message="Are you sure you want to permanently delete this booking? This action cannot be undone."
          onConfirm={() => handleDeleteBooking(confirmModal.id)}
          onCancel={() => setConfirmModal(null)}
          variant="danger"
        />
      )}

      {/* Header Section */}
      <div className="relative overflow-hidden bg-white/[0.02] border-b border-white/10 px-8 py-10">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-[#E63C2F]/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#E63C2F] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E63C2F]">Booking Management</span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
              Sessions <span className="text-[#E63C2F]">&</span> Schedules
            </h1>
          </div>
          <button
            onClick={handleAddClick}
            className="group flex items-center gap-3 bg-[#E63C2F] text-black font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-[#E63C2F]/90 transition-all active:scale-[0.98] shadow-xl shadow-[#E63C2F]/20"
          >
            <Plus size={20} className="transition-transform group-hover:rotate-90" />
            New Booking
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Stat Cards - Premium Dark Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, index) => (
            <div key={index} className="group relative bg-white/[0.02] border border-white/5 rounded-3xl p-6 transition-all hover:bg-white/[0.04] hover:border-white/10 overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-full blur-3xl opacity-20 -mr-8 -mt-8 transition-transform group-hover:scale-150`} />
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color} w-fit mb-4`}>
                <card.icon size={24} />
              </div>
              <div className="text-4xl font-black mb-1 tabular-nums">{card.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30">{card.label}</div>
              {card.subtext && (
                <div className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full bg-white/5 w-fit ${card.color}`}>
                  {card.subtext}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Filters and Table Area */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[#E63C2F]/10 text-[#E63C2F]">
                <Filter size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Active Bookings</h2>
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Total {filtered.length} entries found</p>
              </div>
            </div>
            
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#E63C2F] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search member or trainer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-[#E63C2F]/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.01]">
                  {['Booking ID', 'Member', 'Trainer', 'Date & Time', 'Type', 'Fee', 'Status', 'Actions'].map((col) => (
                    <th
                      key={col}
                      className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Calendar size={48} />
                        <p className="text-sm font-black uppercase tracking-widest">No bookings match your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((booking) => (
                    <tr key={booking._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black font-mono text-white/40 group-hover:text-[#E63C2F] transition-colors">
                          #BK-{booking._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#E63C2F] to-[#E63C2F]/60 flex items-center justify-center shadow-lg shadow-[#E63C2F]/20">
                            <span className="text-black font-black text-sm">{booking.memberId.firstName[0]}</span>
                          </div>
                          <div className="max-w-[150px]">
                            <p 
                              className="font-bold text-white text-sm truncate" 
                              title={`${booking.memberId.firstName} ${booking.memberId.lastName}`}
                            >
                              {booking.memberId.firstName} {booking.memberId.lastName}
                            </p>
                            <p className="text-[10px] text-white/30 uppercase font-black tracking-wider">Member</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-[120px]">
                          <p className="text-white/80 text-sm font-medium truncate" title={booking.trainerId.name}>
                            {booking.trainerId.name}
                          </p>
                          <p className="text-[10px] text-white/20 uppercase font-black tracking-wider">Trainer</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-white/80 text-sm font-medium">
                            {new Date(booking.dateTime).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-white/30 font-bold uppercase">
                            {new Date(booking.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10" style={getTypeStyle(booking.type)}>
                          {booking.type}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-white font-black text-sm tabular-nums">
                          LKR {booking.fee.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusStyle(booking.status).color }} />
                          <span className="text-[10px] font-black uppercase tracking-widest" style={getStatusStyle(booking.status)}>
                            {booking.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(booking)}
                            className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-[#E63C2F]/10 hover:text-[#E63C2F] transition-all"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, id: booking._id })}
                            className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-red-500/10 hover:text-red-500 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
              Showing {filtered.length} of {bookings.length} total sessions
            </span>
          </div>
        </div>
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
