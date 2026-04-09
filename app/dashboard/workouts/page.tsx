'use client';

import React, { useState, useEffect } from 'react';

export default function WorkoutsPage() {
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);


  useEffect(() => {
    const fetchPlan = async () => {
      try {
        console.log('📊 [WORKOUTS] Fetching workout plan...');
        const response = await fetch('/api/health/generate-plan');
        
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          const text = await response.text();
          console.error('❌ [WORKOUTS] Failed to parse JSON. Response:', text.substring(0, 200));
          throw new Error(`API Error ${response.status}: Invalid JSON response`);
        }

        if (response.ok && data.data?.workoutPlan) {
          console.log('✅ [WORKOUTS] Plan loaded:', data.data.workoutPlan);
          setWorkoutPlan(data.data.workoutPlan);
          if (data.data.workoutPlan.weeks?.length > 0) {
            setActiveWeek(0);
            if (data.data.workoutPlan.weeks[0]?.days?.length > 0) {
              setActiveDay(0);
            }
          }
        } else {
          setError('No workout plan found. Complete the plan questionnaire first.');
        }
      } catch (err: any) {
        console.error('❌ [WORKOUTS] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2B2621] text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Loading your personalized plan...</p>
          <div className="animate-spin">⚙️</div>
        </div>
      </div>
    );
  }

  if (error || !workoutPlan) {
    return (
      <div className="min-h-screen bg-[#2B2621] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/20 border border-red-500 p-8 rounded-lg text-center">
            <p className="text-lg font-bold">⚠️ {error || 'No plan available'}</p>
            <p className="text-gray-300 mt-2">Go back to <a href="/bmi-calculator" className="text-[#F4D03F] underline">BMI Calculator</a> to create your personalized plan.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentWeek = workoutPlan.weeks?.[activeWeek] || { days: [] };
  const currentDay = currentWeek.days?.[activeDay];

  return (
    <div className="min-h-screen bg-[#2B2621] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                AI-Generated Plan
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tight mb-4">
                <span className="text-[#F4D03F]">{workoutPlan.goal || 'Fitness'}</span>
                <br />
                <span className="text-white">{workoutPlan.duration || 'Program'}</span>
              </h1>
              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div>
                  <span className="text-gray-400">Level: </span>
                  <span className="text-[#F4D03F] font-bold">{workoutPlan.level || 'Intermediate'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Goal: </span>
                  <span className="text-white font-bold">{workoutPlan.goal}</span>
                </div>
                <div>
                  <span className="text-gray-400">Duration: </span>
                  <span className="text-[#F4D03F] font-bold">{workoutPlan.duration}</span>
                </div>
                <div>
                  <span className="text-gray-400">Frequency: </span>
                  <span className="text-[#F4D03F] font-bold">{workoutPlan.frequency}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-bold text-sm uppercase tracking-wider px-6 py-3 transition-all">
                Download PDF
              </button>
              <button 
                onClick={() => setShowRegenerateModal(true)}
                className="border-2 border-[#F4D03F] text-[#F4D03F] hover:bg-[#F4D03F] hover:text-black font-bold text-sm uppercase tracking-wider px-6 py-3 transition-all">
                Regenerate Plan
              </button>
            </div>
          </div>
        </div>

        {/* Week Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {(workoutPlan.weeks || []).slice(0, 4).map((week: any, idx: number) => (
            <button
              key={idx}
              onClick={() => {
                setActiveWeek(idx);
                setActiveDay(0);
              }}
              className={`px-6 py-3 font-bold text-sm uppercase tracking-wider whitespace-nowrap transition-all ${
                activeWeek === idx
                  ? 'bg-[#F4D03F] text-black'
                  : 'bg-[#1A1816] text-gray-400 hover:bg-[#3A3631]'
              }`}
            >
              Week {week.weekNumber || idx + 1}
            </button>
          ))}
          {(workoutPlan.weeks?.length || 0) > 4 && (
            <button className="px-6 py-3 bg-[#1A1816] text-gray-400 font-bold text-sm uppercase tracking-wider">
              ...
            </button>
          )}
        </div>

        {/* Weekly Calendar */}
        <div className="grid grid-cols-7 gap-3 mb-8">
          {(currentWeek.days || []).map((dayPlan: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveDay(idx)}
              className={`p-4 rounded transition-all ${
                dayPlan.isRest || (dayPlan.exercises?.length === 0)
                  ? 'bg-[#1A1816] cursor-default'
                  : activeDay === idx
                  ? 'bg-[#F4D03F] text-black'
                  : 'bg-[#1A1816] hover:bg-[#3A3631]'
              }`}
            >
              <div className="font-bold text-xs uppercase tracking-wider mb-2">
                {dayPlan.day}
              </div>
              <div className={`text-xs uppercase mb-2 ${(dayPlan.isRest || dayPlan.exercises?.length === 0) ? 'text-gray-500' : ''}`}>
                {dayPlan.title}
              </div>
              {!(dayPlan.isRest || dayPlan.exercises?.length === 0) && (
                <div className="text-xs">
                  <span className="font-bold">{dayPlan.exercises?.length || 0}</span>
                  <br />
                  <span className="text-gray-400 uppercase text-[10px]">exercises</span>
                </div>
              )}
              {(dayPlan.isRest || dayPlan.exercises?.length === 0) && (
                <div className="text-gray-600 text-xs">—</div>
              )}
              {!(dayPlan.isRest || dayPlan.exercises?.length === 0) && <div className="text-gray-600 text-xs mt-1">—</div>}
            </button>
          ))}
        </div>

        {/* Workout Detail Card */}
        {currentDay && (
          <div className="bg-[#1A1816] rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                  {currentDay.day} — {currentDay.title}
                </h2>
                <p className="text-gray-400 text-sm">
                  Duration: <span className="text-white">{currentDay.duration || 'N/A'}</span>
                </p>
                {currentDay.focus?.length > 0 && (
                  <p className="text-gray-400 text-sm">
                    Focus: <span className="text-white">{currentDay.focus.join(', ')}</span>
                  </p>
                )}
              </div>
              <div className="bg-[#F4D03F] text-black font-bold text-xs uppercase tracking-wider px-4 py-2">
                {workoutPlan.goal}
              </div>
            </div>

            {/* Exercise Table */}
            {currentDay.exercises && currentDay.exercises.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#3A3631]">
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Exercise</th>
                      <th className="text-center py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sets</th>
                      <th className="text-center py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reps</th>
                      <th className="text-center py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rest</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Target</th>
                      <th className="text-center py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDay.exercises.map((exercise: any, idx: number) => (
                      <tr key={idx} className="border-b border-[#3A3631] hover:bg-[#2B2621] transition-colors">
                        <td className="py-4 px-4 text-sm">{exercise.id || String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-sm">{exercise.exercise}</div>
                          {exercise.notes && <div className="text-xs text-gray-400 mt-1">{exercise.notes}</div>}
                        </td>
                        <td className="py-4 px-4 text-center text-sm font-bold">{exercise.sets}</td>
                        <td className="py-4 px-4 text-center text-sm">{exercise.reps}</td>
                        <td className="py-4 px-4 text-center text-sm">{exercise.rest}</td>
                        <td className="py-4 px-4">
                          <div className="bg-[#F4D03F]/20 text-[#F4D03F] text-xs font-bold px-3 py-1 rounded w-fit">
                            {exercise.target}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input type="checkbox"  className="w-4 h-4 cursor-pointer accent-[#F4D03F]" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Rest Day</p>
              </div>
            )}
          </div>
        )}

        {/* Plan Notes */}
        {workoutPlan.notes && (
          <div className="mt-8 bg-[#1A1816] rounded-lg p-6">
            <h3 className="text-lg font-black uppercase tracking-tight mb-4 text-[#F4D03F]">Important Notes</h3>
            <p className="text-gray-300 text-sm">{workoutPlan.notes}</p>
          </div>
        )}

        {showRegenerateModal && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
            <div className="bg-[#1A1816] p-8 md:p-12 border-2 border-[#F4D03F] max-w-xl shadow-[0_0_20px_rgba(244,208,63,0.3)] text-center relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-black mb-6 uppercase tracking-wider text-[#F4D03F]">Are you sure?</h2>
              <p className="text-gray-300 mb-8 font-mono">
                Regenerating your plan will replace your current workout schedule.
              </p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setShowRegenerateModal(false)} className="px-8 py-3 bg-gray-600 text-white font-bold hover:bg-gray-500 transition-colors uppercase tracking-wider">No, Keep</button>
                <button onClick={() => window.location.href = '/bmi-calculator?regenerate=true'} className="px-8 py-3 bg-[#F4D03F] text-black font-black hover:bg-yellow-400 transition-colors uppercase tracking-wider shadow-[4px_4px_0_white]">Yes, Regenerate</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
