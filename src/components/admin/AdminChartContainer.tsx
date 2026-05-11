'use client';

import React from 'react';

interface AdminChartContainerProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'side-by-side';
}

export default function AdminChartContainer({
  title,
  subtitle,
  actionLabel,
  onAction,
  headerExtra,
  children,
  variant = 'default',
}: AdminChartContainerProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
            {subtitle}
          </p>
          <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wide">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {headerExtra}
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="text-xs font-bold text-white/60 hover:text-white px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 uppercase tracking-wider transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
