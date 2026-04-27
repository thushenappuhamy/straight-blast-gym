"use client";

import React, { useState, useEffect } from 'react';
import { X, Clock, Users, Loader } from 'lucide-react';

interface AddTrainerModalProps {
  onClose: () => void;
  onSuccess: () => void;
  trainer?: any;
}

const specialtyOptions = [
  'Strength & Conditioning',
  'Nutrition & Weight Loss',
  'Bodybuilding & Hypertrophy',
  'Functional Training',
  'Yoga & Flexibility',
  'CrossFit',
  'HIIT & Cardio',
  'Powerlifting',
  'Boxing & MMA',
];

const qualificationOptions = [
  'Bachelor of Science in Sports Science',
  'Bachelor of Science in Nutrition',
  'Certified Personal Trainer (CPT)',
  'Advanced Diploma in Fitness',
  'Diploma in Sports Medicine',
  'Yoga Instructor Certification',
  'Nutrition Specialist Certification',
];

const specializationOptions = ['MMA', 'Powerlifting', 'BJJ', 'Cardio', 'HIIT', 'Nutrition', 'Hypertrophy', 'Posing', 'Yoga', 'CrossFit', 'Boxing'];
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper functions for time conversion
const convert24To12 = (time24: string): { hour: string; minute: string; period: string } => {
  const [hh, mm] = time24.split(':');
  const hour = parseInt(hh);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return { hour: String(hour12), minute: mm, period };
};

const convert12To24 = (hour: string, minute: string, period: string): string => {
  let hour24 = parseInt(hour);
  if (period === 'AM' && hour24 === 12) hour24 = 0;
  if (period === 'PM' && hour24 !== 12) hour24 += 12;
  return `${String(hour24).padStart(2, '0')}:${minute}`;
};

