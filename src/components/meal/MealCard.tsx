'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { contentToArray, isContentRenderable } from '@/src/lib/contentRenderer';

interface MealItem {
  item?: string;
  name?: string;
  quantity?: string;
  notes?: string;
}

interface MealCardProps {
  type: string;
  time?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items?: MealItem[];
  recipe?: string;
  notes?: string;
}

export default function MealCard({
  type,
  time,
  calories,
  protein,
  carbs,
  fat,
  items = [],
  recipe,
  notes,
}: MealCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatMacro = (value: number | string) => {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    return num.toLocaleString();
  };

  const hasDetails = items.length > 0 || recipe || notes;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left transition-colors hover:bg-white/8 flex items-center justify-between group"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-white uppercase tracking-wide">{type}</h4>
            {time && <span className="text-xs text-white/40">{time}</span>}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="font-bold text-white">
              {calories.toLocaleString()} cal
            </span>
            <span className="text-white/40">
              P: {formatMacro(protein)}g | C: {formatMacro(carbs)}g | F: {formatMacro(fat)}g
            </span>
          </div>
        </div>
        {hasDetails && (
          <div className="ml-2 text-white/40 group-hover:text-[#E63C2F] transition-colors">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        )}
      </button>

      {expanded && hasDetails && (
        <div className="border-t border-white/10 bg-black/40 p-4 space-y-4">
          {items.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/50 mb-2">
                Ingredients
              </p>
              <ul className="space-y-1.5">
                {items.map((item, idx) => {
                  const itemName = item.item || item.name || 'Ingredient';
                  const itemQty = item.quantity || '';
                  return (
                    <li key={idx} className="text-sm text-white/75 flex gap-2">
                      <span className="text-[#E63C2F] font-bold">•</span>
                      <span>
                        {itemName}
                        {itemQty && <span className="text-white/40 ml-1">- {itemQty}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {recipe && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/50 mb-2">
                Recipe
              </p>
              <div className="text-xs text-white/60 leading-relaxed space-y-1">
                {typeof recipe === 'string' ? (
                  recipe
                ) : (
                  contentToArray(recipe).map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))
                )}
              </div>
            </div>
          )}

          {isContentRenderable(notes) && (
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
              <div className="text-xs text-white/60 space-y-1">
                {typeof notes === 'string' ? (
                  <div>📝 {notes}</div>
                ) : (
                  contentToArray(notes).map((line, idx) => (
                    <div key={idx}>{idx === 0 ? `📝 ${line}` : line}</div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
