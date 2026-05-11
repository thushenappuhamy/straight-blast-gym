"use client";

import React, { useState } from 'react';
import { X, ChevronRight, CalendarIcon, Loader } from 'lucide-react';

interface MemberFormData {
  // Step 1
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  
  // Step 2
  country: string;
  city: string;
  zipcode: string;
  address: string;
  
  // Step 3
  fitnessGoal: string[];
  plan: string;
  membershipStartDate: string;
  trainerId: string;
}

interface AddMemberWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberWizard({ isOpen, onClose, onSuccess }: AddMemberWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trainers, setTrainers] = useState<any[]>([]);
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    age: 0,
    gender: '',
    country: '',
    city: '',
    zipcode: '',
    address: '',
    fitnessGoal: [],
    plan: 'basic',
    membershipStartDate: new Date().toISOString().split('T')[0],
    trainerId: '',
  });

  const labelClass = 'block text-[11px] font-bold text-white/45 uppercase mb-2 tracking-wider';
  const inputClass = 'w-full bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#E63C2F] transition-colors';
  const selectClass = 'w-full bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#E63C2F] transition-colors';
  const readOnlyClass = 'w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white/60';

  React.useEffect(() => {
    if (isOpen && step === 3) {
      fetchTrainers();
    }
  }, [isOpen, step]);

  const fetchTrainers = async () => {
    try {
      const res = await fetch('/api/trainers');
      const data = await res.json();
      if (data.data) {
        setTrainers(data.data);
      }
    } catch (err) {
      console.error('Error fetching trainers:', err);
    }
  };

  if (!isOpen) return null;

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const age = calculateAge(value);
    setFormData({ ...formData, dateOfBirth: value, age });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      fitnessGoal: prev.fitnessGoal.includes(goal)
        ? prev.fitnessGoal.filter(g => g !== goal)
        : [...prev.fitnessGoal, goal]
    }));
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Valid email is required';
    if (!formData.phoneNumber.trim()) return 'Phone number is required';
    if (!formData.dateOfBirth) return 'Date of birth is required';
    if (!formData.gender) return 'Gender is required';
    return '';
  };

  const validateStep2 = () => {
    if (!formData.country.trim()) return 'Country is required';
    if (!formData.city.trim()) return 'City is required';
    if (!formData.zipcode.trim()) return 'Zipcode is required';
    if (!formData.address.trim()) return 'Address is required';
    return '';
  };

  const validateStep3 = () => {
    if (formData.fitnessGoal.length === 0) return 'Select at least one fitness goal';
    if (!formData.plan) return 'Membership package is required';
    if (!formData.membershipStartDate) return 'Membership start date is required';
    return '';
  };

  const handleNext = async () => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      setStep(3);
    }
  };

  const handleFinish = async () => {
    const err = validateStep3();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate password (simple - in production, send email with temporary password)
      const tempPassword = Math.random().toString(36).slice(-10);

      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: tempPassword,
          phone: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          age: formData.age,
          gender: formData.gender,
          country: formData.country,
          city: formData.city,
          zipcode: formData.zipcode,
          address: formData.address,
          fitnessGoal: formData.fitnessGoal,
          plan: formData.plan,
          membershipStatus: 'active',
          membershipStartDate: formData.membershipStartDate,
          trainerId: formData.trainerId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member');
      }

      onSuccess();
      onClose();
      setStep(1);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        age: 0,
        gender: '',
        country: '',
        city: '',
        zipcode: '',
        address: '',
        fitnessGoal: [],
        plan: 'basic',
        membershipStartDate: new Date().toISOString().split('T')[0],
        trainerId: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Personal Information
  const renderStep1 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-white mb-5">Personal Information</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First Name *</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="John"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Last Name *</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Doe"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Email Address *</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="john@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Phone Number *</label>
        <input
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="+94 123 456 7890"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`${labelClass} flex items-center gap-1`}>
            <CalendarIcon size={14} /> Date of Birth *
          </label>
          <input
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleDateChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Age</label>
          <div className={readOnlyClass}>
            {formData.age > 0 ? formData.age : '-'} years
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Gender *</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          className={selectClass}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );

  // STEP 2: Location Information
  const renderStep2 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-white mb-5">Location Information</h3>

      <div>
        <label className={labelClass}>Country *</label>
        <input
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          placeholder="Sri Lanka"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>City *</label>
        <input
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="Negombo"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Zipcode *</label>
          <input
            name="zipcode"
            value={formData.zipcode}
            onChange={handleInputChange}
            placeholder="11500"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Address *</label>
        <input
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="123 Main Street, Apartment 4B"
          className={inputClass}
        />
      </div>
    </div>
  );

  // STEP 3: Membership & Fitness Details
  const renderStep3 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-white mb-5">Membership & Fitness Details</h3>

      <div>
        <label className={labelClass}>Fitness Goals *</label>
        <div className="space-y-2">
          {['Weight Loss', 'Muscle Gain', 'Strength', 'Flexibility', 'Overall Health', 'Endurance'].map(goal => (
            <label key={goal} className="flex items-center gap-3 cursor-pointer text-white/80 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={formData.fitnessGoal.includes(goal)}
                onChange={() => handleCheckboxChange(goal)}
                className="w-4 h-4 bg-white/5 border border-white/20 rounded accent-[#E63C2F] cursor-pointer"
              />
              <span className="text-sm">{goal}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Membership Package *</label>
        <select
          name="plan"
          value={formData.plan}
          onChange={handleInputChange}
          className={selectClass}
        >
          <option value="basic">Basic (LKR 2,500/month)</option>
          <option value="gold">Gold (LKR 5,000/month)</option>
          <option value="elite">Elite (LKR 8,000/month)</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Membership Start Date *</label>
        <input
          name="membershipStartDate"
          type="date"
          value={formData.membershipStartDate}
          onChange={handleInputChange}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Assign Trainer (Optional)</label>
        <select
          name="trainerId"
          value={formData.trainerId}
          onChange={handleInputChange}
          className={selectClass}
        >
          <option value="">-- Select a Trainer --</option>
          {trainers.map(trainer => (
            <option key={trainer._id} value={trainer._id}>
              {trainer.name || `${trainer.firstName} ${trainer.lastName}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#161616] w-full max-w-2xl rounded-xl shadow-2xl border border-white/15 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-linear-to-r from-[#E63C2F]/15 to-transparent">
          <div>
            <h2 className="text-white text-xl font-black uppercase tracking-widest">Add New Member</h2>
            <p className="text-white/50 text-xs mt-1">Step {step} of 3</p>
          </div>
          <button onClick={onClose} type="button" className="text-white/45 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  s <= step ? 'bg-[#E63C2F]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <form className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#E63C2F]/15 border border-[#E63C2F]/40 text-[#ffb4ae] text-sm rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#111111] flex justify-between">
          <button
            type="button"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 text-white/60 hover:text-white uppercase text-xs font-bold tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white/60 hover:text-white uppercase text-xs font-bold tracking-wider"
            >
              Cancel
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#E63C2F] hover:bg-[#cf3529] text-white px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="bg-[#E63C2F] hover:bg-[#cf3529] text-white px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader size={14} className="animate-spin" />}
                {loading ? 'Finishing...' : 'Finish'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
