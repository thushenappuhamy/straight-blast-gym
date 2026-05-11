'use client';

type ShopFiltersSidebarProps = {
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (value: number) => void;
  onApplyFilters: () => void;
};

export function ShopFiltersSidebar({
  categories,
  selectedCategories,
  onToggleCategory,
  priceRange,
  onPriceRangeChange,
  onApplyFilters,
}: ShopFiltersSidebarProps) {
  return (
    <aside className="lg:w-85 shrink-0 lg:sticky lg:top-8 lg:self-start">
      <div className="rounded-3xl border border-white/8 bg-white/3 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="mb-5 border-b border-white/8 pb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-white/40">Shop Sidebar</p>
          <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white">Filters</h2>
        </div>

        <div className="mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/45">Category</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onToggleCategory(category)}
                  className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-200 ${
                    isActive
                      ? 'bg-[#E63C2F] text-black shadow-[0_12px_30px_rgba(230,60,47,0.25)]'
                      : 'bg-white/4 text-white/80 hover:bg-white/9 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/45">Price Range</p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
            <input
              type="range"
              min="0"
              max="50000"
              value={priceRange[1]}
              onChange={(event) => onPriceRangeChange(Number(event.target.value))}
              className="shop-range w-full cursor-pointer appearance-none"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-white/45">
              <span>LKR {priceRange[0].toLocaleString()}</span>
              <span>LKR {priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onApplyFilters}
          className="w-full rounded-2xl bg-[#E63C2F] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#ff4e40]"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  );
}