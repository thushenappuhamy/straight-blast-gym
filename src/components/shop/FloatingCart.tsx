'use client';

import { useCart } from '@/src/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

export function FloatingCart() {
  const { items } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Don't show the floating cart if cart is empty, we are already on the checkout page, or on admin routes
  if (itemCount === 0 || pathname === '/dashboard/orders' || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <button
      onClick={() => router.push('/dashboard/orders')}
      className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#E63C2F] text-black shadow-[0_10px_40px_rgba(230,60,47,0.4)] transition-transform duration-300 hover:-translate-y-2 hover:scale-105 hover:bg-[#ff4e40]"
      aria-label="View Cart"
    >
      <ShoppingCart size={28} className="mr-1" />
      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#111] bg-white text-xs font-black text-black">
        {itemCount}
      </span>
    </button>
  );
}
