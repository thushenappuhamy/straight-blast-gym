'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Users, DollarSign, Package, Calendar, Loader } from 'lucide-react';
import DashboardCharts from '@/components/admin/DashboardCharts';

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [supplements, setSupplements] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    monthlyRevenue: 0,
    ordersThisMonth: 0,
    trainerBookingsToday: 0,
    goldMembers: 0,
    activeTrainers: 0,
    productCount: 0,
    supplementSales: 0,
  });

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [membersRes, bookingsRes, supplementsRes, trainersRes] = await Promise.all([
          fetch('/api/admin/members'),
          fetch('/api/admin/bookings'),
          fetch('/api/supplements'),
          fetch('/api/trainers'),
        ]);

        const membersData = await membersRes.json();
        const bookingsData = await bookingsRes.json();
        const supplementsData = await supplementsRes.json();
        const trainersData = await trainersRes.json();

        // Process members data
        if (membersData.data) {
          setMembers(membersData.data.slice(0, 5)); // Last 5 members
          const goldCount = membersData.data.filter((m: any) => m.plan === 'GOLD').length;
          const totalCount = membersData.data.length;
          setStats(prev => ({
            ...prev,
            totalMembers: totalCount,
            goldMembers: goldCount,
          }));
        }

        // Process bookings data
        if (bookingsData.data) {
          setBookings(bookingsData.data.slice(0, 5));
          const todayBookings = bookingsData.data.filter((b: any) => {
            const bookingDate = new Date(b.date).toDateString();
            return bookingDate === new Date().toDateString();
          }).length;
          setStats(prev => ({ ...prev, trainerBookingsToday: todayBookings }));
        }

        // Process trainers data
        if (trainersData.data) {
          setTrainers(trainersData.data);
          setStats(prev => ({ ...prev, activeTrainers: trainersData.data.length }));
        }

        // Process supplements data
        if (supplementsData.data) {
          setSupplements(supplementsData.data.slice(0, 5));
          setStats(prev => ({
            ...prev,
            productCount: supplementsData.data.length,
          }));
        }

        // Calculate revenue (from members data - based on plans)
        if (membersData.data) {
          const revenue = membersData.data.reduce((total: number, m: any) => {
            const planPrice: Record<string, number> = {
              GOLD: 5000,
              ELITE: 8000,
              BASIC: 2500,
            };
            return total + (planPrice[m.plan] || 0);
          }, 0);
          setStats(prev => ({ ...prev, monthlyRevenue: revenue }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      icon: Users,
      value: stats.totalMembers.toString(),
      label: 'Total Members',
      subtext: `↑ ${stats.goldMembers} Gold`,
      subtextColor: 'text-green-500',
    },
    {
      icon: DollarSign,
      value: `LKR ${(stats.monthlyRevenue / 1000000).toFixed(1)}M`,
      label: 'Monthly Revenue',
      subtext: '↑ 18% vs last month',
      subtextColor: 'text-green-500',
    },
    {
      icon: Package,
      value: stats.productCount.toString(),
      label: 'Products Listed',
      subtext: `${stats.productCount} in stock`,
      subtextColor: 'text-orange-500',
    },
    {
      icon: Calendar,
      value: stats.trainerBookingsToday.toString(),
      label: 'Trainer Bookings',
      subtext: `${stats.activeTrainers} active trainers`,
      subtextColor: 'text-[#F4D03F]',
    },
  ];

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-orange-400', 'bg-green-400', 'bg-pink-400'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin mx-auto mb-4 text-[#F4D03F]" />
          <p className="text-xl font-bold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b-4 border-[#F4D03F] px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search members, orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 text-gray-900 w-80 focus:outline-none focus:border-[#F4D03F]"
            />
            <button className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all">
              + Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={index}
                className="bg-[#2B2621] p-6 relative overflow-hidden"
              >
                <IconComponent size={32} className="text-[#F4D03F] opacity-40 mb-3" />
                <div className="text-5xl font-black text-[#F4D03F] mb-2">
                  {card.value}
                </div>
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                  {card.label}
                </div>
                <div className={`text-sm font-bold ${card.subtextColor}`}>
                  {card.subtext}
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <DashboardCharts />

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Members */}
          <div className="bg-white shadow-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight">
                Recent Members
              </h2>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2B2621]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${getAvatarColor(member.name || 'User')} flex items-center justify-center`}
                          >
                            <span className="text-black font-black text-sm">
                              {getInitials(member.name || 'U')}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-900">{member.name}</span>
                            <br />
                            <span className="text-xs text-gray-500">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.plan ? (
                          <span
                            className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider ${
                              member.plan === 'GOLD'
                                ? 'bg-[#F4D03F] text-black'
                                : member.plan === 'ELITE'
                                ? 'bg-black text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {member.plan}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            member.status === 'ACTIVE'
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }`}
                        >
                          {member.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-gray-700 border border-gray-300 px-4 py-2">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {members.length === 0 && (
                <div className="p-8 text-center text-gray-500">No members found</div>
              )}
            </div>
          </div>

          {/* Recent Trainer Bookings */}
          <div className="bg-white shadow-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight">
                Recent Bookings
              </h2>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2B2621]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                      Trainer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking, index) => (
                    <tr key={booking._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900">{booking.memberName || 'N/A'}</span>
                        <br />
                        <span className="text-xs text-gray-500">{booking.memberEmail || ''}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900">{booking.trainerName || 'Unassigned'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(booking.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-1 ${
                            booking.status === 'CONFIRMED'
                              ? 'text-green-600'
                              : booking.status === 'PENDING'
                              ? 'text-orange-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {booking.status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <div className="p-8 text-center text-gray-500">No bookings found</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow-lg border-b-4 border-[#F4D03F] p-8 text-center">
            <div className="text-5xl font-black text-gray-900 mb-3">
              {stats.goldMembers}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wider">
              Gold Members
            </div>
          </div>
          <div className="bg-white shadow-lg border-b-4 border-[#F4D03F] p-8 text-center">
            <div className="text-5xl font-black text-gray-900 mb-3">
              {stats.activeTrainers}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wider">
              Active Trainers
            </div>
          </div>
          <div className="bg-white shadow-lg border-b-4 border-[#F4D03F] p-8 text-center">
            <div className="text-5xl font-black text-gray-900 mb-3">
              {stats.productCount}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wider">
              Products Listed
            </div>
          </div>
          <div className="bg-white shadow-lg border-b-4 border-[#F4D03F] p-8 text-center">
            <div className="text-5xl font-black text-gray-900 mb-3">
              LKR {(stats.monthlyRevenue / 100000).toFixed(0)}K
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wider">
              Monthly Revenue
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