export default function AddTrainerModal({ onClose, onSuccess, trainer }: AddTrainerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    qualifications: [] as string[],
    experience: 0,
    bio: '',
    costPerSession: 0,
    status: 'active',
    isFeatured: false,
    specializations: [] as string[],
    shiftStartTime: '06:00',
    shiftEndTime: '22:00',
    shiftDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  });

  // Local state for 12-hour time display
  const [timeDisplay, setTimeDisplay] = useState({
    startHour: '6',
    startMinute: '00',
    startPeriod: 'AM',
    endHour: '10',
    endMinute: '00',
    endPeriod: 'PM',
  });

  useEffect(() => {
    if (trainer) {
      const startTime = convert24To12(trainer.shiftStartTime || '06:00');
      const endTime = convert24To12(trainer.shiftEndTime || '22:00');
      
      setFormData({
        firstName: trainer.firstName || '',
        lastName: trainer.lastName || '',
        email: trainer.email || '',
        phone: trainer.phone || '',
        specialty: trainer.specialty || '',
        qualifications: trainer.qualifications || [],
        experience: parseInt(trainer.experience) || 0,
        bio: trainer.bio || '',
        costPerSession: parseInt(trainer.costPerSession) || 0,
        status: trainer.status || 'active',
        isFeatured: trainer.isFeatured || false,
        specializations: trainer.specializations || [],
        shiftStartTime: trainer.shiftStartTime || '06:00',
        shiftEndTime: trainer.shiftEndTime || '22:00',
        shiftDays: trainer.shiftDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      });
      
      setTimeDisplay({
        startHour: startTime.hour,
        startMinute: startTime.minute,
        startPeriod: startTime.period,
        endHour: endTime.hour,
        endMinute: endTime.minute,
        endPeriod: endTime.period,
      });
    }
  }, [trainer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? (value === '' ? 0 : parseInt(value) || 0)
          : value,
    }));
  };

  const handleCheckboxChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: (Array.isArray(prev[name as keyof typeof formData]) && (prev[name as keyof typeof formData] as string[]).includes(value))
        ? (prev[name as keyof typeof formData] as string[]).filter(v => v !== value)
        : Array.isArray(prev[name as keyof typeof formData])
          ? [...(prev[name as keyof typeof formData] as string[]), value]
          : [value]
    }));
  };

  const handleTimeChange = (field: string, value: string) => {
    setTimeDisplay(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update formData with converted 24-hour time
    if (field.startsWith('start')) {
      const time24 = convert12To24(timeDisplay.startHour, timeDisplay.startMinute, timeDisplay.startPeriod);
      setFormData(prev => ({
        ...prev,
        shiftStartTime: field === 'startHour' ? convert12To24(value, timeDisplay.startMinute, timeDisplay.startPeriod) :
                       field === 'startMinute' ? convert12To24(timeDisplay.startHour, value, timeDisplay.startPeriod) :
                       time24
      }));
    } else {
      const time24 = convert12To24(timeDisplay.endHour, timeDisplay.endMinute, timeDisplay.endPeriod);
      setFormData(prev => ({
        ...prev,
        shiftEndTime: field === 'endHour' ? convert12To24(value, timeDisplay.endMinute, timeDisplay.endPeriod) :
                      field === 'endMinute' ? convert12To24(timeDisplay.endHour, value, timeDisplay.endPeriod) :
                      time24
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow submission on step 3
    if (step !== 3) {
      console.warn('Form submission attempted on step', step, '- ignoring');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = trainer ? `/api/admin/trainers/${trainer._id}` : '/api/admin/trainers';
      const method = trainer ? 'PUT' : 'POST';

      // Convert time display back to 24-hour format before sending
      const submitData = {
        ...formData,
        shiftStartTime: convert12To24(timeDisplay.startHour, timeDisplay.startMinute, timeDisplay.startPeriod),
        shiftEndTime: convert12To24(timeDisplay.endHour, timeDisplay.endMinute, timeDisplay.endPeriod),
      };

      console.log('👨‍🏫 [ADDING TRAINER]', method === 'POST' ? 'Creating new trainer' : 'Updating trainer', submitData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save trainer');
      }

      console.log('✅ [TRAINER SAVED]', data.data);
      alert(`✅ Trainer ${method === 'POST' ? 'added' : 'updated'} successfully!`);
      onSuccess();
      onClose();
      setStep(1);
    } catch (err: any) {
      console.error('❌ [TRAINER ERROR]', err);
      setError(err.message);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-[#1A1816] mb-5">Basic Information</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">First Name *</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Last Name *</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Email *</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Phone *</label>
        <input
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
          placeholder="+94 123 456 7890"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Specialty *</label>
        <select
          name="specialty"
          value={formData.specialty}
          onChange={handleInputChange}
          className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
        >
          <option value="">Select Specialty</option>
          {specialtyOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Experience (Years) *</label>
          <input
            name="experience"
            type="number"
            min="0"
            value={formData.experience}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
            placeholder="5"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Cost Per Session (LKR) *</label>
          <input
            name="costPerSession"
            type="number"
            min="0"
            value={formData.costPerSession}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
            placeholder="5000"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
          placeholder="Tell us about your experience..."
          rows={3}
        />
      </div>
    </div>
  );

  // STEP 2: Shift & Availability
  const renderStep2 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-[#1A1816] mb-5 flex items-center gap-2">
        <Clock size={20} /> Shift & Availability
      </h3>

      {/* Start Time with AM/PM */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Shift Start Time</label>
        <div className="grid grid-cols-4 gap-2">
          <input
            type="number"
            min="1"
            max="12"
            value={timeDisplay.startHour}
            onChange={(e) => handleTimeChange('startHour', e.target.value)}
            placeholder="Hour"
            className="border-2 border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
          />
          <span className="flex items-center justify-center font-bold">:</span>
          <input
            type="number"
            min="0"
            max="59"
            step="5"
            value={timeDisplay.startMinute}
            onChange={(e) => handleTimeChange('startMinute', e.target.value.padStart(2, '0'))}
            placeholder="Min"
            className="border-2 border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
          />
          <select
            value={timeDisplay.startPeriod}
            onChange={(e) => handleTimeChange('startPeriod', e.target.value)}
            className="border-2 border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      {/* End Time with AM/PM */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Shift End Time</label>
        <div className="grid grid-cols-4 gap-2">
          <input
            type="number"
            min="1"
            max="12"
            value={timeDisplay.endHour}
            onChange={(e) => handleTimeChange('endHour', e.target.value)}
            placeholder="Hour"
            className="border-2 border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
          />
          <span className="flex items-center justify-center font-bold">:</span>
          <input
            type="number"
            min="0"
            max="59"
            step="5"
            value={timeDisplay.endMinute}
            onChange={(e) => handleTimeChange('endMinute', e.target.value.padStart(2, '0'))}
            placeholder="Min"
            className="border-2 border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
          />
          <select
            value={timeDisplay.endPeriod}
            onChange={(e) => handleTimeChange('endPeriod', e.target.value)}
            className="border-2 border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-[#F4D03F]"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Working Days</label>
        <div className="grid grid-cols-2 gap-3">
          {daysOfWeek.map(day => (
            <label key={day} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shiftDays.includes(day)}
                onChange={() => handleCheckboxChange('shiftDays', day)}
                className="w-4 h-4 accent-[#F4D03F]"
              />
              <span className="text-sm text-gray-700">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <p className="text-xs text-gray-600">
          <strong>Schedule Setup:</strong> The trainer will be automatically marked as ACTIVE or INACTIVE based on their shift times and the current time. If the current time falls within their shift timing on a working day, they'll be shown as active.
        </p>
      </div>
    </div>
  );

  // STEP 3: Specializations & Other Info
  const renderStep3 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-[#1A1816] mb-5 flex items-center gap-2">
        <Users size={20} /> Specializations & Settings
      </h3>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Specializations</label>
        <div className="grid grid-cols-2 gap-3">
          {specializationOptions.map(spec => (
            <label key={spec} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.specializations.includes(spec)}
                onChange={() => handleCheckboxChange('specializations', spec)}
                className="w-4 h-4 accent-[#F4D03F]"
              />
              <span className="text-sm text-gray-700">{spec}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Qualifications</label>
        <div className="space-y-2">
          {qualificationOptions.map(qual => (
            <label key={qual} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.qualifications.includes(qual)}
                onChange={() => handleCheckboxChange('qualifications', qual)}
                className="w-4 h-4 accent-[#F4D03F]"
              />
              <span className="text-xs text-gray-700">{qual}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={formData.isFeatured}
          onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
          className="w-4 h-4 accent-[#F4D03F]"
        />
        <label className="text-sm font-bold text-gray-700">Featured Trainer</label>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#F4D03F]/5 via-white to-blue-50 rounded-2xl border-2 border-[#F4D03F] max-w-2xl w-full p-8 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-[#F4D03F]">
          <div>
            <p className="text-[#F4D03F] text-xs font-black uppercase tracking-widest mb-1">
              {trainer ? 'Edit Trainer' : 'Add New Trainer'}
            </p>
            <h2 className="text-3xl font-black uppercase text-slate-700">Step {step} of 3</h2>
          </div>
          <button
            onClick={onClose}
            className="text-3xl font-black text-slate-700 hover:text-[#F4D03F] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? 'bg-[#F4D03F]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
            ⚠️ {error}
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-gray-700 font-bold uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black uppercase text-xs rounded transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-black uppercase text-xs rounded transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader size={14} className="animate-spin" />}
                {loading ? (trainer ? 'Updating...' : 'Adding...') : (trainer ? '✓ Update Trainer' : '✓ Add Trainer')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
