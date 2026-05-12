'use client';

import { useCart } from '@/src/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

export function FloatingCart() {
  const { items } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Don't show the floating cart if cart is empty, we are already on the checkout page, on admin routes, or on auth/home pages
  const isExcludedPage = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/dashboard/orders' || 
    pathname?.startsWith('/admin');

  if (itemCount === 0 || isExcludedPage) {
    return null;
  }

  return (
    <button
      onClick={() => router.push('/dashboard/orders')}
      className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_40px_rgba(230,60,47,0.4)] transition-all duration-300 hover:-translate-y-2 hover:scale-110 active:scale-95"
      aria-label="View Cart"
    >
      <ShoppingCart size={28} />
      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-foreground text-[10px] font-black text-background">
        {itemCount}
      </span>
    </button>
  );
}
