'use client';

import React, { useEffect, useState } from 'react';

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch memberships every 5 seconds for live updates
  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        console.log('💳 [MEMBERSHIPS] Fetching...');
        const response = await fetch('/api/memberships');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch memberships');
        }

        console.log('✅ [MEMBERSHIPS] Loaded:', data.data);
        setMemberships(data.data || []);
        setError('');
      } catch (err: any) {
        console.error('❌ [MEMBERSHIPS] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchMemberships, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#F4D03F] p-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-[#F4D03F] text-xs font-bold uppercase tracking-wider mb-4">
            Choose Your Plan
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-black uppercase tracking-tight">
            Membership Plans
          </h1>
          <p className="text-gray-600 mt-2">Select the perfect plan for your fitness journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg font-bold">💳 Loading membership plans...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg font-bold">❌ {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && memberships.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg font-bold">No membership plans available</p>
          </div>
        )}

        {/* Memberships Grid */}
        {!loading && !error && memberships.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map((membership) => (
              <div
                key={membership._id}
                className={`border-2 transition-all hover:shadow-lg overflow-hidden ${
                  membership.isFeatured ? 'border-[#F4D03F] relative' : 'border-gray-200 hover:border-[#F4D03F]'
                }`}
              >
                {/* Featured Banner */}
                {membership.isFeatured && (
                  <div className="bg-[#F4D03F] text-black font-black text-xs uppercase px-4 py-2 text-center">
                    ⭐ Most Popular
                  </div>
                )}

                {/* Header */}
                <div className={`p-6 ${membership.isFeatured ? 'bg-[#F4D03F]/10 border-b-2 border-[#F4D03F]' : 'bg-gradient-to-r from-gray-50 to-white'}`}>
                  <div className="text-sm text-[#F4D03F] font-black uppercase mb-2">{membership.tagline || 'Premium'}</div>
                  <h3 className="text-2xl font-black uppercase text-gray-900 mb-2">{membership.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{membership.description}</p>
                </div>

                {/* Price */}
                <div className="px-6 py-4 bg-white border-b border-gray-200">
                  <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Monthly Price</div>
                  <div className="text-4xl font-black text-[#F4D03F]">
                    LKR {membership.price.toLocaleString()}
                    <span className="text-lg text-gray-600 font-normal">/mo</span>
                  </div>
                </div>

                {/* Features */}
                <div className="px-6 py-6">
                  <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-4">Features Included</p>
                  <ul className="space-y-3 mb-6">
                    {membership.features && membership.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-[#F4D03F] font-black text-lg">✓</span>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sign Up Button */}
                <div className="px-6 pb-6">
                  <button
                    className={`w-full font-black text-lg uppercase tracking-wider py-3 transition-all ${
                      membership.isFeatured
                        ? 'bg-[#F4D03F] hover:bg-[#E5C730] text-black shadow-lg'
                        : 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    Check Out Now
                  </button>
                </div>

                {/* Stats */}
                {membership.activeMembersCount > 0 && (
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-600">
                      <span className="font-black text-gray-900">{membership.activeMembersCount}</span> active members
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-[#2B2621] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">🔄 Live Updates</p>
          <p className="text-sm font-bold">Data automatically updates every 5 seconds</p>
        </div>
      </div>
    </div>
  );
}
