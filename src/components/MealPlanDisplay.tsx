'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, UtensilsCrossed } from 'lucide-react';

interface MealPlanDisplayProps {
  plan: any;
}

export default function MealPlanDisplay({ plan }: MealPlanDisplayProps) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!plan) return null;

  const formatMacro = (value: string | number) => {
    if (typeof value === 'string') {
      return parseInt(value).toLocaleString();
    }
    return value.toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Plan Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 text-white p-6 rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-black mb-2">{plan.title || 'Meal Plan'}</h2>
            <p className="text-green-100">{plan.goal}</p>
          </div>
          <UtensilsCrossed size={40} className="text-[#F4D03F]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-green-300 text-xs font-bold uppercase">Daily Calories</p>
            <p className="text-lg font-black">{plan.dailyCalories?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-green-300 text-xs font-bold uppercase">Protein</p>
            <p className="text-lg font-black">{formatMacro(plan.dailyProtein || 0)}g</p>
          </div>
          <div>
            <p className="text-green-300 text-xs font-bold uppercase">Carbs</p>
            <p className="text-lg font-black">{formatMacro(plan.dailyCarbs || 0)}g</p>
          </div>
          <div>
            <p className="text-green-300 text-xs font-bold uppercase">Fat</p>
            <p className="text-lg font-black">{formatMacro(plan.dailyFat || 0)}g</p>
          </div>
        </div>
      </div>

      {/* Weekly Breakdown */}
      {plan.weeks && (
        <div className="space-y-3">
          {plan.weeks.map((week: any, weekIdx: number) => (
            <div key={weekIdx} className="border-2 border-gray-300 overflow-hidden">
              <button
                onClick={() => setExpandedWeek(expandedWeek === weekIdx ? null : weekIdx)}
                className="w-full bg-gray-900 text-white p-4 flex justify-between items-center hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1 text-left">
                  <p className="font-black text-lg">{week.week || `Week ${weekIdx + 1}`}</p>
                  <p className="text-gray-300 text-sm">
                    {week.days ? week.days.length : 0} days meal plan
                  </p>
                </div>
                {expandedWeek === weekIdx ? (
                  <ChevronUp className="text-[#F4D03F]" />
                ) : (
                  <ChevronDown className="text-[#F4D03F]" />
                )}
              </button>

              {expandedWeek === weekIdx && week.days && (
                <div className="space-y-2 p-4 bg-gray-50">
                  {week.days.map((day: any, dayIdx: number) => (
                    <div key={dayIdx} className="border border-gray-200 overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedDay(
                            expandedDay === `${weekIdx}-${dayIdx}` ? null : `${weekIdx}-${dayIdx}`
                          )
                        }
                        className="w-full bg-green-50 text-left p-3 flex justify-between items-center hover:bg-green-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-black text-green-900">{day.day || `Day ${dayIdx + 1}`}</p>
                          <p className="text-xs text-gray-600">
                            {day.totalCalories?.toLocaleString() || 0} cal • P: {formatMacro(day.protein || 0)}g • C: {formatMacro(day.carbs || 0)}g • F: {formatMacro(day.fat || 0)}g
                          </p>
                        </div>
                        {expandedDay === `${weekIdx}-${dayIdx}` ? (
                          <ChevronUp size={18} className="text-[#F4D03F]" />
                        ) : (
                          <ChevronDown size={18} className="text-[#F4D03F]" />
                        )}
                      </button>

                      {expandedDay === `${weekIdx}-${dayIdx}` && day.meals && (
                        <div className="bg-white p-4 space-y-4 border-t border-gray-200">
                          {day.meals.map((meal: any, mealIdx: number) => (
                            <div
                              key={mealIdx}
                              className="pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-black text-gray-900">{meal.type}</h5>
                                  <p className="text-xs text-gray-600">{meal.time || ''}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-[#F4D03F]">{meal.calories?.toLocaleString() || 0} cal</p>
                                  <p className="text-xs text-gray-600">
                                    P: {formatMacro(meal.protein || 0)}g | C: {formatMacro(meal.carbs || 0)}g | F: {formatMacro(meal.fat || 0)}g
                                  </p>
                                </div>
                              </div>

                              {meal.items && (
                                <ul className="space-y-1 ml-2 mb-2">
                                  {meal.items.map((item: any, itemIdx: number) => (
                                    <li key={itemIdx} className="text-sm text-gray-700">
                                      <span className="font-bold">•</span> {item.item || item}
                                      {item.quantity && <span className="text-gray-600"> - {item.quantity}</span>}
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {meal.recipe && (
                                <div className="bg-blue-50 p-2 rounded text-sm mt-2">
                                  <p className="font-bold text-blue-900 mb-1">📖 Recipe:</p>
                                  <p className="text-blue-800 text-xs">{meal.recipe}</p>
                                </div>
                              )}

                              {meal.notes && (
                                <p className="text-sm italic text-gray-600 mt-2">📝 {meal.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Nutrition Summary */}
      {plan.nutritionTips && (
        <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
          <p className="font-black text-gray-900 mb-2">💡 Nutrition Tips:</p>
          <p className="text-gray-700 text-sm">{plan.nutritionTips}</p>
        </div>
      )}

      {/* Shopping List */}
      {plan.shoppingList && (
        <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
          <p className="font-black text-gray-900 mb-2">🛒 Shopping List:</p>
          <p className="text-gray-700 text-sm">{plan.shoppingList}</p>
        </div>
      )}

      {/* Notes Section */}
      {plan.notes && (
        <div className="bg-yellow-50 border-2 border-[#F4D03F] p-4 rounded-lg">
          <p className="font-black text-gray-900 mb-2">📌 Important Notes:</p>
          <p className="text-gray-700 text-sm">{plan.notes}</p>
        </div>
      )}
    </div>
  );
}
