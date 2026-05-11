'use client';

import React, { useState, useEffect } from 'react';

export default function WorkoutsPage() {
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [activeVersion, setActiveVersion] = useState(0);


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
          const history = Array.isArray(data.data.workoutHistory) && data.data.workoutHistory.length > 0
            ? data.data.workoutHistory
            : [data.data.workoutPlan];

          setWorkoutHistory(history);
          setWorkoutPlan(history[0]);
          setActiveVersion(0);

          if (history[0]?.weeks?.length > 0) {
            setActiveWeek(0);
            if (history[0].weeks[0]?.days?.length > 0) {
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
      <div className="min-h-screen bg-linear-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-xl font-bold">Loading your personalized plan...</p>
        </div>
      </div>
    );
  }

  if (error || !workoutPlan) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#E63C2F]/10 border-2 border-[#E63C2F] p-8 rounded-2xl text-center">
            <p className="text-lg font-bold mb-2">⚠️ {error || 'No plan available'}</p>
            <p className="text-gray-300">Go back to <a href="/bmi-calculator" className="text-[#F5F5F5] underline hover:text-[#E63C2F] transition-colors">BMI Calculator</a> to create your personalized plan.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentWeek = workoutPlan.weeks?.[activeWeek] || { days: [] };
  const currentDay = currentWeek.days?.[activeDay];

  const generatePDF = () => {
    const element = document.getElementById('workout-plan-pdf');
    if (!element) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate simple PDF-like content
    const pdfContent = generatePDFContent();
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(pdfContent)}`;
    link.download = `${workoutPlan.goal}_${workoutPlan.duration.replace(/\s+/g, '_')}_Plan.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDFContent = () => {
    let content = `STRAIGHT BLAST GYM - PERSONALIZED WORKOUT PLAN\n`;
    content += `${'='.repeat(60)}\n\n`;
    content += `GOAL: ${workoutPlan.goal}\n`;
    content += `DURATION: ${workoutPlan.duration}\n`;
    content += `LEVEL: ${workoutPlan.level}\n`;
    content += `FREQUENCY: ${workoutPlan.frequency}\n\n`;

    (workoutPlan.weeks || []).forEach((week: any, weekIdx: number) => {
      content += `\n${'─'.repeat(60)}\n`;
      content += `WEEK ${week.weekNumber || weekIdx + 1}\n`;
      content += `${'─'.repeat(60)}\n\n`;

      (week.days || []).forEach((day: any) => {
        content += `\n${day.day.toUpperCase()}\n`;
        content += `${day.title}\n`;
        content += `Duration: ${day.duration || 'N/A'}\n`;
        if (day.focus?.length > 0) {
          content += `Focus: ${day.focus.join(', ')}\n`;
        }
        content += `\n`;

        if (day.exercises && day.exercises.length > 0) {
          day.exercises.forEach((ex: any, exIdx: number) => {
            content += `  ${exIdx + 1}. ${ex.exercise}\n`;
            content += `     Sets: ${ex.sets} | Reps: ${ex.reps} | Rest: ${ex.rest}\n`;
            content += `     Target: ${ex.target}\n`;
            if (ex.notes) {
              content += `     Notes: ${ex.notes}\n`;
            }
            content += `\n`;
          });
        } else {
          content += `  ✓ REST DAY\n\n`;
        }
      });
    });

    if (workoutPlan.notes) {
      content += `\n${'='.repeat(60)}\n`;
      content += `IMPORTANT NOTES\n`;
      content += `${'='.repeat(60)}\n`;
      content += `${workoutPlan.notes}\n`;
    }

    content += `\n\nGenerated on: ${new Date().toLocaleDateString()}\n`;
    return content;
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-8 flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="text-xs font-black text-[#E63C2F] uppercase tracking-widest mb-3">
                ✦ AI-Generated Plan
              </div>
              <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6 leading-tight">
                <span className="text-[#F5F5F5]">{workoutPlan.goal || 'Fitness'}</span>
                <br />
                <span className="text-[#F5F5F5]">{workoutPlan.duration || 'Program'}</span>
              </h1>
              <div className="flex items-center gap-8 flex-wrap text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Level</span>
                  <span className="text-[#F5F5F5] font-bold text-lg">{workoutPlan.level || 'Intermediate'}</span>
                </div>
                <div className="w-px h-8 bg-[#888888]"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Duration</span>
                  <span className="text-[#F5F5F5] font-bold text-lg">{workoutPlan.duration}</span>
                </div>
                <div className="w-px h-8 bg-[#888888]"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Frequency</span>
                  <span className="text-[#F5F5F5] font-bold text-lg">{workoutPlan.frequency}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <button className="flex-1 lg:flex-none bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#0D0D0D] font-black text-sm uppercase tracking-wider px-6 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl">
                📥 Download PDF
              </button>
              <button 
                onClick={() => setShowRegenerateModal(true)}
                className="flex-1 lg:flex-none border-2 border-[#E63C2F] text-[#F5F5F5] hover:bg-[#E63C2F] hover:text-[#0D0D0D] font-black text-sm uppercase tracking-wider px-6 py-4 rounded-lg transition-all">
                🔄 Regenerate
              </button>
            </div>
          </div>
        </div>

        {workoutHistory.length > 1 && (
          <div className="mb-8 bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#888888]/20 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#F5F5F5]">📋 Saved Workout Versions</h3>
                <p className="text-xs text-gray-400 mt-1">Access previous generated workout plans</p>
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider bg-[#0D0D0D] px-3 py-2 rounded-lg">
                Version {activeVersion + 1} of {workoutHistory.length}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {workoutHistory.map((plan, index) => (
                <button
                  key={plan._id || index}
                  onClick={() => {
                    setWorkoutPlan(plan);
                    setActiveVersion(index);
                    setActiveWeek(0);
                    setActiveDay(0);
                  }}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap border rounded-lg transition-all ${
                    activeVersion === index
                      ? 'bg-[#F5F5F5] text-[#0D0D0D] border-[#F5F5F5] shadow-lg'
                      : 'bg-transparent text-gray-300 border-[#888888]/40 hover:border-[#E63C2F] hover:text-[#F5F5F5]'
                  }`}
                >
                  {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : `V${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Calendar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-12">
          {(currentWeek.days || []).map((dayPlan: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveDay(idx)}
              className={`p-5 rounded-xl border-2 transition-all transform hover:scale-105 ${
                dayPlan.isRest || (dayPlan.exercises?.length === 0)
                  ? 'bg-[#1A1A1A]/50 border-[#888888]/20 cursor-default'
                  : activeDay === idx
                  ? 'bg-[#F5F5F5] text-[#0D0D0D] border-[#F5F5F5] shadow-lg shadow-[#F5F5F5]/20'
                  : 'bg-[#1A1A1A]/50 border-[#888888]/20 hover:border-[#E63C2F] hover:bg-[#1A1A1A]'
              }`}
            >
              <div className="font-black text-xs uppercase tracking-widest mb-2">
                {dayPlan.day}
              </div>
              <div className={`text-sm font-bold uppercase mb-3 ${(dayPlan.isRest || dayPlan.exercises?.length === 0) ? 'text-gray-500' : activeDay === idx ? 'text-[#0D0D0D]' : 'text-[#F5F5F5]'}`}>
                {dayPlan.title}
              </div>
              {!(dayPlan.isRest || dayPlan.exercises?.length === 0) && (
                <div className={`text-sm font-bold ${activeDay === idx ? 'text-[#0D0D0D]' : 'text-[#E63C2F]'}`}>
                  <span>{dayPlan.exercises?.length || 0}</span>
                  <br />
                  <span className={`text-xs uppercase ${activeDay === idx ? 'text-[#0D0D0D]/70' : 'text-gray-400'}`}>Exercises</span>
                </div>
              )}
              {(dayPlan.isRest || dayPlan.exercises?.length === 0) && (
                <div className="text-gray-600 text-sm font-bold">REST</div>
              )}
            </button>
          ))}
        </div>

        {/* Workout Detail Card */}
        {currentDay && (
          <div className="bg-linear-to-br from-[#1A1A1A] to-[#0D0D0D] rounded-2xl border border-[#888888]/20 p-8 lg:p-10 shadow-2xl">
            <div className="flex items-start justify-between mb-10 flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <h2 className="text-4xl font-black uppercase tracking-tight mb-4">
                  {currentDay.day} <span className="text-[#E63C2F]">—</span> {currentDay.title}
                </h2>
                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Duration</p>
                    <p className="text-[#F5F5F5] font-bold text-lg">{currentDay.duration || 'N/A'}</p>
                  </div>
                  {currentDay.focus?.length > 0 && (
                    <>
                      <div className="w-px h-8 bg-[#888888]/40"></div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Focus Areas</p>
                        <p className="text-[#F5F5F5] font-bold text-lg">{currentDay.focus.join(', ')}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-[#E63C2F] text-white font-black text-sm uppercase tracking-wider px-6 py-3 rounded-lg shadow-lg">
                {workoutPlan.goal}
              </div>
            </div>

            {/* Exercise Cards */}
            {currentDay.exercises && currentDay.exercises.length > 0 ? (
              <div className="grid gap-4">
                {currentDay.exercises.map((exercise: any, idx: number) => (
                  <div key={idx} className="bg-[#0D0D0D]/50 border border-[#888888]/30 rounded-xl p-6 hover:border-[#E63C2F] transition-all group">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-[#E63C2F] text-white font-black text-xs w-8 h-8 rounded flex items-center justify-center">
                            {String(idx + 1).padStart(2, '0')}
                          </div>
                          <h3 className="text-lg font-black uppercase tracking-tight text-[#F5F5F5]">{exercise.exercise}</h3>
                        </div>
                        {exercise.notes && (
                          <p className="text-sm text-gray-400 mt-2 italic">{exercise.notes}</p>
                        )}
                      </div>
                      <input 
                        type="checkbox" 
                        className="w-6 h-6 cursor-pointer accent-[#E63C2F] rounded" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="bg-[#1A1A1A] p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Sets</p>
                        <p className="text-[#F5F5F5] font-black text-xl">{exercise.sets}</p>
                      </div>
                      <div className="bg-[#1A1A1A] p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Reps</p>
                        <p className="text-[#F5F5F5] font-black text-xl">{exercise.reps}</p>
                      </div>
                      <div className="bg-[#1A1A1A] p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Rest</p>
                        <p className="text-[#F5F5F5] font-black text-xl">{exercise.rest}</p>
                      </div>
                      <div className="bg-[#E63C2F]/10 border border-[#E63C2F]/40 p-3 rounded-lg text-center col-span-2 sm:col-span-2">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Target</p>
                        <p className="text-[#E63C2F] font-black text-sm">{exercise.target}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#0D0D0D]/50 border border-[#888888]/20 rounded-xl">
                <p className="text-3xl mb-2">😴</p>
                <p className="text-gray-400 text-lg font-bold">Rest Day</p>
                <p className="text-gray-500 text-sm mt-2">Take this time to recover and prepare for tomorrow!</p>
              </div>
            )}
          </div>
        )}

        {/* Plan Notes */}
        {workoutPlan.notes && (
          <div className="mt-12 bg-linear-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#888888]/20 rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-[#F5F5F5]">💡 Important Notes</h3>
            <p className="text-gray-300 text-base leading-relaxed">{workoutPlan.notes}</p>
          </div>
        )}

        {showRegenerateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-linear-to-br from-[#1A1A1A] to-[#0D0D0D] p-8 md:p-12 border-2 border-[#E63C2F] max-w-md rounded-2xl shadow-2xl shadow-[#E63C2F]/30 text-center relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-black mb-6 uppercase tracking-wider text-[#F5F5F5]">Are you sure?</h2>
              <p className="text-gray-300 mb-8 text-base">
                Regenerating your plan will replace your current workout schedule with a fresh AI-generated plan.
              </p>
              <div className="flex gap-4 justify-center flex-col sm:flex-row">
                <button 
                  onClick={() => setShowRegenerateModal(false)} 
                  className="px-8 py-3 bg-[#1A1A1A] border border-[#888888]/40 text-[#F5F5F5] font-bold hover:border-[#F5F5F5] transition-all uppercase tracking-wider rounded-lg">
                  Cancel
                </button>
                <button 
                  onClick={() => window.location.href = '/bmi-calculator?regenerate=true'} 
                  className="px-8 py-3 bg-[#E63C2F] text-white font-black hover:bg-[#E63C2F]/90 transition-all uppercase tracking-wider rounded-lg shadow-lg hover:shadow-xl">
                  Yes, Regenerate
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}