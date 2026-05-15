'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Star, MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';

interface Booking {
  _id: string;
  trainerId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  type: 'STRENGTH' | 'CARDIO' | 'NUTRITION' | 'HYPERTROPHY';
  fee: number;
  dateTime: string;
  status: 'UPCOMING' | 'IN SESSION' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    STRENGTH: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    CARDIO: 'text-red-400 bg-red-400/10 border-red-400/20',
    NUTRITION: 'text-green-400 bg-green-400/10 border-green-400/20',
    HYPERTROPHY: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };
  return colors[type] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
};

const getStatusStyle = (status: string) => {
  const styles: Record<string, { color: string; bg: string; icon: any }> = {
    UPCOMING: { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Clock },
    'IN SESSION': { color: 'text-orange-400', bg: 'bg-orange-400/10', icon: AlertCircle },
    COMPLETED: { color: 'text-green-400', bg: 'bg-green-400/10', icon: CheckCircle2 },
    CANCELLED: { color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
  };
  return styles[status] || { color: 'text-gray-400', bg: 'bg-gray-400/10', icon: Calendar };
};

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; bookingId: string; trainerId: string; trainerName: string } | null>(null);
  const [userRating, setUserRating] = useState(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const getTrainerName = (trainer: any) => {
    if (!trainer) return 'Unknown Trainer';
    return `${trainer.firstName} ${trainer.lastName}`;
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings');
      setBookings(data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const handleRateSession = async () => {
    if (!ratingModal) return;
    setIsSubmittingRating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          trainerId: ratingModal.trainerId,
          bookingId: ratingModal.bookingId,
          rating: userRating
        })
      });
      const data = await response.json();
      if (data.success) {
        setToast({ message: 'Thank you for your feedback!', type: 'success' });
        setRatingModal(null);
        fetchBookings();
      } else {
        setToast({ message: data.error || 'Failed to submit rating', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Error submitting rating', type: 'error' });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const stats = {
    upcoming: bookings.filter(b => b.status === 'UPCOMING').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    inSession: bookings.filter(b => b.status === 'IN SESSION').length,
    total: bookings.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50 font-bold uppercase tracking-widest text-xs">Loading Sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-primary text-xs font-black uppercase tracking-[0.2em]">Personal Training</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
              My <span className="text-primary">Sessions</span>
            </h1>
            <p className="text-white/40 font-medium max-w-md">Track your progress and manage your upcoming training appointments.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-sm">
            <div className="px-6 py-3 text-center">
              <p className="text-2xl font-black text-white">{stats.total}</p>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Total</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="px-6 py-3 text-center">
              <p className="text-2xl font-black text-green-500">{stats.completed}</p>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Done</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Active & Upcoming */}
          <div className="lg:col-span-2 space-y-10">
            {/* Upcoming Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Clock className="text-primary" size={24} />
                  Upcoming <span className="text-white/20">Sessions</span>
                </h2>
                <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-white/40">{stats.upcoming} Scheduled</span>
              </div>

              {bookings.filter(b => b.status === 'UPCOMING' || b.status === 'IN SESSION').length === 0 ? (
                <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 text-center">
                  <Calendar className="mx-auto text-white/10 mb-4" size={48} />
                  <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No upcoming sessions</p>
                  <button className="mt-6 text-primary font-black text-xs uppercase tracking-wider hover:underline">Book a Trainer Now</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.filter(b => b.status === 'UPCOMING' || b.status === 'IN SESSION').map((booking) => {
                    const status = getStatusStyle(booking.status);
                    const StatusIcon = status.icon;
                    return (
                      <div key={booking._id} className="group relative bg-[#111111] border border-white/5 rounded-3xl p-6 transition-all hover:border-primary/50 hover:bg-[#161616]">
                        <div className="flex justify-between items-start mb-6">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getTypeColor(booking.type)}`}>
                            {booking.type}
                          </div>
                          <div className={`flex items-center gap-1.5 ${status.color}`}>
                            <StatusIcon size={14} className={booking.status === 'IN SESSION' ? 'animate-pulse' : ''} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{booking.status}</span>
                          </div>
                        </div>

                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">
                          {getTrainerName(booking.trainerId)}
                        </h3>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-white/40">
                            <Calendar size={16} />
                            <span className="text-sm font-bold">{new Date(booking.dateTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/40">
                            <Clock size={16} />
                            <span className="text-sm font-bold">{new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Fee</p>
                            <p className="text-lg font-black tracking-tight">LKR {booking.fee.toLocaleString()}</p>
                          </div>
                          {booking.notes && (
                            <div className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors cursor-help" title={booking.notes}>
                              <MessageSquare size={18} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Completed History */}
            <section>
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 mb-6">
                <CheckCircle2 className="text-green-500" size={24} />
                Recent <span className="text-white/20">History</span>
              </h2>
              
              <div className="space-y-3">
                {bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED').slice(0, 5).map((booking) => {
                  const status = getStatusStyle(booking.status);
                  return (
                    <div key={booking._id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.07] transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.bg} ${status.color}`}>
                          {booking.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight text-sm">
                            {getTrainerName(booking.trainerId)}
                            <span className="mx-2 text-white/20">•</span>
                            <span className="text-white/40 text-xs font-bold">{booking.type}</span>
                          </p>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mt-1">
                            {new Date(booking.dateTime).toLocaleDateString()} at {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Paid</p>
                          <p className="text-sm font-black">LKR {booking.fee.toLocaleString()}</p>
                        </div>
                        {booking.status === 'COMPLETED' && (
                          <button 
                            onClick={() => setRatingModal({ 
                              isOpen: true, 
                              bookingId: booking._id, 
                              trainerId: booking.trainerId?._id || '', 
                              trainerName: getTrainerName(booking.trainerId) 
                            })}
                            disabled={!booking.trainerId}
                            className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20 disabled:opacity-30"
                          >
                            Rate
                          </button>
                        )}
                        {booking.status === 'CANCELLED' && (
                          <div className="px-4 py-2 rounded-xl text-red-500/50 text-[10px] font-black uppercase tracking-wider border border-red-500/10 bg-red-500/5">
                            Cancelled
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-xl">
          <div className="bg-[#111111] border border-white/10 rounded-[2.5rem] max-w-sm w-full p-10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Star className="text-primary fill-primary" size={40} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Rate Trainer</h2>
            <p className="text-sm text-white/40 mb-8 font-medium italic">How was your session with {ratingModal.trainerName}?</p>
            
            <div className="flex justify-center gap-3 mb-10">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className={`text-4xl transition-all transform hover:scale-110 active:scale-95 ${star <= userRating ? 'text-primary drop-shadow-[0_0_10px_rgba(230,60,47,0.5)]' : 'text-white/10'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRateSession}
                disabled={isSubmittingRating}
                className="w-full py-4 bg-primary text-white font-black uppercase tracking-wider rounded-2xl hover:bg-primary-light transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
              >
                {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
              <button
                onClick={() => setRatingModal(null)}
                className="w-full py-4 bg-white/5 text-white/40 font-bold uppercase tracking-wider rounded-2xl hover:bg-white/10 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-50 px-8 py-4 rounded-2xl text-white font-black uppercase tracking-wider text-xs shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex items-center gap-4">
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
