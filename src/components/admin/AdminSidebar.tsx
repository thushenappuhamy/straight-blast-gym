'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Users, Dumbbell, Pill, Medal, Calendar, CreditCard, TrendingUp, Settings, Lock, LogOut, Plus, Clock } from 'lucide-react';

type NavItem = {
  icon: string;
  label: string;
  href: string;
  badge?: number | null;
  small?: boolean;
};

const managementItems: NavItem[] = [
  { icon: 'chart', label: 'Dashboard', href: '/admin/dashboard', badge: null },
  { icon: 'users', label: 'Members', href: '/admin/members', badge: null },
  { icon: 'dumbbell', label: 'Trainers', href: '/admin/trainers', badge: null },
  { icon: 'pill', label: 'Supplements', href: '/admin/supplements', badge: null },
  { icon: 'medal', label: 'Memberships', href: '/admin/memberships', badge: null },
  { icon: 'calendar', label: 'Bookings', href: '/admin/bookings', badge: null },
  { icon: 'lock', label: 'Staff Management', href: '/admin/staff', badge: null },
];

const financeItems: NavItem[] = [
  { icon: 'card', label: 'Transactions', href: '/admin/transactions' },
  { icon: 'trending', label: 'Analytics', href: '/admin/analytics' },
];

const systemItems: NavItem[] = [
  { icon: 'settings', label: 'Settings', href: '/admin/settings' },
];

function getIcon(iconName: string) {
  const iconProps = { size: 20, className: 'text-current' };
  switch (iconName) {
    case 'chart': return <BarChart3 {...iconProps} />;
    case 'users': return <Users {...iconProps} />;
    case 'dumbbell': return <Dumbbell {...iconProps} />;
    case 'pill': return <Pill {...iconProps} />;
    case 'medal': return <Medal {...iconProps} />;
    case 'calendar': return <Calendar {...iconProps} />;
    case 'plus': return <Plus {...iconProps} />;
    case 'clock': return <Clock {...iconProps} />;
    case 'card': return <CreditCard {...iconProps} />;
    case 'trending': return <TrendingUp {...iconProps} />;
    case 'settings': return <Settings {...iconProps} />;
    case 'lock': return <Lock {...iconProps} />;
    default: return null;
  }
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-[#0D0D0D] border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 bg-linear-to-br from-[#E63C2F]/10 to-transparent">
        <div className="flex items-center gap-3">
          <img src="/logo_new.jpeg" alt="SBG Logo" className="w-12 h-12 rounded-full" />
          <div className="flex flex-col leading-none">
            <span className="text-white font-black text-lg uppercase tracking-tight">
              SBG Admin
            </span>
            <span className="text-[#E63C2F] text-xs uppercase tracking-wider font-semibold">
              Control Panel
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {/* Management Section */}
        <div className="mb-6">
          <span className="text-white/35 text-xs font-bold uppercase tracking-wider px-3">
            Management
          </span>
          <ul className="mt-3 space-y-1">
            {managementItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between ${item.small ? 'px-2 py-2 text-xs' : 'px-3 py-3 text-sm'} font-medium rounded-lg transition-colors ${pathname === item.href
                    ? 'bg-[#E63C2F]/15 text-[#E63C2F] border border-[#E63C2F]/40'
                    : 'text-white/65 hover:bg-white/4 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span>{getIcon(item.icon)}</span>
                    <span className="uppercase tracking-wider">{item.label}</span>
                  </div>
                  {item.badge != null && (
                    <span className="bg-[#E63C2F] text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center">
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
          <span className="text-white/35 text-xs font-bold uppercase tracking-wider px-3">
            Finance
          </span>
          <ul className="mt-3 space-y-1">
            {financeItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 ${item.small ? 'px-2 py-2 text-xs' : 'px-3 py-3 text-sm'} font-medium rounded-lg transition-colors ${pathname === item.href
                    ? 'bg-[#E63C2F]/15 text-[#E63C2F] border border-[#E63C2F]/40'
                    : 'text-white/65 hover:bg-white/4 hover:text-white'
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
          <span className="text-white/35 text-xs font-bold uppercase tracking-wider px-3">
            System
          </span>
          <ul className="mt-3 space-y-1">
            {systemItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 ${item.small ? 'px-2 py-2 text-xs' : 'px-3 py-3 text-sm'} font-medium rounded-lg transition-colors ${pathname === item.href
                    ? 'bg-[#E63C2F]/15 text-[#E63C2F] border border-[#E63C2F]/40'
                    : 'text-white/65 hover:bg-white/4 hover:text-white'
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
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#E63C2F] flex items-center justify-center">
            <span className="text-white text-xl font-black">A</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-sm">Admin</span>
            <span className="text-white/40 text-xs uppercase tracking-wider">
              Super Admin
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#E63C2F]/40 text-[#E63C2F] hover:bg-[#E63C2F]/10 transition-colors text-sm font-semibold uppercase tracking-wider"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
