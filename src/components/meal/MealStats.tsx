'use client';

import React from 'react';
import { Flame, Zap } from 'lucide-react';

interface MacroStats {
  label: string;
  value: string | number;
  icon?: 'calories' | 'flame' | 'protein' | 'carbs' | 'fat';
  color?: string;
}

interface MealStatsProps {
  stats: MacroStats[];
  variant?: 'default' | 'compact';
}

const colorMap = {
  protein: '#E63C2F',
  carbs: '#E63C2F',
  fat: '#E63C2F',
  calories: '#E63C2F',
};

const iconMap: Record<string, React.ReactNode> = {
  protein: '🥩',
  carbs: '🍚',
  fat: '🥑',
  calories: '🔥',
};

export default function MealStats({ stats, variant = 'default' }: MealStatsProps) {
  const containerClasses = variant === 'compact' 
    ? 'grid grid-cols-2 md:grid-cols-4 gap-3'
    : 'grid grid-cols-2 md:grid-cols-4 gap-4';

  const cardClasses = variant === 'compact'
    ? 'rounded-lg border border-white/8 bg-white/[0.03] p-3'
    : 'rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/8 transition-colors';

  const labelClasses = variant === 'compact'
    ? 'text-[9px] font-bold uppercase tracking-wider text-white/40'
    : 'text-[10px] font-black uppercase tracking-[0.2em] text-white/35';

  const valueClasses = variant === 'compact'
    ? 'text-base font-bold text-white mt-1'
    : 'text-lg font-black text-white mt-2';

  return (
    <div className={containerClasses}>
      {stats.map((stat, idx) => (
        <div key={idx} className={cardClasses}>
          <div className="flex items-start justify-between">
            <div>
              <p className={labelClasses}>{stat.label}</p>
              <p className={valueClasses}>{stat.value}</p>
            </div>
            {stat.icon && (
              <span className="text-lg">{iconMap[stat.icon] || ''}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
