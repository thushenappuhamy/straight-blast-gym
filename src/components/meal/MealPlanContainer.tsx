'use client';

import React, { useState } from 'react';
import MealPlanHeader from './MealPlanHeader';
import MealStats from './MealStats';
import VersionSelector from './VersionSelector';
import DayMeals from './DayMeals';
import { AlertCircle } from 'lucide-react';
import { contentToArray, isContentRenderable } from '@/src/lib/contentRenderer';

interface MealPlanContainerProps {
  title: string;
  goal: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  weeklyPlan: any[];
  mealHistory?: any[];
  onDownload?: () => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
  nutritionTips?: string;
  shoppingList?: string;
  notes?: string;
}

export default function MealPlanContainer({
  title,
  goal,
  dailyCalories,
  dailyProtein,
  dailyCarbs,
  dailyFat,
  weeklyPlan,
  mealHistory = [],
  onDownload,
  onRegenerate,
  isLoading = false,
  nutritionTips,
  shoppingList,
  notes,
}: MealPlanContainerProps) {
  const [activeVersion, setActiveVersion] = useState(0);

  const currentDay = weeklyPlan[0];

  const formatMacro = (value: number | string) => {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <MealPlanHeader
        title={title}
        goal={goal}
        onDownload={onDownload}
        onRegenerate={onRegenerate}
        isLoading={isLoading}
      />

      {/* Daily Macros Summary */}
      <div>
        <h2 className="text-lg font-bold text-white/60 uppercase tracking-wider mb-3">
          Daily Targets
        </h2>
        <MealStats
          stats={[
            {
              label: 'Daily Calories',
              value: dailyCalories.toLocaleString(),
              icon: 'calories',
            },
            {
              label: 'Protein',
              value: `${formatMacro(dailyProtein)}g`,
              icon: 'protein',
            },
            {
              label: 'Carbs',
              value: `${formatMacro(dailyCarbs)}g`,
              icon: 'carbs',
            },
            {
              label: 'Fats',
              value: `${formatMacro(dailyFat)}g`,
              icon: 'fat',
            },
          ]}
        />
      </div>

      {/* Version Selector */}
      {mealHistory.length > 0 && (
        <VersionSelector
          versions={mealHistory.map((version, idx) => ({
            id: idx.toString(),
            label: new Date(version.createdAt || Date.now()).toLocaleDateString(
              'en-GB'
            ),
            date: version.createdAt,
          }))}
          activeVersion={activeVersion.toString()}
          onVersionChange={(id) => {
            setActiveVersion(parseInt(id, 10));
          }}
        />
      )}

      {/* Daily Meals */}
      {currentDay && (
        <DayMeals
          day={currentDay.day || 'Day 1'}
          meals={currentDay.meals || []}
          totalCalories={currentDay.totalCalories || 0}
          totalProtein={currentDay.totalProtein || currentDay.protein || 0}
          totalCarbs={currentDay.totalCarbs || currentDay.carbs || 0}
          totalFat={currentDay.totalFat || currentDay.fat || 0}
        />
      )}

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {isContentRenderable(nutritionTips) && (
          <div className="rounded-xl border border-[#E63C2F]/25 bg-[#E63C2F]/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-3">
              💡 Nutrition Tips
            </p>
            <div className="text-sm text-white/75 leading-relaxed space-y-1.5">
              {contentToArray(nutritionTips).map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-[#E63C2F] font-bold shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {isContentRenderable(shoppingList) && (
          <div className="rounded-xl border border-white/10 bg-white/3 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-3">
              🛒 Shopping List
            </p>
            <div className="text-sm text-white/75 leading-relaxed space-y-1.5">
              {contentToArray(shoppingList).map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-[#E63C2F] font-bold shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isContentRenderable(notes) && (
        <div className="rounded-xl border border-[#E63C2F]/25 bg-[#E63C2F]/5 p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-[#E63C2F] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-2">
              Important Notes
            </p>
            <div className="text-sm text-white/75 leading-relaxed space-y-1.5">
              {contentToArray(notes).map((item, idx) => (
                <div key={idx}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
