'use client';

import React, { useEffect, useState } from 'react';
import Toast from '@/src/components/ui/Toast';
import { Check, ArrowRight, Star, Shield, Zap, Crown, Info, X, CreditCard, Wallet, Banknote } from 'lucide-react';
import Link from 'next/link';

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
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [userCurrentPlan, setUserCurrentPlan] = useState<string | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const [plansRes, userRes] = await Promise.all([
          fetch('/api/memberships', {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
          }),
          fetch('/api/auth/me')
        ]);

        const plansResult = await plansRes.json();
        if (plansResult.success) {
          setPlans(plansResult.data);
          setError(null);
        } else {
          setError('Failed to load membership plans');
        }

        if (userRes.ok) {
          const userResult = await userRes.json();
          if (userResult.user) {
            setUserCurrentPlan(userResult.user.plan);
            setMembershipStatus(userResult.user.membershipStatus);
          }
        }
      } catch (err) {
        setError('Failed to load membership plans');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium tracking-widest uppercase text-xs">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden pb-20 transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none opacity-50"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 pt-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <Star size={14} className="text-primary fill-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Premium Access</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-foreground">
            Choose Your <span className="text-primary">Legacy</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Unlock the full potential of your fitness journey with SBG's elite membership tiers.
            Tailored for those who demand excellence.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <PlanCard 
              key={plan._id} 
              plan={plan} 
              index={idx} 
              onSelect={handlePlanSelect} 
              userCurrentPlan={userCurrentPlan}
              membershipStatus={membershipStatus}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-3xl border border-border bg-card backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="text-primary" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-foreground uppercase tracking-wider">Secure Enrollment</h4>
              <p className="text-sm text-muted-foreground">Encrypted transactions & member protection</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-6 py-3 rounded-xl border border-border bg-muted hover:bg-muted/80 transition-colors text-xs font-bold uppercase tracking-widest text-foreground">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {showPaymentModal && selectedPlan && (
        <PaymentModal 
          plan={selectedPlan} 
          onClose={() => setShowPaymentModal(false)} 
          setToast={setToast}
          isRenewal={userCurrentPlan?.toLowerCase() === selectedPlan.name.toLowerCase()}
        />
      )}
    </div>
  );
}

