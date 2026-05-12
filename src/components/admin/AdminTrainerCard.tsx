'use client';

import React from 'react';
import { Clock, Users, Pencil, Power, Trash2 } from 'lucide-react';

interface AdminTrainerCardProps {
  trainer: any;
  onEdit: (trainer: any) => void;
  onToggleStatus: (trainer: any) => void;
  onDelete: (trainer: any) => void;
}

export default function AdminTrainerCard({
  trainer,
  onEdit,
  onToggleStatus,
  onDelete,
}: AdminTrainerCardProps) {
  const isActive = trainer?.status === 'active';

  return (
    <article className="rounded-xl border border-white/10 bg-white/2 overflow-hidden hover:border-[#E63C2F]/35 hover:bg-white/4 transition-colors">
      <div className="p-5 border-b border-white/10 bg-linear-to-r from-[#E63C2F]/12 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wide">
              {trainer?.firstName} {trainer?.lastName}
            </h3>
            <p className="text-xs text-white/50 mt-1">{trainer?.email || 'No email'}</p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isActive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/10 text-white/65 border border-white/20'
              }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="inline-flex px-2.5 py-1 rounded-md bg-[#E63C2F]/15 text-[#E63C2F] text-[11px] font-bold uppercase tracking-wider border border-[#E63C2F]/30">
          {trainer?.specialty || 'General Training'}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/2 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-wide mb-2">
            <Clock size={14} /> Shift Hours
          </div>
          <p className="text-sm text-white">
            {trainer?.shiftStartTime || '06:00'} - {trainer?.shiftEndTime || '22:00'}
          </p>
          <p className="text-xs text-white/45 mt-1 line-clamp-2">
            {Array.isArray(trainer?.shiftDays) && trainer.shiftDays.length > 0
              ? trainer.shiftDays.join(', ')
              : 'No shift days set'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-lg border border-white/10 p-3">
          <div>
            <p className="text-[10px] text-white/45 uppercase tracking-wider">Experience</p>
            <p className="text-lg font-black text-white">{trainer?.experience || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/45 uppercase tracking-wider">Clients</p>
            <p className="text-lg font-black text-white">{trainer?.assignedClients?.length || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/45 uppercase tracking-wider">Session</p>
            <p className="text-lg font-black text-[#E63C2F]">
              {typeof trainer?.costPerSession === 'number'
                ? `LKR ${trainer.costPerSession.toLocaleString()}`
                : 'LKR 0'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onEdit(trainer)}
            className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <Pencil size={13} /> Edit
          </button>

          <button
            onClick={() => onToggleStatus(trainer)}
            className={`inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider ${isActive
                ? 'bg-amber-600/85 hover:bg-amber-600 text-white'
                : 'bg-emerald-600/85 hover:bg-emerald-600 text-white'
              }`}
          >
            <Power size={13} /> {isActive ? 'Deactivate' : 'Activate'}
          </button>

          <button
            onClick={() => onDelete(trainer)}
            className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-[#E63C2F]/50 text-[#E63C2F] hover:bg-[#E63C2F]/10 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}
