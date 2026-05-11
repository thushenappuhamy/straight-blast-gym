'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Loader } from 'lucide-react';
import Toast from '@/src/components/ui/Toast';

interface QuestionnaireData {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  exerciseBackground: string[];
  daysPerWeek: number;
  exerciseHoursPerDay: number;
  exerciseCapability: string;
  dietaryRestrictions: string[];
  foodAllergies: boolean;
  allergiesDescription: string;
  supplements: string;
  medicalConditions: boolean;
  medicalDescription: string;
  commitmentPeriod: string;
  physicalActivityLevel: string;
  proteinSources: string[];
  carbSources: string[];
  gerd: string[];
  dietCommitment: string;
  sleepHours: string;
  wakeUpTime: string;
  mealsPerDay: number;
}

interface PlanGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  height: number;
  weight: number;
  age: number;
  userName: string;
  onSuccess?: (plans: any) => void;
}

export default function PlanGenerationModal({
  isOpen,
  onClose,
  height,
  weight,
  age,
  userName,
  onSuccess,
}: PlanGenerationModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState<QuestionnaireData>({
    name: userName,
    age,
    height,
    weight,
    goal: '',
    exerciseBackground: [],
    daysPerWeek: 3,
    exerciseHoursPerDay: 1,
    exerciseCapability: 'home',
    dietaryRestrictions: [],
    foodAllergies: false,
    allergiesDescription: '',
    supplements: 'yes',
    medicalConditions: false,
    medicalDescription: '',
    commitmentPeriod: '12-weeks',
    physicalActivityLevel: 'sedentary',
    proteinSources: [],
    carbSources: [],
    gerd: [],
    dietCommitment: 'flexible',
    sleepHours: '7-8',
    wakeUpTime: '07:00',
    mealsPerDay: 4,
  });

  if (!isOpen) return null;

  const handleCheckboxChange = (field: string, value: string) => {
    const fieldValue = formData[field as keyof QuestionnaireData] as string[];
    if (fieldValue.includes(value)) {
      setFormData({
        ...formData,
        [field]: fieldValue.filter(item => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...fieldValue, value],
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plans');
      }

      const data = await response.json();
      if (onSuccess) {
        onSuccess(data);
      }
      onClose();
    } catch (error: any) {
      setToast({ message: `Error: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-[#F4D03F]/20 to-blue-50 border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-700 uppercase">Generate Your Plan</h2>
          <button
            onClick={onClose}
            className="text-2xl font-black text-slate-700 hover:text-[#F4D03F] transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form className="p-6 space-y-6">
          {/* Step 1: Goals & Background */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Fitness Goal *</label>
                <select
                  value={formData.goal}
                  onChange={(e) => handleInputChange('goal', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                >
                  <option value="">Select a goal...</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Strength Building">Strength Building</option>
                  <option value="Toning & Definition">Toning & Definition</option>
                  <option value="Flexibility & Mobility">Flexibility & Mobility</option>
                  <option value="Athletic Performance">Athletic Performance</option>
                  <option value="General Fitness">General Fitness</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Exercise Background *</label>
                <div className="space-y-2">
                  {['Sedentary', 'Light Activity', 'Moderate Activity', 'Very Active', 'Athlete'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.exerciseBackground.includes(opt)}
                        onChange={() => handleCheckboxChange('exerciseBackground', opt)}
                        className="w-4 h-4"
                      />
                      <span className="font-bold text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">How Physically Active Are You Currently? *</label>
                <div className="space-y-2">
                  {[
                    { value: 'Sedentary', label: 'I do not exert myself physically' },
                    { value: 'MildExercise', label: 'I do mild exercise (e.g. walking to the store, walking stairs often)' },
                    { value: 'ModerateExercise', label: 'I do a moderate amount of exercise (e.g. lifting household weights, walks often, sweat a little)' },
                    { value: 'SignificantExercise', label: 'I do a significant amount of exercise (e.g. Gym, Jogging often, carry weights)' }
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-start gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.physicalActivityLevel === opt.value}
                        onChange={() => handleInputChange('physicalActivityLevel', opt.value)}
                        className="w-4 h-4 mt-1"
                      />
                      <span className="font-bold text-gray-700 text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">Days Per Week *</label>
                  <select
                    value={formData.daysPerWeek}
                    onChange={(e) => handleInputChange('daysPerWeek', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <option key={n} value={n}>{n} days</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">Hours Per Session *</label>
                  <select
                    value={formData.exerciseHoursPerDay}
                    onChange={(e) => handleInputChange('exerciseHoursPerDay', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                  >
                    <option value={0.5}>30 mins</option>
                    <option value={1}>1 hour</option>
                    <option value={1.5}>1.5 hours</option>
                    <option value={2}>2 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Where Do You Exercise? *</label>
                <select
                  value={formData.exerciseCapability}
                  onChange={(e) => handleInputChange('exerciseCapability', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                >
                  <option value="home">Home</option>
                  <option value="gym">Gym</option>
                  <option value="both">Both</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Commitment Period *</label>
                <select
                  value={formData.commitmentPeriod}
                  onChange={(e) => handleInputChange('commitmentPeriod', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                >
                  <option value="4-weeks">4 weeks</option>
                  <option value="8-weeks">8 weeks</option>
                  <option value="12-weeks">12 weeks</option>
                  <option value="16-weeks">16 weeks</option>
                </select>
              </div>
            </>
          )}

          {/* Step 2: Nutrition & Preferences */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Dietary Restrictions</label>
                <div className="space-y-2">
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.dietaryRestrictions.includes(opt)}
                        onChange={() => handleCheckboxChange('dietaryRestrictions', opt)}
                        className="w-4 h-4"
                      />
                      <span className="font-bold text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Food Allergies?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!formData.foodAllergies}
                      onChange={() => handleInputChange('foodAllergies', false)}
                      className="w-4 h-4"
                    />
                    <span className="font-bold text-gray-700">No</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.foodAllergies}
                      onChange={() => handleInputChange('foodAllergies', true)}
                      className="w-4 h-4"
                    />
                    <span className="font-bold text-gray-700">Yes</span>
                  </label>
                </div>
              </div>

              {formData.foodAllergies && (
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">Describe Your Allergies</label>
                  <textarea
                    value={formData.allergiesDescription}
                    onChange={(e) => handleInputChange('allergiesDescription', e.target.value)}
                    placeholder="e.g., nuts, shellfish, etc."
                    rows={2}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Protein Sources</label>
                <div className="space-y-2">
                  {['Chicken', 'Fish', 'Beef', 'Pork', 'Eggs', 'Legumes', 'Dairy'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.proteinSources.includes(opt)}
                        onChange={() => handleCheckboxChange('proteinSources', opt)}
                        className="w-4 h-4"
                      />
                      <span className="font-bold text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Carb Preferences</label>
                <div className="space-y-2">
                  {['Rice', 'Pasta', 'Bread', 'Oats', 'Sweet Potato', 'Fruits', 'Legumes'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.carbSources.includes(opt)}
                        onChange={() => handleCheckboxChange('carbSources', opt)}
                        className="w-4 h-4"
                      />
                      <span className="font-bold text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Meals Per Day</label>
                <select
                  value={formData.mealsPerDay}
                  onChange={(e) => handleInputChange('mealsPerDay', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                >
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} meals</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Step 3: Health & Lifestyle */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Medical Conditions?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!formData.medicalConditions}
                      onChange={() => handleInputChange('medicalConditions', false)}
                      className="w-4 h-4"
                    />
                    <span className="font-bold text-gray-700">No</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.medicalConditions}
                      onChange={() => handleInputChange('medicalConditions', true)}
                      className="w-4 h-4"
                    />
                    <span className="font-bold text-gray-700">Yes</span>
                  </label>
                </div>
              </div>

              {formData.medicalConditions && (
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">Describe Your Conditions</label>
                  <textarea
                    value={formData.medicalDescription}
                    onChange={(e) => handleInputChange('medicalDescription', e.target.value)}
                    placeholder="e.g., high blood pressure, diabetes, etc."
                    rows={2}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Open to Supplements?</label>
                <select
                  value={formData.supplements}
                  onChange={(e) => handleInputChange('supplements', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="limited">Limited</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Sleep Hours Per Night</label>
                <select
                  value={formData.sleepHours}
                  onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                >
                  <option value="<5">Less than 5 hours</option>
                  <option value="5-6">5-6 hours</option>
                  <option value="7-8">7-8 hours</option>
                  <option value="9+">9+ hours</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Wake Up Time</label>
                <input
                  type="time"
                  value={formData.wakeUpTime}
                  onChange={(e) => handleInputChange('wakeUpTime', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Diet Commitment</label>
                <select
                  value={formData.dietCommitment}
                  onChange={(e) => handleInputChange('dietCommitment', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none font-bold"
                >
                  <option value="strict">Strict</option>
                  <option value="moderate">Moderate</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Digestion Issues</label>
                <div className="space-y-2">
                  {['None', 'Bloating', 'Gas', 'GERD', 'IBS', 'Lactose Intolerance'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.gerd.includes(opt)}
                        onChange={() => handleCheckboxChange('gerd', opt)}
                        className="w-4 h-4"
                      />
                      <span className="font-bold text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 flex justify-between gap-4">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-3 border-2 border-gray-400 text-gray-700 font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all"
          >
            ← Previous
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black uppercase py-3 transition-all flex items-center justify-center gap-2"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.goal}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black uppercase py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Generating Plans...
                </>
              ) : (
                '✓ Generate Plans'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
