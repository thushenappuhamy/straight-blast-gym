'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
      className={`fixed top-6 right-6 px-6 py-3 rounded-lg text-white font-bold text-sm shadow-lg border ${
        type === 'success' ? 'bg-[#E63C2F]/90 border-[#E63C2F]' : 'bg-[#E63C2F] border-[#E63C2F]/50'
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
  const router = useRouter();
  const steps = [
    'Diet',
    'Health',
    'Nutrition',
    'Lifestyle',
  ];
  const [currentStep, setCurrentStep] = useState(0);
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
  const [showSuccess, setShowSuccess] = useState(false);

  // Update formData when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
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

  const canGoPrevious = currentStep > 0;
  const canGoNext = currentStep < steps.length - 1;

  const handleNextStep = () => {
    if (canGoNext) {
      setCurrentStep((step) => step + 1);
      return;
    }

    handleSubmit();
  };

  const handlePreviousStep = () => {
    if (canGoPrevious) {
      setCurrentStep((step) => step - 1);
    }
  };

  const Section = ({
    title,
    subtitle,
    accentClass,
    children,
  }: {
    title: string;
    subtitle?: string;
    accentClass?: string;
    children: React.ReactNode;
  }) => (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/20">
      <div className="mb-4">
        <h3 className={`text-xl font-black uppercase tracking-tight ${accentClass || 'text-[#F5F5F5]'}`}>{title}</h3>
        {subtitle && <p className="mt-2 text-sm font-semibold text-gray-300">{subtitle}</p>}
      </div>
      {children}
    </section>
  );

  const OptionList = ({
    items,
    value,
    onChange,
    multiple = false,
    onToggle,
  }: {
    items: string[];
    value: string | string[];
    onChange?: (value: string) => void;
    multiple?: boolean;
    onToggle?: (value: string) => void;
  }) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const isSelected = Array.isArray(value) ? value.includes(item) : value === item;

        return (
          <label
            key={item}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors cursor-pointer ${isSelected ? 'border-[#F5F5F5]/60 bg-[#F5F5F5]/10' : 'border-white/10 bg-black/20 hover:border-white/20'}`}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              checked={isSelected}
              onChange={() => {
                if (multiple) {
                  onToggle?.(item);
                } else {
                  onChange?.(item);
                }
              }}
              className="h-4 w-4 accent-[#E63C2F]"
            />
            <span className="text-sm font-bold text-white">{item}</span>
          </label>
        );
      })}
    </div>
  );

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

      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        router.push('/dashboard/workouts');
      }, 2000);
    } catch (error: any) {
      console.error('❌ [QUESTIONNAIRE] Error:', error);
      setError(error.message || 'Failed to submit questionnaire');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showSuccess && (
        <Toast
          message="✅ Questionnaire submitted! Your personalized workout and meal plans are being generated."
          type="success"
          onClose={() => setShowSuccess(false)}
        />
      )}
      <div className="fixed inset-0 lg:left-72 bg-black/70 z-50 flex items-center justify-center overflow-hidden backdrop-blur-sm">
      <div className="mx-4 flex h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0D0D0D] shadow-2xl">
        {/* Modal Header */}
        <div className="border-b border-[#E63C2F]/30 bg-[#1A1A1A] px-6 py-6 text-white sm:px-8">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#E63C2F]">Transform Your Body</p>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">Personal Information</h2>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.35em] text-white/45">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>

            <div className="hidden max-w-md rounded-2xl border border-white/10 bg-white/5 p-4 text-right sm:block">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <span className="font-black uppercase tracking-widest text-[#E63C2F]">Full Name</span>
                <span className="font-bold text-white">{userName || '—'}</span>
                <span className="font-black uppercase tracking-widest text-[#E63C2F]">Age</span>
                <span className="font-bold text-white">{age} years</span>
                <span className="font-black uppercase tracking-widest text-[#E63C2F]">Height</span>
                <span className="font-bold text-white">{height} cm</span>
                <span className="font-black uppercase tracking-widest text-[#E63C2F]">Weight</span>
                <span className="font-bold text-white">{weight} kg</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-4xl font-black text-white transition-all hover:scale-110 hover:text-[#E63C2F]"
            >
              ✕
            </button>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {steps.map((stepLabel, index) => (
              <button
                key={stepLabel}
                onClick={() => setCurrentStep(index)}
                className={`rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${currentStep === index ? 'bg-[#F5F5F5] text-[#0D0D0D]' : 'bg-white/5 text-white/55 hover:bg-white/10 hover:text-white'}`}
              >
                {stepLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-linear-to-b from-[#1A1A1A] to-[#0D0D0D] px-6 py-6 sm:px-8">
          {error && (
            <div className="bg-[#E63C2F]/20 border-2 border-[#E63C2F] text-red-200 px-6 py-4 rounded-lg mb-6 font-bold">
              {error}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            {currentStep === 0 && (
              <>
                <Section title="Dietary Restrictions">
                  <OptionList
                    items={['no restrictions', 'vegetarian', 'Vegan', 'Pescatarian(seafood Only)', 'I avoid Red meat (Beef/Pork)']}
                    value={formData.dietaryRestrictions}
                    onChange={(value) => handleInputChange('dietaryRestrictions', value)}
                  />
                </Section>

                <Section title="Food Allergies">
                  <OptionList
                    items={['No', 'Yes']}
                    value={formData.foodAllergies}
                    onChange={(value) => handleInputChange('foodAllergies', value)}
                  />
                </Section>

                <Section title="Supplements" subtitle="Are you open to plant proteins, whey proteins, or other nutritional supplements?">
                  <OptionList
                    items={['Yes, I am open to supplements', 'No, I prefer natural diet']}
                    value={formData.supplements}
                    onChange={(value) => handleInputChange('supplements', value)}
                  />
                </Section>
              </>
            )}

            {currentStep === 1 && (
              <>
                <Section title="Exercise Background" subtitle="Select all that apply">
                  <OptionList
                    items={['Walking/ Jogging/ Running', 'Cycling', 'Yoga/ Pilates', 'Gym (Weight and/or resistance exercises)']}
                    value={formData.exerciseBackground}
                    multiple
                    onToggle={(value) => handleCheckboxToggle('exerciseBackground', value)}
                  />
                </Section>

                <Section title="Medical Conditions">
                  <OptionList
                    items={['No', 'Yes']}
                    value={formData.medicalConditions}
                    onChange={(value) => handleInputChange('medicalConditions', value)}
                  />
                </Section>

                <Section title="Commitment Period" subtitle="How long would you like to work out?">
                  <OptionList
                    items={['1 month', '3 months', '6 months', '12 months']}
                    value={formData.commitmentPeriod}
                    onChange={(value) => handleInputChange('commitmentPeriod', value)}
                  />
                </Section>

                <Section title="Physical Activity Level">
                  <OptionList
                    items={[
                      'I do not exert myself physically',
                      'I do mild exercise (eg. walking to the store, walking stairs often)',
                      'I do a moderate amount of exercise (eg. lifting household weights, walks often, sweat a little)',
                      'I do a significant amount of exercise (eg. Gym, Jogging often, carry weights)',
                    ]}
                    value={formData.physicalActivityLevel}
                    onChange={(value) => handleInputChange('physicalActivityLevel', value)}
                  />
                </Section>

                <Section title="Goal">
                  <OptionList
                    items={['Weight Loss', 'Staying healthy/ fit', 'Bulking/ Gaining muscle', 'Developing lean muscle/ physique/ aesthetics']}
                    value={formData.goal}
                    onChange={(value) => handleInputChange('goal', value)}
                  />
                </Section>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Section title="Protein Sources" subtitle="Select all that are relevant">
                  <OptionList
                    items={['Plant based proteins', 'Eggs', 'Chicken', 'Seafood', 'Beef', 'Pork']}
                    value={formData.proteinSources}
                    multiple
                    onToggle={(value) => handleCheckboxToggle('proteinSources', value)}
                  />
                </Section>

                <Section title="Carbohydrate Sources" subtitle="Select all that are relevant">
                  <OptionList
                    items={['Rice', 'Pastas', 'Whole grain breads (Flat Breads)', 'Yams/ Tubers', 'Other']}
                    value={formData.carbSources}
                    multiple
                    onToggle={(value) => handleCheckboxToggle('carbSources', value)}
                  />
                </Section>

                <Section title="GERD" subtitle="Do you suffer from acid reflux, gastritis, or bloating?">
                  <OptionList
                    items={['No', 'Acid Reflux/ Gastritis', 'Bloating (post meal)']}
                    value={formData.gerd}
                    multiple
                    onToggle={(value) => handleCheckboxToggle('gerd', value)}
                  />
                </Section>

                <Section title="Diet Commitment">
                  <OptionList
                    items={[
                      'I want a good filling diet at least 3 meals a day',
                      'I want to have small frequent meals',
                      'I am open for intermittent fasting',
                      'I am open for diets such as keto etc',
                    ]}
                    value={formData.dietCommitment}
                    onChange={(value) => handleInputChange('dietCommitment', value)}
                  />
                </Section>

                <Section title="Meals Per Day" subtitle="How many meals can you fit into an average day?">
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.mealsPerDay}
                    onChange={(e) => handleInputChange('mealsPerDay', Number(e.target.value))}
                    className="w-full rounded-lg border border-[#E63C2F]/30 bg-black/30 px-5 py-3 text-lg font-bold text-white focus:border-[#E63C2F] focus:outline-none"
                    placeholder="e.g., 4"
                  />
                </Section>
              </>
            )}

            {currentStep === 3 && (
              <>
                <Section title="Exercise Capability">
                  <OptionList
                    items={['I can do home cardio exercises only', 'I can do workouts at home', 'I can do home workouts + running/ gym']}
                    value={formData.exerciseCapability}
                    onChange={(value) => handleInputChange('exerciseCapability', value)}
                  />
                </Section>

                <Section title="Days Per Week">
                  <OptionList
                    items={['1-2 days', '3 days', '4+ days', '6+ days']}
                    value={formData.daysPerWeek}
                    onChange={(value) => handleInputChange('daysPerWeek', value)}
                  />
                </Section>

                <Section title="Sleep Hours">
                  <OptionList
                    items={['Less than 4 hours', '4 to 6 hours', 'more than 6 hours']}
                    value={formData.sleepHours}
                    onChange={(value) => handleInputChange('sleepHours', value)}
                  />
                </Section>

                <Section title="Wake Up Time">
                  <OptionList
                    items={['Between 3 am to 4 am', '4 am to 5 am', '5 am to 7 am', 'after 7 am']}
                    value={formData.wakeUpTime}
                    onChange={(value) => handleInputChange('wakeUpTime', value)}
                  />
                </Section>

                <Section title="Exercise Hours Per Day" subtitle="How many hours of exercise can we do per day?">
                  <OptionList
                    items={['30 minutes per day', '1 hour per day', '2 hours per day', 'more than 2 hours a day']}
                    value={formData.exerciseHoursPerDay}
                    onChange={(value) => handleInputChange('exerciseHoursPerDay', value)}
                  />
                </Section>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-4 border-t-2 border-[#E63C2F]/30 bg-[#1A1A1A] px-6 py-5 sm:px-8">
          <button
            onClick={onClose}
            className="px-8 py-3 border-2 border-gray-400 rounded-lg font-black uppercase tracking-wider hover:bg-gray-800 hover:border-white transition-all text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePreviousStep}
              disabled={!canGoPrevious}
              className="px-8 py-3 rounded-lg border-2 border-white/20 font-black uppercase tracking-wider text-white/70 transition-all hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={handleNextStep}
              disabled={loading}
              className="px-8 py-3 bg-[#F5F5F5] hover:bg-[#E0E0E0] disabled:bg-[#888888] text-[#0D0D0D] font-black uppercase tracking-wider rounded-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-none text-base"
            >
              {loading ? '⏳ Submitting...' : canGoNext ? 'Next' : '✓ Submit Plan Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
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
    <div className="min-h-screen dark:bg-linear-to-br dark:from-[#0D0D0D] dark:via-[#1A1A1A] dark:to-[#0D0D0D] bg-linear-to-br from-[#F5F5F5] via-[#FFFFFF] to-[#F5F5F5] pt-12 pb-12">
      {/* Header with back button */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 dark:text-white/60 text-[#888888] dark:hover:text-white hover:text-[#1A1A1A] transition-colors mb-6">
            <span>←</span> Back to Dashboard
          </button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Calculator */}
          <div className="dark:bg-[#0D0D0D] bg-white rounded-2xl border dark:border-white/10 border-[#E5E5E5] shadow-lg p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="bg-[#E63C2F] text-white px-3 py-1 inline-block rounded text-xs font-black uppercase tracking-wider mb-4">
                Health Metrics
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight mb-2 dark:text-white text-[#1A1A1A]">BMI Calculator</h1>
            </div>

            {/* Unit System */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider dark:text-white/70 text-[#888888] mb-4">Unit System</h3>
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
                  className={`flex-1 py-3 px-4 font-black uppercase text-sm tracking-wider transition-all rounded ${
                    unitSystem === 'metric'
                      ? 'dark:bg-[#0D0D0D] bg-white dark:text-[#E63C2F] text-[#E63C2F] shadow-sm border border-[#E5E5E5] dark:border-transparent'
                      : 'dark:bg-white/10 bg-black/5 dark:text-white/60 text-[#888888] hover:bg-black/10 dark:hover:bg-white/15'
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
                  className={`flex-1 py-3 px-4 font-black uppercase text-sm tracking-wider transition-all rounded ${
                    unitSystem === 'imperial'
                      ? 'dark:bg-[#0D0D0D] bg-white dark:text-[#E63C2F] text-[#E63C2F] shadow-sm border border-[#E5E5E5] dark:border-transparent'
                      : 'dark:bg-white/10 bg-black/5 dark:text-white/60 text-[#888888] hover:bg-black/10 dark:hover:bg-white/15'
                  }`}
                >
                  Imperial (LB/FT)
                </button>
              </div>
            </div>

            {/* Gender */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider text-white/70 mb-4">Gender</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-3 px-4 font-black uppercase text-sm tracking-wider transition-all rounded ${
                    gender === 'male'
                      ? 'dark:bg-[#0D0D0D] bg-white dark:text-[#E63C2F] text-[#E63C2F] shadow-sm border border-[#E5E5E5] dark:border-transparent'
                      : 'dark:bg-white/10 bg-black/5 dark:text-white/60 text-[#888888] hover:bg-black/10 dark:hover:bg-white/15'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-3 px-4 font-black uppercase text-sm tracking-wider transition-all rounded ${
                    gender === 'female'
                      ? 'dark:bg-[#0D0D0D] bg-white dark:text-[#E63C2F] text-[#E63C2F] shadow-sm border border-[#E5E5E5] dark:border-transparent'
                      : 'dark:bg-white/10 bg-black/5 dark:text-white/60 text-[#888888] hover:bg-black/10 dark:hover:bg-white/15'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Age Slider */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider text-white/70 mb-4">
                Age: {age} Years
              </h3>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="15"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="flex-1 h-2 bg-white/20 rounded appearance-none cursor-pointer accent-[#E63C2F]"
                />
              </div>
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>15</span>
                <span>80</span>
              </div>
            </div>

            {/* Height Slider */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider text-white/70 mb-4">
                Height: {unitSystem === 'metric' ? `${height} CM` : inchesToFeetInches(height)}
              </h3>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min={unitSystem === 'metric' ? 60 : 24}
                  max={unitSystem === 'metric' ? 220 : 87}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="flex-1 h-2 bg-white/20 rounded appearance-none cursor-pointer accent-[#E63C2F]"
                />
              </div>
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>{unitSystem === 'metric' ? '60 cm' : inchesToFeetInches(24)}</span>
                <span>{unitSystem === 'metric' ? '220 cm' : inchesToFeetInches(87)}</span>
              </div>
            </div>

            {/* Weight Slider */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider text-white/70 mb-4">
                Weight: {weight} {unitSystem === 'metric' ? 'KG' : 'LB'}
              </h3>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min={unitSystem === 'metric' ? 20 : 44}
                  max={unitSystem === 'metric' ? 180 : 396}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="flex-1 h-2 bg-white/20 rounded appearance-none cursor-pointer accent-[#E63C2F]"
                />
              </div>
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>{unitSystem === 'metric' ? '20' : '44'}</span>
                <span>{unitSystem === 'metric' ? '180' : '396'}</span>
              </div>
            </div>

            {/* Activity Level */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-wider text-white/70 mb-4">Activity Level</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActivityLevel('sedentary')}
                  className={`py-3 px-3 font-bold uppercase text-xs tracking-wider transition-all rounded text-center ${
                    activityLevel === 'sedentary'
                      ? 'dark:bg-[#0D0D0D] bg-white dark:text-[#E63C2F] text-[#E63C2F] shadow-sm border border-[#E5E5E5] dark:border-transparent'
                      : 'dark:bg-white/10 bg-black/5 dark:text-white/60 text-[#888888] hover:bg-black/10 dark:hover:bg-white/15'
                  }`}
                >
                  Sedentary<br/><span className="text-xs font-normal">(No exercise)</span>
                </button>
                <button
                  onClick={() => setActivityLevel('lightly_active')}
                  className={`py-3 px-3 font-bold uppercase text-xs tracking-wider transition-all rounded text-center ${
                    activityLevel === 'lightly_active'
                      ? 'dark:bg-[#0D0D0D] bg-white dark:text-[#E63C2F] text-[#E63C2F] shadow-sm border border-[#E5E5E5] dark:border-transparent'
                      : 'dark:bg-white/10 bg-black/5 dark:text-white/60 text-[#888888] hover:bg-black/10 dark:hover:bg-white/15'
                  }`}
                >
                  Lightly Active<br/><span className="text-xs font-normal">(1-3 days)</span>
                </button>
                <button
                  onClick={() => setActivityLevel('moderately-active')}
                  className={`py-3 px-3 font-bold uppercase text-xs tracking-wider transition-all rounded text-center ${
                    activityLevel === 'moderately-active'
                      ? 'dark:bg-[#0D0D0D] bg-white dark:text-[#E63C2F] text-[#E63C2F] shadow-sm border border-[#E5E5E5] dark:border-transparent'
                      : 'dark:bg-white/10 bg-black/5 dark:text-white/60 text-[#888888] hover:bg-black/10 dark:hover:bg-white/15'
                  }`}
                >
                  Moderately Active<br/><span className="text-xs font-normal">(3-5 days)</span>
                </button>
                <button
                  onClick={() => setActivityLevel('very-active')}
                  className={`py-3 px-3 font-bold uppercase text-xs tracking-wider transition-all rounded text-center ${
                    activityLevel === 'very-active'
                      ? 'dark:bg-[#0D0D0D] bg-white dark:text-[#E63C2F] text-[#E63C2F] shadow-sm border border-[#E5E5E5] dark:border-transparent'
                      : 'dark:bg-white/10 bg-black/5 dark:text-white/60 text-[#888888] hover:bg-black/10 dark:hover:bg-white/15'
                  }`}
                >
                  Very Active<br/><span className="text-xs font-normal">(6-7 days)</span>
                </button>
                <button
                  onClick={() => setActivityLevel('extremely-active')}
                  className={`col-span-2 py-3 px-3 font-bold uppercase text-xs tracking-wider transition-all rounded text-center ${
                    activityLevel === 'extremely-active'
                      ? 'dark:bg-[#0D0D0D] bg-white dark:text-[#E63C2F] text-[#E63C2F] shadow-sm border border-[#E5E5E5] dark:border-transparent'
                      : 'dark:bg-white/10 bg-black/5 dark:text-white/60 text-[#888888] hover:bg-black/10 dark:hover:bg-white/15'
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
              className="w-full bg-[#E63C2F] hover:bg-[#D12A1F] disabled:bg-white/20 text-white font-black text-sm uppercase tracking-wider py-4 transition-all rounded"
            >
              {loading ? 'Calculating...' : 'Calculate BMI →'}
            </button>
          </div>

          {/* Right: Results */}
          <div className="dark:bg-linear-to-br dark:from-[#1A1A1A] dark:to-[#0D0D0D] bg-white rounded-2xl border dark:border-white/10 border-[#E5E5E5] p-8 dark:text-white text-[#1A1A1A]">
            {bmiResult ? (
              <>
                {/* BMI Score */}
                <div className="mb-8">
                  <p className="text-xs font-black uppercase tracking-widest dark:text-white/50 text-[#888888] mb-2">Your BMI Score</p>
                  <h2 className="text-7xl font-black text-[#E63C2F] mb-4">{bmiResult}</h2>
                  <p className="text-lg font-bold uppercase tracking-wide dark:text-white/80 text-[#1A1A1A]">
                    {category} <span className="text-emerald-500 dark:text-emerald-400">✓</span>
                  </p>
                </div>

                {/* BMI Scale */}
                <div className="mb-8">
                  <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full mb-4">
                    <div
                      className="h-2 bg-[#E63C2F] rounded-full"
                      style={{
                        width: `${Math.min((bmiResult / 35) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold dark:text-white/60 text-[#888888]">
                    <span>Underweight<br/>&lt;18.5</span>
                    <span>Normal<br/>18.5-24.9</span>
                    <span>Overweight<br/>25-29.9</span>
                    <span>Obese<br/>&gt;30</span>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="dark:bg-white/5 bg-black/5 rounded-xl p-4 border dark:border-white/10 border-[#E5E5E5]">
                  <h3 className="text-[10px] font-black uppercase tracking-wider dark:text-white/70 text-[#888888] mb-4">AI Recommendations</h3>
                  <div className="space-y-3">
                    {recommendations.calories && (
                      <div className="flex items-start gap-3">
                        <span className="text-[#E63C2F] font-black text-lg">●</span>
                        <p className="text-sm dark:text-white/70 text-[#555555]">
                          <span className="font-bold dark:text-white text-[#1A1A1A]">Daily calorie target: {recommendations.calories.split(' for')[0]}</span> {recommendations.calories.split(' for')[1] || ''}
                        </p>
                      </div>
                    )}
                    {recommendations.protein && (
                      <div className="flex items-start gap-3">
                        <span className="text-[#E63C2F] font-black text-lg">●</span>
                        <p className="text-sm text-white/70">{recommendations.protein}</p>
                      </div>
                    )}
                    {recommendations.training && (
                      <div className="flex items-start gap-3">
                        <span className="text-[#E63C2F] font-black text-lg">●</span>
                        <p className="text-sm text-white/70">{recommendations.training}</p>
                      </div>
                    )}
                    {recommendations.weightRange && (
                      <div className="flex items-start gap-3">
                        <span className="text-[#E63C2F] font-black text-lg">●</span>
                        <p className="text-sm text-white/70">
                          <span className="font-bold text-white">Ideal weight range for height:</span> {recommendations.weightRange}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Generate Plan Button */}
                <button 
                  onClick={() => setShowQuestionnaireModal(true)}
                  className="w-full bg-[#E63C2F] hover:bg-[#D12A1F] text-white font-black text-sm uppercase tracking-wider py-4 transition-all rounded">
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
