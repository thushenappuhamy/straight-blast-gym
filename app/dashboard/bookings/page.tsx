'use client';

import React, { useEffect, useState } from 'react';

interface Booking {
  _id: string;
  trainerId: {
    name: string;
  };
  type: 'STRENGTH' | 'CARDIO' | 'NUTRITION' | 'HYPERTROPHY';
  fee: number;
  dateTime: string;
  status: 'UPCOMING' | 'IN SESSION' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

const getTypeStyle = (type: string) => {
  const styles: Record<string, string> = {
    STRENGTH: 'from-yellow-400 to-yellow-600',
    CARDIO: 'from-red-400 to-red-600',
    NUTRITION: 'from-green-400 to-green-600',
    HYPERTROPHY: 'from-blue-400 to-blue-600',
  };
  return styles[type] || 'from-gray-400 to-gray-600';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    UPCOMING: 'bg-blue-100 text-blue-800 border-blue-300',
    'IN SESSION': 'bg-orange-100 text-orange-800 border-orange-300',
    COMPLETED: 'bg-green-100 text-green-800 border-green-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user's bookings
  const fetchBookings = async () => {
    try {
      console.log('📅 [USER BOOKINGS] Fetching...');
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      console.log('✅ [USER BOOKINGS] Loaded:', data.data);
      setBookings(data.data || []);
      setError('');
    } catch (err: any) {
      console.error('❌ [USER BOOKINGS] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    upcoming: bookings.filter(b => b.status === 'UPCOMING').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    inSession: bookings.filter(b => b.status === 'IN SESSION').length,
    total: bookings.length,
  };

  // Group bookings by status
  const groupedBookings = {
    upcoming: bookings.filter(b => b.status === 'UPCOMING').sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    inSession: bookings.filter(b => b.status === 'IN SESSION'),
    completed: bookings.filter(b => b.status === 'COMPLETED').sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
    cancelled: bookings.filter(b => b.status === 'CANCELLED'),
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#F4D03F] p-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-[#F4D03F] text-xs font-bold uppercase tracking-wider mb-4">
            My Sessions
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-black uppercase tracking-tight">
            My Bookings
          </h1>
          <p className="text-gray-600 mt-2">View and manage your upcoming training sessions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl font-black mb-2">{stats.upcoming}</div>
            <div className="text-xs uppercase font-bold opacity-90">Upcoming Sessions</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl font-black mb-2">{stats.inSession}</div>
            <div className="text-xs uppercase font-bold opacity-90">In Session</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl font-black mb-2">{stats.completed}</div>
            <div className="text-xs uppercase font-bold opacity-90">Completed</div>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-6 rounded-lg shadow-lg">
            <div className="text-3xl font-black mb-2">{stats.total}</div>
            <div className="text-xs uppercase font-bold opacity-90">Total Bookings</div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg font-bold">📅 Loading your bookings...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-lg font-bold mb-8">
            ❌ {error}
          </div>
        )}

        {/* Upcoming Sessions */}
        {!loading && groupedBookings.upcoming.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 uppercase mb-6">⏳ Upcoming Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupedBookings.upcoming.map((booking) => (
                <div key={booking._id} className={`bg-gradient-to-br ${getTypeStyle(booking.type)} text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs font-black opacity-90 uppercase mb-2">{booking.type}</div>
                      <h3 className="text-2xl font-black">{booking.trainerId.name}</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    📅 {new Date(booking.dateTime).toLocaleDateString()} | 🕐 {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="border-t border-white border-opacity-30 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-90">Trainer Session Fee</p>
                        <p className="text-2xl font-black">LKR {booking.fee.toLocaleString()}</p>
                      </div>
                      {booking.notes && (
                        <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded font-bold text-sm transition-all">
                          Notes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Session */}
        {!loading && groupedBookings.inSession.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 uppercase mb-6">🔴 Currently In Session</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupedBookings.inSession.map((booking) => (
                <div key={booking._id} className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 rounded-lg shadow-lg border-2 border-red-300 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs font-black opacity-90 uppercase mb-2">{booking.type}</div>
                      <h3 className="text-2xl font-black">{booking.trainerId.name}</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    📅 {new Date(booking.dateTime).toLocaleDateString()} | 🕐 {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="border-t border-white border-opacity-30 pt-4">
                    <p className="text-xs opacity-90">Trainer Session Fee</p>
                    <p className="text-2xl font-black">LKR {booking.fee.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Sessions */}
        {!loading && groupedBookings.completed.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 uppercase mb-6">✅ Completed Sessions</h2>
            <div className="space-y-3">
              {groupedBookings.completed.map((booking) => (
                <div key={booking._id} className="border-2 border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between hover:bg-green-100 transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">✅</div>
                    <div>
                      <div className="font-bold text-gray-900">{booking.trainerId.name} - {booking.type}</div>
                      <div className="text-sm text-gray-600">{new Date(booking.dateTime).toLocaleDateString()} at {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Fee Paid</div>
                    <div className="font-black text-green-600">LKR {booking.fee.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Sessions */}
        {!loading && groupedBookings.cancelled.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 uppercase mb-6">❌ Cancelled Sessions</h2>
            <div className="space-y-3">
              {groupedBookings.cancelled.map((booking) => (
                <div key={booking._id} className="border-2 border-red-200 bg-red-50 rounded-lg p-4 flex items-center justify-between hover:bg-red-100 transition-all opacity-75">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">❌</div>
                    <div>
                      <div className="font-bold text-gray-900">{booking.trainerId.name} - {booking.type}</div>
                      <div className="text-sm text-gray-600">{new Date(booking.dateTime).toLocaleDateString()} at {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Was</div>
                    <div className="font-black text-red-600">LKR {booking.fee.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-gray-600 text-lg font-bold mb-4">No bookings yet</p>
            <p className="text-gray-500 mb-6">Book a session with one of our trainers to get started!</p>
            <button className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase px-6 py-3 transition-all">
              Browse Trainers
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-[#2B2621] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">🔄 Live Updates</p>
          <p className="text-sm font-bold">Your bookings automatically update every 5 seconds</p>
        </div>
      </div>
    </div>
  );
}
