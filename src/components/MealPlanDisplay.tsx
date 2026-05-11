'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, UtensilsCrossed } from 'lucide-react';

interface MealPlanDisplayProps {
  plan: any;
}

export default function MealPlanDisplay({ plan }: MealPlanDisplayProps) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!plan) return null;

  const formatMacro = (value: string | number) => {
    if (typeof value === 'string') {
      return parseInt(value, 10).toLocaleString();
    }
    return value.toLocaleString();
  };

  return (
    <div className="space-y-4 text-white">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(230,60,47,0.16),rgba(17,17,17,0.96))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-[#E63C2F]/25 bg-[#E63C2F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
              Meal plan
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">{plan.title || 'Meal Plan'}</h2>
            <p className="mt-2 text-white/60">{plan.goal}</p>
          </div>
          <UtensilsCrossed size={40} className="text-[#E63C2F]" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ['Daily Calories', plan.dailyCalories?.toLocaleString() || 'N/A'],
            ['Protein', `${formatMacro(plan.dailyProtein || 0)}g`],
            ['Carbs', `${formatMacro(plan.dailyCarbs || 0)}g`],
            ['Fat', `${formatMacro(plan.dailyFat || 0)}g`],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/35">{label}</p>
              <p className="mt-2 text-lg font-black text-white">{value as string}</p>
            </div>
          ))}
        </div>
      </section>

      {plan.weeks && (
        <div className="space-y-3">
          {plan.weeks.map((week: any, weekIdx: number) => (
            <div key={weekIdx} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-xl">
              <button
                onClick={() => setExpandedWeek(expandedWeek === weekIdx ? null : weekIdx)}
                className="flex w-full items-center justify-between bg-white/5 p-4 text-left transition-colors hover:bg-white/8"
              >
                <div>
                  <p className="text-lg font-black text-white">{week.week || `Week ${weekIdx + 1}`}</p>
                  <p className="text-sm text-white/45">{week.days ? week.days.length : 0} days meal plan</p>
                </div>
                {expandedWeek === weekIdx ? <ChevronUp className="text-[#E63C2F]" /> : <ChevronDown className="text-[#E63C2F]" />}
              </button>

              {expandedWeek === weekIdx && week.days && (
                <div className="space-y-2 border-t border-white/10 bg-black/25 p-4">
                  {week.days.map((day: any, dayIdx: number) => {
                    const dayKey = `${weekIdx}-${dayIdx}`;

                    return (
                      <div key={dayIdx} className="overflow-hidden rounded-2xl border border-white/10">
                        <button
                          onClick={() => setExpandedDay(expandedDay === dayKey ? null : dayKey)}
                          className="flex w-full items-center justify-between bg-white/5 p-3 text-left transition-colors hover:bg-white/8"
                        >
                          <div>
                            <p className="font-black text-white">{day.day || `Day ${dayIdx + 1}`}</p>
                            <p className="text-xs text-white/45">
                              {day.totalCalories?.toLocaleString() || 0} cal • P: {formatMacro(day.protein || 0)}g • C: {formatMacro(day.carbs || 0)}g • F: {formatMacro(day.fat || 0)}g
                            </p>
                          </div>
                          {expandedDay === dayKey ? <ChevronUp size={18} className="text-[#E63C2F]" /> : <ChevronDown size={18} className="text-[#E63C2F]" />}
                        </button>

                        {expandedDay === dayKey && day.meals && (
                          <div className="space-y-4 border-t border-white/10 bg-[#111111] p-4">
                            {day.meals.map((meal: any, mealIdx: number) => (
                              <div key={mealIdx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <div>
                                    <h5 className="font-black text-white uppercase tracking-[0.2em]">{meal.type}</h5>
                                    <p className="text-xs text-white/45">{meal.time || ''}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black text-[#E63C2F]">{meal.calories?.toLocaleString() || 0} cal</p>
                                    <p className="text-xs text-white/45">
                                      P: {formatMacro(meal.protein || 0)}g | C: {formatMacro(meal.carbs || 0)}g | F: {formatMacro(meal.fat || 0)}g
                                    </p>
                                  </div>
                                </div>

                                {meal.items && (
                                  <ul className="mb-2 space-y-1 pl-2">
                                    {meal.items.map((item: any, itemIdx: number) => (
                                      <li key={itemIdx} className="text-sm text-white/75">
                                        <span className="font-bold text-[#E63C2F]">•</span> {item.item || item}
                                        {item.quantity && <span className="text-white/45"> - {item.quantity}</span>}
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                {meal.recipe && (
                                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-sm">
                                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#E63C2F]">Recipe</p>
                                    <p className="text-white/75 text-xs">{meal.recipe}</p>
                                  </div>
                                )}

                                {meal.notes && <p className="mt-2 text-sm italic text-white/45">📝 {meal.notes}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {plan.nutritionTips && (
        <div className="rounded-2xl border border-[#E63C2F]/25 bg-[#E63C2F]/10 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white">💡 Nutrition Tips</p>
          <p className="text-sm text-white/75">{plan.nutritionTips}</p>
        </div>
      )}

      {plan.shoppingList && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white">🛒 Shopping List</p>
          <p className="text-sm text-white/75">{plan.shoppingList}</p>
        </div>
      )}

      {plan.notes && (
        <div className="rounded-2xl border border-[#E63C2F]/25 bg-[#E63C2F]/10 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white">📌 Important Notes</p>
          <p className="text-sm text-white/75">{plan.notes}</p>
        </div>
      )}
    </div>
  );
}