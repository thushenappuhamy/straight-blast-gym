'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';

interface WorkoutPlanDisplayProps {
  plan: any;
}

export default function WorkoutPlanDisplay({ plan }: WorkoutPlanDisplayProps) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!plan) return null;

  return (
    <div className="space-y-4">
      {/* Plan Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-black mb-2">{plan.title || 'Workout Plan'}</h2>
            <p className="text-blue-100">{plan.goal}</p>
          </div>
          <Dumbbell size={40} className="text-[#F4D03F]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase">Level</p>
            <p className="text-lg font-black">{plan.level}</p>
          </div>
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase">Duration</p>
            <p className="text-lg font-black">{plan.duration}</p>
          </div>
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase">Frequency</p>
            <p className="text-lg font-black">{plan.frequency}</p>
          </div>
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase">Focus</p>
            <p className="text-lg font-black">{plan.focus || 'Full Body'}</p>
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
                    {week.days ? week.days.length : 0} training days
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
                        className="w-full bg-blue-50 text-left p-3 flex justify-between items-center hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-black text-blue-900">{day.day || `Day ${dayIdx + 1}`}</p>
                          <p className="text-xs text-gray-600">{day.focus || 'Training'}</p>
                        </div>
                        {expandedDay === `${weekIdx}-${dayIdx}` ? (
                          <ChevronUp size={18} className="text-[#F4D03F]" />
                        ) : (
                          <ChevronDown size={18} className="text-[#F4D03F]" />
                        )}
                      </button>

                      {expandedDay === `${weekIdx}-${dayIdx}` && day.exercises && (
                        <div className="bg-white p-3 space-y-3 border-t border-gray-200">
                          {day.exercises.map((exercise: any, exIdx: number) => (
                            <div key={exIdx} className="pb-3 border-b border-gray-200 last:border-0">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-black text-gray-900">{exercise.name}</h5>
                                <span className="bg-[#F4D03F] text-gray-900 px-2 py-1 text-xs font-black rounded">
                                  {exercise.sets}x{exercise.reps}
                                </span>
                              </div>

                              {exercise.target && (
                                <p className="text-sm text-gray-600 mb-2">
                                  <span className="font-bold">Target:</span> {exercise.target}
                                </p>
                              )}

                              {exercise.rest && (
                                <p className="text-sm text-gray-600 mb-2">
                                  <span className="font-bold">Rest:</span> {exercise.rest}
                                </p>
                              )}

                              {exercise.formTips && (
                                <div className="bg-blue-50 p-2 rounded text-sm">
                                  <p className="font-bold text-blue-900 mb-1">Form Tips:</p>
                                  <p className="text-blue-800">{exercise.formTips}</p>
                                </div>
                              )}

                              {exercise.notes && (
                                <p className="text-sm italic text-gray-600 mt-2">📝 {exercise.notes}</p>
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
