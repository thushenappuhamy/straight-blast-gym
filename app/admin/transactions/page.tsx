'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Calendar, CreditCard, Loader, Plus, X } from 'lucide-react';
import Toast from '@/src/components/ui/Toast';

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
              date: new Date(member.createdAt).toLocaleDateString(),
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
              date: new Date(txn.date).toLocaleDateString(),
              status: txn.status,
              typeIcon: txn.type.toLowerCase().includes('supplement') ? 'supplement' : txn.type.toLowerCase().includes('trainer') ? 'trainer' : 'membership',
              isRefund: txn.status === 'REFUNDED',
            });
          });
        }

        // Sort by date (newest first)
        allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
      subtextColor: 'text-green-500',
    },
    {
      icon: ShoppingCart,
      value: `LKR ${(stats.supplementSales / 1000).toFixed(0)}K`,
      label: 'Supplement Sales',
      subtext: null,
      subtextColor: '',
    },
    {
      icon: Calendar,
      value: `LKR ${(stats.trainerSessions / 1000).toFixed(0)}K`,
      label: 'Trainer Sessions',
      subtext: null,
      subtextColor: '',
    },
    {
      icon: CreditCard,
      value: `LKR ${(stats.membershipFees / 1000).toFixed(0)}K`,
      label: 'Membership Fees',
      subtext: null,
      subtextColor: '',
    },
  ];

  const typeOptions = ['All Types', 'Membership', 'Supplement Order', 'Trainer Booking', 'Refund'];
  const dateOptions = ['This Month', 'Last Month', 'Last 3 Months', 'All Time'];
  const statusOptions = ['All Status', 'COMPLETED', 'PROCESSING', 'REFUNDED'];

  const statusStyles: Record<string, string> = {
    COMPLETED: 'text-green-600',
    PROCESSING: 'text-orange-500',
    REFUNDED: 'text-pink-500',
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
    return matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin mx-auto mb-4 text-[var(--primary)]" />
          <p className="text-xl font-bold">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header */}
      <div className="bg-white px-8 py-6" style={{ borderBottomWidth: '4px', borderBottomColor: 'var(--primary)' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tight">Transactions</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-[var(--primary)] border-2 border-[var(--primary)] font-black text-xs uppercase tracking-wider px-5 py-3 hover:bg-[var(--primary)] hover:text-black transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Record Cash Payment
            </button>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="border-2 border-gray-300 text-gray-800 font-black text-xs uppercase tracking-wider px-5 py-3 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? '📥 Exporting...' : '📥 Export CSV'}
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={exporting}
              className="bg-[var(--primary)] hover:bg-[var(--primary-light)] text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? '📄 Generating...' : '📄 Generate Report'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div key={index} className="bg-[#2B2621] p-6 relative overflow-hidden">
                <IconComponent size={32} className="text-[var(--primary)] opacity-40 mb-3" />
                <div className="text-4xl font-black text-[var(--primary)] mb-2">{card.value}</div>
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{card.label}</div>
                {card.subtext && (
                  <div className={`text-sm font-bold ${card.subtextColor}`}>{card.subtext}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Transactions Table */}
        <div className="bg-white shadow-lg">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-black uppercase tracking-tight">All Transactions</h2>
            <div className="flex items-center gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-[var(--primary)]"
              >
                {typeOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-[var(--primary)]"
              >
                {dateOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-[var(--primary)]"
              >
                {statusOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2B2621]">
                <tr>
                  {['ID', 'Member', 'Type', 'Amount', 'Payment', 'Date', 'Status', 'Action'].map((col) => (
                    <th key={col} className="px-6 py-4 text-left text-xs font-black text-[var(--primary)] uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((txn, idx) => (
                    <tr key={txn.id || idx} className="hover:bg-gray-50/50 transition-colors">
                    {/* ID */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 text-sm">
                      {txn.id}
                    </td>
                    {/* Member */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${getAvatarColor(txn.member)} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-black font-black text-sm">{getInitials(txn.member)}</span>
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{txn.member}</span>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${getTypeIconBg(txn.type)} flex items-center justify-center text-sm flex-shrink-0`}>
                          {getTypeIcon(txn.typeIcon)}
                        </div>
                        <span className="text-gray-700 text-sm">{txn.type}</span>
                      </div>
                    </td>
                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-black text-sm ${txn.isRefund ? 'text-red-500' : 'text-gray-900'}`}>
                        {txn.isRefund ? '-' : ''}LKR {txn.amount.toLocaleString()}
                      </span>
                    </td>
                    {/* Payment */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-sm">
                      {txn.payment}
                    </td>
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-sm">
                      {txn.date}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-bold uppercase tracking-wider ${statusStyles[txn.status]}`}>
                        {txn.status}
                      </span>
                    </td>
                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {txn.status === 'PROCESSING' && (
                          <button
                            onClick={() => handleSettle(txn.dbId || txn.id)}
                            className="text-xs font-black uppercase px-3 py-1 bg-green-500 text-white hover:bg-green-600 tracking-wider shadow-sm"
                          >
                            Settle
                          </button>
                        )}
                        <button className="text-xs font-bold uppercase px-3 py-1 border border-gray-300 text-gray-700 hover:bg-gray-100 tracking-wider">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center p-8 text-gray-500">No transactions found</div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} transactions
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-800 border border-gray-300 disabled:opacity-50"
              >
                ← Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-sm border ${currentPage === i + 1
                    ? 'font-bold bg-[var(--primary)] text-black border-[var(--primary)]'
                    : 'text-gray-600 hover:bg-gray-100 border-gray-300'
                    }`}
                >
                  {i + 1}
                </button>
              )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-800 border border-gray-300 disabled:opacity-50"
              >
                Next →
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
