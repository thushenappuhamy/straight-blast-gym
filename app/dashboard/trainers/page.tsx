'use client';

import React, { useEffect, useState } from 'react';

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 rounded-lg border px-5 py-3 text-sm font-bold text-white shadow-lg ${
        type === 'success' ? 'border-green-500 bg-green-500/95' : 'border-red-500 bg-red-500/95'
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

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    dateTime: '',
    type: 'STRENGTH',
    notes: '',
  });

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trainerId: selectedTrainer.id,
          fee: selectedTrainer.price,
          type: formData.type,
          dateTime: new Date(formData.dateTime).toISOString(),
          notes: formData.notes,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to book trainer');
      }

      setToast({ message: 'Trainer booked successfully!', type: 'success' });
      setShowModal(false);
      setFormData({ dateTime: '', type: 'STRENGTH', notes: '' });
      setSelectedTrainer(null);
    } catch (err: any) {
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch trainers and poll for updates every 5 seconds
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        console.log('👨‍🏫 [USER TRAINERS] Fetching...');
        const response = await fetch('/api/trainers', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        const result = await response.json();
        
        if (result.success) {
          // Transform API data and filter out deleted trainers
          const transformedTrainers = result.data
            .filter((trainer: any) => trainer.status !== 'deleted') // Don't show deleted trainers
            .map((trainer: any) => ({
              id: trainer._id,
              name: `${trainer.firstName} ${trainer.lastName}`.toUpperCase(),
              specialty: trainer.specialty.toUpperCase(),
              badge: trainer.isFeatured ? 'HEAD COACH' : null,
              tags: trainer.specializations || [],
              experience: trainer.experience || 0,
              clients: trainer.totalClients || 0,
              rating: trainer.ratingAverage || 0,
              price: trainer.costPerSession || 0,
              featured: trainer.isFeatured || false,
              status: trainer.status || 'active',
              isInactive: trainer.status === 'inactive',
            }));
          console.log('✅ [USER TRAINERS] Loaded:', transformedTrainers.length);
          setTrainers(transformedTrainers);
          setError(null);
        } else {
          setError('Failed to load trainers');
        }
      } catch (err) {
        console.error('❌ [USER TRAINERS] Error:', err);
        setError('An error occurred while loading trainers');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTrainers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="text-[#E63C2F] text-xs font-bold uppercase tracking-wider mb-4">
            Expert Coaching
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tight">
            Meet Our Trainers
          </h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-white text-xl font-bold py-12">
            Loading trainers...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 text-xl font-bold py-12">
            {error}
          </div>
        )}

        {/* Trainer Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className={`rounded-2xl overflow-hidden transition-shadow bg-white/2 border ${
                trainer.featured ? 'border-[#E63C2F] shadow-[0_20px_60px_rgba(230,60,47,0.08)]' : 'border-white/8'
              } ${trainer.isInactive ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {/* Profile Image Section */}
              <div className="relative h-64 bg-linear-to-br from-black/20 to-black flex items-center justify-center">
                {/* Placeholder for profile image */}
                <div className="text-white text-8xl font-black opacity-10">?</div>

                {/* Inactive Overlay */}
                {trainer.isInactive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center">
                      <div className="text-2xl font-black uppercase tracking-wider mb-2 text-white">INACTIVE</div>
                      <p className="text-xs text-white/60">This trainer is currently unavailable</p>
                    </div>
                  </div>
                )}

                {/* Badge */}
                {trainer.badge && !trainer.isInactive && (
                  <div className="absolute top-4 right-4 bg-[#E63C2F] text-black font-bold text-[10px] uppercase tracking-wider px-3 py-1">
                    {trainer.badge}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="p-6">
                <h3 className="text-white text-xl font-black uppercase tracking-tight mb-2">{trainer.name}</h3>
                <p className="text-[#E63C2F] text-sm font-bold uppercase tracking-wider mb-4">{trainer.specialty}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {trainer.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-black/30 text-white/70 text-[10px] font-bold uppercase tracking-wider px-3 py-1 border border-white/8 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-white text-2xl font-black">{trainer.experience}YR</div>
                    <div className="text-white/50 text-[10px] uppercase tracking-wider">Experience</div>
                  </div>
                  <div>
                    <div className="text-white text-2xl font-black">{trainer.clients}</div>
                    <div className="text-white/50 text-[10px] uppercase tracking-wider">Clients</div>
                  </div>
                  <div>
                    <div className="text-white text-2xl font-black">{trainer.rating}★</div>
                    <div className="text-white/50 text-[10px] uppercase tracking-wider">Rating</div>
                  </div>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-2xl font-black">LKR {trainer.price.toLocaleString()}</div>
                    <div className="text-white/50 text-xs">per session</div>
                  </div>
                  <button
                    disabled={trainer.isInactive}
                    onClick={() => {
                      setSelectedTrainer(trainer);
                      setShowModal(true);
                    }}
                    className={`font-black text-sm uppercase tracking-wider px-6 py-3 transition-all rounded-xl ${
                      trainer.isInactive
                        ? 'bg-white/8 text-white/40 cursor-not-allowed'
                        : 'bg-[#E63C2F] hover:bg-[#cf3529] text-black'
                    }`}
                    title={trainer.isInactive ? 'This trainer is currently unavailable' : 'Select this trainer'}
                  >
                    {trainer.isInactive ? 'Unavailable' : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && selectedTrainer && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#111] rounded-2xl border border-white/10 max-w-md w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Book Session</h2>
            <p className="text-sm text-white/60 mb-6">with {selectedTrainer.name}</p>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Session Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#E63C2F]"
                  required
                >
                  <option value="STRENGTH">Strength & Conditioning</option>
                  <option value="CARDIO">Cardio / HIIT</option>
                  <option value="NUTRITION">Nutrition Consultation</option>
                  <option value="HYPERTROPHY">Hypertrophy (Muscle Building)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  className="scheme-dark w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#E63C2F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any specific goals or injuries?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#E63C2F]"
                  rows={3}
                ></textarea>
              </div>
              
              <div className="pt-4 border-t border-white/10 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/70 text-sm">Session Fee:</span>
                  <span className="text-xl font-black text-white">LKR {selectedTrainer.price.toLocaleString()}</span>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-white/20 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-[#E63C2F] text-black font-black uppercase tracking-wider rounded-lg hover:bg-[#ff4e40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Booking...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
