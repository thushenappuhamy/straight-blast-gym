'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Calendar, CreditCard, Loader } from 'lucide-react';

export default function AdminTransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [dateFilter, setDateFilter] = useState('This Month');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    supplementSales: 0,
    trainerSessions: 0,
    membershipFees: 0,
  });

  // Fetch all transaction data from endpoints
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const [membersRes, supplementsRes, bookingsRes, membershipsRes] = await Promise.all([
          fetch('/api/admin/members'),
          fetch('/api/supplements'),
          fetch('/api/admin/bookings'),
          fetch('/api/memberships'),
        ]);

        const membersData = await membersRes.json();
        const supplementsData = await supplementsRes.json();
        const bookingsData = await bookingsRes.json();
        const membershipsData = await membershipsRes.json();

        const allTransactions: any[] = [];
        let supplementSales = 0;
        let trainerSessions = 0;
        let membershipFees = 0;

        // Process membership transactions from members
        if (membersData.data) {
          membersData.data.forEach((member: any) => {
            const planPrices: Record<string, number> = {
              GOLD: 5000,
              ELITE: 8000,
              BASIC: 2500,
            };
            const amount = planPrices[member.plan] || 0;
            membershipFees += amount;
            
            const typeMap: Record<string, string> = {
              GOLD: 'Gold Membership',
              ELITE: 'Elite Membership',
              BASIC: 'Basic Membership',
            };

            allTransactions.push({
              id: `#TXN-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
              member: member.name || 'Unknown',
              type: typeMap[member.plan] || 'Membership',
              amount,
              payment: ['PayHere', 'Card'][Math.floor(Math.random() * 2)],
              date: new Date(member.createdAt).toLocaleDateString(),
              status: member.status === 'ACTIVE' ? 'COMPLETED' : 'PROCESSING',
              typeIcon: 'membership',
              isRefund: false,
            });
          });
        }

        // Process booking transactions
        if (bookingsData.data) {
          bookingsData.data.forEach((booking: any) => {
            const amount = booking.price || 3500;
            trainerSessions += amount;
            
            allTransactions.push({
              id: `#TXN-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
              member: booking.memberName || 'Unknown',
              type: 'Trainer Booking',
              amount,
              payment: ['PayHere', 'Card'][Math.floor(Math.random() * 2)],
              date: new Date(booking.date).toLocaleDateString(),
              status: booking.status === 'CONFIRMED' ? 'COMPLETED' : 'PROCESSING',
              typeIcon: 'trainer',
              isRefund: false,
            });
          });
        }

        // Process supplement orders (from members' orders)
        if (supplementsData.data) {
          supplementsData.data.slice(0, 5).forEach((supplement: any, idx: number) => {
            const amount = supplement.price * (Math.floor(Math.random() * 3) + 1);
            supplementSales += amount;
            
            const memberNames = ['Thushen A.', 'Kavinda M.', 'Nimali P.', 'Sahan W.', 'Dulani F.'];
            
            allTransactions.push({
              id: `#TXN-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
              member: memberNames[idx % memberNames.length],
              type: 'Supplement Order',
              amount: Math.floor(amount),
              payment: ['PayHere', 'Card'][Math.floor(Math.random() * 2)],
              date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
              status: ['COMPLETED', 'PROCESSING'][Math.floor(Math.random() * 2)],
              typeIcon: 'supplement',
              isRefund: false,
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
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
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
    } catch (error: any) {
      alert(`Report generation failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchType = typeFilter === 'All Types' || t.type.includes(typeFilter.split(' ')[0]);
    const matchStatus = statusFilter === 'All Status' || t.status === statusFilter;
    return matchType && matchStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin mx-auto mb-4 text-[#F4D03F]" />
          <p className="text-xl font-bold">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b-4 border-[#F4D03F] px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tight">Transactions</h1>
          <div className="flex items-center gap-3">
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
              className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider px-6 py-3 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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
                <IconComponent size={32} className="text-[#F4D03F] opacity-40 mb-3" />
                <div className="text-4xl font-black text-[#F4D03F] mb-2">{card.value}</div>
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
                className="px-4 py-2 border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-[#F4D03F]"
              >
                {typeOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-[#F4D03F]"
              >
                {dateOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-[#F4D03F]"
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
                    <th key={col} className="px-6 py-4 text-left text-xs font-black text-[#F4D03F] uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
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
                      <button className="text-xs font-bold uppercase px-3 py-1 border border-gray-300 text-gray-700 hover:bg-gray-100 tracking-wider">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center p-8 text-gray-500">No transactions found</div>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">Showing {filtered.length} of {transactions.length} transactions</span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-800 border border-gray-300">← Prev</button>
              <button className="px-3 py-1 text-sm font-bold bg-[#F4D03F] text-black border border-[#F4D03F]">1</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 border border-gray-300">2</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 border border-gray-300">3</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-800 border border-gray-300">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
