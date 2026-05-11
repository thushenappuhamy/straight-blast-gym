'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminChartContainer from './AdminChartContainer';

type MrrPoint = {
  date: string;
  mrr: number;
  newMembers: number;
};

type AttendancePoint = {
  time: string;
  Mon: number;
  Tue: number;
  Wed: number;
  Thu: number;
  Fri: number;
  Sat: number;
  Sun: number;
};

const dayKeys: Array<keyof Omit<AttendancePoint, 'time'>> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
  const [attendanceData, setAttendanceData] = useState<AttendancePoint[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const res = await fetch(`/api/admin/dashboard-charts?year=${selectedYear}`, { cache: 'no-store' });
        const json = await res.json();

        if (json?.success) {
          setMrrData(Array.isArray(json.mrrData) ? json.mrrData : []);
          setAttendanceData(Array.isArray(json.attendanceData) ? json.attendanceData : []);
        }
      } catch (error) {
        console.error('Failed to load live dashboard charts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharts();
    const interval = setInterval(fetchCharts, 30000);
    return () => clearInterval(interval);
  }, [selectedYear]);

  const heatmapMax = useMemo(() => {
    let max = 0;
    attendanceData.forEach((slot) => {
      dayKeys.forEach((day) => {
        if (slot[day] > max) max = slot[day];
      });
    });
    return max || 1;
  }, [attendanceData]);

  const getHeatColor = (value: number) => {
    const ratio = value / heatmapMax;
    if (ratio === 0) return 'rgba(255,255,255,0.04)';
    if (ratio < 0.25) return 'rgba(230, 60, 47, 0.20)';
    if (ratio < 0.5) return 'rgba(230, 60, 47, 0.35)';
    if (ratio < 0.75) return 'rgba(230, 60, 47, 0.55)';
    return 'rgba(230, 60, 47, 0.80)';
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
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

      <AdminChartContainer
        title="Peak Hours Heatmap"
        subtitle="Facility Usage"
      >
        <div className="h-64 md:h-72 overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center text-white/40">Loading facility usage...</div>
          ) : attendanceData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/40">No attendance data</div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-8 gap-2 text-[11px] uppercase tracking-wider text-white/40">
                <div />
                {dayKeys.map((day) => (
                  <div key={day} className="text-center">
                    {day}
                  </div>
                ))}
              </div>

              {attendanceData.map((slot) => (
                <div key={slot.time} className="grid grid-cols-8 gap-2 items-center">
                  <div className="text-[11px] font-semibold text-white/60">{slot.time}</div>
                  {dayKeys.map((day) => (
                    <div
                      key={`${slot.time}-${day}`}
                      className="h-8 rounded-md border border-white/10 flex items-center justify-center text-[11px] font-semibold text-white"
                      style={{ backgroundColor: getHeatColor(slot[day]) }}
                      title={`${day} ${slot.time}: ${slot[day]} check-ins`}
                    >
                      {slot[day]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminChartContainer>
    </div>
  );
}
