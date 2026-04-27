'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, Dumbbell, Pill, Medal, Calendar, CreditCard, TrendingUp, Settings, Lock } from 'lucide-react';

const managementItems = [
  { icon: 'chart', label: 'Dashboard', href: '/admin/dashboard', badge: null },
  { icon: 'users', label: 'Members', href: '/admin/members', badge: 483 },
  { icon: 'dumbbell', label: 'Trainers', href: '/admin/trainers', badge: null },
  { icon: 'pill', label: 'Supplements', href: '/admin/supplements', badge: null },
  { icon: 'medal', label: 'Memberships', href: '/admin/memberships', badge: null },
  { icon: 'calendar', label: 'Bookings', href: '/admin/bookings', badge: 4 },
  { icon: 'lock', label: 'Staff Management', href: '/admin/staff', badge: null },
];

const financeItems = [
  { icon: 'card', label: 'Transactions', href: '/admin/transactions' },
  { icon: 'trending', label: 'Analytics', href: '/admin/analytics' },
];

const systemItems = [
  { icon: 'settings', label: 'Settings', href: '/admin/settings' },
];

function getIcon(iconName: string) {
  const iconProps = { size: 20, className: 'text-current' };
  switch(iconName) {
    case 'chart': return <BarChart3 {...iconProps} />;
    case 'users': return <Users {...iconProps} />;
    case 'dumbbell': return <Dumbbell {...iconProps} />;
    case 'pill': return <Pill {...iconProps} />;
    case 'medal': return <Medal {...iconProps} />;
    case 'calendar': return <Calendar {...iconProps} />;
    case 'card': return <CreditCard {...iconProps} />;
    case 'trending': return <TrendingUp {...iconProps} />;
    case 'settings': return <Settings {...iconProps} />;
    case 'lock': return <Lock {...iconProps} />;
    default: return null;
  }
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#1A1816] border-r border-[#2B2621] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#2B2621]">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="SBG Logo" className="w-12 h-12 rounded-full" />
          <div className="flex flex-col leading-none">
            <span className="text-[#F4D03F] font-black text-lg uppercase tracking-tight">
              SBG Admin
            </span>
            <span className="text-gray-500 text-xs uppercase tracking-wider">
              Control Panel
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {/* Management Section */}
        <div className="mb-6">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider px-3">
            Management
          </span>
          <ul className="mt-3 space-y-1">
            {managementItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-3 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-[#3A3621] text-[#F4D03F] border-l-4 border-[#F4D03F]'
                      : 'text-gray-400 hover:bg-[#2B2621] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span>{getIcon(item.icon)}</span>
                    <span className="uppercase tracking-wider">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#F4D03F] text-black text-xs font-black rounded-full w-6 h-6 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Finance Section */}
        <div className="mb-6">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider px-3">
            Finance
          </span>
          <ul className="mt-3 space-y-1">
            {financeItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-[#3A3621] text-[#F4D03F] border-l-4 border-[#F4D03F]'
                      : 'text-gray-400 hover:bg-[#2B2621] hover:text-white'
                  }`}
                >
                  <span>{getIcon(item.icon)}</span>
                  <span className="uppercase tracking-wider">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* System Section */}
        <div>
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider px-3">
            System
          </span>
          <ul className="mt-3 space-y-1">
            {systemItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-[#3A3621] text-[#F4D03F] border-l-4 border-[#F4D03F]'
                      : 'text-gray-400 hover:bg-[#2B2621] hover:text-white'
                  }`}
                >
                  <span>{getIcon(item.icon)}</span>
                  <span className="uppercase tracking-wider">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Admin Profile */}
      <div className="p-4 border-t border-[#2B2621]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F4D03F] flex items-center justify-center">
            <span className="text-black text-xl font-black">A</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-sm">Admin</span>
            <span className="text-gray-500 text-xs uppercase tracking-wider">
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
