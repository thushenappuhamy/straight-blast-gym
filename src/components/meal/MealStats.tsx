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
    ? 'rounded-lg border border-border bg-muted/50 p-3 shadow-sm'
    : 'rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors shadow-sm';

  const labelClasses = variant === 'compact'
    ? 'text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60'
    : 'text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground';

  const valueClasses = variant === 'compact'
    ? 'text-base font-bold text-foreground mt-1'
    : 'text-lg font-black text-foreground mt-2';

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
