'use client';

import React, { useState, useEffect } from 'react';
import AddTrainerModal from '@/components/admin/AddTrainerModal';
import { Clock, Users } from 'lucide-react';

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
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [showSchedule, setShowSchedule] = useState<string | null>(null);
  const [formData, setFormData] = useState({
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
    shiftStartTime: '06:00',
    shiftEndTime: '22:00',
    shiftDays: [],
  });
  const [formLoading, setFormLoading] = useState(false);

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
    
    // Refresh every 30 seconds to update active status
    const interval = setInterval(fetchTrainers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshTrainers = async () => {
    try {
      const response = await fetch('/api/admin/trainers');
      const data = await response.json();
      if (data.data) {
        setTrainers(data.data);
      }
    } catch (err) {
      console.error('Error refreshing trainers:', err);
    }
  };

  const handleEditTrainer = (trainer: any) => {
    setEditingTrainer(trainer);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTrainer(null);
  };

  const handleToggleStatus = async (trainer: any) => {
    const newStatus = trainer.status === 'active' ? 'inactive' : 'active';
    const confirmMsg = `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} ${trainer.firstName} ${trainer.lastName}?`;
    
    if (!confirm(confirmMsg)) return;

    try {
      console.log(`👨‍🏫 [ADMIN TRAINERS] ${newStatus === 'active' ? 'Activating' : 'Deactivating'} trainer:`, trainer._id);
      
      const response = await fetch(`/api/admin/trainers/${trainer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...trainer, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update trainer status');
      }

      console.log(`✅ [ADMIN TRAINERS] Trainer ${newStatus === 'active' ? 'activated' : 'deactivated'}:`, data.data);
      alert(`✅ Trainer ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      handleRefreshTrainers();
    } catch (err: any) {
      console.error('❌ [ADMIN TRAINERS] Error:', err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleDeleteTrainer = async (trainer: any) => {
    const confirmMsg = `⚠️ Are you sure you want to DELETE ${trainer.firstName} ${trainer.lastName}? This action cannot be undone and will remove them from all dashboards.`;
    
    if (!confirm(confirmMsg)) return;

    try {
      console.log('👨‍🏫 [ADMIN TRAINERS] Deleting trainer:', trainer._id);
      
      const response = await fetch(`/api/admin/trainers/${trainer._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete trainer');
      }

      console.log('✅ [ADMIN TRAINERS] Trainer deleted:', trainer._id);
      alert(`✅ Trainer ${trainer.firstName} ${trainer.lastName} deleted successfully!`);
      
      // Remove trainer from local state
      setTrainers(trainers.filter(t => t._id !== trainer._id));
    } catch (err: any) {
      console.error('❌ [ADMIN TRAINERS] Error:', err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2B2621] to-[#1A1816]">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#F4D03F] mb-4">Loading trainers...</p>
          <div className="animate-spin text-4xl">⚙️</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-b from-[#2B2621] to-[#1A1816]">
        <div className="bg-red-100 border-2 border-red-500 text-red-800 p-6 rounded">
          <h2 className="font-bold text-lg mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={handleRefreshTrainers}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2B2621] to-[#1A1816]">
      {/* Header */}
      <div className="bg-slate-900 border-b-4 border-[#F4D03F] px-8 py-6 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">🏋️ Trainers</h1>
          <button
            onClick={() => {
              setEditingTrainer(null);
              setShowAddModal(true);
            }}
            className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all whitespace-nowrap shadow-lg hover:shadow-xl"
          >
            + Add Trainer
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Trainers Grid */}
        {trainers && trainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <div key={trainer._id} className="bg-[#2B2621] rounded-lg overflow-hidden border-2 border-[#F4D03F]/30 hover:border-[#F4D03F] transition-all hover:shadow-[0_0_25px_rgba(244,208,63,0.2)]">
                {/* Trainer Header */}
                <div className="relative h-32 bg-gradient-to-r from-[#1A1816] to-[#2B2621] p-4 border-b-2 border-[#F4D03F]/20">
                  <div className="absolute top-3 right-3">
                    {trainer.currentlyActive ? (
                      <span className="inline-block bg-green-500 text-white px-2 py-1 text-xs font-black uppercase animate-pulse flex items-center gap-1">
                        <span>●</span> Active Now
                      </span>
                    ) : (
                      <span className="inline-block bg-gray-600 text-white px-2 py-1 text-xs font-black uppercase">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-5xl text-center mt-3">👨‍💼</div>
                </div>

                {/* Trainer Info */}
                <div className="p-6">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">
                    {trainer.firstName} {trainer.lastName}
                  </h3>
                  <div className="mb-4">
                    <div className="inline-block bg-[#F4D03F]/20 text-[#F4D03F] px-3 py-1 text-xs font-black uppercase tracking-wider">
                      {trainer.specialty || 'General'}
                    </div>
                  </div>

                  {/* Shift Info */}
                  <div className="bg-slate-800/50 p-3 rounded mb-4 border-l-4 border-[#F4D03F]">
                    <div className="flex items-center gap-2 text-[#F4D03F] text-sm font-bold mb-1">
                      <Clock size={16} />
                      Shift Hours
                    </div>
                    <div className="text-xs text-gray-300">
                      {trainer.shiftStartTime || '06:00'} - {trainer.shiftEndTime || '22:00'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {trainer.shiftDays && trainer.shiftDays.length > 0
                        ? trainer.shiftDays.join(', ')
                        : 'No days set'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4 pb-4 border-b border-gray-700">
                    <div>
                      <div className="text-[#F4D03F] font-black text-lg">{trainer.experience || 0}</div>
                      <div className="text-gray-400 uppercase text-xs">Years Exp.</div>
                    </div>
                    <div>
                      <div className="text-[#F4D03F] font-black text-lg">{trainer.assignedClients?.length || 0}</div>
                      <div className="text-gray-400 uppercase text-xs">Clients</div>
                    </div>
                  </div>

                  {/* Cost Per Session */}
                  <div className="mb-4 pb-4 border-b border-gray-700">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Cost Per Session</div>
                    <div className="text-[#F4D03F] font-black text-xl">LKR {trainer.costPerSession?.toLocaleString() || '0'}</div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider ${
                        trainer.status === 'active'
                          ? 'bg-green-600/20 text-green-400'
                          : trainer.status === 'inactive'
                            ? 'bg-red-600/20 text-red-400'
                            : 'bg-yellow-600/20 text-yellow-400'
                      }`}
                    >
                      {trainer.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEditTrainer(trainer)}
                      className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-xs uppercase tracking-wider py-2 transition-all"
                      title="Edit trainer information"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(trainer)}
                      className={`font-black text-xs uppercase tracking-wider py-2 transition-all ${
                        trainer.status === 'active'
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      title={trainer.status === 'active' ? 'Deactivate trainer' : 'Activate trainer'}
                    >
                      {trainer.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteTrainer(trainer)}
                      className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black text-xs uppercase tracking-wider py-2 transition-all"
                      title="Permanently delete this trainer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#2B2621] rounded-lg border-2 border-dashed border-[#F4D03F]/30">
            <p className="text-gray-400 text-lg font-bold mb-4">No trainers found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black px-8 py-3 uppercase tracking-wider transition-all"
            >
              + Add Your First Trainer
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Trainer Modal */}
      {showAddModal && <AddTrainerModal trainer={editingTrainer} onClose={handleCloseModal} onSuccess={handleRefreshTrainers} />}
    </div>
  );
}
