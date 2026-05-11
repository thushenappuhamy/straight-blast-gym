'use client';

import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import {
  AdminLayout,
  AdminSidebar,
  AdminHeader,
  AdminStatsGrid,
  AdminTable,
  LiveDashboardCharts,
} from '@/src/components/admin';
import AddMemberWizard from '@/components/admin/AddMemberWizard';

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    monthlyRevenue: 0,
    activeTrainers: 0,
    productCount: 0,
  });

  const fetchAllData = async () => {
    try {
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

      if (membersData.data) {
        setMembers(membersData.data.slice(0, 5));
        const revenue = membersData.data.reduce((total: number, m: any) => {
          const planPrice: Record<string, number> = {
            GOLD: 5000,
            ELITE: 8000,
            BASIC: 2500,
          };
          return total + (planPrice[m.plan] || 0);
        }, 0);
        setStats(prev => ({
          ...prev,
          totalMembers: membersData.data.length,
          monthlyRevenue: revenue,
        }));
      }

      if (bookingsData.data) {
        setBookings(bookingsData.data.slice(0, 5));
      }

      if (trainersData.data) {
        setStats(prev => ({ ...prev, activeTrainers: trainersData.data.length }));
      }

      if (supplementsData.data) {
        setStats(prev => ({
          ...prev,
          productCount: supplementsData.data.length,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchAllData();
      setLoading(false);
    };

    loadInitialData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const dashboardStats = [
    {
      icon: '👥',
      label: 'Total Members',
      value: stats.totalMembers.toString(),
    },
    {
      icon: '💰',
      label: 'Monthly Revenue',
      value: `LKR ${(stats.monthlyRevenue / 1000000).toFixed(1)}M`,
    },
    {
      icon: '📦',
      label: 'Products Listed',
      value: stats.productCount.toString(),
    },
    {
      icon: '🏋️',
      label: 'Active Trainers',
      value: stats.activeTrainers.toString(),
    },
  ];

  const filteredMembers = members.filter((member) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      `${member?.name || ''}`.toLowerCase().includes(query) ||
      `${member?.email || ''}`.toLowerCase().includes(query) ||
      `${member?.plan || ''}`.toLowerCase().includes(query)
    );
  });

  const memberColumns = [
    { key: 'name', label: 'Member' },
    { key: 'plan', label: 'Plan' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span
          className={`text-xs font-bold uppercase tracking-wider ${value === 'ACTIVE' ? 'text-green-400' : 'text-orange-400'
            }`}
        >
          {value || 'PENDING'}
        </span>
      ),
    },
  ];

  const bookingColumns = [
    { key: 'memberName', label: 'Member' },
    { key: 'trainerName', label: 'Trainer' },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span
          className={`text-xs font-bold uppercase tracking-wider ${value === 'CONFIRMED' ? 'text-green-400' : 'text-orange-400'
            }`}
        >
          {value || 'PENDING'}
        </span>
      ),
    },
  ];

  const formattedBookings = bookings.map(b => ({
    ...b,
    date: new Date(b.date).toLocaleDateString(),
  }));

  const filteredBookings = formattedBookings.filter((booking) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      `${booking?.memberName || ''}`.toLowerCase().includes(query) ||
      `${booking?.trainerName || ''}`.toLowerCase().includes(query) ||
      `${booking?.status || ''}`.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin mx-auto mb-4 text-[#E63C2F]" />
          <p className="text-xl font-bold text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      sidebar={
        <AdminSidebar />
      }
      header={
        <AdminHeader
          title="Admin Dashboard"
          description="Manage your gym operations and member data"
          searchPlaceholder="Search members, trainers, bookings..."
          onSearch={(val) => setSearchQuery(val)}
          actionButton={{
            label: '+ Add Member',
            onClick: () => setIsAddMemberModalOpen(true),
            variant: 'primary',
          }}
        />
      }
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <AdminStatsGrid stats={dashboardStats} columns={4} />

        {/* Charts Section */}
        <LiveDashboardCharts />

        {/* Tables Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <AdminTable
            title="Recent Members"
            columns={memberColumns}
            data={filteredMembers}
            onViewMore={() => console.log('View all members')}
            emptyMessage="No members found"
          />

          <AdminTable
            title="Recent Bookings"
            columns={bookingColumns}
            data={filteredBookings}
            onViewMore={() => console.log('View all bookings')}
            emptyMessage="No bookings found"
          />
        </div>
      </div>

      <AddMemberWizard
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSuccess={fetchAllData}
      />
    </AdminLayout>
  );
}
