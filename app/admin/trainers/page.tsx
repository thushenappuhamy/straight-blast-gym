'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Loader } from 'lucide-react';
import AddTrainerModal from '@/components/admin/AddTrainerModal';
import Toast from '@/src/components/ui/Toast';
import {
  AdminHeader,
  AdminLayout,
  AdminSidebar,
  AdminStatsGrid,
  AdminTrainerCard,
} from '@/src/components/admin';

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);

  const fetchTrainers = async () => {
    try {
      const response = await fetch('/api/admin/trainers', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch trainers');
      }

      setTrainers(data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
    const interval = setInterval(fetchTrainers, 30000);
    return () => clearInterval(interval);
  }, []);

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
      const response = await fetch(`/api/admin/trainers/${trainer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...trainer, status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update trainer status');
      }

      setToast({ message: 'Trainer status updated successfully!', type: 'success' });
      await fetchTrainers();
    } catch (err: any) {
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  const handleDeleteTrainer = async (trainer: any) => {
    const confirmMsg = `Are you sure you want to delete ${trainer.firstName} ${trainer.lastName}? This cannot be undone.`;
    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetch(`/api/admin/trainers/${trainer._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete trainer');
      }

      setTrainers((prev) => prev.filter((t) => t._id !== trainer._id));
      setToast({ message: 'Trainer deleted successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  const filteredTrainers = useMemo(() => {
    if (!searchQuery.trim()) return trainers;
    const q = searchQuery.toLowerCase();

    return trainers.filter((trainer) => {
      const fullName = `${trainer?.firstName || ''} ${trainer?.lastName || ''}`.toLowerCase();
      return (
        fullName.includes(q) ||
        `${trainer?.email || ''}`.toLowerCase().includes(q) ||
        `${trainer?.specialty || ''}`.toLowerCase().includes(q) ||
        `${trainer?.status || ''}`.toLowerCase().includes(q)
      );
    });
  }, [trainers, searchQuery]);

  const total = trainers.length;
  const active = trainers.filter((t) => t.status === 'active').length;
  const inactive = trainers.filter((t) => t.status === 'inactive').length;
  const avgCost =
    total > 0
      ? Math.round(
          trainers.reduce((sum, t) => sum + (typeof t.costPerSession === 'number' ? t.costPerSession : 0), 0) /
            total
        )
      : 0;

  const stats = [
    { icon: '🏋️', label: 'Total Trainers', value: total },
    { icon: '✅', label: 'Active Trainers', value: active },
    { icon: '⏸️', label: 'Inactive Trainers', value: inactive },
    { icon: '💰', label: 'Avg Session Rate', value: `LKR ${avgCost.toLocaleString()}` },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin mx-auto mb-4 text-[#E63C2F]" />
          <p className="text-xl font-bold text-white">Loading trainers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AdminLayout
        sidebar={<AdminSidebar />}
        header={
          <AdminHeader
            title="Trainers"
            description="Manage coaching staff, shift schedules, and pricing"
            actionButton={{
              label: '+ Add Trainer',
              onClick: () => {
                setEditingTrainer(null);
                setShowAddModal(true);
              },
            }}
          />
        }
      >
        <div className="rounded-xl border border-[#E63C2F]/35 bg-[#E63C2F]/10 p-5">
          <h2 className="font-black text-white mb-2">Failed to load trainers</h2>
          <p className="text-white/70 text-sm mb-4">{error}</p>
          <button
            onClick={fetchTrainers}
            className="bg-[#E63C2F] hover:bg-[#cf3529] text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      sidebar={<AdminSidebar />}
      header={
        <AdminHeader
          title="Trainers"
          description="Manage coaching staff, shift schedules, and pricing"
          searchPlaceholder="Search trainer, specialty, email, status..."
          onSearch={setSearchQuery}
          actionButton={{
            label: '+ Add Trainer',
            onClick: () => {
              setEditingTrainer(null);
              setShowAddModal(true);
            },
            variant: 'primary',
          }}
        />
      }
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="space-y-6">
        <AdminStatsGrid stats={stats} columns={4} />

        {filteredTrainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredTrainers.map((trainer) => (
              <AdminTrainerCard
                key={trainer._id}
                trainer={trainer}
                onEdit={handleEditTrainer}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTrainer}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-14 rounded-xl border border-white/10 bg-white/2">
            <p className="text-white/60 text-base font-semibold mb-5">No trainers found</p>
            <button
              onClick={() => {
                setEditingTrainer(null);
                setShowAddModal(true);
              }}
              className="bg-[#E63C2F] hover:bg-[#cf3529] text-white font-black px-6 py-2.5 rounded-lg text-sm uppercase tracking-wider transition-colors"
            >
              + Add Your First Trainer
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddTrainerModal
          trainer={editingTrainer}
          onClose={handleCloseModal}
          onSuccess={fetchTrainers}
        />
      )}
    </AdminLayout>
  );
}
