'use client';

import React from 'react';
import { UtensilsCrossed, RotateCcw, Download } from 'lucide-react';

interface MealPlanHeaderProps {
  title: string;
  goal: string;
  onDownload?: () => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
}

export default function MealPlanHeader({
  title,
  goal,
  onDownload,
  onRegenerate,
  isLoading = false,
}: MealPlanHeaderProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#E63C2F]/10 to-transparent p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex gap-4">
          <div className="w-fit rounded-xl bg-[#E63C2F]/20 p-3 flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-[#E63C2F]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full border border-[#E63C2F]/30 bg-[#E63C2F]/10 text-[9px] font-black uppercase tracking-wider text-white/60">
                AI Nutrition
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              {title}
            </h1>
            <p className="text-white/60 text-sm mt-2">{goal}</p>
          </div>
        </div>

        <div className="flex gap-2 md:flex-col">
          {onDownload && (
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-white/90 transition-colors"
            >
              <Download size={16} />
              Download PDF
            </button>
          )}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E63C2F] text-[#E63C2F] font-bold text-sm uppercase tracking-wider hover:bg-[#E63C2F]/10 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
