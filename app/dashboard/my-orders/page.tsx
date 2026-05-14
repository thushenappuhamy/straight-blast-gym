'use client';

import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, AlertTriangle, Search, Filter, ArrowRight, Eye, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/transactions/my-transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Filter only Supplement Orders
        const supplementOrders = data.data.filter((tx: any) => 
          tx.type.toLowerCase().includes('supplement') || tx.type.toLowerCase().includes('order')
        );
        setOrders(supplementOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-[2px] w-8 bg-primary"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Member Portal</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">
              My <span className="text-primary">Orders</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-card border border-border rounded-2xl p-1">
              {['ALL', 'COMPLETED', 'PROCESSING'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order._id} className="group bg-card border border-border rounded-[2.5rem] p-8 shadow-xl hover:border-primary/30 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      <Package size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">#{order.reference || order._id.slice(-6).toUpperCase()}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                          {order.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{order.type}</h3>
                      <div className="flex flex-wrap gap-4 mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <div className="flex items-center gap-1.5"><Calendar size={12} className="text-primary" /> {new Date(order.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1.5"><CreditCard size={12} className="text-primary" /> {order.paymentMethod}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-12 border-t lg:border-t-0 pt-6 lg:pt-0 border-border">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Amount</p>
                      <p className="text-3xl font-black text-foreground tabular-nums">LKR {order.amount.toLocaleString()}</p>
                    </div>
                    <button className="w-14 h-14 rounded-2xl bg-muted hover:bg-primary hover:text-white flex items-center justify-center transition-all shadow-xl shadow-black/5">
                      <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border border-dashed rounded-[2.5rem] p-20 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={40} className="text-muted-foreground/20" />
              </div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">No Orders Found</h3>
              <p className="text-muted-foreground text-sm font-medium mb-8">You haven't placed any supplement orders yet.</p>
              <Link href="/shop" className="bg-primary hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest px-10 py-5 rounded-2xl transition-all shadow-xl shadow-primary/20">
                Explore Supplement Shop
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
