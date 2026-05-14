'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [membersRes, bookingsRes, supplementsRes, trainersRes, txnsRes] = await Promise.all([
        fetch('/api/admin/members', { headers }),
        fetch('/api/admin/bookings', { headers }),
        fetch('/api/supplements', { headers }),
        fetch('/api/admin/trainers', { headers }),
        fetch('/api/admin/transactions', { headers }),
      ]);

      const membersData = await membersRes.json();
      const bookingsData = await bookingsRes.json();
      const supplementsData = await supplementsRes.json();
      const trainersData = await trainersRes.json();
      const txnsData = await txnsRes.json();

      if (membersData.data) {
        // Map members to include a 'name' field for the table
        const mappedMembers = membersData.data.map((m: any) => ({
          ...m,
          name: m.firstName ? `${m.firstName} ${m.lastName}` : (m.name || 'Unknown')
        }));
        
        setMembers(mappedMembers.slice(0, 5));
        
        setStats(prev => ({
          ...prev,
          totalMembers: membersData.data.length,
        }));
      }

      if (txnsData.success && txnsData.data) {
        const revenue = txnsData.data.reduce((total: number, txn: any) => {
          // Only count COMPLETED transactions for revenue
          return txn.status === 'COMPLETED' ? total + (txn.amount || 0) : total;
        }, 0);

        setStats(prev => ({
          ...prev,
          monthlyRevenue: revenue,
        }));
      }

      if (bookingsData.data) {
        // Map bookings to include memberName and trainerName
        const mappedBookings = bookingsData.data.map((b: any) => ({
          ...b,
          memberName: b.memberId ? `${b.memberId.firstName} ${b.memberId.lastName}` : 'Unknown',
          trainerName: b.trainerId ? b.trainerId.name : 'Unassigned',
          date: new Date(b.dateTime).toLocaleDateString(),
        }));
        setBookings(mappedBookings.slice(0, 2));
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
          className={`text-xs font-bold uppercase tracking-wider ${value === 'COMPLETED' ? 'text-green-400' : 'text-orange-400'
            }`}
        >
          {value || 'UPCOMING'}
        </span>
      ),
    },
  ];

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
            onViewMore={() => router.push('/admin/members')}
            emptyMessage="No members found"
          />

          <AdminTable
            title="Recent Bookings"
            columns={bookingColumns}
            data={bookings}
            onViewMore={() => router.push('/admin/bookings')}
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
