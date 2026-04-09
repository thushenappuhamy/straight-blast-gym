"use client";

import React, { useState } from 'react';
import { Users, UserCheck, Clock, Plus, Filter, RotateCw } from 'lucide-react';
import { AdvancedMembersTable } from '@/components/admin/AdvancedMembersTable';
import { MemberDetailsSheet } from '@/components/admin/MemberDetailsSheet';

// Mock data
const MOCK_MEMBERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', plan: 'Premium', status: 'Active', joinDate: '2023-01-15', lastVisit: 'Today', attendance: 12, belt: 'Blue' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', plan: 'Basic', status: 'Active', joinDate: '2023-03-22', lastVisit: 'Yesterday', attendance: 8, belt: 'White' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', plan: 'Elite', status: 'Inactive', joinDate: '2022-11-05', lastVisit: '2 weeks ago', attendance: 45, belt: 'Purple' },
  { id: '4', name: 'Sarah Williams', email: 'sarah@example.com', plan: 'Premium', status: 'Active', joinDate: '2023-06-10', lastVisit: 'Today', attendance: 24, belt: 'Blue' },
  { id: '5', name: 'David Brown', email: 'david@example.com', plan: 'Basic', status: 'Pending', joinDate: '2023-10-01', lastVisit: 'Never', attendance: 0, belt: 'White' },
];

export default function MembersPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMemberInfo, setSelectedMemberInfo] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleViewDetails = (member: any) => {
    setSelectedMemberInfo(member);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Members Management
          </h1>
          <p className="text-gray-400 mt-1">Directory of all SBG athletes and members</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-400 transition-colors border border-gray-700/50"
            title="Refresh Data"
          >
            <RotateCw className={`h-5 w-5 ${refreshing ? 'animate-spin text-orange-500' : ''}`} />
          </button>
          
          <button className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-orange-500/20 font-medium">
            <Plus className="h-5 w-5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-gray-400 font-medium">Total Members</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">1,248</p>
          <div className="mt-4 flex items-center text-sm font-medium relative z-10">
            <span className="text-emerald-400 flex items-center bg-emerald-400/10 px-2 py-0.5 rounded">
              +12%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>
        
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-gray-400 font-medium">Active Now</h3>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">42</p>
          <div className="mt-4 flex items-center text-sm font-medium relative z-10">
            <span className="text-emerald-400 flex items-center bg-emerald-400/10 px-2 py-0.5 rounded">
              +5
            </span>
            <span className="text-gray-500 ml-2">since last hour</span>
          </div>
        </div>
        
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-gray-400 font-medium">Recent Check-ins</h3>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white relative z-10">156</p>
          <div className="mt-4 flex items-center text-sm font-medium relative z-10">
            <span className="text-gray-400">
              Today's attendance
            </span>
          </div>
        </div>
      </div>

      {/* Main Members Dashboard */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl overflow-hidden">
        <div className="p-1">
          <AdvancedMembersTable 
            data={MOCK_MEMBERS}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>

      {/* Member Details Slide-out Drawer */}
      <MemberDetailsSheet 
        isOpen={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen}
        member={selectedMemberInfo}
      />
    </div>
  );
}
