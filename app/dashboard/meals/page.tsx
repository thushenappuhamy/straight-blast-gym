'use client';

import React, { useState, useEffect } from 'react';

export default function MealPlansPage() {
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [mealHistory, setMealHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(0);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [activeVersion, setActiveVersion] = useState(0);

  useEffect(() => {
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
            ? data.data.mealHistory
            : [data.data.mealPlan];

          setMealHistory(history);
          setMealPlan(history[0]);
          setActiveVersion(0);
          setActiveDay(0);
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

    fetchPlan();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Loading your personalized meal plan...</p>
          <div className="animate-spin">⚙️</div>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 p-8 rounded-lg text-center">
            <p className="text-lg font-bold text-red-800">⚠️ {error || 'No plan available'}</p>
            <p className="text-red-700 mt-2">Go back to <a href="/bmi-calculator" className="underline font-bold">BMI Calculator</a> to create your personalized plan.</p>
          </div>
        </div>
      </div>
    );
  }

  const weekPlan = mealPlan.weeklyPlan || [];
  const currentDay = weekPlan[activeDay] || weekPlan[0];
  const currentMeals = currentDay?.meals || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-block bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider mb-3">
              AI Nutrition
            </div>
            <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tight">
              Your Meal Plan
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="bg-black text-white hover:bg-gray-800 font-bold text-sm uppercase tracking-wider px-6 py-3 transition-colors">
              Download PDF
            </button>
            <button 
              onClick={() => setShowRegenerateModal(true)}
              className="border-2 border-black text-black hover:bg-black hover:text-white font-bold text-sm uppercase tracking-wider px-6 py-3 transition-colors"
            >
              Regenerate Plan
            </button>
          </div>
        </div>

        {mealHistory.length > 1 && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Saved Meal Versions</h3>
                <p className="text-xs text-gray-500">Open any previous generated meal plan.</p>
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                Showing version {activeVersion + 1} of {mealHistory.length}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {mealHistory.map((plan, index) => (
                <button
                  key={plan._id || index}
                  onClick={() => {
                    setMealPlan(plan);
                    setActiveVersion(index);
                    setActiveDay(0);
                  }}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap border transition-all ${
                    activeVersion === index
                      ? 'bg-black text-[#F4D03F] border-black'
                      : 'bg-transparent text-gray-700 border-gray-300 hover:border-black hover:text-black'
                  }`}
                >
                  {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : `Version ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Macro Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-3">
              <div className="w-1 h-12 bg-yellow-400 rounded"></div>
              <div>
                <div className="text-3xl font-black text-gray-900">{mealPlan.dailyCalories || '0'}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Daily Calories</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-3">
              <div className="w-1 h-12 bg-red-500 rounded"></div>
              <div>
                <div className="text-3xl font-black text-gray-900">{mealPlan.protein || '0'}G</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Protein</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-3">
              <div className="w-1 h-12 bg-blue-500 rounded"></div>
              <div>
                <div className="text-3xl font-black text-gray-900">{mealPlan.carbs || '0'}G</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Carbs</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-3">
              <div className="w-1 h-12 bg-green-500 rounded"></div>
              <div>
                <div className="text-3xl font-black text-gray-900">{mealPlan.fats || '0'}G</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Fats</div>
              </div>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekPlan.map((day: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveDay(idx)}
              className={`py-4 font-bold text-sm uppercase tracking-wider transition-all ${
                activeDay === idx
                  ? 'bg-black text-yellow-400'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
            >
              {day.day?.substring(0, 3) || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][idx]}
            </button>
          ))}
        </div>

        {/* Meal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentMeals.length > 0 ? (
            currentMeals.map((meal: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-[#2B2621] text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-lg uppercase tracking-wide">{meal.mealType}</span>
                    </div>
                    <div className="font-black text-xl">{meal.calories || '0'} kcal</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {(meal.items || []).map((item: any, itemIdx: number) => (
                      <div key={itemIdx}>
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-400 text-lg mt-0.5">●</span>
                          <div>
                            <div className="font-bold text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.quantity || item.portion}</div>
                            {item.notes && <div className="text-xs text-gray-400 mt-1">{item.notes}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-black text-gray-900">{meal.protein || '0'}G</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Protein</div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-gray-900">{meal.carbs || '0'}G</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Carbs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-gray-900">{meal.fats || '0'}G</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Fats</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500 text-lg">No meals configured for this day</p>
            </div>
          )}
        </div>
        {/* Guidelines Section */}
        {mealPlan.guidelines && mealPlan.guidelines.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-gray-900">
              Nutrition Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mealPlan.guidelines.map((guideline: string, idx: number) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-[#F4D03F] text-lg font-bold">✓</span>
                  <p className="text-gray-700">{guideline}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {showRegenerateModal && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 md:p-12 border-4 border-black max-w-xl text-center relative max-h-[90vh] overflow-y-auto shadow-[8px_8px_0_rgba(0,0,0,1)]">
              <h2 className="text-3xl font-black mb-6 uppercase tracking-wider text-black">Are you sure?</h2>
              <p className="text-gray-700 mb-8 font-medium">
                Regenerating your plan will replace your current nutrition schedule.
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setShowRegenerateModal(false)} 
                  className="px-8 py-3 bg-gray-200 text-black font-bold hover:bg-gray-300 transition-colors uppercase tracking-wider border-2 border-black"
                >
                  No, Keep
                </button>
                <button 
                  onClick={() => window.location.href = '/bmi-calculator?regenerate=true'} 
                  className="px-8 py-3 bg-[#F4D03F] text-black font-black hover:bg-yellow-400 transition-colors uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_black]"
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