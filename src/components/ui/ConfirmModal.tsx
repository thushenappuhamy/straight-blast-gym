'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bg: 'bg-red-500',
      text: 'text-red-500',
      border: 'border-red-500/20',
      hover: 'hover:bg-red-600',
    },
    warning: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-500',
      border: 'border-yellow-500/20',
      hover: 'hover:bg-yellow-600',
    },
    info: {
      bg: 'bg-blue-500',
      text: 'text-blue-500',
      border: 'border-blue-500/20',
      hover: 'hover:bg-blue-600',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${style.bg}/10 ${style.text}`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            {message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/5 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 rounded-xl ${style.bg} text-black font-black uppercase tracking-wider text-xs ${style.hover} transition-all active:scale-95 shadow-lg shadow-${variant}-500/20`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
