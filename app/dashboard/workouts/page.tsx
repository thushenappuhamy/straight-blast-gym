'use client';

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

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
      <div className="min-h-screen dark:bg-linear-to-br dark:from-[#0D0D0D] dark:via-[#1A1A1A] dark:to-[#0D0D0D] bg-linear-to-br from-[#F5F5F5] via-[#FFFFFF] to-[#F5F5F5] dark:text-white text-[#1A1A1A] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-xl font-bold">Loading your personalized plan...</p>
        </div>
      </div>
    );
  }

  if (error || !workoutPlan) {
    return (
      <div className="min-h-screen dark:bg-linear-to-br dark:from-[#0D0D0D] dark:via-[#1A1A1A] dark:to-[#0D0D0D] bg-linear-to-br from-[#F5F5F5] via-[#FFFFFF] to-[#F5F5F5] dark:text-white text-[#1A1A1A] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#E63C2F]/10 border-2 border-[#E63C2F] p-8 rounded-2xl text-center">
            <p className="text-lg font-bold mb-2">⚠️ {error || 'No plan available'}</p>
            <p className="text-gray-300">
              Go back to{' '}
              <a href="/bmi-calculator" className="text-[#F5F5F5] underline hover:text-[#E63C2F] transition-colors">
                BMI Calculator
              </a>{' '}
              to create your personalized plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentWeek = workoutPlan.weeks?.[activeWeek] || { days: [] };
  const currentDay = currentWeek.days?.[activeDay];

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let cursorY = 16;

    const setText = (size: number, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(0, 0, 0);
    };

    const ensureSpace = (requiredHeight: number) => {
      if (cursorY + requiredHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
    };

    const writeLine = (text: string, size: number, bold = false, gapAfter = 0) => {
      setText(size, bold);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      const lineHeight = size * 0.5 + 2;
      ensureSpace(lines.length * lineHeight + gapAfter);
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * lineHeight + gapAfter;
    };

    const drawCell = (
      x: number,
      y: number,
      width: number,
      height: number,
      text: string,
      options: { bold?: boolean; align?: 'left' | 'center' | 'right'; fill?: boolean; fillColor?: [number, number, number] } = {}
    ) => {
      if (options.fill) {
        doc.setFillColor(...(options.fillColor ?? [236, 236, 236]));
        doc.rect(x, y, width, height, 'F');
      }

      doc.setDrawColor(0, 0, 0);
      doc.rect(x, y, width, height);
      setText(8, options.bold ?? false);

      const lines = doc.splitTextToSize(text || '-', width - 5);
      const lineHeight = 4;
      let textY = y + 5;

      lines.forEach((line: string) => {
        if (options.align === 'center') {
          doc.text(line, x + width / 2, textY, { align: 'center' });
        } else if (options.align === 'right') {
          doc.text(line, x + width - 2.5, textY, { align: 'right' });
        } else {
          doc.text(line, x + 2.5, textY);
        }
        textY += lineHeight;
      });
    };

    const drawTableRow = (
      cells: Array<{ text: string; width: number; align?: 'left' | 'center' | 'right'; bold?: boolean }>,
      options: { fill?: boolean; fillColor?: [number, number, number] } = {}
    ) => {
      const wrapped = cells.map((cell) => {
        setText(8, cell.bold ?? false);
        return doc.splitTextToSize(cell.text || '-', cell.width - 5);
      });

      const rowHeight = Math.max(...wrapped.map((lines) => lines.length * 4 + 5), 10);
      ensureSpace(rowHeight + 2);

      let x = margin;
      cells.forEach((cell, index) => {
        drawCell(x, cursorY, cell.width, rowHeight, wrapped[index].join('\n'), {
          bold: cell.bold,
          align: cell.align,
          fill: options.fill,
          fillColor: options.fillColor,
        });
        x += cell.width;
      });

      cursorY += rowHeight;
    };

    writeLine('STRAIGHT BLAST GYM', 18, true, 4);
    writeLine('PERSONALIZED WORKOUT PLAN', 13, true, 6);
    writeLine(`Goal: ${workoutPlan.goal}`, 10.5, true, 1);
    writeLine(`Duration: ${workoutPlan.duration}`, 10.5, false, 1);
    writeLine(`Level: ${workoutPlan.level}`, 10.5, false, 1);
    writeLine(`Frequency: ${workoutPlan.frequency}`, 10.5, false, 6);

    const columnWidths = [18, 58, 14, 16, 24, 22, 29];
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    const availableWidth = pageWidth - margin * 2;
    const scale = availableWidth / totalWidth;
    const widths = columnWidths.map((width) => width * scale);

    (workoutPlan.weeks || []).forEach((week: any, weekIdx: number) => {
      writeLine(`Week ${week.weekNumber || weekIdx + 1}`, 12, true, 4);

      drawTableRow([
        { text: 'Day', width: widths[0], align: 'center', bold: true },
        { text: 'Exercise', width: widths[1], bold: true },
        { text: 'Sets', width: widths[2], align: 'center', bold: true },
        { text: 'Reps', width: widths[3], align: 'center', bold: true },
        { text: 'Rest', width: widths[4], align: 'center', bold: true },
        { text: 'Target', width: widths[5], align: 'center', bold: true },
        { text: 'Notes', width: widths[6], bold: true },
      ], { fill: true, fillColor: [236, 236, 236] });

      (week.days || []).forEach((day: any) => {
        if (day.exercises && day.exercises.length > 0) {
          day.exercises.forEach((exercise: any, exerciseIdx: number) => {
            drawTableRow([
              { text: exerciseIdx === 0 ? `${day.day} - ${day.title}` : '', width: widths[0], align: 'center', bold: true },
              { text: exercise.exercise || '-', width: widths[1], bold: true },
              { text: String(exercise.sets ?? '-'), width: widths[2], align: 'center' },
              { text: String(exercise.reps ?? '-'), width: widths[3], align: 'center' },
              { text: String(exercise.rest ?? '-'), width: widths[4], align: 'center' },
              { text: String(exercise.target ?? '-'), width: widths[5], align: 'center' },
              { text: String(exercise.notes || ''), width: widths[6] },
            ]);
          });
        } else {
          drawTableRow([
            { text: `${day.day} - ${day.title}`, width: widths[0], align: 'center', bold: true },
            { text: 'REST DAY', width: widths[1], bold: true },
            { text: '-', width: widths[2], align: 'center' },
            { text: '-', width: widths[3], align: 'center' },
            { text: '-', width: widths[4], align: 'center' },
            { text: '-', width: widths[5], align: 'center' },
            { text: day.notes || 'Recovery day', width: widths[6] },
          ]);
        }
      });
    });

    if (workoutPlan.notes) {
      cursorY += 4;
      writeLine('Important Notes', 12, true, 3);
      writeLine(workoutPlan.notes, 9.5, false, 2);
    }

    writeLine(`Generated on: ${new Date().toLocaleDateString()}`, 9, false, 0);
    doc.save(`${workoutPlan.goal}_${workoutPlan.duration.replace(/\s+/g, '_')}_Workout_Plan.pdf`);
  };

  return (
    <div className="min-h-screen dark:bg-linear-to-br dark:from-[#0D0D0D] dark:via-[#1A1A1A] dark:to-[#0D0D0D] bg-linear-to-br from-[#F5F5F5] via-[#FFFFFF] to-[#F5F5F5] dark:text-white text-[#1A1A1A] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-start justify-between mb-8 flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="text-xs font-black text-[#E63C2F] uppercase tracking-widest mb-3">✦ AI-Generated Plan</div>
              <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6 leading-tight">
                <span className="dark:text-[#F5F5F5] text-[#1A1A1A]">{workoutPlan.goal || 'Fitness'}</span>
                <br />
                <span className="dark:text-[#F5F5F5] text-[#1A1A1A]">{workoutPlan.duration || 'Program'}</span>
              </h1>
              <div className="flex items-center gap-8 flex-wrap text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Level</span>
                  <span className="text-[#F5F5F5] font-bold text-lg">{workoutPlan.level || 'Intermediate'}</span>
                </div>
                <div className="w-px h-8 dark:bg-[#888888] bg-[#E5E5E5]"></div>
                <div className="flex flex-col gap-1">
                  <span className="dark:text-gray-400 text-gray-500 text-xs uppercase tracking-wider">Duration</span>
                  <span className="dark:text-[#F5F5F5] text-[#1A1A1A] font-bold text-lg">{workoutPlan.duration}</span>
                </div>
                <div className="w-px h-8 dark:bg-[#888888] bg-[#E5E5E5]"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Frequency</span>
                  <span className="text-[#F5F5F5] font-bold text-lg">{workoutPlan.frequency}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <button
                onClick={generatePDF}
                className="flex-1 lg:flex-none bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#0D0D0D] font-black text-sm uppercase tracking-wider px-6 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                📥 Download PDF
              </button>
              <button
                onClick={() => setShowRegenerateModal(true)}
                className="flex-1 lg:flex-none border-2 border-[#E63C2F] text-[#F5F5F5] hover:bg-[#E63C2F] hover:text-[#0D0D0D] font-black text-sm uppercase tracking-wider px-6 py-4 rounded-lg transition-all"
              >
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-12">
          {(currentWeek.days || []).map((dayPlan: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveDay(idx)}
              className={`p-5 rounded-xl border-2 transition-all transform hover:scale-105 ${
                dayPlan.isRest || dayPlan.exercises?.length === 0
                  ? 'bg-[#1A1A1A]/50 border-[#888888]/20 cursor-default'
                  : activeDay === idx
                  ? 'bg-[#F5F5F5] text-[#0D0D0D] border-[#F5F5F5] shadow-lg shadow-[#F5F5F5]/20'
                  : 'bg-[#1A1A1A]/50 border-[#888888]/20 hover:border-[#E63C2F] hover:bg-[#1A1A1A]'
              }`}
            >
              <div className="font-black text-xs uppercase tracking-widest mb-2">{dayPlan.day}</div>
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

        {currentDay && (
          <div className="dark:bg-linear-to-br dark:from-[#1A1A1A] dark:to-[#0D0D0D] bg-white rounded-2xl border dark:border-[#888888]/20 border-[#E5E5E5] p-8 lg:p-10 shadow-2xl">
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

            {currentDay.exercises && currentDay.exercises.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-[#888888]/20 bg-[#0D0D0D]/50">
                <table className="min-w-245 w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#1A1A1A] text-left">
                      <th className="w-16 px-4 py-4 text-xs font-black uppercase tracking-wider text-gray-400">#</th>
                      <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Exercise</th>
                      <th className="w-28 px-4 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-center">Sets</th>
                      <th className="w-28 px-4 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-center">Reps</th>
                      <th className="w-36 px-4 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-center">Rest</th>
                      <th className="w-40 px-4 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-center">Target</th>
                      <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDay.exercises.map((exercise: any, idx: number) => {
                      const isLastRow = idx === currentDay.exercises.length - 1;

                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${idx % 2 === 0 ? 'bg-[#111111]' : 'bg-[#0D0D0D]'} hover:bg-[#1A1A1A] ${!isLastRow ? 'border-b border-[#888888]/15' : ''}`}
                        >
                          <td className="px-4 py-5 align-top">
                            <div className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#E63C2F] text-xs font-black text-white">
                              {String(idx + 1).padStart(2, '0')}
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top">
                            <div className="space-y-1">
                              <h3 className="text-base font-black uppercase tracking-tight text-[#F5F5F5]">{exercise.exercise}</h3>
                              {exercise.notes && <p className="text-sm italic text-gray-400">{exercise.notes}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top text-center">
                            <div className="rounded-xl bg-[#1A1A1A] px-3 py-3">
                              <p className="text-xs uppercase tracking-wider text-gray-500">Sets</p>
                              <p className="mt-1 text-xl font-black text-[#F5F5F5]">{exercise.sets}</p>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top text-center">
                            <div className="rounded-xl bg-[#1A1A1A] px-3 py-3">
                              <p className="text-xs uppercase tracking-wider text-gray-500">Reps</p>
                              <p className="mt-1 text-xl font-black text-[#F5F5F5]">{exercise.reps}</p>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top text-center">
                            <div className="rounded-xl bg-[#1A1A1A] px-3 py-3">
                              <p className="text-xs uppercase tracking-wider text-gray-500">Rest</p>
                              <p className="mt-1 text-lg font-black text-[#F5F5F5]">{exercise.rest}</p>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top text-center">
                            <div className="rounded-xl border border-[#E63C2F]/35 bg-[#E63C2F]/10 px-3 py-3">
                              <p className="text-xs uppercase tracking-wider text-gray-500">Target</p>
                              <p className="mt-1 text-sm font-black text-[#E63C2F]">{exercise.target}</p>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top">
                            <p className="max-w-65 text-sm leading-relaxed text-gray-300">{exercise.notes || 'No extra notes'}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

        {workoutPlan.notes && (
          <div className="mt-12 dark:bg-linear-to-br dark:from-[#1A1A1A] dark:to-[#0D0D0D] bg-white border dark:border-[#888888]/20 border-[#E5E5E5] rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 dark:text-[#F5F5F5] text-[#1A1A1A]">💡 Important Notes</h3>
            <p className="dark:text-gray-300 text-gray-600 text-base leading-relaxed">{workoutPlan.notes}</p>
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
                  className="px-8 py-3 bg-[#1A1A1A] border border-[#888888]/40 text-[#F5F5F5] font-bold hover:border-[#F5F5F5] transition-all uppercase tracking-wider rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => window.location.href = '/bmi-calculator?regenerate=true'}
                  className="px-8 py-3 bg-[#E63C2F] text-white font-black hover:bg-[#E63C2F]/90 transition-all uppercase tracking-wider rounded-lg shadow-lg hover:shadow-xl"
                >
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