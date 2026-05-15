'use client';

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WorkoutsPage() {
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [activeVersion, setActiveVersion] = useState(0);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserPlan(data.user?.plan?.toLowerCase() || 'basic');
          setUserStatus(data.user?.membershipStatus?.toLowerCase() || 'pending');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

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

    fetchUser();
    fetchPlan();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-black uppercase tracking-widest text-muted-foreground animate-pulse">Analyzing Clearance...</p>
        </div>
      </div>
    );
  }

  if (userPlan === 'basic' || userStatus !== 'active') {
    const isPending = userStatus === 'pending';

    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-card border border-border p-12 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner">
            <Lock className="text-primary -rotate-3" size={40} />
          </div>
          
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-6 text-foreground leading-none">
            {isPending ? 'Activation' : 'Premium Access'} <span className="text-primary">{isPending ? 'Pending' : 'Required'}</span>
          </h1>
          
          <p className="text-muted-foreground text-lg mb-10 font-medium leading-relaxed">
            {isPending 
              ? 'Your membership is currently pending verification. Once an admin activates your account, your AI workout plans will be unlocked.'
              : 'Personalized AI Workout Plans are an exclusive benefit for STANDARD and PREMIUM members.'
            }
          </p>
          
          <Link 
            href={isPending ? "/dashboard/profile" : "/dashboard/membership"} 
            className="group relative inline-flex items-center gap-3 bg-primary text-white font-black uppercase tracking-widest px-10 py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all text-sm"
          >
            {isPending ? 'View Profile Status' : 'Upgrade Membership'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="mt-8 pt-8 border-t border-border/50">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Crown size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Elevate Your Fitness Journey</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workoutPlan) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary/10 border-2 border-primary p-8 rounded-2xl text-center shadow-lg">
            <p className="text-lg font-bold mb-2">⚠️ {error || 'No plan available'}</p>
            <p className="text-muted-foreground">
              Go back to{' '}
              <a href="/bmi-calculator" className="text-primary font-bold underline hover:opacity-80 transition-all">
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
    <div className="min-h-screen bg-background text-foreground p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-start justify-between mb-8 flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="text-xs font-black text-primary uppercase tracking-widest mb-3">✦ AI-Generated Plan</div>
              <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6 leading-tight text-foreground">
                {workoutPlan.goal || 'Fitness'}<br />{workoutPlan.duration || 'Program'}
              </h1>
              <div className="flex items-center gap-8 flex-wrap text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Level</span>
                  <span className="text-foreground font-black text-lg">{workoutPlan.level || 'Intermediate'}</span>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Duration</span>
                  <span className="text-foreground font-black text-lg">{workoutPlan.duration}</span>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Frequency</span>
                  <span className="text-foreground font-black text-lg">{workoutPlan.frequency}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <button
                onClick={generatePDF}
                className="flex-1 lg:flex-none bg-foreground text-background font-black text-sm uppercase tracking-wider px-6 py-4 rounded-lg transition-all shadow-lg hover:opacity-90"
              >
                📥 Download PDF
              </button>
              <button
                onClick={() => setShowRegenerateModal(true)}
                className="flex-1 lg:flex-none border-2 border-primary text-primary font-black text-sm uppercase tracking-wider px-6 py-4 rounded-lg transition-all hover:bg-primary hover:text-white"
              >
                🔄 Regenerate
              </button>
            </div>
          </div>
        </div>

        {workoutHistory.length > 1 && (
          <div className="mb-8 bg-card backdrop-blur-sm border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">📋 Saved Workout Versions</h3>
                <p className="text-xs text-muted-foreground mt-1">Access previous generated workout plans</p>
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider bg-muted px-3 py-2 rounded-lg font-bold">
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
                      ? 'bg-foreground text-background border-foreground shadow-lg'
                      : 'bg-transparent text-muted-foreground border-border hover:border-primary hover:text-foreground'
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
                  ? 'bg-muted/50 border-border cursor-default opacity-50'
                  : activeDay === idx
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                  : 'bg-card border-border hover:border-primary hover:bg-muted/30'
              }`}
            >
              <div className={`font-black text-[10px] uppercase tracking-widest mb-2 ${activeDay === idx ? 'text-white/80' : 'text-muted-foreground'}`}>{dayPlan.day}</div>
              <div className={`text-sm font-black uppercase mb-3 ${activeDay === idx ? 'text-white' : 'text-foreground'}`}>
                {dayPlan.title}
              </div>
              {!(dayPlan.isRest || dayPlan.exercises?.length === 0) && (
                <div className={`text-sm font-black ${activeDay === idx ? 'text-white' : 'text-primary'}`}>
                  <span>{dayPlan.exercises?.length || 0}</span>
                  <br />
                  <span className={`text-[10px] uppercase ${activeDay === idx ? 'text-white/70' : 'text-muted-foreground'}`}>Exercises</span>
                </div>
              )}
              {(dayPlan.isRest || dayPlan.exercises?.length === 0) && (
                <div className="text-muted-foreground/60 text-xs font-black uppercase tracking-widest">REST</div>
              )}
            </button>
          ))}
        </div>

        {currentDay && (
          <div className="bg-card rounded-2xl border border-border p-8 lg:p-10 shadow-xl">
            <div className="flex items-start justify-between mb-10 flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <h2 className="text-4xl font-black uppercase tracking-tight mb-4 text-foreground">
                  {currentDay.day} <span className="text-primary">—</span> {currentDay.title}
                </h2>
                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Duration</p>
                    <p className="text-foreground font-black text-lg">{currentDay.duration || 'N/A'}</p>
                  </div>
                  {currentDay.focus?.length > 0 && (
                    <>
                      <div className="w-px h-8 bg-border"></div>
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Focus Areas</p>
                        <p className="text-foreground font-black text-lg">{currentDay.focus.join(', ')}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-primary text-white font-black text-sm uppercase tracking-wider px-6 py-3 rounded-lg shadow-lg shadow-primary/20">
                {workoutPlan.goal}
              </div>
            </div>

            {currentDay.exercises && currentDay.exercises.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-border bg-muted/20">
                <table className="min-w-245 w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="w-16 px-4 py-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">#</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Exercise</th>
                      <th className="w-28 px-4 py-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">Sets</th>
                      <th className="w-28 px-4 py-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">Reps</th>
                      <th className="w-36 px-4 py-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">Rest</th>
                      <th className="w-40 px-4 py-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">Target</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDay.exercises.map((exercise: any, idx: number) => {
                      const isLastRow = idx === currentDay.exercises.length - 1;

                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${idx % 2 === 0 ? 'bg-card/30' : 'bg-transparent'} hover:bg-primary/5 ${!isLastRow ? 'border-b border-border' : ''}`}
                        >
                          <td className="px-4 py-5 align-top">
                            <div className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary text-[10px] font-black text-white shadow-sm shadow-primary/20">
                              {String(idx + 1).padStart(2, '0')}
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top">
                            <div className="space-y-1">
                              <h3 className="text-base font-black uppercase tracking-tight text-foreground">{exercise.exercise}</h3>
                              {exercise.notes && <p className="text-xs italic text-muted-foreground">{exercise.notes}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top text-center">
                            <div className="rounded-xl bg-muted px-3 py-3 border border-border">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Sets</p>
                              <p className="mt-1 text-xl font-black text-foreground">{exercise.sets}</p>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top text-center">
                            <div className="rounded-xl bg-muted px-3 py-3 border border-border">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Reps</p>
                              <p className="mt-1 text-xl font-black text-foreground">{exercise.reps}</p>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top text-center">
                            <div className="rounded-xl bg-muted px-3 py-3 border border-border">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Rest</p>
                              <p className="mt-1 text-lg font-black text-foreground">{exercise.rest}</p>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top text-center">
                            <div className="rounded-xl border border-primary/35 bg-primary/5 px-3 py-3">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Target</p>
                              <p className="mt-1 text-sm font-black text-primary">{exercise.target}</p>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-top">
                            <p className="max-w-65 text-xs leading-relaxed text-muted-foreground font-medium">{exercise.notes || 'No extra notes'}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/20 border border-border rounded-xl">
                <p className="text-3xl mb-2">😴</p>
                <p className="text-foreground text-lg font-black uppercase">Rest Day</p>
                <p className="text-muted-foreground text-sm mt-2 font-medium">Take this time to recover and prepare for tomorrow!</p>
              </div>
            )}
          </div>
        )}

        {workoutPlan.notes && (
          <div className="mt-12 bg-card border border-border rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-foreground">💡 Important Notes</h3>
            <p className="text-muted-foreground text-base leading-relaxed font-medium">{workoutPlan.notes}</p>
          </div>
        )}

        {showRegenerateModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-card p-8 md:p-12 border border-border max-w-md rounded-2xl shadow-2xl text-center relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-black mb-6 uppercase tracking-wider text-foreground">Are you sure?</h2>
              <p className="text-muted-foreground mb-8 text-base font-medium">
                Regenerating your plan will replace your current workout schedule with a fresh AI-generated plan.
              </p>
              <div className="flex gap-4 justify-center flex-col sm:flex-row">
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="px-8 py-3 bg-muted border border-border text-foreground font-black hover:bg-muted/80 transition-all uppercase tracking-wider rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => window.location.href = '/bmi-calculator?regenerate=true'}
                  className="px-8 py-3 bg-primary text-white font-black hover:bg-primary-light transition-all uppercase tracking-wider rounded-lg shadow-lg shadow-primary/20"
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