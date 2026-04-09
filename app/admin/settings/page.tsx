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
        enabled ? 'bg-[#F4D03F]' : 'bg-gray-300'
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
      <h2 className="text-xl font-black uppercase tracking-tight mb-6">Gym Information</h2>

      <div className="space-y-5">
        {/* Gym Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
            Gym Name
          </label>
          <input
            type="text"
            value={form.gymName}
            onChange={(e) => setForm({ ...form, gymName: e.target.value })}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
          />
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
            Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
          />
        </div>

        {/* Opening + Closing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Opening Time
            </label>
            <input
              type="time"
              value={form.openingTime}
              onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Closing Time
            </label>
            <input
              type="time"
              value={form.closingTime}
              onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
            />
          </div>
        </div>

        {/* About */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
            About / Description
          </label>
          <textarea
            rows={4}
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F] resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#F4D03F] hover:bg-[#E5C730] disabled:bg-gray-400 text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all"
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
      <h2 className="text-xl font-black uppercase tracking-tight mb-6">Membership Plan Pricing</h2>

      <div className="space-y-5">
        {/* Plan prices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Basic Plan (LKR/Mo)
            </label>
            <input
              type="number"
              value={form.basicPrice}
              onChange={(e) => setForm({ ...form, basicPrice: Number(e.target.value) })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Gold Plan (LKR/Mo)
            </label>
            <input
              type="number"
              value={form.goldPrice}
              onChange={(e) => setForm({ ...form, goldPrice: Number(e.target.value) })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Elite Plan (LKR/Mo)
            </label>
            <input
              type="number"
              value={form.elitePrice}
              onChange={(e) => setForm({ ...form, elitePrice: Number(e.target.value) })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
            />
          </div>
        </div>

        {/* Discounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Gold Supplement Discount (%)
            </label>
            <input
              type="number"
              value={form.goldDiscount}
              onChange={(e) => setForm({ ...form, goldDiscount: Number(e.target.value) })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Elite Supplement Discount (%)
            </label>
            <input
              type="number"
              value={form.eliteDiscount}
              onChange={(e) => setForm({ ...form, eliteDiscount: Number(e.target.value) })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
            />
          </div>
        </div>

        {/* Gold Sessions */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
            Gold Trainer Sessions / Month
          </label>
          <input
            type="number"
            value={form.goldSessions}
            onChange={(e) => setForm({ ...form, goldSessions: Number(e.target.value) })}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-gray-800">Allow Annual Billing</p>
              <p className="text-xs text-gray-500">Members can pay yearly at a discounted rate</p>
            </div>
            <Toggle enabled={annualBilling} onChange={() => setAnnualBilling(!annualBilling)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-gray-800">Free Trial (7 Days)</p>
              <p className="text-xs text-gray-500">New members get a 7-day free trial</p>
            </div>
            <Toggle enabled={freeTrial} onChange={() => setFreeTrial(!freeTrial)} />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#F4D03F] hover:bg-[#E5C730] disabled:bg-gray-400 text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all"
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
      <h2 className="text-xl font-black uppercase tracking-tight mb-6">Payment Gateway</h2>

      <div className="space-y-5">
        {/* Connected banner */}
        <div className="border border-gray-200 bg-gray-50 px-5 py-4">
          <p className="text-sm font-semibold text-gray-800">
            🔒 PayHere (Pvt) Ltd — Connected
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {liveMode ? 'Live mode active' : 'Sandbox mode active. Switch to Live for real payments.'}
          </p>
        </div>

        {/* Merchant ID */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
            Merchant ID
          </label>
          <input
            type="password"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
          />
        </div>

        {/* Merchant Secret */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
            Merchant Secret
          </label>
          <input
            type="password"
            value={merchantSecret}
            onChange={(e) => setMerchantSecret(e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-gray-800">Live Mode</p>
              <p className="text-xs text-gray-500">Currently in {liveMode ? 'live' : 'sandbox/test'} mode</p>
            </div>
            <Toggle enabled={liveMode} onChange={() => setLiveMode(!liveMode)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-gray-800">Email Payment Receipts</p>
              <p className="text-xs text-gray-500">Send receipt to member after payment</p>
            </div>
            <Toggle enabled={emailReceipts} onChange={() => setEmailReceipts(!emailReceipts)} />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#F4D03F] hover:bg-[#E5C730] disabled:bg-gray-400 text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all"
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
      <h2 className="text-xl font-black uppercase tracking-tight mb-6">Notification Preferences</h2>

      <div className="space-y-5">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-gray-800">{row.label}</p>
              <p className="text-xs text-gray-500">{row.sub}</p>
            </div>
            <Toggle enabled={prefs[row.key]} onChange={() => toggle(row.key)} />
          </div>
        ))}

        {/* Admin email */}
        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
            Admin Notification Email
          </label>
          <input
            type="email"
            value={notifEmail}
            onChange={(e) => setNotifEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#F4D03F] hover:bg-[#E5C730] disabled:bg-gray-400 text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all"
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
      <h2 className="text-xl font-black uppercase tracking-tight mb-6">Admin Account</h2>

      <div className="space-y-5">
        {/* Profile banner */}
        <div className="bg-[#1A1816] px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#F4D03F] flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-xl">
              {form.firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-black text-lg uppercase tracking-wide">
              {form.firstName} {form.lastName}
            </p>
            <p className="text-gray-400 text-sm">Super Admin · {form.email}</p>
          </div>
        </div>

        {/* First + Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F]"
          />
        </div>

        {/* Current Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
            Current Password
          </label>
          <input
            type="password"
            placeholder="Enter current password (only if changing password)"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F] placeholder-gray-400"
          />
        </div>

        {/* New + Confirm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Min. 8 characters (optional)"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F] placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#F4D03F] placeholder-gray-400"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#F4D03F] hover:bg-[#E5C730] disabled:bg-gray-400 text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all"
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b-4 border-[#F4D03F] px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tight">Settings</h1>
          <button className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all">
            Save Changes
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="flex gap-6 items-start">
          {/* Left Nav */}
          <div className="w-64 flex-shrink-0 bg-white shadow-lg">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold uppercase tracking-widest text-left transition-all border-l-4 ${
                  activeTab === item.key
                    ? 'border-[#F4D03F] bg-gray-50 text-gray-900'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 bg-white shadow-lg p-8">
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
