'use client';

import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Package, Calendar, Loader } from 'lucide-react';
import AddMemberWizard from '@/components/admin/AddMemberWizard';

export default function MembersPage() {
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
    const colors = ['bg-[#F4D03F]', 'bg-blue-400', 'bg-orange-400', 'bg-green-400', 'bg-pink-400'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const statCards = [
    {
      icon: Users,
      value: stats.totalMembers.toString(),
      label: 'Total Members',
      subtext: `↑ ${stats.goldMembers} Gold`,
      subtextColor: 'text-[#F4D03F]',
    },
    {
      icon: DollarSign,
      value: stats.activeMembers.toString(),
      label: 'Active Members',
      subtext: `↓ ${stats.pendingMembers} Pending`,
      subtextColor: 'text-orange-500',
    },
    {
      icon: Package,
      value: stats.goldMembers.toString(),
      label: 'Gold Members',
      subtext: 'Premium plan',
      subtextColor: 'text-green-500',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin mx-auto mb-4 text-[#F4D03F]" />
          <p className="text-xl font-bold">Loading members...</p>
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
            Members Management
          </h1>
          <button 
            onClick={() => setIsAddMemberModalOpen(true)}
            className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all"
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        {/* Members Table */}
        <div className="bg-white shadow-lg">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight">
              All Members ({members.length})
            </h2>
            <span className="text-xs text-gray-500">Live Updates • Refreshing every 15s</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2B2621]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.length > 0 ? (
                  members.map((member) => (
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
                          <span className="font-bold text-gray-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            member.status === 'ACTIVE'
                              ? 'text-green-600 bg-green-100'
                              : member.status === 'PENDING'
                              ? 'text-orange-600 bg-orange-100'
                              : 'text-red-600 bg-red-100'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.joined}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddMemberWizard 
        isOpen={isAddMemberModalOpen} 
        onClose={() => setIsAddMemberModalOpen(false)} 
        onSuccess={fetchMembers} 
      />
    </div>
  );
}
