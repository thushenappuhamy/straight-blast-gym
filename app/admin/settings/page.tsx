'use client';

import React, { useState, useEffect } from 'react';

type Tab = 'gym' | 'membership' | 'payment' | 'notifications' | 'account';

// Toast notification component
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 px-6 py-3 rounded text-white font-bold text-sm ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      {message}
    </div>
  );
}

// Toggle component
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? 'bg-[var(--primary)]' : 'bg-[#888888]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ── Tab Panels ──────────────────────────────────────────────────────────────

function GymInfoPanel() {
  const [form, setForm] = useState({
    gymName: 'Straight Blast Gym (SBG)',
    phone: '+94 31 222 0000',
    email: 'info@sbgnegombo.lk',
    address: '123 Main Street, Negombo, Western Province',
    openingTime: '05:30',
    closingTime: '22:00',
    about:
      "Straight Blast Gym is Negombo's premier combat and fitness gym, offering world-class training in MMA, BJJ, strength & conditioning, and personalized nutrition.",
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('🏋️ [GYM INFO] Submitting form:', form);
      const response = await fetch('/api/admin/settings/gym-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      console.log('📬 [GYM INFO] Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update gym info');
      }

      setNotification({ message: 'Gym info updated successfully!', type: 'success' });
    } catch (error: any) {
      console.error('❌ [GYM INFO] Error:', error);
      setNotification({ message: error.message || 'Failed to update gym info', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-black uppercase tracking-tight mb-6 text-white">Gym Information</h2>

      <div className="space-y-5">
        {/* Gym Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
            Gym Name
          </label>
          <input
            type="text"
            value={form.gymName}
            onChange={(e) => setForm({ ...form, gymName: e.target.value })}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          />
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
            Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          />
        </div>

        {/* Opening + Closing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              Opening Time
            </label>
            <input
              type="time"
              value={form.openingTime}
              onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              Closing Time
            </label>
            <input
              type="time"
              value={form.closingTime}
              onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
        </div>

        {/* About */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
            About / Description
          </label>
          <textarea
            rows={4}
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none resize-none"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="font-black text-sm uppercase tracking-wider px-6 py-3 transition-all text-black disabled:bg-gray-400 disabled:opacity-60"
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--primary-light)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--primary)')}
          style={{ background: loading ? '#888888' : 'var(--primary)' }}
        >
          {loading ? 'Updating...' : 'Update Gym Info →'}
        </button>
      </div>

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

function MembershipPlansPanel() {
  const [form, setForm] = useState({
    basicPrice: 2500,
    goldPrice: 5000,
    elitePrice: 9500,
    goldDiscount: 10,
    eliteDiscount: 20,
    goldSessions: 2,
  });
  const [annualBilling, setAnnualBilling] = useState(true);
  const [freeTrial, setFreeTrial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('💳 [MEMBERSHIP PLANS] Submitting form:', form);
      const response = await fetch('/api/admin/settings/membership-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basicPrice: Number(form.basicPrice),
          goldPrice: Number(form.goldPrice),
          elitePrice: Number(form.elitePrice),
          goldDiscount: Number(form.goldDiscount),
          eliteDiscount: Number(form.eliteDiscount),
          goldSessions: Number(form.goldSessions),
          allowAnnualBilling: annualBilling,
          freeTrial: freeTrial ? 7 : 0,
        }),
      });

      const data = await response.json();
      console.log('📬 [MEMBERSHIP PLANS] Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update membership plans');
      }

      setNotification({ message: 'Membership plans updated successfully!', type: 'success' });
    } catch (error: any) {
      console.error('❌ [MEMBERSHIP PLANS] Error:', error);
      setNotification({ message: error.message || 'Failed to update membership plans', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-black uppercase tracking-tight mb-6 text-white">Membership Plan Pricing</h2>

      <div className="space-y-5">
        {/* Plan prices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              Basic Plan (LKR/Mo)
            </label>
            <input
              type="number"
              value={form.basicPrice}
              onChange={(e) => setForm({ ...form, basicPrice: Number(e.target.value) })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              Gold Plan (LKR/Mo)
            </label>
            <input
              type="number"
              value={form.goldPrice}
              onChange={(e) => setForm({ ...form, goldPrice: Number(e.target.value) })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              Elite Plan (LKR/Mo)
            </label>
            <input
              type="number"
              value={form.elitePrice}
              onChange={(e) => setForm({ ...form, elitePrice: Number(e.target.value) })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
            />
          </div>
        </div>

        {/* Discounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              Gold Supplement Discount (%)
            </label>
            <input
              type="number"
              value={form.goldDiscount}
              onChange={(e) => setForm({ ...form, goldDiscount: Number(e.target.value) })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              Elite Supplement Discount (%)
            </label>
            <input
              type="number"
              value={form.eliteDiscount}
              onChange={(e) => setForm({ ...form, eliteDiscount: Number(e.target.value) })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
        </div>

        {/* Gold Sessions */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
            Gold Trainer Sessions / Month
          </label>
          <input
            type="number"
            value={form.goldSessions}
            onChange={(e) => setForm({ ...form, goldSessions: Number(e.target.value) })}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-white">Allow Annual Billing</p>
              <p className="text-xs text-white/50">Members can pay yearly at a discounted rate</p>
            </div>
            <Toggle enabled={annualBilling} onChange={() => setAnnualBilling(!annualBilling)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-white">Free Trial (7 Days)</p>
              <p className="text-xs text-white/50">New members get a 7-day free trial</p>
            </div>
            <Toggle enabled={freeTrial} onChange={() => setFreeTrial(!freeTrial)} />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="font-black text-sm uppercase tracking-wider px-6 py-3 transition-all text-black disabled:bg-gray-400 disabled:opacity-60"
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--primary-light)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--primary)')}
          style={{ background: loading ? '#888888' : 'var(--primary)' }}
        >
          {loading ? 'Saving...' : 'Save Plan Settings →'}
        </button>
      </div>

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

function PaymentPanel() {
  const [liveMode, setLiveMode] = useState(false);
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [merchantId, setMerchantId] = useState('12345678');
  const [merchantSecret, setMerchantSecret] = useState('abcdefghijk');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('💳 [PAYMENT] Submitting form:', { liveMode, emailReceipts });
      const response = await fetch('/api/admin/settings/payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentProvider: 'payhere',
          merchantId,
          merchantSecret,
          liveMode,
          emailReceipts,
        }),
      });

      const data = await response.json();
      console.log('📬 [PAYMENT] Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update payment settings');
      }

      setNotification({ message: 'Payment settings updated successfully!', type: 'success' });
    } catch (error: any) {
      console.error('❌ [PAYMENT] Error:', error);
      setNotification({ message: error.message || 'Failed to update payment settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-black uppercase tracking-tight mb-6 text-white">Payment Gateway</h2>

      <div className="space-y-5">
        {/* Connected banner */}
        <div className="border border-white/10 bg-[#1A1A1A] px-5 py-4">
          <p className="text-sm font-semibold text-white">
            🔒 PayHere (Pvt) Ltd — Connected
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            {liveMode ? 'Live mode active' : 'Sandbox mode active. Switch to Live for real payments.'}
          </p>
        </div>

        {/* Merchant ID */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
            Merchant ID
          </label>
          <input
            type="password"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          />
        </div>

        {/* Merchant Secret */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
            Merchant Secret
          </label>
          <input
            type="password"
            value={merchantSecret}
            onChange={(e) => setMerchantSecret(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-white">Live Mode</p>
              <p className="text-xs text-white/50">Currently in {liveMode ? 'live' : 'sandbox/test'} mode</p>
            </div>
            <Toggle enabled={liveMode} onChange={() => setLiveMode(!liveMode)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-white">Email Payment Receipts</p>
              <p className="text-xs text-white/50">Send receipt to member after payment</p>
            </div>
            <Toggle enabled={emailReceipts} onChange={() => setEmailReceipts(!emailReceipts)} />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="font-black text-sm uppercase tracking-wider px-6 py-3 transition-all text-black disabled:bg-gray-400 disabled:opacity-60"
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--primary-light)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--primary)')}
          style={{ background: loading ? '#888888' : 'var(--primary)' }}
        >
          {loading ? 'Saving...' : 'Save Payment Settings →'}
        </button>
      </div>

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

function NotificationsPanel() {
  const [prefs, setPrefs] = useState({
    newMember: true,
    newOrder: true,
    trainerBooking: true,
    lowStock: true,
    membershipExpiry: false,
  });
  const [notifEmail, setNotifEmail] = useState('admin@sbgnegombo.lk');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('🔔 [NOTIFICATIONS] Submitting form:', { ...prefs, adminEmail: notifEmail });
      const response = await fetch('/api/admin/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...prefs,
          adminEmail: notifEmail,
        }),
      });

      const data = await response.json();
      console.log('📬 [NOTIFICATIONS] Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update notification settings');
      }

      setNotification({ message: 'Notification settings updated successfully!', type: 'success' });
    } catch (error: any) {
      console.error('❌ [NOTIFICATIONS] Error:', error);
      setNotification({ message: error.message || 'Failed to update notification settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const rows = [
    { key: 'newMember' as const, label: 'New Member Registration', sub: 'Alert when a new member registers' },
    { key: 'newOrder' as const, label: 'New Order Placed', sub: 'Alert on each supplement order' },
    { key: 'trainerBooking' as const, label: 'Trainer Booking', sub: 'Alert when a session is booked' },
    { key: 'lowStock' as const, label: 'Low Stock Alerts', sub: 'Alert when supplement stock drops below 5' },
    { key: 'membershipExpiry' as const, label: 'Membership Expiry Reminders', sub: 'Notify members 7 days before expiry' },
  ];

  return (
    <div>
      <h2 className="text-xl font-black uppercase tracking-tight mb-6 text-white">Notification Preferences</h2>

      <div className="space-y-5">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-white">{row.label}</p>
              <p className="text-xs text-white/50">{row.sub}</p>
            </div>
            <Toggle enabled={prefs[row.key]} onChange={() => toggle(row.key)} />
          </div>
        ))}

        {/* Admin email */}
        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
            Admin Notification Email
          </label>
          <input
            type="email"
            value={notifEmail}
            onChange={(e) => setNotifEmail(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="font-black text-sm uppercase tracking-wider px-6 py-3 transition-all text-black disabled:bg-gray-400 disabled:opacity-60"
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--primary-light)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--primary)')}
          style={{ background: loading ? '#888888' : 'var(--primary)' }}
        >
          {loading ? 'Saving...' : 'Save Notifications →'}
        </button>
      </div>

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

function AdminAccountPanel() {
  const [form, setForm] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@sbgnegombo.lk',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async () => {
    // Validate password change if provided
    if (form.newPassword) {
      if (!form.currentPassword) {
        setNotification({ message: 'Current password is required to change password', type: 'error' });
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setNotification({ message: 'New passwords do not match', type: 'error' });
        return;
      }
      if (form.newPassword.length < 8) {
        setNotification({ message: 'Password must be at least 8 characters', type: 'error' });
        return;
      }
    }

    setLoading(true);
    try {
      console.log('👤 [ADMIN ACCOUNT] Submitting form');
      const response = await fetch('/api/auth/update-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await response.json();
      console.log('📬 [ADMIN ACCOUNT] Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update account');
      }

      setNotification({ message: 'Account updated successfully!', type: 'success' });
      // Clear password fields on success
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      console.error('❌ [ADMIN ACCOUNT] Error:', error);
      setNotification({ message: error.message || 'Failed to update account', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-black uppercase tracking-tight mb-6 text-white">Admin Account</h2>

      <div className="space-y-5">
        {/* Profile banner */}
        <div className="bg-[var(--card)] px-6 py-5 flex items-center gap-4 border border-white/10">
          <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-xl">
              {form.firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-black text-lg uppercase tracking-wide">
              {form.firstName} {form.lastName}
            </p>
            <p className="text-white/50 text-sm">Super Admin · {form.email}</p>
          </div>
        </div>

        {/* First + Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          />
        </div>

        {/* Current Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
            Current Password
          </label>
          <input
            type="password"
            placeholder="Enter current password (only if changing password)"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          />
        </div>

        {/* New + Confirm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Min. 8 characters (optional)"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/65 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              className="w-full border px-4 py-3 text-sm bg-[#0c0c0c] text-white placeholder:text-white/28 focus:outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="font-black text-sm uppercase tracking-wider px-6 py-3 transition-all text-black disabled:bg-gray-400 disabled:opacity-60"
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--primary-light)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--primary)')}
          style={{ background: loading ? '#888888' : 'var(--primary)' }}
        >
          {loading ? 'Updating...' : 'Update Account →'}
        </button>
      </div>

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

// ── Nav Items ────────────────────────────────────────────────────────────────

const navItems: { key: Tab; icon: string; label: string }[] = [
  { key: 'gym', icon: '⚙️', label: 'Gym Info' },
  { key: 'membership', icon: '💳', label: 'Membership Plans' },
  { key: 'payment', icon: '💰', label: 'Payment' },
  { key: 'notifications', icon: '🔔', label: 'Notifications' },
  { key: 'account', icon: '👤', label: 'Admin Account' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('gym');

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="px-8 py-6" style={{ background: 'var(--card)', borderBottom: '2px solid var(--primary)' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Settings</h1>
          <button className="font-black text-sm uppercase tracking-wider px-6 py-3 transition-all text-black" 
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
            style={{ background: 'var(--primary)' }}
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="flex gap-6 items-start">
          {/* Left Nav */}
          <div className="w-64 flex-shrink-0" style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold uppercase tracking-widest text-left transition-all border-l-4 ${
                  activeTab === item.key
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/75'
                }`}
                style={activeTab === item.key ? { borderLeftColor: 'var(--primary)', background: 'rgba(230, 60, 47, 0.1)' } : { borderLeftColor: 'transparent' }}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 p-8" style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {activeTab === 'gym' && <GymInfoPanel />}
            {activeTab === 'membership' && <MembershipPlansPanel />}
            {activeTab === 'payment' && <PaymentPanel />}
            {activeTab === 'notifications' && <NotificationsPanel />}
            {activeTab === 'account' && <AdminAccountPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
