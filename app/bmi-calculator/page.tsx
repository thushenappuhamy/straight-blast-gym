'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Toast notification component
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 px-6 py-3 rounded text-white font-bold text-sm ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      {message}
    </div>
  );
}

// Helper function to convert inches to feet and inches
function inchesToFeetInches(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

// Questionnaire Modal Component
function QuestionnaireModal({
  isOpen,
  onClose,
  height,
  weight,
  age,
  userName,
}: {
  isOpen: boolean;
  onClose: () => void;
  height: number;
  weight: number;
  age: number;
  userName: string;
}) {
  const [formData, setFormData] = useState({
    name: userName,
    age,
    height,
    weight,
    dietaryRestrictions: 'no restrictions',
    foodAllergies: 'No',
    supplements: 'Yes, I am open to supplements',
    exerciseBackground: [] as string[],
    medicalConditions: 'No',
    medicalDescription: '',
    commitmentPeriod: '3 months',
    physicalActivityLevel: '',
    goal: '',
    proteinSources: [] as string[],
    carbSources: [] as string[],
    gerd: [] as string[],
    dietCommitment: '',
    exerciseCapability: '',
    daysPerWeek: '',
    sleepHours: '',
    wakeUpTime: '',
    mealsPerDay: 0,
    exerciseHoursPerDay: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update formData when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        name: userName,
        age,
        height,
        weight,
      }));
    }
  }, [isOpen, userName, age, height, weight]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxToggle = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev as any)[field].includes(value)
        ? (prev as any)[field].filter((item: string) => item !== value)
        : [...(prev as any)[field], value],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.physicalActivityLevel || !formData.goal) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('📋 [QUESTIONNAIRE] Submitting questionnaire...');
      
      // Convert string boolean fields to actual booleans
      const submissionData = {
        ...formData,
        foodAllergies: formData.foodAllergies === 'Yes',
        supplements: formData.supplements.includes('Yes'),
        medicalConditions: formData.medicalConditions === 'Yes',
      };

      console.log('✨ [DATA CONVERSION] Converted form data:', submissionData);
      
      // Step 1: Save questionnaire
      const questionnaireResponse = await fetch('/api/health/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const questionnaireData = await questionnaireResponse.json();
      console.log('📬 [QUESTIONNAIRE] Questionnaire saved:', questionnaireData);

      if (!questionnaireResponse.ok) {
        throw new Error(questionnaireData.error || 'Failed to save questionnaire');
      }

      // Step 2: Generate plans with AI
      console.log('🤖 [PLAN GENERATION] Generating AI plans...');
      const planResponse = await fetch('/api/health/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const planData = await planResponse.json();
      console.log('✅ [PLAN GENERATION] Plans generated:', planData);

      if (!planResponse.ok) {
        console.warn('⚠️ Plans generation had issues but questionnaire was saved');
      }

      alert('✅ Questionnaire submitted! Your personalized workout and meal plans are being generated. Check your dashboard soon!');
      onClose();
    } catch (error: any) {
      console.error('❌ [QUESTIONNAIRE] Error:', error);
      setError(error.message || 'Failed to submit questionnaire');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center overflow-y-auto backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1A1816] via-[#2B2621] to-black rounded-xl shadow-2xl max-w-2xl w-full mx-4 my-8 border border-[#F4D03F]/20">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1A1816] to-black text-white px-8 py-8 flex items-center justify-between border-b-2 border-[#F4D03F]">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#F4D03F] mb-2">Transform Your Body</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">Personalized Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="text-4xl font-black hover:text-[#F4D03F] hover:scale-110 transition-all text-white"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-8 py-8 overflow-y-auto max-h-[calc(100vh-200px)] bg-gradient-to-b from-[#2B2621]/50 to-[#1A1816]/50">
          {error && (
            <div className="bg-red-500/20 border-2 border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6 font-bold">
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              Personal Information
            </h3>
            <div className="space-y-4 bg-gradient-to-r from-[#F4D03F]/10 to-[#F4D03F]/5 p-6 rounded-lg border border-[#F4D03F]/30 backdrop-blur">
              <div className="flex justify-between items-center border-b border-[#F4D03F]/20 pb-3">
                <span className="font-black text-[#F4D03F] text-sm uppercase tracking-widest">Full Name:</span>
                <span className="text-white font-bold text-lg">{formData.name || '—'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#F4D03F]/20 pb-3">
                <span className="font-black text-[#F4D03F] text-sm uppercase tracking-widest">Age:</span>
                <span className="text-white font-bold text-lg">{formData.age} years</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#F4D03F]/20 pb-3">
                <span className="font-black text-[#F4D03F] text-sm uppercase tracking-widest">Height:</span>
                <span className="text-white font-bold text-lg">{formData.height} cm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-black text-[#F4D03F] text-sm uppercase tracking-widest">Weight:</span>
                <span className="text-white font-bold text-lg">{formData.weight} kg</span>
              </div>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              Do you have any dietary restrictions?
            </h3>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['no restrictions', 'vegetarian', 'Vegan', 'Pescatarian(seafood Only)', 'I avoid Red meat (Beef/Pork)'].map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="dietary"
                    value={option}
                    checked={formData.dietaryRestrictions === option}
                    onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Food Allergies */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              Do you have any food allergies?
            </h3>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="allergies"
                  value="No"
                  checked={formData.foodAllergies === 'No'}
                  onChange={() => handleInputChange('foodAllergies', 'No')}
                  className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                />
                <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">No</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="allergies"
                  value="Yes"
                  checked={formData.foodAllergies === 'Yes'}
                  onChange={() => handleInputChange('foodAllergies', 'Yes')}
                  className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                />
                <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">Yes</span>
              </label>
            </div>
          </div>

          {/* Supplements */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-[#F4D03F]">
              Are you open to including regimented supplements?
            </h3>
            <p className="text-gray-300 mb-5 font-semibold">Are you open to including plant proteins/ Whey Proteins or other nutritional supplements in your dietary regime?</p>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="supplements"
                  value="Yes, I am open to supplements"
                  checked={formData.supplements === 'Yes, I am open to supplements'}
                  onChange={() => handleInputChange('supplements', 'Yes, I am open to supplements')}
                  className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                />
                <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">Yes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="supplements"
                  value="No, I prefer natural diet"
                  checked={formData.supplements === 'No, I prefer natural diet'}
                  onChange={() => handleInputChange('supplements', 'No, I prefer natural diet')}
                  className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                />
                <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">No</span>
              </label>
            </div>
          </div>

          {/* Exercise Background */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-[#F4D03F]">
              What is your past exercise background
            </h3>
            <p className="text-gray-300 mb-5 font-semibold">(Select all that is relevant)</p>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['Walking/ Jogging/ Running', 'Cycling', 'Yoga/ Pilates', 'Gym (Weight and/or resistance exercises)'].map((exercise) => (
                <label key={exercise} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.exerciseBackground.includes(exercise)}
                    onChange={() => handleCheckboxToggle('exerciseBackground', exercise)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">{exercise}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              Do you have any long-term medical conditions and/or injuries?
            </h3>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="medical"
                  value="No"
                  checked={formData.medicalConditions === 'No'}
                  onChange={() => handleInputChange('medicalConditions', 'No')}
                  className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                />
                <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">No</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="medical"
                  value="Yes"
                  checked={formData.medicalConditions === 'Yes'}
                  onChange={() => handleInputChange('medicalConditions', 'Yes')}
                  className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                />
                <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">Yes</span>
              </label>
            </div>
          </div>

          {/* Commitment Period */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-[#F4D03F]">
              Period of commitment?
            </h3>
            <p className="text-gray-300 mb-5 font-semibold">How long would you like to workout</p>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['1 month', '3 months', '6 months', '12 months'].map((period) => (
                <label key={period} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="period"
                    value={period}
                    checked={formData.commitmentPeriod === period}
                    onChange={(e) => handleInputChange('commitmentPeriod', e.target.value)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors capitalize">{period}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Physical Activity Level */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              How physically active are you?
            </h3>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {[
                'I do not exert myself physically',
                'I do mild exercise (eg. walking to the store, walking stairs often)',
                'I do a moderate amount of exercise (eg. lifting household weights, walks often, sweat a little)',
                'I do a significant amount of exercise (eg. Gym, Jogging often, carry weights)',
              ].map((level) => (
                <label key={level} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="activity"
                    value={level}
                    checked={formData.physicalActivityLevel === level}
                    onChange={(e) => handleInputChange('physicalActivityLevel', e.target.value)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors text-sm">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              What is your goal?
            </h3>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['Weight Loss', 'Staying healthy/ fit', 'Bulking/ Gaining muscle', 'Developing lean muscle/ physique/ aesthetics'].map((g) => (
                <label key={g} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="goal"
                    value={g}
                    checked={formData.goal === g}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Protein Sources */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-[#F4D03F]">
              What are your favorite protein sources?
            </h3>
            <p className="text-gray-300 mb-5 font-semibold">(Select all that is relevant)</p>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['Plant based proteins', 'Eggs', 'Chicken', 'Seafood', 'Beef', 'Pork'].map((protein) => (
                <label key={protein} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.proteinSources.includes(protein)}
                    onChange={() => handleCheckboxToggle('proteinSources', protein)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">{protein}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Carb Sources */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-[#F4D03F]">
              Carbohydrate Sources?
            </h3>
            <p className="text-gray-300 mb-2 font-semibold">What are your favorite sources of carbohydrates?</p>
            <p className="text-gray-300 mb-5 font-semibold">(Select all that is relevant)</p>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['Rice', 'Pastas', 'Whole grain breads (Flat Breads)', 'Yams/ Tubers', 'Other'].map((carb) => (
                <label key={carb} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.carbSources.includes(carb)}
                    onChange={() => handleCheckboxToggle('carbSources', carb)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">{carb}</span>
                </label>
              ))}
            </div>
          </div>

          {/* GERD */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-[#F4D03F]">
              Do your suffer from Gastroesophageal Reflux Disease?
            </h3>
            <p className="text-gray-300 mb-2 font-semibold">Do you tend to have acid reflux/ gastritis or have tendencies to bloat easily with discomfort?</p>
            <p className="text-gray-300 mb-5 font-semibold">(Select all that is relevant)</p>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['No', 'Acid Reflux/ Gastritis', 'Bloating (post meal)'].map((issue) => (
                <label key={issue} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.gerd.includes(issue)}
                    onChange={() => handleCheckboxToggle('gerd', issue)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">{issue}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Diet Commitment */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              What level of commitment is possible right now?
            </h3>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {[
                'I want a good filling diet at least 3 meals a day',
                'I want to have small frequent meals',
                'I am open for intermittent fasting',
                'I am open for diets such as keto etc',
              ].map((diet) => (
                <label key={diet} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="diet"
                    value={diet}
                    checked={formData.dietCommitment === diet}
                    onChange={(e) => handleInputChange('dietCommitment', e.target.value)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors text-sm">{diet}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Exercise Capability */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              What level of exercise is possible right now
            </h3>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['I can do home cardio exercises only', 'I can do workouts at home', 'I can do home workouts + running/ gym'].map((capability) => (
                <label key={capability} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="capability"
                    value={capability}
                    checked={formData.exerciseCapability === capability}
                    onChange={(e) => handleInputChange('exerciseCapability', e.target.value)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">{capability}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Days Per Week */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              How many days a week can you commit towards exercising?
            </h3>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['1-2 days', '3 days', '4+ days', '6+ days'].map((days) => (
                <label key={days} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="days"
                    value={days}
                    checked={formData.daysPerWeek === days}
                    onChange={(e) => handleInputChange('daysPerWeek', e.target.value)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">{days}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sleep */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              How many hours of sleep do you get per day?
            </h3>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['Less than 4 hours', '4 to 6 hours', 'more than 6 hours'].map((sleep) => (
                <label key={sleep} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="sleep"
                    value={sleep}
                    checked={formData.sleepHours === sleep}
                    onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">{sleep}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Wake Up Time */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              When do you usually wake up?
            </h3>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['Between 3 am to 4 am', '4 am to 5 am', '5 am to 7 am', 'after 7 am'].map((time) => (
                <label key={time} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="wakeup"
                    value={time}
                    checked={formData.wakeUpTime === time}
                    onChange={(e) => handleInputChange('wakeUpTime', e.target.value)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">{time}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Meals Per Day */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-[#F4D03F]">
              Number of meals per day
            </h3>
            <p className="text-gray-300 mb-5 font-semibold">How many meals can you fit into an average day? (4-6 meals are good. Anything below 3 is not enough)</p>
            <input
              type="number"
              min="1"
              max="8"
              value={formData.mealsPerDay}
              onChange={(e) => handleInputChange('mealsPerDay', Number(e.target.value))}
              className="w-full bg-gray-900/60 border border-[#F4D03F]/30 px-5 py-3 rounded-lg focus:outline-none focus:border-[#F4D03F] text-white font-bold text-lg"
              placeholder="e.g., 4"
            />
          </div>

          {/* Exercise Hours Per Day */}
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-5 text-[#F4D03F]">
              How many hours of exercise can we do per day
            </h3>
            <div className="space-y-3 bg-gray-900/40 p-5 rounded-lg border border-[#F4D03F]/20">
              {['30 minutes per day', '1 hour per day', '2 hours per day', 'more than 2 hours a day'].map((duration) => (
                <label key={duration} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="duration"
                    value={duration}
                    checked={formData.exerciseHoursPerDay === duration}
                    onChange={(e) => handleInputChange('exerciseHoursPerDay', e.target.value)}
                    className="w-5 h-5 accent-[#F4D03F] cursor-pointer"
                  />
                  <span className="text-white font-bold group-hover:text-[#F4D03F] transition-colors">{duration}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gradient-to-r from-black to-[#1A1816] px-8 py-6 flex gap-4 justify-end border-t-2 border-[#F4D03F]/30">
          <button
            onClick={onClose}
            className="px-8 py-3 border-2 border-gray-400 rounded-lg font-black uppercase tracking-wider hover:bg-gray-800 hover:border-white transition-all text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-[#F4D03F] hover:bg-[#E5C730] disabled:bg-gray-600 text-black font-black uppercase tracking-wider rounded-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-none text-base"
          >
            {loading ? '⏳ Submitting...' : '✓ Submit Plan Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BMICalculatorPage() {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(24);
  const [height, setHeight] = useState(175); // in cm for metric, inches for imperial
  const [weight, setWeight] = useState(75);
  const [activityLevel, setActivityLevel] = useState('moderately-active');
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [recommendations, setRecommendations] = useState<{
    calories?: string;
    protein?: string;
    training?: string;
    weightRange?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [userName, setUserName] = useState('');
  const [questionnaireData, setQuestionnaireData] = useState<any>({
    dietaryRestrictions: 'no-restrictions',
    foodAllergies: 'no',
    openToSupplements: 'yes',
    exerciseBackground: [],
    medicalConditions: 'no',
    commitmentPeriod: '3-months',
    physicalActivityLevel: 'moderate',
    fitnessGoals: [],
    proteinSources: [],
    gastroproblem: 'no',
    dietCommitment: 'three-meals',
    exerciseLocation: 'home-plus-outdoor',
    exerciseDaysPerWeek: '4-5',
    sleepHours: 'more-6',
    wakeUpTime: '5-7am',
    mealsPerDay: 3,
    carbSources: [],
    exerciseHoursPerDay: '1-hour',
  });
  const [submittingQuestionnaire, setSubmittingQuestionnaire] = useState(false);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);

  // Load user's existing BMI data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('📊 [BMI] Loading user data...');
        
        // Fetch BMI data
        const bmiResponse = await fetch('/api/health/bmi');
        const bmiData = await bmiResponse.json();
        
        // Fetch user profile data
        const userResponse = await fetch('/api/auth/me');
        const userData = await userResponse.json();

        if (bmiResponse.ok && bmiData.data) {
          console.log('✅ [BMI] User data loaded:', bmiData.data);
          // Store height and weight in metric first
          setHeight(bmiData.data.height || 175);
          setWeight(bmiData.data.weight || 75);
          setGender(bmiData.data.gender || 'male');
          setBmiResult(bmiData.data.bmi || null);
          setCategory(bmiData.data.category || '');
          setRecommendations({
            weightRange: bmiData.data.normalWeightRange,
          });
        }
        
        if (userResponse.ok && userData.user) {
          console.log('✅ [BMI] User profile loaded:', userData.user);
          const fullName = `${userData.user.firstName || ''} ${userData.user.lastName || ''}`.trim();
          setUserName(fullName);
        }
        
        setUserDataLoaded(true);
      } catch (error) {
        console.error('❌ [BMI] Error loading user data:', error);
      }
    };

    loadUserData();
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('regenerate') === 'true') {
      setShowQuestionnaireModal(true);
    }
  }, []);

  const calculateBMI = async () => {
    setLoading(true);
    try {
      console.log('🔢 [BMI] Calculating BMI...', { height, weight, age, gender });

      // Convert to metric if imperial
      let heightCm = height;
      let weightKg = weight;

      if (unitSystem === 'imperial') {
        heightCm = Math.round(height * 2.54); // inches to cm
        weightKg = Math.round(weight * 0.453592); // lbs to kg
      }

      const response = await fetch('/api/health/bmi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: heightCm,
          weight: weightKg,
          gender,
          dateOfBirth: `2002-03-16`, // Approximate based on age 24
          fitnessGoal: ['muscle-gain', 'strength'],
        }),
      });

      const data = await response.json();
      console.log('📬 [BMI] Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate BMI');
      }

      // Update results
      setBmiResult(data.data.bmi);
      setCategory(data.data.category);

      // Calculate recommendations based on activity level
      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        lightly_active: 1.375,
        'moderately-active': 1.55,
        'very-active': 1.725,
        'extremely-active': 1.9,
      };

      const bmr =
        gender === 'male'
          ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
          : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

      const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
      const calorieTarget =
        category === 'Underweight'
          ? tdee + 500
          : category === 'Obese'
            ? tdee - 500
            : tdee;

      const protein = Math.round(weightKg * 1.6); // 1.6g per kg for muscle gain
      const trainingType =
        category === 'Underweight'
          ? '4-day upper/lower with progressive overload'
          : '4-day upper/lower with progressive overload';

      setRecommendations({
        calories: `${calorieTarget} kcal for${category === 'Underweight' ? ' muscle gain' : category === 'Obese' ? ' weight loss' : ' maintenance'}`,
        protein: `${protein}g/day – Why protein supplement recommended`,
        training: `Training split: ${trainingType}`,
        weightRange: data.data.normalWeightRange,
      });

      setNotification({ message: 'BMI calculated successfully!', type: 'success' });
    } catch (error: any) {
      console.error('❌ [BMI] Error:', error);
      setNotification({ message: error.message || 'Failed to calculate BMI', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const submitQuestionnaire = async () => {
    if (!userName.trim()) {
      setNotification({ message: 'Please enter your name', type: 'error' });
      return;
    }

    setSubmittingQuestionnaire(true);
    try {
      console.log('📋 [QUESTIONNAIRE] Submitting...', questionnaireData);

      const response = await fetch('/api/health/plan-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          age,
          height: unitSystem === 'metric' ? height : Math.round(height * 2.54),
          weight: unitSystem === 'metric' ? weight : Math.round(weight * 0.453592),
          ...questionnaireData,
        }),
      });

      const data = await response.json();
      console.log('📬 [QUESTIONNAIRE] Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit questionnaire');
      }

      setNotification({ message: 'Plan request submitted successfully! We will prepare your personalized plan.', type: 'success' });
      setShowQuestionnaireModal(false);
      // Reset form
      setUserName('');
    } catch (error: any) {
      console.error('❌ [QUESTIONNAIRE] Error:', error);
      setNotification({ message: error.message || 'Failed to submit questionnaire', type: 'error' });
    } finally {
      setSubmittingQuestionnaire(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-12 pb-12">
      {/* Header with back button */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <span>←</span> Back to Dashboard
          </button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Calculator */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="bg-black text-white px-3 py-1 inline-block rounded text-xs font-black uppercase tracking-wider mb-4">
                Health Metrics
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight mb-2">BMI Calculator</h1>
            </div>

            {/* Unit System */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-4">Unit System</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (unitSystem === 'imperial') {
                      // Convert height from inches to cm
                      setHeight(Math.round(height * 2.54));
                      // Convert weight from lbs to kg
                      setWeight(Math.round(weight * 0.453592));
                    }
                    setUnitSystem('metric');
                  }}
                  className={`flex-1 py-3 px-4 font-black uppercase text-sm tracking-wider transition-all ${
                    unitSystem === 'metric'
                      ? 'bg-black text-[#F4D03F]'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Metric (KG/CM)
                </button>
                <button
                  onClick={() => {
                    if (unitSystem === 'metric') {
                      // Convert height from cm to inches
                      setHeight(Math.round(height / 2.54));
                      // Convert weight from kg to lbs
                      setWeight(Math.round(weight * 2.20462));
                    }
                    setUnitSystem('imperial');
                  }}
                  className={`flex-1 py-3 px-4 font-black uppercase text-sm tracking-wider transition-all ${
                    unitSystem === 'imperial'
                      ? 'bg-black text-[#F4D03F]'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Imperial (LB/FT)
                </button>
              </div>
            </div>

            {/* Gender */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-4">Gender</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-3 px-4 font-black uppercase text-sm tracking-wider transition-all ${
                    gender === 'male'
                      ? 'bg-black text-[#F4D03F]'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-3 px-4 font-black uppercase text-sm tracking-wider transition-all ${
                    gender === 'female'
                      ? 'bg-black text-[#F4D03F]'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Age Slider */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-4">
                Age: {age} Years
              </h3>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="15"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-300 rounded appearance-none cursor-pointer accent-[#F4D03F]"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>15</span>
                <span>80</span>
              </div>
            </div>

            {/* Height Slider */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-4">
                Height: {unitSystem === 'metric' ? `${height} CM` : inchesToFeetInches(height)}
              </h3>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min={unitSystem === 'metric' ? 60 : 24}
                  max={unitSystem === 'metric' ? 220 : 87}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-300 rounded appearance-none cursor-pointer accent-[#F4D03F]"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{unitSystem === 'metric' ? '60 cm' : inchesToFeetInches(24)}</span>
                <span>{unitSystem === 'metric' ? '220 cm' : inchesToFeetInches(87)}</span>
              </div>
            </div>

            {/* Weight Slider */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-4">
                Weight: {weight} {unitSystem === 'metric' ? 'KG' : 'LB'}
              </h3>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min={unitSystem === 'metric' ? 20 : 44}
                  max={unitSystem === 'metric' ? 180 : 396}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-300 rounded appearance-none cursor-pointer accent-[#F4D03F]"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{unitSystem === 'metric' ? '20' : '44'}</span>
                <span>{unitSystem === 'metric' ? '180' : '396'}</span>
              </div>
            </div>

            {/* Activity Level */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-4">Activity Level</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActivityLevel('sedentary')}
                  className={`py-3 px-3 font-bold uppercase text-xs tracking-wider transition-all rounded text-center ${
                    activityLevel === 'sedentary'
                      ? 'bg-black text-[#F4D03F]'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Sedentary<br/><span className="text-xs font-normal">(No exercise)</span>
                </button>
                <button
                  onClick={() => setActivityLevel('lightly_active')}
                  className={`py-3 px-3 font-bold uppercase text-xs tracking-wider transition-all rounded text-center ${
                    activityLevel === 'lightly_active'
                      ? 'bg-black text-[#F4D03F]'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Lightly Active<br/><span className="text-xs font-normal">(1-3 days)</span>
                </button>
                <button
                  onClick={() => setActivityLevel('moderately-active')}
                  className={`py-3 px-3 font-bold uppercase text-xs tracking-wider transition-all rounded text-center ${
                    activityLevel === 'moderately-active'
                      ? 'bg-black text-[#F4D03F]'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Moderately Active<br/><span className="text-xs font-normal">(3-5 days)</span>
                </button>
                <button
                  onClick={() => setActivityLevel('very-active')}
                  className={`py-3 px-3 font-bold uppercase text-xs tracking-wider transition-all rounded text-center ${
                    activityLevel === 'very-active'
                      ? 'bg-black text-[#F4D03F]'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Very Active<br/><span className="text-xs font-normal">(6-7 days)</span>
                </button>
                <button
                  onClick={() => setActivityLevel('extremely-active')}
                  className={`col-span-2 py-3 px-3 font-bold uppercase text-xs tracking-wider transition-all rounded text-center ${
                    activityLevel === 'extremely-active'
                      ? 'bg-black text-[#F4D03F]'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Extremely Active<br/><span className="text-xs font-normal">(Physical job / Training)</span>
                </button>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateBMI}
              disabled={loading}
              className="w-full bg-[#F4D03F] hover:bg-[#E5C730] disabled:bg-gray-400 text-black font-black text-sm uppercase tracking-wider py-4 transition-all"
            >
              {loading ? 'Calculating...' : 'Calculate BMI →'}
            </button>
          </div>

          {/* Right: Results */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-8 text-white">
            {bmiResult ? (
              <>
                {/* BMI Score */}
                <div className="mb-8">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Your BMI Score</p>
                  <h2 className="text-7xl font-black text-[#F4D03F] mb-4">{bmiResult}</h2>
                  <p className="text-lg font-bold uppercase tracking-wide text-gray-300">
                    {category} <span className="text-green-400">✓</span>
                  </p>
                </div>

                {/* BMI Scale */}
                <div className="mb-8">
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-full mb-4">
                    <div
                      className="h-2 bg-white rounded-full"
                      style={{
                        width: `${Math.min((bmiResult / 35) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>Underweight<br/>&lt;18.5</span>
                    <span>Normal<br/>18.5-24.9</span>
                    <span>Overweight<br/>25-29.9</span>
                    <span>Obese<br/>&gt;30</span>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">AI Recommendations</p>
                  <div className="space-y-3">
                    {recommendations.calories && (
                      <div className="flex items-start gap-3">
                        <span className="text-[#F4D03F] font-black text-lg">●</span>
                        <p className="text-sm text-gray-300">
                          <span className="font-bold text-white">Daily calorie target: {recommendations.calories.split(' for')[0]}</span> {recommendations.calories.split(' for')[1] || ''}
                        </p>
                      </div>
                    )}
                    {recommendations.protein && (
                      <div className="flex items-start gap-3">
                        <span className="text-[#F4D03F] font-black text-lg">●</span>
                        <p className="text-sm text-gray-300">{recommendations.protein}</p>
                      </div>
                    )}
                    {recommendations.training && (
                      <div className="flex items-start gap-3">
                        <span className="text-[#F4D03F] font-black text-lg">●</span>
                        <p className="text-sm text-gray-300">{recommendations.training}</p>
                      </div>
                    )}
                    {recommendations.weightRange && (
                      <div className="flex items-start gap-3">
                        <span className="text-[#F4D03F] font-black text-lg">●</span>
                        <p className="text-sm text-gray-300">
                          <span className="font-bold text-white">Ideal weight range for height:</span> {recommendations.weightRange}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Generate Plan Button */}
                <button 
                  onClick={() => setShowQuestionnaireModal(true)}
                  className="w-full bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider py-4 transition-all">
                  Generate My Plan →
                </button>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl mb-4">📊</p>
                  <p className="text-lg font-bold text-gray-300 mb-2">Calculate Your BMI</p>
                  <p className="text-sm text-gray-400">Adjust your measurements and click "Calculate BMI" to see your health metrics and personalized recommendations.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <QuestionnaireModal
        isOpen={showQuestionnaireModal}
        onClose={() => setShowQuestionnaireModal(false)}
        height={height}
        weight={weight}
        age={age}
        userName={userName}
      />
    </div>
  );
}
