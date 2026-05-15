'use client';

import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/src/components/dashboard/DashboardSidebar';
import { useTheme } from '@/src/context/ThemeContext';
import { SupplementProductCard } from '@/src/components/shop/SupplementProductCard';

const categories = ['All Products', 'Protein', 'Mass Gainer', 'Creatine', 'Fat Burner', 'Vitamins'];

export default function SupplementShopPage() {
  const { theme, setTheme } = useTheme();
  const [supplements, setSupplements] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['All Products']);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState('Best Match');

  // Fetch supplements from API
  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        const response = await fetch('/api/admin/supplements');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch supplements');
        }

        setSupplements(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplements();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = supplements;

    // Filter by category
    if (!selectedCategories.includes('All Products')) {
      filtered = filtered.filter(s => selectedCategories.includes(s.category));
    }

    // Filter by price range
    filtered = filtered.filter(s => {
      const discountedPrice = s.discount 
        ? s.price * (1 - s.discount / 100) 
        : s.price;
      return discountedPrice >= priceRange[0] && discountedPrice <= priceRange[1];
    });

    // Sort
    if (sortBy === 'Price: Low to High') {
      filtered.sort((a, b) => {
        const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
        const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
        return priceA - priceB;
      });
    } else if (sortBy === 'Price: High to Low') {
      filtered.sort((a, b) => {
        const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
        const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
        return priceB - priceA;
      });
    } else if (sortBy === 'Top Rated') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'Newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    setFilteredProducts(filtered);
  }, [supplements, selectedCategories, priceRange, sortBy]);

  const toggleCategory = (category: string) => {
    if (category === 'All Products') {
      setSelectedCategories(['All Products']);
    } else {
      const filtered = selectedCategories.filter((c) => c !== 'All Products');
      if (selectedCategories.includes(category)) {
        const newSelection = filtered.filter((c) => c !== category);
        setSelectedCategories(newSelection.length === 0 ? ['All Products'] : newSelection);
      } else {
        setSelectedCategories([...filtered, category]);
      }
    }
  };

  const applyFilters = () => {
    setSelectedCategories([...selectedCategories]);
  };

  const clearFilters = () => {
    setSelectedCategories(['All Products']);
    setPriceRange([0, 50000]);
    setSortBy('Best Match');
  };



  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <DashboardSidebar theme={theme} onThemeChange={setTheme} />

      <main className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
        <div
          className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl sm:p-8"
          style={{
            background:
              theme === 'dark' 
                ? 'radial-gradient(circle_at_top_left,rgba(230,60,47,0.18),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))'
                : 'radial-gradient(circle_at_top_left,rgba(230,60,47,0.05),transparent_40%),linear-gradient(135deg,rgba(255,255,255,1),rgba(241,245,249,1))',
          }}
        >
          <div className="inline-flex rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-white">
            SBG Store
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Supplement Shop
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Browse supplements with a cleaner shopping flow, image-first cards, and reusable filter controls.
          </p>
        </div>

        <div className="min-w-0">
            <div
              className="mb-6 flex flex-col gap-4 rounded-3xl border border-border p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between bg-card/50"
            >
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-bold text-foreground">{filteredProducts.length} products</span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground transition-all hover:border-primary hover:text-primary"
                >
                  Reset Filters
                </button>
                <label className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="whitespace-nowrap text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground/60">
                    Sort
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  >
                    <option>Best Match</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Top Rated</option>
                    <option>Newest</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2 rounded-3xl border border-border bg-card p-4 shadow-sm">
              {categories.map((category) => {
                const isActive = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-[0_12px_30px_rgba(230,60,47,0.25)]'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Loading State */}
            {loading && (
              <div
                className="rounded-3xl border border-border py-16 text-center text-muted-foreground bg-card"
              >
                Loading supplements...
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 py-16 text-center text-rose-200">
                {error}
              </div>
            )}

            {/* No Products State */}
            {!loading && !error && filteredProducts.length === 0 && (
              <div
                className="rounded-3xl border border-border py-16 text-center text-muted-foreground bg-card"
              >
                No products found. Try adjusting your filters.
              </div>
            )}

            {/* Product Grid */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <SupplementProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
        </div>
      </div>
      </main>
    </div>
  );
}
