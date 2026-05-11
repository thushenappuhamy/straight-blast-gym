'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader, Calendar, Users, Dumbbell } from 'lucide-react';
import Toast from '@/src/components/ui/Toast';

interface AddBookingModalProps {
  onClose: () => void;
  onSuccess: () => void;
  members: any[];
  trainers: any[];
}

const sessionTypes = ['STRENGTH', 'CARDIO', 'NUTRITION', 'HYPERTROPHY'];
const sessionStatuses = ['UPCOMING', 'IN SESSION', 'COMPLETED', 'CANCELLED'];

const professionalQuestions = [
  {
    id: 'fitness_goal',
    label: 'What is the primary fitness goal for this session?',
    type: 'select',
    options: [
      'Weight Loss',
      'Muscle Gain',
      'Strength Building',
      'Toning & Definition',
      'Flexibility & Mobility',
      'Athletic Performance',
      'Injury Recovery',
      'General Fitness',
    ],
  },
  {
    id: 'experience_level',
    label: 'Client experience level?',
    type: 'select',
    options: ['Beginner', 'Intermediate', 'Advanced', 'Elite'],
  },
  {
    id: 'session_focus',
    label: 'Session focus area?',
    type: 'select',
    options: [
      'Upper Body',
      'Lower Body',
      'Core',
      'Full Body',
      'Cardio',
      'Flexibility',
      'Recovery',
      'Nutrition Consultation',
    ],
  },
  {
    id: 'intensity_level',
    label: 'Desired intensity level?',
    type: 'select',
    options: ['Low', 'Moderate', 'High', 'Maximum'],
  },
  {
    id: 'injuries_concerns',
    label: 'Any injuries or concerns to consider?',
    type: 'text',
    placeholder: 'e.g., Back pain, knee injury, etc.',
  },
  {
    id: 'dietary_preferences',
    label: 'Dietary preferences or restrictions?',
    type: 'text',
    placeholder: 'e.g., Vegetarian, gluten-free, allergies',
  },
];

export default function AddBookingModal({ onClose, onSuccess, members, trainers }: AddBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    memberId: '',
    trainerId: '',
    type: 'STRENGTH',
    fee: '',
    dateTime: '',
    status: 'UPCOMING',
    notes: '',
    // Professional questions
    fitness_goal: '',
    experience_level: '',
    session_focus: '',
    intensity_level: '',
    injuries_concerns: '',
    dietary_preferences: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step !== 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📅 [ADD BOOKING] Creating booking...');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate dateTime is not empty
      if (!formData.dateTime) {
        throw new Error('Please select a valid date and time');
      }

      // Convert datetime-local format to ISO string
      // datetime-local format: "YYYY-MM-DDTHH:mm"
      const dateTime = new Date(formData.dateTime + ':00');
      if (isNaN(dateTime.getTime())) {
        throw new Error('Invalid date/time format');
      }

      // Prepare submission data - only send booking fields to API
      const submitData = {
        memberId: formData.memberId,
        trainerId: formData.trainerId,
        type: formData.type,
        fee: parseInt(formData.fee),
        dateTime: dateTime.toISOString(),
        status: formData.status,
        notes: [
          `Goal: ${formData.fitness_goal}`,
          `Experience: ${formData.experience_level}`,
          `Focus: ${formData.session_focus}`,
          `Intensity: ${formData.intensity_level}`,
          formData.injuries_concerns ? `Injuries/Concerns: ${formData.injuries_concerns}` : '',
          formData.dietary_preferences ? `Dietary: ${formData.dietary_preferences}` : '',
          formData.notes ? `Notes: ${formData.notes}` : '',
        ]
          .filter(Boolean)
          .join(' | '),
      };

      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      console.log('✅ [ADD BOOKING] Booking created:', data.data);
      setToast({ message: 'Booking created successfully!', type: 'success' });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('❌ [ADD BOOKING] Error:', err);
      setError(err.message || 'Failed to create booking');
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Member & Trainer Selection
  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
        <Users size={20} /> Select Member & Trainer
      </h3>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Select Member *</label>
        <select
          name="memberId"
          value={formData.memberId}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border-2 rounded text-sm"
          style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
          required
        >
          <option value="">-- Choose a member --</option>
          {members.map(member => (
            <option key={member._id} value={member._id}>
              {member.firstName} {member.lastName} ({member.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Select Trainer *</label>
        <select
          name="trainerId"
          value={formData.trainerId}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border-2 rounded text-sm"
          style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
          required
        >
          <option value="">-- Choose a trainer --</option>
          {trainers.map(trainer => (
            <option key={trainer._id} value={trainer._id}>
              {trainer.firstName} {trainer.lastName} - {trainer.specialty}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // STEP 2: Session Details
  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
        <Calendar size={20} /> Session Details
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Session Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 rounded text-sm"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            required
          >
            {sessionTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Session Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 rounded text-sm"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            required
          >
            {sessionStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Date & Time *</label>
          <input
            type="datetime-local"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 rounded text-sm"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Session Fee (LKR) *</label>
          <input
            type="number"
            name="fee"
            value={formData.fee}
            onChange={handleInputChange}
            placeholder="5000"
            className="w-full px-3 py-2 border-2 rounded text-sm"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Additional Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Any additional notes about the booking..."
          className="w-full px-3 py-2 border-2 rounded text-sm resize-none"
          style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
          rows={3}
        />
      </div>
    </div>
  );

  // STEP 3: Professional Questions
  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
        <Dumbbell size={20} /> Client Assessment
      </h3>

      <div className="space-y-5 max-h-96 overflow-y-auto pr-4">
        {professionalQuestions.map(question => (
          <div key={question.id}>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              {question.label} {question.type === 'text' ? '(Optional)' : '*'}
            </label>

              {question.type === 'select' ? (
              <select
                name={question.id}
                value={formData[question.id as keyof typeof formData]}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 rounded text-sm"
                style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <option value="">-- Select --</option>
                {question.options?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <textarea
                name={question.id}
                value={formData[question.id as keyof typeof formData]}
                onChange={handleInputChange}
                placeholder={question.placeholder}
                className="w-full px-3 py-2 border-2 rounded text-sm resize-none"
                style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--foreground)', background: 'transparent' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                rows={2}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="rounded-2xl max-w-2xl w-full my-8 p-8 shadow-2xl" style={{ background: 'var(--card)', border: '2px solid var(--primary)' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4" style={{ borderBottom: '2px solid rgba(255,255,255,0.04)' }}>
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--primary)' }}>Management</p>
            <h2 className="text-3xl font-black uppercase" style={{ color: 'var(--foreground)' }}>Step {step} of 3</h2>
          </div>
          <button
            onClick={onClose}
            className="text-3xl font-black transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 h-2 rounded-full transition-colors"
              style={{ background: s <= step ? 'var(--primary)' : 'rgba(255,255,255,0.06)' }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', color: '#fca5a5' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6" style={{ borderTop: '2px solid rgba(255,255,255,0.04)' }}>
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 font-bold uppercase text-xs rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--foreground)', background: 'rgba(255,255,255,0.04)' }}
            >
              ← Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 text-black font-black uppercase text-xs rounded transition-all"
                style={{ background: 'var(--primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-black font-black uppercase text-xs rounded transition-all flex items-center gap-2 disabled:opacity-50"
                style={{ background: 'var(--primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
              >
                {loading && <Loader size={14} className="animate-spin" />}
                {loading ? 'Creating...' : '✓ Create Booking'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
