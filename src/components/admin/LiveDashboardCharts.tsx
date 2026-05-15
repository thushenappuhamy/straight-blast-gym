'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminChartContainer from './AdminChartContainer';

type MrrPoint = {
  date: string;
  mrr: number;
  newMembers: number;
};

function RevenueTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value || 0;

  return (
    <div className="rounded-lg border border-white/15 bg-[#111111] px-3 py-2 text-sm text-white shadow-lg">
      <p className="font-semibold text-[#E63C2F]">LKR {value.toLocaleString()}</p>
    </div>
  );
}

export default function LiveDashboardCharts() {
  const [loading, setLoading] = useState(true);
  const [mrrData, setMrrData] = useState<MrrPoint[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const res = await fetch(`/api/admin/dashboard-charts?year=${selectedYear}`, { cache: 'no-store' });
        const json = await res.json();

        if (json?.success) {
          setMrrData(Array.isArray(json.mrrData) ? json.mrrData : []);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchCharts();
    const interval = setInterval(fetchCharts, 30000);
    return () => clearInterval(interval);
  }, [selectedYear]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <AdminChartContainer
        title="Monthly Recurring Revenue"
        subtitle="Revenue Analytics"
        headerExtra={
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg outline-none focus:border-[#E63C2F]/50 transition-colors cursor-pointer"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y} className="bg-[#1A1A1A]">{y}</option>
            ))}
          </select>
        }
      >
        <div className="h-64 md:h-72">
          {loading ? (
            <div className="h-full flex items-center justify-center text-white/40">Loading revenue...</div>
          ) : mrrData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/40">No revenue data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E63C2F" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#E63C2F" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value) => `LKR ${(value / 1000000).toFixed(1)}M`}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={72}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="mrr" stroke="#E63C2F" strokeWidth={2.5} fill="url(#mrrGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </AdminChartContainer>
    </div>
  );
}
