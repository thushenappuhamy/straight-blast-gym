'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader, CreditCard, Calendar, CheckCircle2, Clock, AlertTriangle, User, Phone, Mail, Award } from 'lucide-react';
import Toast from '@/src/components/ui/Toast';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState<string[]>([]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [userRes, transRes] = await Promise.all([
        fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/transactions/my-transactions', { headers: { Authorization: `Bearer ${token}` } }) // I'll create this API
      ]);

      const userJson = await userRes.json();
      const transJson = await transRes.json();

      if (userJson.user) {
        const user = userJson.user;
        setUserData(user);
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setPhone(user.phone || '');
        setGender(user.gender || 'Male');
        setHeight(user.height?.toString() || '');
        setWeight(user.weight?.toString() || '');
        setFitnessGoal(user.fitnessGoal || []);
      }

      if (transJson.success) {
        setTransactions(transJson.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile/update', { // I'll check if this exists or create it
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          gender,
          height: parseFloat(height),
          weight: parseFloat(weight),
          fitnessGoal
        })
      });

      if (response.ok) {
        setToast({ message: 'Profile updated successfully!', type: 'success' });
        setIsEditing(false);
        fetchProfileData();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  const calculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h && w) return (w / (h * h)).toFixed(1);
    return '0.0';
  };

  const bmi = calculateBMI();
  const bmiValue = parseFloat(bmi);

  const getBMIStatus = () => {
    if (bmiValue === 0) return 'PENDING';
    if (bmiValue < 18.5) return 'UNDERWEIGHT';
    if (bmiValue < 25) return 'NORMAL';
    if (bmiValue < 30) return 'OVERWEIGHT';
    return 'OBESE';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Profile Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="w-28 h-28 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3">
                <span className="text-white text-5xl font-black -rotate-3">{firstName[0]}{lastName[0]}</span>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">
                    {firstName} <span className="text-primary">{lastName}</span>
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${userData?.membershipStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {userData?.membershipStatus || 'PENDING'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-muted-foreground text-sm font-medium">
                  <div className="flex items-center gap-1.5"><Mail size={14} className="text-primary" /> {userData?.email}</div>
                  <div className="flex items-center gap-1.5"><Phone size={14} className="text-primary" /> {phone || 'No phone'}</div>
                  <div className="flex items-center gap-1.5"><Award size={14} className="text-primary" /> {userData?.plan?.toUpperCase() || 'NO PLAN'}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-card hover:bg-muted border border-border text-foreground font-black text-xs uppercase tracking-widest px-8 py-4 transition-all rounded-2xl shadow-xl"
            >
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-xl">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                <User className="text-primary" size={24} />
                Personal Dossier
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 ml-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      readOnly={!isEditing}
                      className={`w-full px-5 py-4 rounded-2xl border text-sm font-bold transition-all focus:outline-none focus:border-primary ${isEditing ? 'bg-background border-border shadow-inner' : 'bg-muted/30 border-transparent cursor-not-allowed'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 ml-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      readOnly={!isEditing}
                      className={`w-full px-5 py-4 rounded-2xl border text-sm font-bold transition-all focus:outline-none focus:border-primary ${isEditing ? 'bg-background border-border shadow-inner' : 'bg-muted/30 border-transparent cursor-not-allowed'}`}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 ml-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      readOnly={!isEditing}
                      className={`w-full px-5 py-4 rounded-2xl border text-sm font-bold transition-all focus:outline-none focus:border-primary ${isEditing ? 'bg-background border-border shadow-inner' : 'bg-muted/30 border-transparent cursor-not-allowed'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 ml-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-5 py-4 rounded-2xl border text-sm font-bold transition-all focus:outline-none focus:border-primary appearance-none ${isEditing ? 'bg-background border-border shadow-inner' : 'bg-muted/30 border-transparent cursor-not-allowed'}`}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 ml-1">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-5 py-4 rounded-2xl border text-sm font-bold transition-all focus:outline-none focus:border-primary ${isEditing ? 'bg-background border-border shadow-inner' : 'bg-muted/30 border-transparent cursor-not-allowed'}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 ml-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full px-5 py-4 rounded-2xl border text-sm font-bold transition-all focus:outline-none focus:border-primary ${isEditing ? 'bg-background border-border shadow-inner' : 'bg-muted/30 border-transparent cursor-not-allowed'}`}
                  />
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={handleSaveClick}
                  className="mt-10 w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all"
                >
                  Save Global Updates
                </button>
              )}
            </div>

            {/* Transaction History */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl">
              <div className="p-10 border-b border-border">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <CreditCard className="text-primary" size={24} />
                  Subscription Ledger
                </h2>
              </div>
              <div className="divide-y divide-border">
                {transactions.length > 0 ? (
                  transactions.map((tx, i) => (
                    <div key={i} className="p-8 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {tx.status === 'COMPLETED' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                        </div>
                        <div>
                          <p className="font-black text-foreground uppercase tracking-tight text-sm">{tx.type}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                              <Calendar size={10} /> {new Date(tx.date).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                              {tx.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-foreground">LKR {tx.amount.toLocaleString()}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center text-muted-foreground">
                    <p className="text-xs font-black uppercase tracking-widest">No transactions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* BMI Card */}
            <div className="bg-primary text-white rounded-[2.5rem] p-10 shadow-2xl shadow-primary/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-6">Health Index</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-7xl font-black tracking-tighter">{bmi}</span>
                <span className="text-xs font-black uppercase opacity-60">BMI</span>
              </div>
              <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                {getBMIStatus()}
              </div>
            </div>

            {/* Membership Status Card */}
            <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-8">Membership Portal</h3>
              
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Current Tier</p>
                    <p className="text-xl font-black text-foreground uppercase tracking-tighter">{userData?.plan || 'Free Tier'}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary">
                    <Award size={24} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${userData?.membershipStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                      <p className="text-sm font-black text-foreground uppercase">{userData?.membershipStatus || 'PENDING'}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary">
                    {userData?.membershipStatus === 'active' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/dashboard/membership" className="block w-full py-4 bg-muted hover:bg-primary/10 text-center rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Upgrade / Renew Plan
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
