'use client';

import React, { useEffect, useState } from 'react';

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
  summary: {
    totalMembers: number;
    activeMembers: number;
    totalRevenue: number;
    totalSessions: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const fetchAnalytics = async () => {
    try {
      console.log('📊 [ANALYTICS] Fetching data...');
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('❌ [ANALYTICS] No token found');
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMsg = 'Failed to fetch analytics';
        try {
          const data = await response.json();
          errorMsg = data.error || data.details || errorMsg;
        } catch {
          errorMsg = `HTTP ${response.status}`;
        }
        console.error('❌ [ANALYTICS PAGE] API Error:', errorMsg, 'Status:', response.status);
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log('✅ [ANALYTICS] Data loaded:', result.data);
      setData(result.data);
      setError('');
    } catch (err: any) {
      console.error('❌ [ANALYTICS] Error:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 text-lg font-bold">📊 Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 font-bold rounded">
            ❌ {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-b-2 border-[#F4D03F] p-6 mb-8">
        <div className="max-w-7xl mx-auto flex-1">
          <div className="text-[#F4D03F] text-xs font-bold uppercase tracking-wider mb-2">
            Business Intelligence
          </div>
          <h1 className="text-4xl font-black text-gray-900 uppercase">Analytics</h1>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border-2 border-gray-300 text-gray-900 font-bold px-4 py-2 focus:outline-none focus:border-[#F4D03F]"
          >
            <option>Last 30 Days</option>
            <option>Last 60 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
          <button className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase px-6 py-2 transition-all">
            📥 EXPORT REPORT
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Growth */}
          <div className="bg-[#2B2621] p-6 flex flex-col">
            <div className="text-4xl mb-2 opacity-50">📈</div>
            <div className="text-5xl font-black text-[#F4D03F] mb-1">
              +{data.stats.revenueGrowth}%
            </div>
            <div className="text-gray-400 text-xs uppercase tracking-wider font-bold">
              Revenue Growth
            </div>
            <div className="text-[#F4D03F] text-xs font-bold mt-2">
              📊 vs last month
            </div>
          </div>

          {/* New Members */}
          <div className="bg-[#2B2621] p-6 flex flex-col">
            <div className="text-4xl mb-2 opacity-50">👥</div>
            <div className="text-5xl font-black text-[#F4D03F] mb-1">
              +{data.stats.newMembers}
            </div>
            <div className="text-gray-400 text-xs uppercase tracking-wider font-bold">
              New Members
            </div>
            <div className="text-[#F4D03F] text-xs font-bold mt-2">
              This week
            </div>
          </div>

          {/* Retention Rate */}
          <div className="bg-[#2B2621] p-6 flex flex-col">
            <div className="text-4xl mb-2 opacity-50">🎯</div>
            <div className="text-5xl font-black text-[#F4D03F] mb-1">
              {data.stats.retentionRate}%
            </div>
            <div className="text-gray-400 text-xs uppercase tracking-wider font-bold">
              Retention Rate
            </div>
            <div className="text-[#F4D03F] text-xs font-bold mt-2">
              ⬆️ 2% from last month
            </div>
          </div>

          {/* Avg Trainer Rating */}
          <div className="bg-[#2B2621] p-6 flex flex-col">
            <div className="text-4xl mb-2 opacity-50">⭐</div>
            <div className="text-5xl font-black text-[#F4D03F] mb-1">
              {data.stats.avgTrainerRating}
            </div>
            <div className="text-gray-400 text-xs uppercase tracking-wider font-bold">
              Avg Trainer Rating
            </div>
            <div className="text-[#F4D03F] text-xs font-bold mt-2">
              {data.summary.totalMembers} ratings
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Breakdown */}
          <div className="bg-[#2B2621] p-6">
            <h3 className="text-[#F4D03F] font-black text-lg uppercase tracking-wider mb-6">
              Revenue Breakdown
            </h3>
            <div className="space-y-4">
              {Object.entries(data.revenueBreakdown).map(([type, info]) => (
                info.total > 0 && (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm font-bold uppercase">
                        {type}
                      </span>
                      <span className="text-[#F4D03F] font-black text-sm">
                        {info.percentage}% • LKR {info.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-[#F4D03F] h-full rounded-full transition-all duration-300"
                        style={{ width: `${info.percentage}%` }}
                      />
                    </div>
                  </div>
                )
              ))}
              {Object.values(data.revenueBreakdown).every((info) => info.total === 0) && (
                <div className="text-gray-400 text-center py-6">No booking data yet</div>
              )}
            </div>
          </div>

          {/* Member Growth Chart */}
          <div className="bg-[#2B2621] p-6">
            <h3 className="text-[#F4D03F] font-black text-lg uppercase tracking-wider mb-6">
              Member Growth — 2026
            </h3>
            {data.memberGrowth.length === 0 ? (
              <div className="text-gray-400 text-center py-12">No member growth data</div>
            ) : (
              <>
                <div className="flex items-end justify-between h-48 gap-2">
                  {data.memberGrowth.map((item, index) => {
                    const maxCount = Math.max(...data.memberGrowth.map((m) => m.count)) || 1;
                    const heightPercent = maxCount === 0 ? 5 : (item.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-[#F4D03F] rounded-t transition-all duration-300"
                          style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                          title={`${item.month}: ${item.count}`}
                        />
                        <span className="text-gray-400 text-xs font-bold uppercase">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-center text-gray-500 text-xs">
                  Total: {data.summary.totalMembers} members
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Supplements */}
          <div className="bg-white border-2 border-gray-200 p-6">
            <h3 className="text-gray-900 font-black text-lg uppercase tracking-wider mb-6">
              Top Selling Supplements
            </h3>
            {data.topSupplements.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No supplement sales data yet
              </div>
            ) : (
              <div className="space-y-4">
                {data.topSupplements.map((supplement, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-bold">{supplement.name}</span>
                      <span className="text-[#F4D03F] font-black text-sm">
                        {supplement.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-[#F4D03F] h-full rounded-full transition-all duration-300"
                        style={{ width: `${supplement.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Member Goals Distribution */}
          <div className="bg-white border-2 border-gray-200 p-6">
            <h3 className="text-gray-900 font-black text-lg uppercase tracking-wider mb-6">
              Member Goals Distribution
            </h3>
            {data.memberGoals.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No member goal data yet
              </div>
            ) : (
              <div className="space-y-4">
                {data.memberGoals.map((goal, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-bold">{goal.goal}</span>
                      <span className="text-[#F4D03F] font-black text-sm">
                        {goal.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-[#F4D03F] h-full rounded-full transition-all duration-300"
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
