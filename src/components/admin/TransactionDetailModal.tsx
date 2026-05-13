'use client';

import React from 'react';
import { X, Calendar, User, CreditCard, DollarSign, Tag, Info } from 'lucide-react';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export default function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  const statusColors: Record<string, string> = {
    COMPLETED: 'text-green-400 bg-green-400/10 border-green-400/20',
    PROCESSING: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    REFUNDED: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  };

  const detailItems = [
    { label: 'Transaction ID', value: transaction.id, icon: Tag },
    { label: 'Member Name', value: transaction.member, icon: User },
    { label: 'Type', value: transaction.type, icon: Info },
    { label: 'Amount', value: `LKR ${transaction.amount?.toLocaleString()}`, icon: DollarSign, color: transaction.isRefund ? 'text-red-500' : 'text-white' },
    { label: 'Payment Method', value: transaction.payment, icon: CreditCard },
    { label: 'Date', value: transaction.date, icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D0D0D] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div>
            <p className="text-[10px] font-black text-[#E63C2F] uppercase tracking-[0.2em] mb-1">Transaction Details</p>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Receipt Overview</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-widest ${statusColors[transaction.status] || 'text-white/40 border-white/10'}`}>
              {transaction.status}
            </div>
          </div>

          <div className="space-y-6">
            {detailItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-white/30 group-hover:text-[#E63C2F] transition-colors">
                    <item.icon size={18} />
                  </div>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{item.label}</span>
                </div>
                <span className={`text-sm font-black ${item.color || 'text-white'} uppercase tracking-tight`}>
                  {item.value || 'N/A'}
                </span>
              </div>
            ))}
          </div>

          {transaction.notes && (
            <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-white/70 italic leading-relaxed">
                "{transaction.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/[0.02] border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-[#E63C2F] text-black font-black uppercase tracking-widest hover:bg-[#E63C2F]/90 transition-all active:scale-[0.98] shadow-lg shadow-[#E63C2F]/20"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
