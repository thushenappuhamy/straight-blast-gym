'use client';

import React from 'react';

interface AdminStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
    isPositive: boolean;
  };
  variant?: 'default' | 'compact';
}

export default function AdminStatCard({
  icon,
  label,
  value,
  change,
  variant = 'default',
}: AdminStatCardProps) {
  const isCompact = variant === 'compact';

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 md:p-6 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/40 mb-1">
            {label}
          </p>
          <p className={`font-black text-white ${isCompact ? 'text-2xl' : 'text-3xl'}`}>
            {value}
          </p>
          {change && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${
              change.isPositive ? 'text-[#E63C2F]' : 'text-white/40'
            }`}>
              <span>{change.direction === 'up' ? '↑' : '↓'}</span>
              <span>{Math.abs(change.value)}%</span>
              <span className="text-white/30 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-[#E63C2F]/10 flex items-center justify-center text-xl text-[#E63C2F] flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}
