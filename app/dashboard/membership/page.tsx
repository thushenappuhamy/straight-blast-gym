'use client';

import React, { useEffect, useState } from 'react';

interface MembershipPlan {
  _id: string;
  name: string;
  price: number;
  features: string[];
  description?: string;
  tagline?: string;
  isFeatured?: boolean;
  badge?: string;
  color?: string;
  icon?: string;
  duration?: string;
}

export default function MembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [updateCounter, setUpdateCounter] = useState(0);

  // Fetch memberships and poll for updates every 5 seconds
  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        console.log('💳 [USER MEMBERSHIPS] Fetching... (Poll #' + (updateCounter + 1) + ')');
        const response = await fetch('/api/memberships', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ [USER MEMBERSHIPS] Loaded:', result.data.length);
          setPlans(result.data);
          setLastUpdated(new Date());
          setUpdateCounter(prev => prev + 1);
          setError(null);
        } else {
          console.error('❌ [USER MEMBERSHIPS] Fetch failed:', result.error);
          setError('Failed to load membership plans');
        }
      } catch (err) {
        console.error('❌ [USER MEMBERSHIPS] Error:', err);
        setError('Failed to load membership plans');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchMemberships();

    // Set up polling for real-time updates every 5 seconds
    const interval = setInterval(fetchMemberships, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4D03F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading membership plans...</p>
        </div>
      </div>
    );
  }

  if (error || plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-4">{error || 'No membership plans available'}</p>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Yellow top border */}
      <div className="w-full h-1 bg-[#F4D03F] absolute top-0 left-0"></div>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-black text-[#F4D03F] px-6 py-2 text-xs font-bold uppercase tracking-wider mb-4">
            Membership Plans
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tight mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-4">
            Unlock full access to SBG's digital platform, trainers, and supplement store.
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 font-semibold">
              🔄 Live updates • Last updated: {lastUpdated.toLocaleTimeString()} (Poll #{updateCounter})
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`shadow-xl overflow-hidden relative ${
                plan.isFeatured
                  ? 'bg-[#2B2621] text-white border-4 border-[#F4D03F]'
                  : 'bg-white text-gray-900'
              }`}
            >
              {/* Most Popular Badge */}
              {plan.isFeatured && (
                <div className="absolute top-0 right-0 bg-[#F4D03F] text-black font-bold text-xs uppercase tracking-wider px-4 py-2">
                  {plan.badge || 'Most Popular'}
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h2
                  className={`text-4xl font-black uppercase tracking-tight mb-6 ${
                    plan.isFeatured ? 'text-[#F4D03F]' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h2>

                {/* Tagline */}
                {plan.tagline && (
                  <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${
                    plan.isFeatured ? 'text-[#F4D03F]' : 'text-[#F4D03F]'
                  }`}>
                    {plan.tagline}
                  </p>
                )}

                {/* Price */}
                <div className="mb-8">
                  <div className={`text-5xl font-black ${plan.isFeatured ? 'text-white' : 'text-gray-900'}`}>
                    LKR {plan.price.toLocaleString()}
                  </div>
                  <div className={`text-sm ${plan.isFeatured ? 'text-gray-400' : 'text-gray-500'}`}>
                    / {plan.duration || 'month'}
                  </div>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className={`text-sm mb-6 ${plan.isFeatured ? 'text-gray-300' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                )}

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#F4D03F] text-xl flex-shrink-0 mt-0.5">✓</span>
                      <span
                        className={`text-sm ${
                          plan.isFeatured ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`w-full font-black text-sm uppercase tracking-wider py-4 px-6 transition-all ${
                    plan.isFeatured
                      ? 'bg-[#F4D03F] hover:bg-[#E5C730] text-black'
                      : plan.name.toUpperCase() === 'ELITE'
                      ? 'bg-black hover:bg-gray-900 text-[#F4D03F]'
                      : 'border-2 border-[#F4D03F] text-black hover:bg-[#F4D03F]'
                  }`}
                >
                  {plan.badge ? `Get ${plan.badge} →` : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
