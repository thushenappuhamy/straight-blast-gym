'use client';

import React from 'react';
import AdminStatCard from './AdminStatCard';

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
    isPositive: boolean;
  };
}

interface AdminStatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact';
}

export default function AdminStatsGrid({
  stats,
  columns = 4,
  variant = 'default',
}: AdminStatsGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4`}>
      {stats.map((stat, idx) => (
        <AdminStatCard
          key={idx}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          variant={variant}
        />
      ))}
    </div>
  );
}
