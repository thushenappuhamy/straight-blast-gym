import React, { useState, useEffect } from 'react';
import { Bell, Package, AlertCircle } from 'lucide-react';
import Toast from '@/src/components/ui/Toast';

interface AdminHeaderProps {
  title: string;
  description?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export default function AdminHeader({
  title,
  description,
  actionButton,
  searchPlaceholder,
  onSearch,
}: AdminHeaderProps) {
  const [lowStockSupplements, setLowStockSupplements] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        const response = await fetch('/api/admin/supplements');
        const data = await response.json();
        if (data.success) {
          const lowStock = data.data.filter((s: any) => (s.stock || 0) <= 10);
          setLowStockSupplements(lowStock);
        }
      } catch (err) {
        console.error('Failed to fetch supplements for notifications', err);
      }
    };
    fetchSupplements();
    // Refresh every 5 minutes
    const interval = setInterval(fetchSupplements, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lowStockSupplements.length > 0 && !hasNotified) {
      setToast({
        message: `${lowStockSupplements.length} supplements are low on stock!`,
        type: 'error'
      });
      setHasNotified(true);
    } else if (lowStockSupplements.length === 0) {
      setHasNotified(false);
    }
  }, [lowStockSupplements, hasNotified]);

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#E63C2F]/10 to-transparent p-6 mb-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-white/60 text-sm mt-2">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {searchPlaceholder && onSearch && (
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#E63C2F]/50 transition-colors"
            />
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors relative"
            >
              <Bell size={20} />
              {lowStockSupplements.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E63C2F] rounded-full animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Notifications</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#E63C2F]/20 text-[#E63C2F] text-[10px] font-bold uppercase">
                      {lowStockSupplements.length} alerts
                    </span>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {lowStockSupplements.length > 0 ? (
                    lowStockSupplements.map((item) => (
                      <div key={item._id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Package size={20} className="text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white mb-1">{item.name}</p>
                            <p className="text-xs text-white/50 mb-2">Inventory is running low</p>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase">
                                {item.stock} left
                              </span>
                              <span className="text-[10px] text-[#E63C2F] font-bold uppercase tracking-wider">Restock Required</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <Bell size={24} className="text-white/20" />
                      </div>
                      <p className="text-sm text-white/40">No new notifications</p>
                      <p className="text-[10px] text-white/20 uppercase mt-1 tracking-widest">Everything is up to date</p>
                    </div>
                  )}
                </div>
                {lowStockSupplements.length > 0 && (
                  <button
                    onClick={() => {
                      window.location.href = '/admin/supplements';
                      setShowNotifications(false);
                    }}
                    className="w-full p-3 text-[10px] font-black text-white/40 hover:text-[#E63C2F] hover:bg-white/5 transition-all uppercase tracking-[0.2em] border-t border-white/10"
                  >
                    View Inventory Management →
                  </button>
                )}
              </div>
            )}
          </div>

          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className={`px-4 md:px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors ${actionButton.variant === 'secondary'
                ? 'border border-[#E63C2F] text-[#E63C2F] hover:bg-[#E63C2F]/10'
                : 'bg-[#E63C2F] text-white hover:bg-[#E63C2F]/90'
                }`}
            >
              {actionButton.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
