'use client';

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { MealPlanContainer } from '@/src/components/meal';
import { transformMealPlan } from '@/src/lib/mealTransformer';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MealPlansPage() {
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [mealHistory, setMealHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState(false);
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
        console.log('📊 [MEALS] Fetching meal plan...');
        const response = await fetch('/api/health/generate-plan');
        
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          const text = await response.text();
          console.error('❌ [MEALS] Failed to parse JSON. Response:', text.substring(0, 200));
          throw new Error(`API Error ${response.status}: Invalid JSON response`);
        }

        if (response.ok && data.data?.mealPlan) {
          console.log('✅ [MEALS] Plan loaded:', data.data.mealPlan);
          const history = Array.isArray(data.data.mealHistory) && data.data.mealHistory.length > 0
            ? data.data.mealHistory.map(transformMealPlan)
            : [transformMealPlan(data.data.mealPlan)];

          const plan = transformMealPlan(data.data.mealPlan);
          setMealHistory(history);
          setMealPlan(plan);
        } else {
          setError('No meal plan found. Complete the plan questionnaire first.');
        }
      } catch (err: any) {
        console.error('❌ [MEALS] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchPlan();
  }, []);

  const handleDownload = () => {
    if (!mealPlan) return;

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
    writeLine('PERSONALIZED MEAL PLAN', 13, true, 6);
    writeLine(`Goal: ${mealPlan.goal}`, 10.5, true, 1);
    writeLine(`Daily Calories: ${mealPlan.dailyCalories.toLocaleString()}`, 10.5, false, 1);
    writeLine(`Protein: ${mealPlan.dailyProtein}g`, 10.5, false, 1);
    writeLine(`Carbs: ${mealPlan.dailyCarbs}g`, 10.5, false, 1);
    writeLine(`Fats: ${mealPlan.dailyFat}g`, 10.5, false, 6);

    const columnWidths = [22, 54, 18, 18, 18, 22, 33];
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    const availableWidth = pageWidth - margin * 2;
    const scale = availableWidth / totalWidth;
    const widths = columnWidths.map((width) => width * scale);

    (mealPlan.weeklyPlan || []).forEach((day: any, dayIdx: number) => {
      writeLine(`${day.day || `Day ${dayIdx + 1}`}`, 12, true, 4);

      drawTableRow([
        { text: 'Meal', width: widths[0], bold: true },
        { text: 'Items', width: widths[1], bold: true },
        { text: 'Calories', width: widths[2], align: 'center', bold: true },
        { text: 'Protein', width: widths[3], align: 'center', bold: true },
        { text: 'Carbs', width: widths[4], align: 'center', bold: true },
        { text: 'Fats', width: widths[5], align: 'center', bold: true },
        { text: 'Notes', width: widths[6], bold: true },
      ], { fill: true, fillColor: [236, 236, 236] });

      (day.meals || []).forEach((meal: any) => {
        const items = Array.isArray(meal.items)
          ? meal.items
              .map((item: any) => item?.name || item?.item || item?.quantity || '')
              .filter(Boolean)
              .join(', ')
          : '';

        drawTableRow([
          { text: meal.type || 'Meal', width: widths[0], bold: true },
          { text: items || meal.recipe || '-', width: widths[1] },
          { text: String(meal.calories ?? 0), width: widths[2], align: 'center' },
          { text: `${meal.protein ?? 0}g`, width: widths[3], align: 'center' },
          { text: `${meal.carbs ?? 0}g`, width: widths[4], align: 'center' },
          { text: `${meal.fat ?? 0}g`, width: widths[5], align: 'center' },
          { text: meal.notes || meal.time || '', width: widths[6] },
        ]);
      });

      cursorY += 2;
    });

    if (mealPlan.nutritionTips) {
      cursorY += 4;
      writeLine('Nutrition Tips', 12, true, 3);
      writeLine(mealPlan.nutritionTips, 9.5, false, 2);
    }

    if (mealPlan.shoppingList) {
      cursorY += 2;
      writeLine('Shopping List', 12, true, 3);
      writeLine(mealPlan.shoppingList, 9.5, false, 2);
    }

    if (mealPlan.notes) {
      cursorY += 2;
      writeLine('Important Notes', 12, true, 3);
      writeLine(mealPlan.notes, 9.5, false, 2);
    }

    writeLine(`Generated on: ${new Date().toLocaleDateString()}`, 9, false, 0);
    doc.save(`${mealPlan.goal}_${mealPlan.title.replace(/\s+/g, '_')}_Meal_Plan.pdf`);
  };

  const handleRegenerate = () => {
    window.location.href = '/bmi-calculator?regenerate=true';
  };

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
              ? 'Your membership is currently pending verification. Once an admin activates your account, your AI meal plans will be unlocked.'
              : 'Personalized AI Meal Plans are an exclusive benefit for STANDARD and PREMIUM members.'
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Elevate Your Nutrition Game</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
            <p className="text-lg font-bold text-foreground">⚠️ {error || 'No plan available'}</p>
            <p className="text-muted-foreground mt-3">
              Go back to{' '}
              <a href="/bmi-calculator" className="text-primary hover:underline font-bold">
                BMI Calculator
              </a>{' '}
              to create your personalized plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <MealPlanContainer
          title={mealPlan.title}
          goal={mealPlan.goal}
          dailyCalories={mealPlan.dailyCalories}
          dailyProtein={mealPlan.dailyProtein}
          dailyCarbs={mealPlan.dailyCarbs}
          dailyFat={mealPlan.dailyFat}
          weeklyPlan={mealPlan.weeklyPlan}
          mealHistory={mealHistory}
          onDownload={handleDownload}
          onRegenerate={handleRegenerate}
          isLoading={regenerating}
          nutritionTips={mealPlan.nutritionTips}
          shoppingList={mealPlan.shoppingList}
          notes={mealPlan.notes}
        />
      </div>
    </div>
  );
}
