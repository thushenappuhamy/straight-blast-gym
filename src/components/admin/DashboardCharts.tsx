"use client";

import React, { useMemo, useState, useEffect } from 'react';
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
  Legend
} from 'recharts';
import { format, subDays } from 'date-fns';

// Dummy data fallback
const generateMRRData = () => {
  const data = [];
  let currentMRR = 1200000; // 1.2M LKR baseline
  
  for (let i = 30; i >= 0; i--) {
    const activeDate = subDays(new Date(), i);
    currentMRR += (Math.random() - 0.3) * 50000;
    data.push({
      date: format(activeDate, 'MMM dd'),
      mrr: Math.round(currentMRR),
      newMembers: Math.floor(Math.random() * 5),
    });
  }
  return data;
};

const generateAttendanceData = () => {
  return [
    { time: '6 AM', Mon: 45, Tue: 52, Wed: 48, Thu: 50, Fri: 41, Sat: 20, Sun: 15 },
    { time: '9 AM', Mon: 20, Tue: 25, Wed: 22, Thu: 24, Fri: 18, Sat: 45, Sun: 30 },
    { time: '12 PM', Mon: 15, Tue: 12, Wed: 18, Thu: 14, Fri: 10, Sat: 15, Sun: 10 },
    { time: '5 PM', Mon: 65, Tue: 70, Wed: 68, Thu: 62, Fri: 50, Sat: 25, Sun: 20 },
    { time: '8 PM', Mon: 55, Tue: 60, Wed: 58, Thu: 65, Fri: 45, Sat: 10, Sun: 5 },
  ];
};

export default function DashboardCharts() {
  const [mrrData, setMrrData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveChartData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard-charts');
        const json = await res.json();
        if (json.success) {
          setMrrData(json.mrrData);
          setAttendanceData(json.attendanceData);
        } else {
          setMrrData(generateMRRData());
          setAttendanceData(generateAttendanceData());
        }
      } catch (err) {
        setMrrData(generateMRRData());
        setAttendanceData(generateAttendanceData());
      } finally {
        setLoading(false);
      }
    };
    fetchLiveChartData();
  }, []);

  if (loading) {
    return <div className="h-[350px] flex items-center justify-center text-white">Loading live charts...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* MRR Chart (Takes 2 columns) */}
      <div className="lg:col-span-2 bg-[#2B2621] rounded-xl overflow-hidden shadow-lg border border-gray-800">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-[#F4D03F] text-sm font-black uppercase tracking-widest mb-1">Revenue Analytics</h2>
            <div className="text-white text-2xl font-black">Monthly Recurring Revenue</div>
          </div>
          <select className="bg-[#1A1A1A] text-gray-300 border border-gray-700 px-3 py-1 rounded text-sm outline-none">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Year to Date</option>
          </select>
        </div>
        <div className="p-6 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mrrData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F4D03F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
              <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis 
                tickFormatter={(value) => `Rs ${(value / 1000000).toFixed(1)}M`} 
                stroke="#888" 
                fontSize={12}
                tickLine={false} 
                axisLine={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#F4D03F', fontWeight: 'bold' }}
                formatter={(value: any) => [`Rs ${value.toLocaleString()}`, 'MRR']}
              />
              <Area type="monotone" dataKey="mrr" stroke="#F4D03F" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peak Hours Chart (1 column) */}
      <div className="lg:col-span-1 bg-[#111111] rounded-xl overflow-hidden shadow-lg border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-[#F4D03F] text-sm font-black uppercase tracking-widest mb-1">Facility Usage</h2>
          <div className="text-white text-2xl font-black">Peak Hours Heatmap</div>
          <div className="text-gray-400 text-xs mt-2 uppercase">Average Check-ins by Time/Day</div>
        </div>
        <div className="p-6 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#666" fontSize={10} hide />
              <YAxis dataKey="time" type="category" stroke="#888" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#222'}}
                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', color: '#fff' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#888' }} />
              <Bar dataKey="Mon" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Wed" stackId="a" fill="#10b981" />
              <Bar dataKey="Fri" stackId="a" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}