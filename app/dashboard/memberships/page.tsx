'use client';

import React, { useEffect, useState } from 'react';
import Toast from '@/src/components/ui/Toast';

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header */}
      <div className="p-6 mb-8" style={{ borderBottom: '2px solid var(--primary)', background: 'linear-gradient(90deg, rgba(0,0,0,0.12), transparent)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--primary)' }}>
            Choose Your Plan
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight" style={{ color: 'var(--foreground)' }}>
            Membership Plans
          </h1>
          <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>Select the perfect plan for your fitness journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>💳 Loading membership plans...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-lg font-bold" style={{ color: '#fca5a5' }}>❌ {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && memberships.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-bold" style={{ color: 'var(--muted-foreground)' }}>No membership plans available</p>
          </div>
        )}

        {/* Memberships Grid */}
        {!loading && !error && memberships.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map((membership) => (
              <div
                key={membership._id}
                className="border-2 transition-all hover:shadow-lg overflow-hidden"
                style={{
                  background: 'var(--card)',
                  borderColor: membership.isFeatured ? 'var(--primary)' : 'rgba(255,255,255,0.06)'
                }}
              >
                {/* Featured Banner */}
                {membership.isFeatured && (
                  <div className="font-black text-xs uppercase px-4 py-2 text-center" style={{ background: 'var(--primary)', color: 'black' }}>
                    ⭐ Most Popular
                  </div>
                )}

                {/* Header */}
                <div className="p-6" style={membership.isFeatured ? { background: 'rgba(230,60,47,0.08)', borderBottom: '2px solid var(--primary)' } : { borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-sm font-black uppercase mb-2" style={{ color: 'var(--primary)' }}>{membership.tagline || 'Premium'}</div>
                  <h3 className="text-2xl font-black uppercase mb-2" style={{ color: 'var(--foreground)' }}>{membership.name}</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{membership.description}</p>
                </div>

                {/* Price */}
                <div className="px-6 py-4" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>Monthly Price</div>
                  <div className="text-4xl font-black" style={{ color: 'var(--primary)' }}>
                    LKR {membership.price.toLocaleString()}
                    <span className="text-lg font-normal" style={{ color: 'var(--muted-foreground)' }}>/mo</span>
                  </div>
                </div>

                {/* Features */}
                <div className="px-6 py-6">
                  <p className="text-xs font-black uppercase tracking-wider mb-4" style={{ color: 'var(--muted-foreground)' }}>Features Included</p>
                  <ul className="space-y-3 mb-6">
                    {membership.features && membership.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="font-black text-lg" style={{ color: 'var(--primary)' }}>✓</span>
                        <span className="text-sm" style={{ color: 'var(--foreground)' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleSubscribe(membership.name, membership._id)}
                    disabled={processingId === membership._id}
                    className="w-full font-black text-lg uppercase tracking-wider py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={membership.isFeatured ? { background: 'var(--primary)', color: 'black', boxShadow: '0 10px 24px rgba(230,60,47,0.2)' } : { border: '2px solid rgba(255,255,255,0.08)', color: 'var(--foreground)', background: 'transparent' }}
                    onMouseEnter={(e) => {
                      if (!processingId && membership.isFeatured) e.currentTarget.style.background = 'var(--primary-light)';
                      else if (!processingId) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (!processingId && membership.isFeatured) e.currentTarget.style.background = 'var(--primary)';
                      else if (!processingId) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {processingId === membership._id ? 'Processing...' : 'Check Out Now'}
                  </button>
                </div>

                {/* Stats */}
                {membership.activeMembersCount > 0 && (
                  <div className="px-6 py-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="font-black" style={{ color: 'var(--foreground)' }}>{membership.activeMembersCount}</span> active members
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="py-8 mt-12" style={{ background: 'var(--card)', color: 'var(--foreground)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>🔄 Live Updates</p>
          <p className="text-sm font-bold">Data automatically updates every 5 seconds</p>
        </div>
      </div>
    </div>
  );
}
