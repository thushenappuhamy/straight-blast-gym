'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Calendar, 
  CreditCard, 
  Loader, 
  Plus, 
  X, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Filter,
  Search
} from 'lucide-react';
import Toast from '@/src/components/ui/Toast';
import TransactionDetailModal from '@/src/components/admin/TransactionDetailModal';

const formatDateSafe = (dateStr: any) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

export default function AdminTransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [dateFilter, setDateFilter] = useState('This Month');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    supplementSales: 0,
    trainerSessions: 0,
    membershipFees: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [newTxn, setNewTxn] = useState({
    memberId: '',
    memberName: '',
    type: 'Membership',
    amount: '',
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0],
    reference: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  // Fetch all transaction data from endpoints
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [membersRes, supplementsRes, bookingsRes, realTxnsRes] = await Promise.all([
          fetch('/api/admin/members', { headers }),
          fetch('/api/supplements', { headers }),
          fetch('/api/admin/bookings', { headers }),
          fetch('/api/admin/transactions', { headers }),
        ]);

        const membersData = await membersRes.json();
        const supplementsData = await supplementsRes.json();
        const bookingsData = await bookingsRes.json();
        const realTxnsData = await realTxnsRes.json();

        if (membersData.data) setMembers(membersData.data);

        const allTransactions: any[] = [];
        let supplementSales = 0;
        let trainerSessions = 0;
        let membershipFees = 0;

        // Process membership transactions from members (Historical/Legacy)
        if (membersData.data) {
          membersData.data.forEach((member: any) => {
            const plan = member.plan?.toUpperCase() || 'BASIC';
            const planPrices: Record<string, number> = {
              GOLD: 5000,
              ELITE: 8000,
              BASIC: 2500,
            };
            const amount = planPrices[plan] || 0;
            membershipFees += amount;

            const typeMap: Record<string, string> = {
              GOLD: 'Gold Membership',
              ELITE: 'Elite Membership',
              BASIC: 'Basic Membership',
            };

            allTransactions.push({
              id: `#TXN-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
              member: member.firstName ? `${member.firstName} ${member.lastName}` : (member.name || 'Unknown'),
              type: typeMap[plan] || 'Membership',
              amount,
              payment: 'PayHere',
              date: formatDateSafe(member.createdAt),
              rawDate: member.createdAt,
              status: member.status === 'ACTIVE' ? 'COMPLETED' : 'PROCESSING',
              typeIcon: 'membership',
              isRefund: false,
            });
          });
        }

        // Process real transactions from DB
        if (realTxnsData.success && realTxnsData.data) {
          realTxnsData.data.forEach((txn: any) => {
            if (txn.type.includes('Supplement')) supplementSales += txn.amount;
            else if (txn.type.includes('Trainer')) trainerSessions += txn.amount;
            else membershipFees += txn.amount;

            allTransactions.push({
              id: `#TXN-${txn._id.slice(-4).toUpperCase()}`,
              dbId: txn._id,
              member: txn.memberName,
              type: txn.type,
              amount: txn.amount,
              payment: txn.paymentMethod,
              date: formatDateSafe(txn.date),
              rawDate: txn.date || txn.createdAt,
              status: txn.status,
              typeIcon: txn.type.toLowerCase().includes('supplement') ? 'supplement' : txn.type.toLowerCase().includes('trainer') ? 'trainer' : 'membership',
              isRefund: txn.status === 'REFUNDED',
            });
          });
        }

        // Sort by rawDate (newest first)
        allTransactions.sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime());

        setTransactions(allTransactions);
        setStats({
          monthlyRevenue: supplementSales + trainerSessions + membershipFees,
          supplementSales,
          trainerSessions,
          membershipFees,
        });
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      icon: DollarSign,
      value: `LKR ${(stats.monthlyRevenue / 1000000).toFixed(1)}M`,
      label: 'Monthly Revenue',
      subtext: '↑ 18%',
      color: 'text-[#E63C2F]',
      bg: 'bg-[#E63C2F]/10',
    },
    {
      icon: ShoppingCart,
      value: `LKR ${(stats.supplementSales / 1000).toFixed(0)}K`,
      label: 'Supplement Sales',
      subtext: 'Last 30 Days',
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
    },
    {
      icon: Calendar,
      value: `LKR ${(stats.trainerSessions / 1000).toFixed(0)}K`,
      label: 'Trainer Sessions',
      subtext: 'Active Bookings',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
    {
      icon: CreditCard,
      value: `LKR ${(stats.membershipFees / 1000).toFixed(0)}K`,
      label: 'Membership Fees',
      subtext: 'Recurring Revenue',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ];

  const typeOptions = ['All Types', 'Membership', 'Supplement Order', 'Trainer Booking', 'Refund'];
  const dateOptions = ['This Month', 'Last Month', 'Last 3 Months', 'All Time'];
  const statusOptions = ['All Status', 'COMPLETED', 'PROCESSING', 'REFUNDED'];

  const statusStyles: Record<string, string> = {
    COMPLETED: 'text-green-400 border-green-400/20 bg-green-400/5',
    PROCESSING: 'text-orange-400 border-orange-400/20 bg-orange-400/5',
    REFUNDED: 'text-pink-400 border-pink-400/20 bg-pink-400/5',
  };

  const getTypeIcon = (typeIcon: string) => {
    const iconProps = { size: 16, className: 'text-current' };
    switch (typeIcon) {
      case 'supplement':
        return <ShoppingCart {...iconProps} />;
      case 'trainer':
        return <Calendar {...iconProps} />;
      case 'membership':
        return <CreditCard {...iconProps} />;
      default:
        return null;
    }
  };

  const getTypeIconBg = (type: string) => {
    if (type.includes('Supplement')) return 'bg-orange-100';
    if (type.includes('Trainer')) return 'bg-yellow-100';
    if (type.includes('Membership')) return 'bg-purple-100';
    return 'bg-gray-100';
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-orange-400', 'bg-green-400', 'bg-pink-400'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/export/transactions-csv', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to export: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToast({ message: 'Transactions CSV exported successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: `Export failed: ${error.message}`, type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  // Generate Report
  const handleGenerateReport = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/export/transactions-report', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaction-report_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToast({ message: 'Transaction report generated successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: `Report generation failed: ${error.message}`, type: 'error' });
    } finally {
      setExporting(false);
    }
  };
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newTxn,
          amount: parseFloat(newTxn.amount)
        })
      });

      const data = await response.json();
      if (data.success) {
        setToast({ message: 'Transaction recorded successfully!', type: 'success' });
        setShowAddModal(false);
        // Trigger re-fetch
        window.location.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettle = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/transactions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status: 'COMPLETED' })
      });

      const data = await response.json();
      if (data.success) {
        setToast({ message: 'Transaction settled successfully!', type: 'success' });
        window.location.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchType = typeFilter === 'All Types' || t.type.includes(typeFilter.split(' ')[0]);
    const matchStatus = statusFilter === 'All Status' || t.status === statusFilter;
    const matchSearch = t.member.toLowerCase().includes(search.toLowerCase()) || (t.id || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans selection:bg-[#E63C2F]/30">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {selectedTransaction && (
        <TransactionDetailModal
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          transaction={selectedTransaction}
        />
      )}

      {/* Header Section */}
      <div className="relative overflow-hidden bg-white/[0.02] border-b border-white/10 px-8 py-10">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-[#E63C2F]/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#E63C2F] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E63C2F]">Finance Dashboard</span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
              Financial <span className="text-[#E63C2F]">Flows</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#E63C2F] text-black font-black uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-[#E63C2F]/90 transition-all active:scale-[0.98] shadow-xl shadow-[#E63C2F]/20 text-xs"
            >
              <Plus size={18} />
              Record Cash
            </button>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-white/10 transition-all active:scale-[0.98] text-xs disabled:opacity-50"
            >
              <Download size={18} />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={exporting}
              className="flex items-center gap-2 bg-white text-black font-black uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-[0.98] text-xs disabled:opacity-50 shadow-xl"
            >
              <FileText size={18} />
              {exporting ? 'Generating...' : 'Report'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Stat Cards - Premium Dark Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="group relative bg-white/[0.02] border border-white/5 rounded-3xl p-6 transition-all hover:bg-white/[0.04] hover:border-white/10 overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-full blur-3xl opacity-20 -mr-8 -mt-8 transition-transform group-hover:scale-150`} />
                <div className={`p-3 rounded-2xl ${card.bg} ${card.color} w-fit mb-4`}>
                  <Icon size={24} />
                </div>
                <div className={`text-3xl font-black mb-1 tabular-nums ${card.color}`}>{card.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30">{card.label}</div>
                {card.subtext && (
                  <div className="text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full bg-white/5 w-fit text-white/40">
                    {card.subtext}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Filters and Table Area */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          <div className="p-8 border-b border-white/5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[#E63C2F]/10 text-[#E63C2F]">
                  <Filter size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Ledger History</h2>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Total {filtered.length} entries found</p>
                </div>
              </div>
              
              <div className="hidden xl:flex items-center gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 focus:border-[#E63C2F]/40 outline-none"
                >
                  {typeOptions.map((opt) => <option key={opt} className="bg-[#1A1A1A]">{opt}</option>)}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 focus:border-[#E63C2F]/40 outline-none"
                >
                  {statusOptions.map((opt) => <option key={opt} className="bg-[#1A1A1A]">{opt}</option>)}
                </select>
              </div>
            </div>
            
            <div className="relative group w-full xl:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#E63C2F] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search member, ID, reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-[#E63C2F]/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.01]">
                  {['Transaction ID', 'Member', 'Category', 'Amount', 'Payment', 'Date', 'Status', 'Actions'].map((col) => (
                    <th
                      key={col}
                      className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <CreditCard size={48} />
                        <p className="text-sm font-black uppercase tracking-widest">No transactions discovered</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((txn, idx) => (
                    <tr key={txn.id || idx} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black font-mono text-white/40 group-hover:text-[#E63C2F] transition-colors">
                          {txn.id}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl ${getAvatarColor(txn.member)} flex items-center justify-center shadow-lg`}>
                            <span className="text-black font-black text-xs">{getInitials(txn.member)}</span>
                          </div>
                          <div className="max-w-[150px]">
                            <p className="font-bold text-white text-sm truncate" title={txn.member}>{txn.member}</p>
                            <p className="text-[10px] text-white/20 uppercase font-black tracking-wider">Client</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${getTypeIconBg(txn.type)} flex items-center justify-center text-black shadow-inner`}>
                            {getTypeIcon(txn.typeIcon)}
                          </div>
                          <span className="text-white/80 text-xs font-medium uppercase tracking-tight">{txn.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-sm font-black tabular-nums ${txn.isRefund ? 'text-red-500' : 'text-white'}`}>
                          {txn.isRefund ? '-' : ''}LKR {txn.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{txn.payment}</span>
                          <div className="w-8 h-0.5 bg-white/10 mt-1 rounded-full overflow-hidden">
                            <div className="w-1/2 h-full bg-[#E63C2F]/40" />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-white/40 text-xs font-medium">
                        {txn.date}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${statusStyles[txn.status]}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedTransaction(txn)}
                            className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-[#E63C2F]/10 hover:text-[#E63C2F] transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
              Showing {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} transactions
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-20 transition-all"
              >
                ←
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1
                      ? 'bg-[#E63C2F] text-black shadow-lg shadow-[#E63C2F]/20'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {i + 1}
                  </button>
                )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-20 transition-all"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Record Cash Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-[#2B2621] p-6 flex justify-between items-center">
              <h2 className="text-[var(--primary)] text-xl font-black uppercase tracking-wider">Record Transaction</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:text-[var(--primary)] transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2">Select Member</label>
                <select
                  required
                  value={newTxn.memberId}
                  onChange={(e) => {
                    const member = members.find(m => m._id === e.target.value);
                    setNewTxn({ ...newTxn, memberId: e.target.value, memberName: member ? `${member.firstName} ${member.lastName}` : '' });
                  }}
                  className="w-full border-b-2 border-gray-200 py-3 focus:border-[var(--primary)] outline-none transition-all text-sm font-bold text-gray-900"
                >
                  <option value="">-- Select Member --</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.firstName} {m.lastName} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2">Transaction Type</label>
                  <select
                    value={newTxn.type}
                    onChange={(e) => setNewTxn({ ...newTxn, type: e.target.value })}
                    className="w-full border-b-2 border-gray-200 py-3 focus:border-[var(--primary)] outline-none transition-all text-sm font-bold text-gray-900"
                  >
                    <option>Membership</option>
                    <option>Supplement Order</option>
                    <option>Trainer Booking</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2">Amount (LKR)</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={newTxn.amount}
                    onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })}
                    className="w-full border-b-2 border-gray-200 py-3 focus:border-[var(--primary)] outline-none transition-all text-sm font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2">Payment Method</label>
                  <select
                    value={newTxn.paymentMethod}
                    onChange={(e) => setNewTxn({ ...newTxn, paymentMethod: e.target.value as any })}
                    className="w-full border-b-2 border-gray-200 py-3 focus:border-[var(--primary)] outline-none transition-all text-sm font-bold text-gray-900"
                  >
                    <option>Cash</option>
                    <option>Card</option>
                    <option>PayHere</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={newTxn.date}
                    onChange={(e) => setNewTxn({ ...newTxn, date: e.target.value })}
                    className="w-full border-b-2 border-gray-200 py-3 focus:border-[var(--primary)] outline-none transition-all text-sm font-bold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2">Reference / Note</label>
                <input
                  type="text"
                  placeholder="Receipt #, note, etc."
                  value={newTxn.reference}
                  onChange={(e) => setNewTxn({ ...newTxn, reference: e.target.value })}
                  className="w-full border-b-2 border-gray-200 py-3 focus:border-[var(--primary)] outline-none transition-all text-sm font-bold text-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--primary)] text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-[var(--primary-light)] transition-all shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Recording...' : 'Confirm Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
