'use client';

import React, { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [fullName, setFullName] = useState('Thushen Appuhamy');
  const [email, setEmail] = useState('thushen@example.com');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [memberSince, setMemberSince] = useState('January 2025');
  const [plan, setPlan] = useState('Gold Plan');
  const [age, setAge] = useState('26');
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('75');
  const [fitnessGoal, setFitnessGoal] = useState('MUSCLE GAIN');
  const [isEditing, setIsEditing] = useState(false);

  // Ensure component resets to read-only mode on mount
  useEffect(() => {
    setIsEditing(false);
  }, []);

  // Handle edit mode toggle
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  // Calculate BMI
  const calculateBMI = () => {
    const heightM = parseFloat(height) / 100;
    const weightKg = parseFloat(weight);
    if (heightM && weightKg) {
      return (weightKg / (heightM * heightM)).toFixed(1);
    }
    return '24.5';
  };

  const bmi = calculateBMI();
  const bmiValue = parseFloat(bmi);

  const getBMIStatus = () => {
    if (bmiValue < 18.5) return 'UNDERWEIGHT';
    if (bmiValue < 25) return 'NORMAL WEIGHT';
    if (bmiValue < 30) return 'OVERWEIGHT';
    return 'OBESE';
  };

  const getBMIPosition = () => {
    if (bmiValue < 18.5) return '12.5%';
    if (bmiValue < 25) return '37.5%';
    if (bmiValue < 30) return '62.5%';
    return '87.5%';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Profile Header */}
      <div className="bg-[#2B2621] text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-[#E63C2F] flex items-center justify-center">
                <span className="text-black text-4xl font-black">T</span>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
                  {fullName.toUpperCase()}
                </h1>
                <p className="text-gray-400 text-sm mb-1">
                  {email} · {phone}
                </p>
                <p className="text-gray-500 text-xs uppercase tracking-wider">
                  Member Since {memberSince} · {plan}
                </p>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              type="button"
              onClick={handleEditClick}
              className="bg-[#E63C2F] hover:bg-[#BD2E26] text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all"
            >
              Edit Profile
            </button>
          </div>
        </div>
        {/* Primary bottom border */}
        <div className="w-full h-1 bg-[#E63C2F]"></div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white shadow-lg p-8">
            <h2 className="text-xl font-black uppercase tracking-tight mb-6">
              Personal Information
            </h2>

            <div className="space-y-6">
              {/* Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-4 py-3 border text-gray-900 focus:outline-none focus:border-[#E63C2F] ${
                      isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-4 py-3 border text-gray-900 focus:outline-none focus:border-[#E63C2F] ${
                      isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-4 py-3 border text-gray-900 focus:outline-none focus:border-[#E63C2F] ${
                      isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Member Since
                  </label>
                  <input
                    type="text"
                    value={memberSince}
                    onChange={(e) => setMemberSince(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-4 py-3 border text-gray-900 focus:outline-none focus:border-[#E63C2F] ${
                      isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-4 py-3 border text-gray-900 focus:outline-none focus:border-[#E63C2F] ${
                      isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border text-gray-900 focus:outline-none focus:border-[#F4D03F] appearance-none bg-white ${
                      isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    }`}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Height and Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-4 py-3 border text-gray-900 focus:outline-none focus:border-[#E63C2F] ${
                      isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-4 py-3 border text-gray-900 focus:outline-none focus:border-[#E63C2F] ${
                      isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Fitness Goal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                  Fitness Goal
                </label>
                <div className="flex flex-wrap gap-3">
                  {['MUSCLE GAIN', 'FAT LOSS', 'ENDURANCE'].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => isEditing && setFitnessGoal(goal)}
                      disabled={!isEditing}
                      className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                        fitnessGoal === goal
                          ? 'bg-[#E63C2F] text-black'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${!isEditing ? 'cursor-not-allowed opacity-70' : ''}`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={!isEditing}
                  className="bg-[#E63C2F] hover:bg-[#BD2E26] text-black font-black text-sm uppercase tracking-wider px-8 py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm uppercase tracking-wider px-8 py-4 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="bg-white shadow-lg p-8">
            <h2 className="text-xl font-black uppercase tracking-tight mb-6">
              Health Metrics
            </h2>

            {/* BMI Display */}
            <div className="text-center mb-6">
              <div className="text-8xl font-black text-gray-900 mb-3">
                {bmi}
              </div>
              <div className="inline-block bg-[#E63C2F] text-black font-bold text-xs uppercase tracking-wider px-4 py-2">
                {getBMIStatus()}
              </div>
            </div>

            {/* BMI Scale */}
            <div className="mb-8">
              <div className="flex h-4 mb-2 overflow-hidden">
                <div className="bg-blue-400" style={{ width: '25%' }}></div>
                <div className="bg-green-500" style={{ width: '25%' }}></div>
                <div className="bg-orange-400" style={{ width: '25%' }}></div>
                <div className="bg-red-500" style={{ width: '25%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 uppercase">
                <span>Under</span>
                <span>Normal ← You</span>
                <span>Over</span>
                <span>Obese</span>
              </div>
            </div>

            {/* Daily Values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-6 text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">
                  2,450
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  Daily Calories
                </div>
              </div>
              <div className="bg-gray-50 p-6 text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">
                  165G
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  Protein/Day
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
