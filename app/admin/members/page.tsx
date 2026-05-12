'use client';

import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import {
  AdminLayout,
  AdminSidebar,
  AdminHeader,
  AdminStatsGrid,
  AdminTable,
} from '@/src/components/admin';
import AddMemberWizard from '@/components/admin/AddMemberWizard';

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    goldMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
  });

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/members');
      const data = await res.json();

      if (data.data) {
        setMembers(data.data);

        const gold = data.data.filter((m: any) => m.plan === 'GOLD').length;
        const active = data.data.filter((m: any) => m.status === 'ACTIVE').length;
        const pending = data.data.filter((m: any) => m.status === 'PENDING').length;

        setStats({
          totalMembers: data.data.length,
          goldMembers: gold,
          activeMembers: active,
          pendingMembers: pending,
        });
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();

    // Live update every 15 seconds
    const interval = setInterval(fetchMembers, 15000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-[#E63C2F]', 'bg-red-500', 'bg-orange-500', 'bg-rose-500', 'bg-red-400'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const statCards = [
    {
      icon: '👥',
      value: stats.totalMembers.toString(),
      label: 'Total Members',
      change: {
        value: stats.goldMembers,
        direction: 'up' as const,
        isPositive: true,
      },
    },
    {
      icon: '✅',
      value: stats.activeMembers.toString(),
      label: 'Active Members',
      change: {
        value: stats.pendingMembers,
        direction: stats.pendingMembers > 0 ? 'down' as const : 'up' as const,
        isPositive: stats.pendingMembers === 0,
      },
    },
    {
      icon: '🥇',
      value: stats.goldMembers.toString(),
      label: 'Gold Members',
    },
    {
      icon: '⏳',
      value: stats.pendingMembers.toString(),
      label: 'Pending Members',
    },
  ];

  const filteredMembers = members.filter((member) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      `${member?.name || ''}`.toLowerCase().includes(query) ||
      `${member?.email || ''}`.toLowerCase().includes(query) ||
      `${member?.plan || ''}`.toLowerCase().includes(query) ||
      `${member?.status || ''}`.toLowerCase().includes(query)
    );
  });

  const memberColumns = [
    {
      key: 'name',
      label: 'Member',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full ${getAvatarColor(value || 'U')} flex items-center justify-center`}
          >
            <span className="text-white font-black text-xs">{getInitials(value || 'U')}</span>
          </div>
          <div>
            <p className="font-semibold text-white">{value || 'Unknown Member'}</p>
            <p className="text-xs text-white/45">{row.email || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (value: string) => {
        const plan = value || 'BASIC';
        const planClass =
          plan === 'GOLD'
            ? 'bg-[#E63C2F]/20 text-[#E63C2F] border border-[#E63C2F]/30'
            : plan === 'ELITE'
              ? 'bg-white/10 text-white border border-white/20'
              : 'bg-white/5 text-white/70 border border-white/10';

        return (
          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${planClass}`}>
            {plan}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const status = value || 'PENDING';
        const statusClass =
          status === 'ACTIVE'
            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
            : status === 'PENDING'
              ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
              : 'text-rose-400 bg-rose-500/10 border border-rose-500/30';

        return (
          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${statusClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (value: string, row: any) => {
        const source = value || row.joined;
        if (!source) return <span className="text-white/50">-</span>;
        const date = new Date(source);
        return (
          <span className="text-white/70 text-sm">
            {Number.isNaN(date.getTime()) ? source : date.toLocaleDateString()}
          </span>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin mx-auto mb-4 text-[#E63C2F]" />
          <p className="text-xl font-bold text-white">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      sidebar={<AdminSidebar />}
      header={
        <AdminHeader
          title="Members Management"
          description="Track, filter, and manage all gym members in real-time"
          searchPlaceholder="Search by name, email, plan, status..."
          onSearch={setSearchQuery}
          actionButton={{
            label: '+ Add Member',
            onClick: () => setIsAddMemberModalOpen(true),
            variant: 'primary',
          }}
        />
      }
    >
      <div className="space-y-6">
        <AdminStatsGrid stats={statCards} columns={4} />

        <div className="flex items-center justify-end">
          <span className="text-xs text-white/50 uppercase tracking-wider">
            Live Updates • Refreshing every 15s
          </span>
        </div>

        <AdminTable
          title={`All Members (${filteredMembers.length})`}
          columns={memberColumns}
          data={filteredMembers}
          emptyMessage="No members found"
        />
      </div>

      <AddMemberWizard
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSuccess={fetchMembers}
      />
    </AdminLayout>
  );
}
