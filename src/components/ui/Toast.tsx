'use client';

import { useEffect } from 'react';

type ToastProps = {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
};

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 rounded-lg border px-5 py-3 text-sm font-bold text-white shadow-lg ${
        type === 'success' ? 'border-green-500 bg-green-500/95' : 'border-red-500 bg-red-500/95'
      }`}
    >
      <div className="flex items-start gap-4">
        <span>{message}</span>
        <button type="button" onClick={onClose} className="text-white/80 transition-colors hover:text-white">
          ×
        </button>
      </div>
    </div>
  );
}
