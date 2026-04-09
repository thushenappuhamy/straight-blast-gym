'use client';

import React, { useState, useEffect } from 'react';

export default function SupplementShopPage() {
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
        console.log('💊 [SHOP] Fetching supplements...');
        const response = await fetch('/api/admin/supplements');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch supplements');
        }

        console.log('✅ [SHOP] Supplements loaded:', data.data);
        setSupplements(data.data || []);
      } catch (err: any) {
        console.error('❌ [SHOP] Error:', err);
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



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider mb-3">
            SBG Store
          </div>
          <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tight">
            Supplement Shop
          </h1>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 mb-4">
                  Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['All Products', 'Protein', 'Mass Gainer', 'Creatine', 'Fat Burner', 'Vitamins'].map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all ${
                        selectedCategories.includes(category)
                          ? 'bg-[#F4D03F] text-black shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 mb-4">
                  Price Range
                </h3>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #F4D03F 0%, #F4D03F ${
                        (priceRange[1] / 50000) * 100
                      }%, #E5E7EB ${(priceRange[1] / 50000) * 100}%, #E5E7EB 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>LKR {priceRange[0].toLocaleString()}</span>
                    <span>LKR {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Apply Filters Button */}
              <button className="w-full bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider py-3 transition-all">
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-bold text-gray-900">{filteredProducts.length} products</span>
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 focus:outline-none focus:border-[#F4D03F]"
              >
                <option>Best Match</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Top Rated</option>
                <option>Newest</option>
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading supplements...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* No Products State */}
            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No products found. Try adjusting your filters.</p>
              </div>
            )}

            {/* Product Grid */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const discountedPrice = product.discount 
                    ? product.price * (1 - product.discount / 100) 
                    : product.price;
                  
                  return (
                    <div key={product._id} className="bg-white rounded-lg shadow-xl overflow-hidden group hover:shadow-2xl transition-shadow">
                      {/* Product Image Area */}
                      <div className="bg-[#2B2621] h-48 flex items-center justify-center relative overflow-hidden">
                        {product.discount && (
                          <div className="absolute top-4 left-4 bg-red-500 text-white font-bold text-xs uppercase tracking-wider px-3 py-1">
                            -{product.discount}%
                          </div>
                        )}
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="text-6xl">💊</div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-6">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          {product.category}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase mb-2">
                          {product.name}
                        </h3>
                        {product.flavor && (
                          <div className="text-xs text-gray-500 mb-2">{product.flavor}</div>
                        )}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Rating */}
                        {product.rating && (
                          <div className="flex items-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < Math.round(product.rating) ? 'text-[#F4D03F]' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                            <span className="text-xs text-gray-500 ml-2">({product.rating})</span>
                          </div>
                        )}

                        {/* Price and CTA */}
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-2xl font-black text-gray-900">
                              LKR {Math.round(discountedPrice).toLocaleString()}
                            </div>
                            {product.discount && (
                              <div className="text-sm text-gray-400 line-through">
                                LKR {product.price.toLocaleString()}
                              </div>
                            )}
                          </div>
                          <button className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
