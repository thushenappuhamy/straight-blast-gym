'use client';

import React, { useState } from 'react';

export default function ProfilePage() {
  const [fullName, setFullName] = useState('Thushen Appuhamy');
  const [age, setAge] = useState('26');
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('75');
  const [fitnessGoal, setFitnessGoal] = useState('MUSCLE GAIN');

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Profile Header */}
      <div className="bg-[#2B2621] text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-[#F4D03F] flex items-center justify-center">
                <span className="text-black text-4xl font-black">T</span>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
                  THUSHEN APPUHAMY
                </h1>
                <p className="text-gray-400 text-sm mb-1">
                  thushen@example.com · +94 77 123 4567
                </p>
                <p className="text-gray-500 text-xs uppercase tracking-wider">
                  Member Since January 2025 · Gold Plan
                </p>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all">
              Edit Profile
            </button>
          </div>
        </div>
        {/* Yellow bottom border */}
        <div className="w-full h-1 bg-[#F4D03F]"></div>
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
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F]"
                />
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
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F] appearance-none bg-white"
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
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F]"
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
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#F4D03F]"
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
                      onClick={() => setFitnessGoal(goal)}
                      className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                        fitnessGoal === goal
                          ? 'bg-[#F4D03F] text-black'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider px-8 py-4 transition-all">
                Save Changes
              </button>
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
              <div className="inline-block bg-[#F4D03F] text-black font-bold text-xs uppercase tracking-wider px-4 py-2">
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
