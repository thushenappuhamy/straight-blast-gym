'use client';

import React, { useEffect, useState } from 'react';
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
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  // Export analytics report
  const handleExportReport = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/export/analytics-report', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to export: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToast({ message: 'Analytics report exported successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: `Export failed: ${error.message}`, type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <p className="text-lg font-bold">📊 Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="px-4 py-3 font-bold rounded" style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', color: '#fca5a5' }}>
            ❌ {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <p className="text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header */}
      <div className="flex items-center justify-between p-6 mb-8" style={{ borderBottom: '2px solid var(--primary)', background: 'linear-gradient(90deg, rgba(0,0,0,0.12), transparent)' }}>
        <div className="max-w-7xl mx-auto flex-1">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--primary)' }}>
            Business Intelligence
          </div>
          <h1 className="text-4xl font-black uppercase" style={{ color: 'var(--foreground)' }}>Analytics</h1>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="font-bold px-4 py-2 focus:outline-none"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
          >
            <option>Last 30 Days</option>
            <option>Last 60 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
          <button
            onClick={handleExportReport}
            disabled={exporting}
            className="text-black font-black text-sm uppercase px-6 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
          >
            {exporting ? '📥 Exporting...' : '📥 EXPORT REPORT'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Growth */}
          <div className="p-6 flex flex-col" style={{ background: 'var(--card)' }}>
            <div className="text-4xl mb-2 opacity-50">📈</div>
            <div className="text-5xl font-black mb-1" style={{ color: 'var(--primary)' }}>
              +{data.stats.revenueGrowth}%
            </div>
            <div className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--muted-foreground)' }}>
              Revenue Growth
            </div>
            <div className="text-xs font-bold mt-2" style={{ color: 'var(--primary)' }}>
              📊 vs last month
            </div>
          </div>

          {/* New Members */}
          <div className="p-6 flex flex-col" style={{ background: 'var(--card)' }}>
            <div className="text-4xl mb-2 opacity-50">👥</div>
            <div className="text-5xl font-black mb-1" style={{ color: 'var(--primary)' }}>
              +{data.stats.newMembers}
            </div>
            <div className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--muted-foreground)' }}>
              New Members
            </div>
            <div className="text-xs font-bold mt-2" style={{ color: 'var(--primary)' }}>
              This week
            </div>
          </div>

          {/* Retention Rate */}
          <div className="p-6 flex flex-col" style={{ background: 'var(--card)' }}>
            <div className="text-4xl mb-2 opacity-50">🎯</div>
            <div className="text-5xl font-black mb-1" style={{ color: 'var(--primary)' }}>
              {data.stats.retentionRate}%
            </div>
            <div className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--muted-foreground)' }}>
              Retention Rate
            </div>
            <div className="text-xs font-bold mt-2" style={{ color: 'var(--primary)' }}>
              ⬆️ 2% from last month
            </div>
          </div>

          {/* Avg Trainer Rating */}
          <div className="p-6 flex flex-col" style={{ background: 'var(--card)' }}>
            <div className="text-4xl mb-2 opacity-50">⭐</div>
            <div className="text-5xl font-black mb-1" style={{ color: 'var(--primary)' }}>
              {data.stats.avgTrainerRating}
            </div>
            <div className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--muted-foreground)' }}>
              Avg Trainer Rating
            </div>
            <div className="text-xs font-bold mt-2" style={{ color: 'var(--primary)' }}>
              {data.summary.totalMembers} ratings
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Breakdown */}
          <div className="p-6" style={{ background: 'var(--card)' }}>
            <h3 className="font-black text-lg uppercase tracking-wider mb-6" style={{ color: 'var(--primary)' }}>
              Revenue Breakdown
            </h3>
            <div className="space-y-4">
              {Object.entries(data.revenueBreakdown).map(([type, info]) => (
                info.total > 0 && (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold uppercase" style={{ color: 'var(--foreground)' }}>
                        {type}
                      </span>
                      <span className="font-black text-sm" style={{ color: 'var(--primary)' }}>
                        {info.percentage}% • LKR {info.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${info.percentage}%`, background: 'var(--primary)' }}
                      />
                    </div>
                  </div>
                )
              ))}
              {Object.values(data.revenueBreakdown).every((info) => info.total === 0) && (
                <div className="text-center py-6" style={{ color: 'var(--muted-foreground)' }}>No booking data yet</div>
              )}
            </div>
          </div>

          {/* Member Growth Chart */}
          <div className="p-6" style={{ background: 'var(--card)' }}>
            <h3 className="font-black text-lg uppercase tracking-wider mb-6" style={{ color: 'var(--primary)' }}>
              Member Growth — 2026
            </h3>
            {data.memberGrowth.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>No member growth data</div>
            ) : (
              <>
                <div className="flex items-end justify-between h-48 gap-2">
                  {data.memberGrowth.map((item, index) => {
                    const maxCount = Math.max(...data.memberGrowth.map((m) => m.count)) || 1;
                    const heightPercent = maxCount === 0 ? 5 : (item.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t transition-all duration-300"
                          style={{ height: `${heightPercent}%`, minHeight: '4px', background: 'var(--primary)' }}
                          title={`${item.month}: ${item.count}`}
                        />
                        <span className="text-xs font-bold uppercase" style={{ color: 'var(--muted-foreground)' }}>{item.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Total: {data.summary.totalMembers} members
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Supplements */}
          <div className="p-6" style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-black text-lg uppercase tracking-wider mb-6" style={{ color: 'var(--foreground)' }}>
              Top Selling Supplements
            </h3>
            {data.topSupplements.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
                No supplement sales data yet
              </div>
            ) : (
              <div className="space-y-4">
                {data.topSupplements.map((supplement, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold" style={{ color: 'var(--foreground)' }}>{supplement.name}</span>
                      <span className="font-black text-sm" style={{ color: 'var(--primary)' }}>
                        {supplement.percentage}%
                      </span>
                    </div>
                    <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${supplement.percentage}%`, background: 'var(--primary)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Member Goals Distribution */}
          <div className="p-6" style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-black text-lg uppercase tracking-wider mb-6" style={{ color: 'var(--foreground)' }}>
              Member Goals Distribution
            </h3>
            {data.memberGoals.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
                No member goal data yet
              </div>
            ) : (
              <div className="space-y-4">
                {data.memberGoals.map((goal, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold" style={{ color: 'var(--foreground)' }}>{goal.goal}</span>
                      <span className="font-black text-sm" style={{ color: 'var(--primary)' }}>
                        {goal.percentage}%
                      </span>
                    </div>
                    <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${goal.percentage}%`, background: 'var(--primary)' }}
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
