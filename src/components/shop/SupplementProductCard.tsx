'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/src/context/CartContext';

type SupplementProductCardProps = {
  product: {
    _id: string;
    name: string;
    category: string;
    description?: string;
    flavor?: string;
    price: number;
    discount?: number;
    rating?: number;
    image?: string;
    stock?: number;
  };
};

const fallbackGradientByCategory: Record<string, string> = {
  Protein: 'from-orange-500/35 to-[#E63C2F]/10',
  'Mass Gainer': 'from-amber-500/35 to-[#E63C2F]/10',
  Creatine: 'from-sky-500/35 to-[#E63C2F]/10',
  'Fat Burner': 'from-rose-500/35 to-[#E63C2F]/10',
  Vitamins: 'from-emerald-500/35 to-[#E63C2F]/10',
};

const getFinalPrice = (price: number, discount?: number) => {
  return discount ? price * (1 - discount / 100) : price;
};

export function SupplementProductCard({ product }: SupplementProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const finalPrice = getFinalPrice(product.price, product.discount);
  const imageGradient = fallbackGradientByCategory[product.category] || 'from-white/15 to-white/5';

  const handleAddToCart = () => {
    setIsModalOpen(true);
    setQuantity(1);
  };

  const handleConfirmAdd = () => {
    addToCart({
      id: product._id,
      name: product.name,
      details: product.flavor ? `${product.category} · ${product.flavor}` : product.category,
      price: finalPrice,
      quantity,
      image: product.image,
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsModalOpen(false);
    }, 800);
  };

  const handleProceedToBuy = () => {
    handleConfirmAdd();
    router.push('/dashboard/orders');
  };

  return (
    <>
      <article className="group overflow-hidden rounded-3xl border border-white/8 bg-white/3 shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-1 hover:border-white/12 relative">
        <div className={`relative aspect-4/3 overflow-hidden bg-linear-to-br ${imageGradient}`}>
          {product.discount ? (
            <div className="absolute left-4 top-4 z-10 rounded-full bg-[#E63C2F] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-black">
              -{product.discount}%
            </div>
          ) : null}

          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-center">
              <div>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black/25 text-4xl">
                  💊
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-white/70">
                  Image coming soon
                </p>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-black uppercase tracking-[0.24em] text-white/55">
                {product.category}
              </p>
              <h3 className="mt-1 truncate text-xl font-black uppercase tracking-tight text-white">
                {product.name}
              </h3>
            </div>
            {product.stock !== undefined ? (
              <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex min-h-12 flex-col gap-2">
            {product.flavor ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                {product.flavor}
              </p>
            ) : null}
            <p className="line-clamp-2 text-sm leading-6 text-white/60">
              {product.description || 'High-quality supplement designed to support your training goals.'}
            </p>
          </div>

          {product.rating ? (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  className="text-sm"
                  style={{ color: index < Math.round(product.rating || 0) ? '#E63C2F' : 'rgba(255,255,255,0.18)' }}
                >
                  ★
                </span>
              ))}
              <span className="ml-2 text-xs text-white/45">({product.rating})</span>
            </div>
          ) : null}

          <div className="flex items-end justify-between gap-4 border-t border-white/8 pt-4">
            <div>
              <p className="text-2xl font-black tracking-tight text-white">
                LKR {Math.round(finalPrice).toLocaleString()}
              </p>
              {product.discount ? (
                <p className="text-sm text-white/35 line-through">
                  LKR {product.price.toLocaleString()}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="rounded-full bg-[#E63C2F] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#ff4e40] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </article>

      {/* Quantity Selector Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#111] p-6 shadow-2xl">
            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
              Select Quantity
            </h3>
            <p className="text-sm text-white/60 mb-6">{product.name}</p>

            <div className="flex items-center justify-center gap-6 mb-8">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-2xl font-bold text-white transition-colors hover:bg-white/10"
              >
                -
              </button>
              <span className="text-3xl font-black text-white w-12 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-2xl font-bold text-white transition-colors hover:bg-white/10"
              >
                +
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleProceedToBuy}
                className="w-full rounded-full bg-[#E63C2F] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition-colors hover:bg-[#ff4e40]"
              >
                Proceed to Buy
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                disabled={isAdded}
                className={`w-full rounded-full border px-4 py-3 text-sm font-black uppercase tracking-[0.2em] transition-colors ${
                  isAdded
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-white/20 bg-transparent text-white hover:bg-white/5'
                }`}
              >
                {isAdded ? 'Added ✓' : 'Add & Continue Shopping'}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="mt-2 text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white/70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}