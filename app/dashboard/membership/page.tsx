'use client';

import React, { useEffect, useState } from 'react';
import Toast from '@/src/components/ui/Toast';

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
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4D03F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading membership plans...</p>
        </div>
      </div>
    );
  }

  if (error || plans.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-4">{error || 'No membership plans available'}</p>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-[#070707] py-12 px-4 sm:px-6 lg:px-8 text-white">
      {/* Primary top border */}
      <div className="w-full h-1 bg-[#E63C2F] absolute top-0 left-0"></div>
      
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

        {/* Pricing Carousel */}
        <PricingCarousel plans={plans} />
      </div>
    </div>
  );
}

function PricingCarousel({ plans }: { plans: MembershipPlan[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubscribe = async (planName: string, id: string) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/memberships/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planName })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setToast({ message: `Successfully subscribed to the ${planName.toUpperCase()} plan!`, type: 'success' });
      setTimeout(() => {
        window.location.href = '/dashboard/profile';
      }, 2000);
    } catch (err: any) {
      setToast({ message: 'Error: ' + err.message, type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    const calc = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
      if (w < 640) setVisible(1);
      else if (w < 1024) setVisible(2);
      else setVisible(3);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // Move PREMIUM to the end (user requested premium shown last)
  const premium = plans.find((p) => (p.name || '').toUpperCase() === 'PREMIUM');
  const others = plans.filter((p) => (p.name || '').toUpperCase() !== 'PREMIUM');
  const ordered = premium ? [...others, premium] : [...plans];

  // Clamp index so we always have 'visible' cards to show where possible
  useEffect(() => {
    if (index > Math.max(0, ordered.length - visible)) {
      setIndex(Math.max(0, ordered.length - visible));
    }
  }, [visible, ordered.length, index]);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(ordered.length - visible, i + 1));

  const translatePercent = (index * 100) / visible;
  const activeCard = index + Math.floor(visible / 2);

  return (
    <div className="relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="text-sm text-white/60 mb-6">Showing {ordered.length} plans</div>

      {/* Right-side arrows */}
      <div className="absolute right-8 top-28 flex flex-col gap-2 z-20">
        <button onClick={prev} disabled={index === 0} className="w-10 h-10 rounded bg-white/6 text-white/90 disabled:opacity-40">◀</button>
        <button onClick={next} disabled={index >= ordered.length - visible} className="w-10 h-10 rounded bg-white/6 text-white/90 disabled:opacity-40">▶</button>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${translatePercent}%)` }}
        >
          {ordered.map((plan, i) => {
            const isActive = i === activeCard;
            return (
              <div key={plan._id} className={`w-full md:w-1/2 lg:w-1/3 px-4 shrink-0`}>
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-xl p-8 transition-transform duration-300 ${
                    isActive ? 'scale-105 border-4 border-[#E63C2F] bg-[#0F0F0F]' : 'bg-white/3'
                  }`}
                >
                  {plan.isFeatured && (
                    <div className="absolute top-4 right-4 bg-[#E63C2F] text-black font-bold text-xs uppercase tracking-wider px-4 py-2">
                      {plan.badge || 'Most Popular'}
                    </div>
                  )}
                  <h3 className={`text-3xl font-black uppercase mb-3 ${isActive ? 'text-[#E63C2F]' : 'text-white'}`}>{plan.name}</h3>
                  {plan.tagline && <p className="text-sm text-white/70 mb-4">{plan.tagline}</p>}
                  <div className="mb-6">
                    <div className="text-4xl font-black text-white">LKR {plan.price.toLocaleString()}</div>
                    <div className="text-sm text-white/60">/ {plan.duration || 'month'}</div>
                  </div>
                  {plan.description && <p className="text-white/70 mb-6">{plan.description}</p>}
                  <ul className="mb-6 space-y-3">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-[#E63C2F]">✓</span>
                        <span className="text-white/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => handleSubscribe(plan.name, plan._id)}
                    disabled={processingId === plan._id}
                    className={`w-full py-3 font-black rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-[#E63C2F] hover:bg-[#ff4e40] text-black' : 'border-2 border-[#E63C2F] hover:bg-white/5 text-white'}`}
                  >
                    {processingId === plan._id ? 'Processing...' : 'Get Started'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
