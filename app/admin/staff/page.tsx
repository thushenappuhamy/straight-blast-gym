'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, Search, RefreshCw, Users, Clock, Lock } from 'lucide-react';

interface LoginRecord {
  _id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  loginTime: string;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  status: 'success' | 'failed';
  failureReason?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  count: number;
  color: string;
  icon: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipStatus?: string;
  createdAt: string;
}

interface Trainer {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  status: string;
  createdAt: string;
}

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'login-history'>('roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch roles data
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/staff/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch roles');
      }

      setRoles(data.data.roles);
      setAdmins(data.data.users.admins);
      setMembers(data.data.users.members);
      setTrainers(data.data.users.trainers);
      setError('');
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch login history
  const fetchLoginHistory = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', '50');
      if (searchEmail) queryParams.append('email', searchEmail);
      if (searchRole) queryParams.append('role', searchRole);

      const response = await fetch(`/api/admin/staff/login-history?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch login history');
      }

      setLoginHistory(data.data);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.pages);
      setTotalRecords(data.pagination.total);
      setError('');
    } catch (err: any) {
      console.error('Error fetching login history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'roles') {
      fetchRoles();
    } else {
      fetchLoginHistory();
    }
  }, [activeTab]);

  // Auto-poll login history every 5 seconds when on login history tab
  useEffect(() => {
    if (activeTab === 'login-history') {
      const interval = setInterval(() => {
        fetchLoginHistory(1); // Always fetch first page to see newest records
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Handle search for login history
  const handleSearchLoginHistory = () => {
    setCurrentPage(1);
    fetchLoginHistory(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#2B2621] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2B2621] to-[#3D3430] border-b-2 px-8 py-6" style={{ borderColor: 'var(--primary)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>Management</p>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Staff Management</h1>
          </div>
          <div className="text-5xl">👥</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#2B2621] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-8 flex gap-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-4 px-6 font-black uppercase tracking-wider text-sm transition-all border-b-4 ${activeTab === 'roles'
                ? 'text-[var(--primary)] border-[var(--primary)]'
                : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
          >
            <div className="flex items-center gap-2">
              <Lock size={18} />
              Roles & Permissions
            </div>
          </button>
          <button
            onClick={() => setActiveTab('login-history')}
            className={`py-4 px-6 font-black uppercase tracking-wider text-sm transition-all border-b-4 ${activeTab === 'login-history'
                ? 'text-[var(--primary)] border-[var(--primary)]'
                : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
          >
            <div className="flex items-center gap-2">
              <Clock size={18} />
              Login History
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border-l-4 border-red-500 text-red-200 rounded">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin mb-4">
                <RefreshCw size={40} className="text-[var(--primary)]" />
              </div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        ) : activeTab === 'roles' ? (
          // ROLES TAB
          <div className="space-y-8">
            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div key={role.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 p-8 hover:border-[var(--primary)] transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-4xl mb-3">{role.icon}</div>
                      <h3 className="text-2xl font-black text-white uppercase">{role.name}</h3>
                    </div>
                    <div className="bg-black/50 rounded-xl px-4 py-2 text-center">
                      <p className="text-2xl font-black" style={{ color: 'var(--primary)' }}>{role.count}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Active</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">{role.description}</p>

                  {/* Permissions */}
                  <div>
                    <p className="text-xs font-black text-[var(--primary)] uppercase tracking-widest mb-4">Permissions</p>
                    <div className="space-y-2">
                      {role.permissions.slice(0, 5).map((perm, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="text-[var(--primary)]">✓</span>
                          <span className="capitalize">{perm.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                      {role.permissions.length > 5 && (
                        <div className="text-xs text-gray-400 pt-2 pl-6">
                          +{role.permissions.length - 5} more permissions
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Users by Role */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Admins */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 px-6 py-4">
                  <h4 className="text-lg font-black text-white uppercase tracking-wider">🔑 Administrators ({admins.length})</h4>
                </div>
                <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                  {admins.map((admin) => (
                    <div key={admin._id} className="flex items-start gap-3 p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
                      <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black">A</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{admin.firstName} {admin.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{admin.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Members */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h4 className="text-lg font-black text-white uppercase tracking-wider">👤 Members ({members.length})</h4>
                </div>
                <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                  {members.map((member) => (
                    <div key={member._id} className="flex items-start gap-3 p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black">M</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{member.email}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--primary)' }}>{member.membershipStatus || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trainers */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h4 className="text-lg font-black text-white uppercase tracking-wider">💪 Trainers ({trainers.length})</h4>
                </div>
                <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                  {trainers.map((trainer) => (
                    <div key={trainer._id} className="flex items-start gap-3 p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black">T</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{trainer.name}</p>
                        <p className="text-xs text-gray-400 truncate">{trainer.email}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--primary)' }}>{trainer.specialization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // LOGIN HISTORY TAB
          <div className="space-y-6">
            {/* Live Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border-l-4 border-green-500 text-green-300 rounded text-sm font-bold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              🔄 Live updates - Login history refreshes every 5 seconds
            </div>

            {/* Search and Filters */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-2 tracking-wider" style={{ color: 'var(--primary)' }}>
                    Search Email
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      placeholder="Enter email..."
                      className="w-full bg-black/50 border-2 border-gray-600 text-white px-10 py-2 rounded-lg outline-none transition-all"
                      style={{ borderColor: 'var(--primary)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-2 tracking-wider" style={{ color: 'var(--primary)' }}>
                    Role
                  </label>
                  <select
                    value={searchRole}
                    onChange={(e) => setSearchRole(e.target.value)}
                    className="w-full bg-black/50 border-2 border-gray-600 text-white px-4 py-2 rounded-lg outline-none transition-all"
                    style={{ borderColor: 'var(--primary)' }}
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">Member</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSearchLoginHistory}
                    className="w-full text-black font-black uppercase py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--primary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
                  >
                    <Search size={18} />
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Login History Table */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r to-gray-800 border-b-2 border-gray-700" style={{ background: 'linear-gradient(to right, rgba(230,60,47,0.2), #2b2621)' }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: 'var(--primary)' }}>User</th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Email</th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Login Time</th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Device</th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Browser</th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: 'var(--primary)' }}>OS</th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: 'var(--primary)' }}>IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {loginHistory.map((record) => (
                      <tr
                        key={record._id}
                        className={`transition-all ${record.status === 'failed'
                            ? 'bg-red-900/20 hover:bg-red-900/30'
                            : 'hover:bg-black/30'
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${record.status === 'failed'
                                  ? 'bg-red-600'
                                  : 'bg-[var(--primary)]'
                                }`}
                            >
                              <span
                                className={`text-xs font-black ${record.status === 'failed'
                                    ? 'text-white'
                                    : 'text-black'
                                  }`}
                              >
                                {record.firstName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{record.firstName} {record.lastName}</p>
                              <p className={`text-xs uppercase ${record.status === 'failed'
                                  ? 'text-red-400'
                                  : 'text-[var(--primary)]'
                                }`}>
                                {record.role}
                                {record.status === 'failed' && ` • ⚠️ ${record.failureReason || 'Failed'}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300">{record.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300">{formatDate(record.loginTime)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${record.status === 'success'
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                                }`}
                            ></span>
                            <span
                              className={`text-xs font-black uppercase ${record.status === 'success'
                                  ? 'text-green-400'
                                  : 'text-red-400'
                                }`}
                            >
                              {record.status === 'success' ? '✓ Success' : '✗ Failed'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${record.status === 'failed'
                              ? 'bg-red-900/50 text-red-200'
                              : 'bg-gray-700 text-gray-200'
                            }`}>
                            {record.device}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300">{record.browser}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300">{record.os}</p>
                        </td>
                        <td className="px-6 py-4">
                          <code className={`text-xs px-3 py-1 rounded font-mono ${record.status === 'failed'
                              ? 'bg-red-900/30 text-red-300'
                              : 'bg-black/50 text-[var(--primary)]'
                            }`}>
                            {record.ipAddress}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
                <p className="text-sm text-gray-400">
                  Showing {loginHistory.length} of {totalRecords} records
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchLoginHistory(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 disabled:opacity-50 text-white rounded-lg hover:bg-gray-600 transition-all font-bold"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => fetchLoginHistory(pageNum)}
                          className={`px-3 py-1 rounded font-bold transition-all ${pageNum === currentPage
                              ? 'bg-[var(--primary)] text-black'
                              : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => fetchLoginHistory(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 disabled:opacity-50 text-white rounded-lg hover:bg-gray-600 transition-all font-bold"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