function PlanCard({ 
  plan, index, onSelect, userCurrentPlan, membershipStatus 
}: { 
  plan: MembershipPlan; 
  index: number; 
  onSelect: (plan: MembershipPlan) => void;
  userCurrentPlan: string | null;
  membershipStatus: string | null;
}) {
  const isPopular = plan.isFeatured || plan.name.toUpperCase() === 'STANDARD';
  const isPremium = plan.name.toUpperCase() === 'POWERLIFTING' || plan.name.toUpperCase() === 'PREMIUM';

  const isCurrentPlan = userCurrentPlan?.toLowerCase() === plan.name.toLowerCase();
  
  const getIcon = () => {
    if (isPremium) return <Crown className="text-primary" size={28} />;
    if (isPopular) return <Zap className="text-primary" size={28} />;
    return <Star className="text-primary" size={28} />;
  };

  return (
    <div
      className={`group relative rounded-[2.5rem] p-1 transition-all duration-500 hover:-translate-y-2 ${isPopular ? 'bg-gradient-to-b from-primary to-primary/20' : 'bg-border hover:bg-primary/30'
        }`}
    >
      <div className="bg-card rounded-[2.3rem] p-8 h-full flex flex-col relative overflow-hidden shadow-2xl">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 skew-x-12 group-hover:left-full transition-all duration-1000 pointer-events-none"></div>

        {isCurrentPlan && (
          <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/40">
            Current Plan
          </div>
        )}

        {!isCurrentPlan && plan.isFeatured && (
          <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/40">
            {plan.badge || 'Recommended'}
          </div>
        )}

        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {getIcon()}
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors text-foreground">
            {plan.name}
          </h3>
          <p className="text-muted-foreground text-sm font-bold">{plan.tagline || 'Elevate your game'}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-muted-foreground uppercase">LKR</span>
            <span className="text-5xl font-black tracking-tight text-foreground">{plan.price.toLocaleString()}</span>
          </div>
          <p className="text-muted-foreground/60 text-xs font-black uppercase tracking-widest mt-1">Per {plan.duration || 'Month'}</p>
        </div>

        <div className="flex-1 space-y-4 mb-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-4">Core Benefits</p>
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3 group/item">
              <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                <Check size={10} strokeWidth={4} />
              </div>
              <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors font-medium">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onSelect(plan)}
          className={`group/btn relative w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 overflow-hidden ${isPopular
              ? 'bg-primary text-white hover:bg-slate-900 shadow-lg shadow-primary/20'
              : 'border border-border bg-muted hover:bg-foreground hover:text-background'
            }`}
        >
          {isCurrentPlan ? 'Renew Plan' : 'Get Started'} <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function PaymentModal({ 
  plan, onClose, setToast, isRenewal 
}: { 
  plan: MembershipPlan; 
  onClose: () => void; 
  setToast: any;
  isRenewal: boolean;
}) {
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'PayHere'>('Cash');
  const [processing, setProcessing] = useState(false);
  const [cardType, setCardType] = useState<'Credit' | 'Debit'>('Credit');
  const [cardBrand, setCardBrand] = useState<'Visa' | 'Mastercard'>('Visa');
  const [processStep, setProcessStep] = useState(0);

  const handleConfirm = async () => {
    setProcessing(true);
    
    // Simulate 4-digit processing steps
    if (paymentMethod === 'Card') {
      for (let i = 1; i <= 4; i++) {
        setProcessStep(i);
        await new Promise(r => setTimeout(r, 600));
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/memberships/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          plan: plan.name,
          paymentMethod: paymentMethod,
          amount: plan.price
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Subscription failed');

      setToast({ 
        message: paymentMethod === 'Cash' 
          ? 'Subscription requested! Please settle payment at the gym.' 
          : `Welcome to the ${plan.name.toUpperCase()} family!`, 
        type: 'success' 
      });
      
      setTimeout(() => window.location.href = '/dashboard/profile', 2000);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
              {isRenewal ? 'Plan Renewal' : 'Secure Checkout'}
            </h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {isRenewal ? 'Continuing your legacy' : 'Finalizing your legacy'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="bg-muted/30 rounded-2xl p-6 mb-8 border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Selected Plan</span>
              <span className="text-xs font-black uppercase tracking-widest text-primary">{plan.name}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-black text-foreground">LKR {plan.price.toLocaleString()}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Due</span>
            </div>
          </div>

          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-4">Select Payment Method</label>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <button 
              onClick={() => setPaymentMethod('Cash')}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${paymentMethod === 'Cash' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/50'}`}
            >
              <Banknote size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Cash</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('Card')}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${paymentMethod === 'Card' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/50'}`}
            >
              <CreditCard size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Card</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('PayHere')}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${paymentMethod === 'PayHere' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/50'}`}
            >
              <Wallet size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">PayHere</span>
            </button>
          </div>

          {paymentMethod === 'Card' && (
            <div className="space-y-6 mb-8 p-6 bg-muted/20 border border-border rounded-2xl animate-in slide-in-from-top duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Card Type</label>
                  <select 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-primary"
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as any)}
                  >
                    <option value="Credit">Credit Card</option>
                    <option value="Debit">Debit Card</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Network</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setCardBrand('Visa')}
                      className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${cardBrand === 'Visa' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}
                    >Visa</button>
                    <button 
                      type="button"
                      onClick={() => setCardBrand('Mastercard')}
                      className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${cardBrand === 'Mastercard' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}
                    >Master</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Card Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="**** **** **** 1234"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-primary"
                    readOnly
                    value="4242 4242 4242 4242"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                    {cardBrand === 'Visa' ? <span className="text-blue-600 font-bold italic">VISA</span> : <span className="text-orange-500 font-bold italic">MASTER</span>}
                  </div>
                </div>
              </div>

              {processing && (
                <div className="pt-4 flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    {processStep < 4 ? `Verifying Step ${processStep}/4...` : 'Security Code Accepted'}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl mb-8 border border-primary/10">
            <Info size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
              {paymentMethod === 'Card' 
                ? 'Secure encrypted transaction. Your plan will be activated immediately upon successful payment.'
                : 'Your plan will be activated once the admin verifies the payment at the counter or via mobile transfer.'}
            </p>
          </div>

          <button 
            onClick={handleConfirm}
            disabled={processing}
            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all disabled:opacity-50"
          >
            {processing 
              ? (paymentMethod === 'Card' ? (processStep < 4 ? 'Processing Card...' : 'Finalizing Renewal...') : 'Processing Securely...') 
              : (isRenewal ? 'Confirm & Renew' : 'Confirm & Subscribe')}

          </button>
        </div>
      </div>
    </div>
  );
}
