'use client';

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Star, 
  Download, 
  Calendar,
  CreditCard,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Award
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import Toast from '@/src/components/ui/Toast';

interface AnalyticsData {
  stats: {
    revenueGrowth: number;
    newMembers: number;
    retentionRate: number;
    avgTrainerRating: number;
  };
  memberGrowth: Array<{ month: string; count: number }>;
  revenueBreakdown: Record<string, { total: number; count: number; percentage: number }>;
  topSupplements: Array<{ name: string; count: number; percentage: number }>;
  memberGoals: Array<{ goal: string; count: number; percentage: number }>;
  financialBreakdown: Record<string, { total: number; count: number; percentage: number }>;
  summary: {
    totalMembers: number;
    activeMembers: number;
    totalRevenue: number;
    totalSessions: number;
  };
}

const COLORS = ['#E63C2F', '#FF6B6B', '#FF8E8E', '#FFB1B1'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');

      const result = await response.json();
      setData(result.data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleExportReport = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/export/analytics-report', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Export failed`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SBG_Analytics_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setToast({ message: 'Report exported successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: `Export failed: ${error.message}`, type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E63C2F] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#E63C2F] font-black uppercase tracking-widest text-xs">Loading Intelligence...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const pieData = Object.entries(data.revenueBreakdown)
    .filter(([_, info]) => info.total > 0)
    .map(([name, info]) => ({ name, value: info.total }));

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#E63C2F]/30 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E63C2F]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E63C2F]/5 blur-[120px] rounded-full" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 bg-[#050505]/80">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-[#E63C2F]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E63C2F]">Analytics Engine v2.0</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Command <span className="text-[#E63C2F]">Center</span></h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 group hover:border-[#E63C2F]/50 transition-all cursor-pointer">
              <Calendar size={14} className="text-white/40 group-hover:text-[#E63C2F]" />
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer outline-none"
              >
                <option className="bg-[#0A0A0A]">Last 30 Days</option>
                <option className="bg-[#0A0A0A]">Last 90 Days</option>
                <option className="bg-[#0A0A0A]">This Year</option>
              </select>
            </div>
            <button
              onClick={handleExportReport}
              disabled={exporting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#E63C2F] hover:bg-white hover:text-black transition-all rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#E63C2F]/20 disabled:opacity-50"
            >
              <Download size={14} />
              {exporting ? 'Processing...' : 'Export Intel'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 mt-10">
        {/* Top 4 Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Revenue Growth', value: `+${data.stats.revenueGrowth}%`, icon: <TrendingUp size={24} />, sub: 'vs Last Month', color: '#E63C2F' },
            { label: 'New Members', value: `+${data.stats.newMembers}`, icon: <Users size={24} />, sub: 'Recent Activations', color: '#E63C2F' },
            { label: 'Retention Rate', value: `${data.stats.retentionRate}%`, icon: <Target size={24} />, sub: 'Member Loyalty', color: '#E63C2F' },
            { label: 'Trainer Rating', value: `${data.stats.avgTrainerRating}`, icon: <Star size={24} />, sub: 'Service Quality', color: '#E63C2F' },
          ].map((stat, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-500">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all">
                {stat.icon}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">{stat.label}</div>
              <div className="text-4xl font-black mb-1 tracking-tight italic">{stat.value}</div>
              <div className="text-[10px] font-bold text-[#E63C2F] flex items-center gap-1">
                <ArrowUpRight size={10} />
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Financial Split Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Membership Card */}
          <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#E63C2F]/10 blur-[80px] rounded-full group-hover:bg-[#E63C2F]/20 transition-all duration-700" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <CreditCard size={24} className="text-[#E63C2F]" />
                </div>
                <div className="px-3 py-1 bg-[#E63C2F]/20 border border-[#E63C2F]/30 rounded-full text-[10px] font-black uppercase tracking-widest text-[#E63C2F]">
                  Membership Intel
                </div>
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-2">Total Membership Revenue</h3>
              <div className="text-6xl font-black tracking-tighter italic mb-8">LKR {(data.financialBreakdown?.Membership?.total || 0).toLocaleString()}</div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Revenue Contribution</span>
                  <span className="text-xl font-black italic">{data.financialBreakdown?.Membership?.percentage || 0}%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#E63C2F] to-[#FF6B6B] transition-all duration-1000" 
                    style={{ width: `${data.financialBreakdown?.Membership?.percentage || 0}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 italic">
                  <Users size={12} />
                  Based on {data.financialBreakdown?.Membership?.count || 0} active member subscriptions
                </div>
              </div>
            </div>
          </div>

          {/* Supplement Card */}
          <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full group-hover:bg-amber-500/20 transition-all duration-700" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <ShoppingBag size={24} className="text-amber-500" />
                </div>
                <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-500">
                  Store Intel
                </div>
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-2">Total Supplement Sales</h3>
              <div className="text-6xl font-black tracking-tighter italic mb-8">LKR {(data.financialBreakdown?.Supplement?.total || 0).toLocaleString()}</div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Store Contribution</span>
                  <span className="text-xl font-black italic text-amber-500">{data.financialBreakdown?.Supplement?.percentage || 0}%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-1000" 
                    style={{ width: `${data.financialBreakdown?.Supplement?.percentage || 0}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 italic">
                  <Activity size={12} />
                  Generated from {data.financialBreakdown?.Supplement?.count || 0} product transactions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Member Growth - Area Chart */}
          <div className="lg:col-span-2 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#E63C2F]">Member Growth Velocity</h3>
              <div className="text-[10px] font-bold text-white/40 italic">2026 Yearly Trend</div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.memberGrowth}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E63C2F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E63C2F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#E63C2F', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#E63C2F" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Breakdown - Pie Chart */}
          <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#E63C2F] mb-8 text-center">Service Breakdown</h3>
             <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Central Stat */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black italic">{(Object.values(data.revenueBreakdown).reduce((a,b) => a + b.total, 0) / 1000).toFixed(0)}K</span>
                  <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Total LKR</span>
                </div>
             </div>
             <div className="mt-8 space-y-3">
               {pieData.map((item, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                     <span className="text-[10px] font-bold uppercase text-white/60">{item.name}</span>
                   </div>
                   <span className="text-[10px] font-black italic">LKR {(item.value / 1000).toFixed(1)}K</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Secondary Intel Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8 flex items-center gap-2">
              <ShoppingBag size={14} className="text-[#E63C2F]" />
              Top Selling Products
            </h3>
            <div className="space-y-6">
              {data.topSupplements.map((item, i) => (
                <div key={i} className="space-y-2 group">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase group-hover:text-[#E63C2F] transition-colors italic">{item.name}</span>
                    <span className="text-[10px] font-black text-[#E63C2F]">{item.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#E63C2F] to-[#FF6B6B] transition-all duration-1000" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Member Goals */}
          <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8 flex items-center gap-2">
              <Award size={14} className="text-[#E63C2F]" />
              Goal Distribution
            </h3>
            <div className="space-y-6">
              {data.memberGoals.map((item, i) => (
                <div key={i} className="space-y-2 group">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase group-hover:text-[#E63C2F] transition-colors italic">{item.goal}</span>
                    <span className="text-[10px] font-black text-[#E63C2F]">{item.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#E63C2F] to-[#FF6B6B] transition-all duration-1000" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
