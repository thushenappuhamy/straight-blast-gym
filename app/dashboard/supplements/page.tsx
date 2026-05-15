'use client';

import React, { useEffect, useState } from 'react';

const categoryColors: Record<string, string> = {
  Protein: 'bg-blue-100 text-blue-800',
  'Mass Gainer': 'bg-orange-100 text-orange-800',
  Creatine: 'bg-purple-100 text-purple-800',
  'Fat Burner': 'bg-red-100 text-red-800',
  Vitamins: 'bg-green-100 text-green-800',
};

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Protein', 'Mass Gainer', 'Creatine', 'Fat Burner', 'Vitamins'];

  // Fetch supplements every 5 seconds for live updates
  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        const response = await fetch('/api/supplements');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch supplements');
        }

        setSupplements(data.data || []);
        setError('');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplements();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchSupplements, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredSupplements = selectedCategory === 'All' 
    ? supplements 
    : supplements.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#F4D03F] p-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-[#F4D03F] text-xs font-bold uppercase tracking-wider mb-4">
            Premium Nutrition
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-black uppercase tracking-tight">
            Supplements Store
          </h1>
          <p className="text-gray-600 mt-2">Premium quality supplements for your fitness goals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 font-black text-sm uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-[#F4D03F] text-black shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg font-bold">💊 Loading supplements...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg font-bold">❌ {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredSupplements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg font-bold">No supplements available in this category</p>
          </div>
        )}

        {/* Supplements Grid */}
        {!loading && !error && filteredSupplements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSupplements.map((supplement) => (
              <div
                key={supplement._id}
                className="border-2 border-gray-200 hover:border-[#F4D03F] transition-all hover:shadow-lg overflow-hidden"
              >
                {/* Product Image Placeholder */}
                <div className="bg-gradient-to-br from-[#2B2621] to-white h-48 flex items-center justify-center relative">
                  <div className="text-6xl opacity-20">💊</div>
                  {supplement.status === 'low-stock' && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white font-black text-xs uppercase px-3 py-1">
                      ⚠️ Low Stock
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span
                      className={`text-xs font-black uppercase px-3 py-1 rounded ${
                        categoryColors[supplement.category] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {supplement.category}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-xl font-black uppercase text-gray-900 mb-2">{supplement.name}</h3>

                  {/* Dosage */}
                  {supplement.dosage && (
                    <p className="text-sm text-gray-600 mb-2">📦 {supplement.dosage}</p>
                  )}

                  {/* Servings */}
                  {supplement.servings && (
                    <p className="text-sm text-gray-600 mb-3">🔢 {supplement.servings} servings</p>
                  )}

                  {/* Description */}
                  {supplement.description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{supplement.description}</p>
                  )}

                  {/* Stock Status */}
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-600">STOCK AVAILABLE</p>
                    <p className="text-2xl font-black text-gray-900">{supplement.stock}</p>
                    <p className="text-xs text-gray-500">units in stock</p>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Price</p>
                    <p className="text-3xl font-black text-[#F4D03F]">LKR {supplement.price.toLocaleString()}</p>
                  </div>

                  {/* Add to Cart Button */}
                  <button className="w-full bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-lg uppercase tracking-wider py-3 transition-all shadow-lg hover:shadow-xl">
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-[#2B2621] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">🔄 Live Updates</p>
          <p className="text-sm font-bold">Data automatically updates every 5 seconds</p>
        </div>
      </div>
    </div>
  );
}
