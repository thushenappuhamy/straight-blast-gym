'use client';

import React, { useEffect, useState } from 'react';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trainers and poll for updates every 5 seconds
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        console.log('👨‍🏫 [USER TRAINERS] Fetching...');
        const response = await fetch('/api/trainers', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        const result = await response.json();
        
        if (result.success) {
          // Transform API data and filter out deleted trainers
          const transformedTrainers = result.data
            .filter((trainer: any) => trainer.status !== 'deleted') // Don't show deleted trainers
            .map((trainer: any) => ({
              id: trainer._id,
              name: `${trainer.firstName} ${trainer.lastName}`.toUpperCase(),
              specialty: trainer.specialty.toUpperCase(),
              badge: trainer.isFeatured ? 'HEAD COACH' : null,
              tags: trainer.specializations || [],
              experience: trainer.experience || 0,
              clients: trainer.totalClients || 0,
              rating: trainer.ratingAverage || 0,
              price: trainer.costPerSession || 0,
              featured: trainer.isFeatured || false,
              status: trainer.status || 'active',
              isInactive: trainer.status === 'inactive',
            }));
          console.log('✅ [USER TRAINERS] Loaded:', transformedTrainers.length);
          setTrainers(transformedTrainers);
          setError(null);
        } else {
          setError('Failed to load trainers');
        }
      } catch (err) {
        console.error('❌ [USER TRAINERS] Error:', err);
        setError('An error occurred while loading trainers');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTrainers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#2B2621] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="text-[#F4D03F] text-xs font-bold uppercase tracking-wider mb-4">
            Expert Coaching
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tight">
            Meet Our Trainers
          </h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-white text-xl font-bold py-12">
            Loading trainers...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 text-xl font-bold py-12">
            {error}
          </div>
        )}

        {/* Trainer Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className={`overflow-hidden relative transition-all opacity-100 ${
                trainer.isInactive ? 'opacity-50 pointer-events-none' : ''
              } ${
                trainer.featured ? 'border-2 border-[#F4D03F]' : 'border border-[#424242]'
              }`}
            >
              {/* Profile Image Section */}
              <div className="relative bg-[#3A3A3A] h-64 flex items-center justify-center">
                {/* Placeholder for profile image */}
                <div className="text-white text-8xl font-black opacity-20">?</div>
                
                {/* Inactive Badge */}
                {trainer.isInactive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="text-white text-center">
                      <div className="text-2xl font-black uppercase tracking-wider mb-2">INACTIVE</div>
                      <p className="text-xs text-gray-300">This trainer is currently unavailable</p>
                    </div>
                  </div>
                )}
                
                {/* Badge */}
                {trainer.badge && !trainer.isInactive && (
                  <div className="absolute top-4 right-4 bg-[#F4D03F] text-black font-bold text-[10px] uppercase tracking-wider px-3 py-1">
                    {trainer.badge}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="bg-[#1F1D1B] p-6">
                {/* Name */}
                <h3 className="text-white text-xl font-black uppercase tracking-tight mb-2">
                  {trainer.name}
                </h3>

                {/* Specialty */}
                <p className="text-[#F4D03F] text-sm font-bold uppercase tracking-wider mb-4">
                  {trainer.specialty}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {trainer.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-[#2B2621] text-gray-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 border border-[#424242]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-white text-2xl font-black">{trainer.experience}YR</div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">Experience</div>
                  </div>
                  <div>
                    <div className="text-white text-2xl font-black">{trainer.clients}</div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">Clients</div>
                  </div>
                  <div>
                    <div className="text-white text-2xl font-black">{trainer.rating}★</div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">Rating</div>
                  </div>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-2xl font-black">LKR {trainer.price.toLocaleString()}</div>
                    <div className="text-gray-500 text-xs">per session</div>
                  </div>
                  <button
                    disabled={trainer.isInactive}
                    className={`font-black text-sm uppercase tracking-wider px-6 py-3 transition-all ${
                      trainer.isInactive
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-[#F4D03F] hover:bg-[#E5C730] text-black'
                    }`}
                    title={trainer.isInactive ? 'This trainer is currently unavailable' : 'Select this trainer'}
                  >
                    {trainer.isInactive ? 'Unavailable' : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
