'use client';

import React, { useState, useEffect } from 'react';

const specialtyOptions = [
  'Strength & Conditioning',
  'Nutrition & Weight Loss',
  'Bodybuilding & Hypertrophy',
  'Functional Training',
  'Yoga & Flexibility',
  'CrossFit',
  'HIIT & Cardio',
  'Powerlifting',
  'Boxing & MMA',
];

const qualificationOptions = [
  'Bachelor of Science in Sports Science',
  'Bachelor of Science in Nutrition',
  'Certified Personal Trainer (CPT)',
  'Advanced Diploma in Fitness',
  'Diploma in Sports Medicine',
  'Yoga Instructor Certification',
  'Nutrition Specialist Certification',
];

const specializationOptions = ['MMA', 'Powerlifting', 'BJJ', 'Cardio', 'HIIT', 'Nutrition', 'Hypertrophy', 'Posing', 'Yoga', 'CrossFit', 'Boxing'];

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    qualifications: [] as string[],
    certifications: '',
    experience: 0,
    bio: '',
    costPerSession: 0,
    status: 'active',
    isFeatured: false,
    specializations: [] as string[],
    tags: '',
  });

  // Fetch trainers from API
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        console.log('👨‍🏫 [ADMIN TRAINERS] Fetching trainers...');
        const response = await fetch('/api/admin/trainers');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch trainers');
        }

        console.log('✅ [ADMIN TRAINERS] Trainers loaded:', data.data);
        setTrainers(data.data || []);
      } catch (err: any) {
        console.error('❌ [ADMIN TRAINERS] Error:', err);
        setError(err.message || 'Failed to load trainers');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  // Calculate stats dynamically
  const activeTrainers = trainers.filter((t) => t.status === 'active').length;
  const totalSessions = trainers.reduce((sum, t) => sum + (t.sessionsThisMonth || 0), 0);
  const avgRating = trainers.length > 0
    ? (trainers.reduce((sum, t) => sum + parseFloat(t.rating), 0) / trainers.length).toFixed(1)
    : '0';
  const totalRevenue = trainers.reduce((sum, t) => sum + (parseInt(t.perSession.replace(/[^\d]/g, '')) || 0) * (t.sessionsThisMonth || 0), 0);

  const statCards = [
    { icon: '🏋️', value: activeTrainers.toString(), label: 'Active Trainers', subtext: null, subtextColor: '' },
    { icon: '📅', value: totalSessions.toString(), label: 'Sessions This Month', subtext: null, subtextColor: '' },
    { icon: '⭐', value: avgRating, label: 'Avg Rating', subtext: null, subtextColor: '' },
    { icon: '💰', value: `LKR ${(totalRevenue / 1000).toFixed(0)}K`, label: 'Sessions Revenue', subtext: 'This month', subtextColor: 'text-[#F4D03F]' },
  ];

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const submitData = {
        ...formData,
        experience: parseInt(formData.experience.toString()),
        costPerSession: parseInt(formData.costPerSession.toString()),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const response = await fetch('/api/admin/trainers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add trainer');
      }

      console.log('✅ [ADMIN TRAINERS] Trainer added:', data.data);
      alert('✅ Trainer added successfully!');

      // Reset form and refetch trainers
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialty: '',
        qualifications: [],
        certifications: '',
        experience: 0,
        bio: '',
        costPerSession: 0,
        status: 'active',
        isFeatured: false,
        specializations: [],
        tags: '',
      });
      setShowAddModal(false);

      // Refetch trainers
      const trainersResponse = await fetch('/api/admin/trainers');
      const trainersData = await trainersResponse.json();
      setTrainers(trainersData.data || []);
    } catch (err: any) {
      console.error('❌ [ADMIN TRAINERS] Error:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Loading trainers...</p>
          <div className="animate-spin">⚙️</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-100 border-2 border-red-500 text-red-800 p-6 rounded">
          <h2 className="font-bold text-lg mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b-4 border-[#F4D03F] px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tight">Trainers</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all whitespace-nowrap"
          >
            + Add Trainer
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="bg-[#2B2621] p-6 relative overflow-hidden">
              <div className="text-3xl mb-3 opacity-40">{card.icon}</div>
              <div className="text-5xl font-black text-[#F4D03F] mb-2">{card.value}</div>
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{card.label}</div>
              {card.subtext && <div className={`text-sm font-bold ${card.subtextColor}`}>{card.subtext}</div>}
            </div>
          ))}
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <div key={trainer._id} className="bg-[#2B2621] rounded-lg overflow-hidden border-2 border-[#F4D03F]/30">
              {/* Trainer Header */}
              <div className="relative h-32 bg-gradient-to-r from-[#1A1816] to-[#2B2621] p-4">
                {trainer.badge && <div className="absolute top-3 right-3 bg-white text-black px-2 py-1 text-xs font-black uppercase">{trainer.badge}</div>}
                <div className="text-6xl text-center mt-2">{trainer.avatar}</div>
              </div>

              {/* Trainer Info */}
              <div className="p-6">
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">{trainer.name}</h3>
                <div className="mb-4">
                  <div className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider ${trainer.specialtyColor} mb-2`}>
                    {trainer.specialty}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {trainer.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 uppercase font-bold">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4 pb-4 border-b border-gray-700">
                  <div>
                    <div className="text-[#F4D03F] font-black">{trainer.experience}</div>
                    <div className="text-gray-400 uppercase text-xs">Experience</div>
                  </div>
                  <div>
                    <div className="text-[#F4D03F] font-black">{trainer.clients}</div>
                    <div className="text-gray-400 uppercase text-xs">Clients</div>
                  </div>
                  <div>
                    <div className="text-[#F4D03F] font-black">{trainer.rating}</div>
                    <div className="text-gray-400 uppercase text-xs">Rating</div>
                  </div>
                  <div>
                    <div className="text-[#F4D03F] font-black">{trainer.perSession}</div>
                    <div className="text-gray-400 uppercase text-xs">Per Session</div>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider ${
                    trainer.status === 'active' ? 'bg-green-600 text-white' : 
                    trainer.status === 'inactive' ? 'bg-red-600 text-white' : 
                    'bg-yellow-600 text-white'
                  }`}>
                    {trainer.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-xs uppercase tracking-wider py-2 transition-all">
                    View Schedule
                  </button>
                  <button className="flex-1 border-2 border-[#F4D03F] text-[#F4D03F] hover:bg-[#F4D03F] hover:text-black font-black text-xs uppercase tracking-wider py-2 transition-all">
                    Edit
                  </button>
                  <button className="flex-1 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black text-xs uppercase tracking-wider py-2 transition-all">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {trainers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No trainers found. Click "+ Add Trainer" to add one.</p>
          </div>
        )}
      </div>

      {/* Add Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#F4D03F]/5 via-white to-blue-50 rounded-2xl border-2 border-[#F4D03F] max-w-2xl w-full my-8 p-8 shadow-[0_0_40px_rgba(244,208,63,0.15)]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-[#F4D03F]">
              <div>
                <p className="text-[#F4D03F] text-xs font-black uppercase tracking-widest mb-2">Management</p>
                <h2 className="text-4xl font-black uppercase text-slate-700 tracking-tight">Add New Trainer</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-4xl font-black text-slate-700 hover:text-[#F4D03F] transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTrainer} className="space-y-6">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">First Name *</label>
                  <input
                    type="text"
                    placeholder="Kasun"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Last Name *</label>
                  <input
                    type="text"
                    placeholder="Perera"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Email *</label>
                  <input
                    type="email"
                    placeholder="kasun@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Phone *</label>
                  <input
                    type="tel"
                    placeholder="+94 71 234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Specialty */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Specialty *</label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  required
                >
                  <option value="">Select Specialty</option>
                  {specialtyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience & Cost Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Cost Per Session (LKR) *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.costPerSession}
                    onChange={(e) => setFormData({ ...formData, costPerSession: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Select Qualifications (Ctrl+Click for multiple)</label>
                <select
                  multiple
                  value={formData.qualifications}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setFormData({ ...formData, qualifications: selected });
                  }}
                  className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                >
                  {qualificationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Bio (Max 500 Characters)</label>
                <textarea
                  placeholder="Write about the trainer's background and expertise..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  maxLength={500}
                  className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all resize-none"
                  rows={3}
                />
              </div>

              {/* Specializations */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Specializations</label>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 border-2 border-gray-300 rounded">
                  {specializationOptions.map((spec) => (
                    <label key={spec} className="flex items-center gap-2 text-gray-900 cursor-pointer hover:text-[#F4D03F] transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.specializations.includes(spec)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, specializations: [...formData.specializations, spec] });
                          } else {
                            setFormData({ ...formData, specializations: formData.specializations.filter((s) => s !== spec) });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-bold">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status & Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-gray-900 bg-white px-4 py-3 border-2 border-gray-300 cursor-pointer rounded hover:border-[#F4D03F] transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="font-black text-sm">Feature Trainer (Head Coach)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-gradient-to-r from-[#F4D03F] to-yellow-400 hover:from-[#E5C730] hover:to-yellow-300 disabled:opacity-50 text-black font-black text-lg uppercase tracking-wider py-4 transition-all shadow-[0_4px_20px_rgba(244,208,63,0.3)] hover:shadow-[0_6px_30px_rgba(244,208,63,0.5)]"
                >
                  {formLoading ? '🔄 Adding...' : '✓ Add Trainer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 font-black text-lg uppercase tracking-wider py-4 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
