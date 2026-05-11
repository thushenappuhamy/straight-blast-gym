'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';

interface WorkoutPlanDisplayProps {
  plan: any;
}

export default function WorkoutPlanDisplay({ plan }: WorkoutPlanDisplayProps) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!plan) return null;

  return (
    <div className="space-y-4 text-white">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(230,60,47,0.18),rgba(17,17,17,0.96))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-[#E63C2F]/25 bg-[#E63C2F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
              Workout plan
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">{plan.title || 'Workout Plan'}</h2>
            <p className="mt-2 text-white/60">{plan.goal}</p>
          </div>
          <Dumbbell size={40} className="text-[#E63C2F]" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ['Level', plan.level],
            ['Duration', plan.duration],
            ['Frequency', plan.frequency],
            ['Focus', plan.focus || 'Full Body'],
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
                  <p className="text-sm text-white/45">{week.days ? week.days.length : 0} training days</p>
                </div>
                {expandedWeek === weekIdx ? <ChevronUp className="text-[#E63C2F]" /> : <ChevronDown className="text-[#E63C2F]" />}
              </button>

              {expandedWeek === weekIdx && week.days && (
                <div className="space-y-2 border-t border-white/10 bg-black/25 p-4">
                  {week.days.map((day: any, dayIdx: number) => {
                    const dayKey = `${weekIdx}-${dayIdx}`;
                    const hasExercises = day.exercises && day.exercises.length > 0;

                    return (
                      <div key={dayIdx} className="overflow-hidden rounded-2xl border border-white/10">
                        <button
                          onClick={() => setExpandedDay(expandedDay === dayKey ? null : dayKey)}
                          className="flex w-full items-center justify-between bg-white/5 p-3 text-left transition-colors hover:bg-white/8"
                        >
                          <div>
                            <p className="font-black text-white">{day.day || `Day ${dayIdx + 1}`}</p>
                            <p className="text-xs text-white/45">{day.focus || 'Training'}</p>
                          </div>
                          {expandedDay === dayKey ? <ChevronUp size={18} className="text-[#E63C2F]" /> : <ChevronDown size={18} className="text-[#E63C2F]" />}
                        </button>

                        {expandedDay === dayKey && hasExercises && (
                          <div className="space-y-3 border-t border-white/10 bg-[#111111] p-4">
                            {day.exercises.map((exercise: any, exIdx: number) => (
                              <div key={exIdx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="mb-2 flex items-start justify-between gap-3">
                                  <h5 className="font-black text-white">{exercise.name}</h5>
                                  <span className="rounded-full bg-[#E63C2F] px-2 py-1 text-xs font-black text-white">{exercise.sets}x{exercise.reps}</span>
                                </div>

                                {exercise.target && <p className="mb-2 text-sm text-white/65"><span className="font-bold text-white">Target:</span> {exercise.target}</p>}
                                {exercise.rest && <p className="mb-2 text-sm text-white/65"><span className="font-bold text-white">Rest:</span> {exercise.rest}</p>}

                                {exercise.formTips && (
                                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-sm">
                                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#E63C2F]">Form Tips</p>
                                    <p className="text-white/75">{exercise.formTips}</p>
                                  </div>
                                )}

                                {exercise.notes && <p className="mt-2 text-sm italic text-white/45">📝 {exercise.notes}</p>}
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

      {plan.notes && (
        <div className="rounded-2xl border border-[#E63C2F]/25 bg-[#E63C2F]/10 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white">📌 Important Notes</p>
          <p className="text-sm text-white/75">{plan.notes}</p>
        </div>
      )}
    </div>
  );
}