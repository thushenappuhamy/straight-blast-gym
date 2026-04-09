'use client';

import React, { useState, useEffect } from 'react';

const categoryColors: Record<string, string> = {
  Protein: 'bg-blue-100 text-blue-800',
  'Mass Gainer': 'bg-orange-100 text-orange-800',
  Creatine: 'bg-purple-100 text-purple-800',
  'Fat Burner': 'bg-red-100 text-red-800',
  Vitamins: 'bg-green-100 text-green-800',
};

const statusColors: Record<string, string> = {
  active: 'text-green-600',
  'low-stock': 'text-orange-500',
  'out-of-stock': 'text-red-500',
};

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Protein',
    price: '',
    stock: '',
    description: '',
    dosage: '',
    servings: '',
    image: '', // Base64 image string
    manufacturer: '',
    flavor: '',
    size: '',
    protein: '',
    carbs: '',
    fats: '',
    calories: '',
    ingredients: '',
    certifications: [] as string[],
    allergens: [] as string[],
    warnings: '',
    expiryDate: '',
    sku: '',
    discount: '',
    rating: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<Record<string, string>>({});

  // Dynamic questions based on category
  const getCategoryQuestions = (category: string): { question: string; key: string; type: 'text' | 'select'; options?: string[] }[] => {
    const questions: Record<string, { question: string; key: string; type: 'text' | 'select'; options?: string[] }[]> = {
      Protein: [
        { question: 'What type of whey protein?', key: 'wheyType', type: 'select', options: ['Whey Concentrate', 'Whey Isolate', 'Whey Hydrolysate', 'Blend'] },
        { question: 'Best for?', key: 'bestFor', type: 'select', options: ['Post-Workout', 'Daily Nutrition', 'Mass Gain', 'Weight Loss'] },
      ],
      'Mass Gainer': [
        { question: 'Suitable for?', key: 'suitableFor', type: 'select', options: ['Beginners', 'Intermediate', 'Advanced', 'All Levels'] },
        { question: 'Primary use?', key: 'primaryUse', type: 'select', options: ['Muscle Gain', 'Weight Gain', 'Recovery'] },
      ],
      Creatine: [
        { question: 'Type of creatine?', key: 'creatineType', type: 'select', options: ['Monohydrate', 'HCI', 'Ethyl Ester', 'Buffered', 'Liquid'] },
        { question: 'Loading phase required?', key: 'loadingPhase', type: 'select', options: ['Yes', 'No', 'Optional'] },
      ],
      'Fat Burner': [
        { question: 'Key ingredient?', key: 'keyIngredient', type: 'text' },
        { question: 'Thermogenic formula type?', key: 'formulaType', type: 'select', options: ['Stimulant', 'Stimulant-Free', 'Hybrid'] },
      ],
      Vitamins: [
        { question: 'Type of vitamin?', key: 'vitaminType', type: 'select', options: ['Multivitamin', 'Single Vitamin', 'Mineral', 'Complex'] },
        { question: 'Daily value coverage?', key: 'dvCoverage', type: 'select', options: ['25-50%', '50-100%', '100-200%', '200%+'] },
      ],
    };
    return questions[category] || [];
  };

  // Certification options
  const certificationOptions = ['Vegan', 'Vegetarian', 'Organic', 'Non-GMO', 'Gluten-Free', 'Kosher', 'Halal'];
  
  // Allergen options
  const allergenOptions = ['Dairy', 'Gluten', 'Nuts', 'Shellfish', 'Eggs', 'Soy', 'Sesame'];

  // Handle certification toggle
  const handleCertificationToggle = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  // Handle allergen toggle
  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  // Fetch supplements
  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        console.log('💊 [SUPPLEMENTS] Fetching...');
        const response = await fetch('/api/admin/supplements');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch supplements');
        }

        console.log('✅ [SUPPLEMENTS] Loaded:', data.data);
        setSupplements(data.data || []);
      } catch (err: any) {
        console.error('❌ [SUPPLEMENTS] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplements();
  }, []);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
    setImagePreview(null);
  };

  // Handle adding supplement
  const handleAddSupplement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      console.log('🔐 [SUPPLEMENTS] Token:', token ? 'Found' : 'Not found');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      console.log('📝 [SUPPLEMENTS] Form data:', {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        stock: formData.stock,
      });

      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        servings: formData.servings ? parseInt(formData.servings) : undefined,
        protein: formData.protein ? parseFloat(formData.protein) : undefined,
        carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
        fats: formData.fats ? parseFloat(formData.fats) : undefined,
        calories: formData.calories ? parseFloat(formData.calories) : undefined,
        discount: formData.discount ? parseFloat(formData.discount) : undefined,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
      };

      console.log('📤 [SUPPLEMENTS] Sending payload:', payload);

      const response = await fetch('/api/admin/supplements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('📥 [SUPPLEMENTS] Response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || `Failed to add supplement (Status: ${response.status})`);
      }

      console.log('✅ [SUPPLEMENTS] Added:', data.data);
      alert('✅ Supplement added successfully!');

      // Refresh list
      const refreshResponse = await fetch('/api/admin/supplements');
      const refreshData = await refreshResponse.json();
      setSupplements(refreshData.data || []);

      // Reset form
      setFormData({
        name: '',
        category: 'Protein',
        price: '',
        stock: '',
        description: '',
        dosage: '',
        servings: '',
        image: '',
        manufacturer: '',
        flavor: '',
        size: '',
        protein: '',
        carbs: '',
        fats: '',
        calories: '',
        ingredients: '',
        certifications: [],
        allergens: [],
        warnings: '',
        expiryDate: '',
        sku: '',
        discount: '',
        rating: '',
      });
      setAdditionalInfo({});
      setImagePreview(null);
      setShowAddModal(false);
    } catch (err: any) {
      console.error('❌ [SUPPLEMENTS] Error:', err);
      alert('❌ Error: ' + (err.message || 'Failed to add supplement'));
    } finally {
      setFormLoading(false);
    }
  };

  // Handle editing supplement
  const handleEditClick = (supplement: any) => {
    setFormData({
      name: supplement.name,
      category: supplement.category,
      price: supplement.price,
      stock: supplement.stock,
      description: supplement.description,
      dosage: supplement.dosage,
      servings: supplement.servings,
      image: supplement.image || '',
      manufacturer: supplement.manufacturer || '',
      flavor: supplement.flavor || '',
      size: supplement.size || '',
      protein: supplement.protein || '',
      carbs: supplement.carbs || '',
      fats: supplement.fats || '',
      calories: supplement.calories || '',
      ingredients: supplement.ingredients || '',
      certifications: supplement.certifications || [],
      allergens: supplement.allergens || [],
      warnings: supplement.warnings || '',
      expiryDate: supplement.expiryDate || '',
      sku: supplement.sku || '',
      discount: supplement.discount || '',
      rating: supplement.rating || '',
    });
    setImagePreview(supplement.image || null);
    setEditingId(supplement._id);
    setShowEditModal(true);
  };

  const handleUpdateSupplement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/supplements/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock) || 0,
          servings: formData.servings ? parseInt(formData.servings) : undefined,
          protein: formData.protein ? parseFloat(formData.protein) : undefined,
          carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
          fats: formData.fats ? parseFloat(formData.fats) : undefined,
          calories: formData.calories ? parseFloat(formData.calories) : undefined,
          discount: formData.discount ? parseFloat(formData.discount) : undefined,
          rating: formData.rating ? parseFloat(formData.rating) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update supplement');
      }

      console.log('✅ [SUPPLEMENTS] Updated:', data.data);
      alert('✅ Supplement updated successfully!');

      // Refresh list
      const refreshResponse = await fetch('/api/admin/supplements');
      const refreshData = await refreshResponse.json();
      setSupplements(refreshData.data || []);

      // Reset form and close modal
      setFormData({
        name: '',
        category: 'Protein',
        price: '',
        stock: '',
        description: '',
        dosage: '',
        servings: '',
        image: '',
        manufacturer: '',
        flavor: '',
        size: '',
        protein: '',
        carbs: '',
        fats: '',
        calories: '',
        ingredients: '',
        certifications: [],
        allergens: [],
        warnings: '',
        expiryDate: '',
        sku: '',
        discount: '',
        rating: '',
      });
      setImagePreview(null);
      setEditingId(null);
      setShowEditModal(false);
    } catch (err: any) {
      console.error('❌ [SUPPLEMENTS] Error:', err);
      alert('❌ ' + (err.message || 'Failed to update supplement'));
    } finally {
      setFormLoading(false);
    }
  };

  // Handle deleting supplement
  const handleDeleteSupplement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplement?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/supplements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete supplement');
      }

      console.log('✅ [SUPPLEMENTS] Deleted');
      alert('✅ Supplement deleted successfully!');

      // Refresh list
      const refreshResponse = await fetch('/api/admin/supplements');
      const refreshData = await refreshResponse.json();
      setSupplements(refreshData.data || []);
    } catch (err: any) {
      console.error('❌ [SUPPLEMENTS] Error:', err);
      alert('❌ ' + (err.message || 'Failed to delete supplement'));
    }
  };

  // Calculate stats
  const totalProducts = supplements.length;
  const totalStock = supplements.reduce((sum, s) => sum + (s.stock || 0), 0);
  const totalSales = supplements.reduce((sum, s) => sum + (s.salesThisMonth || 0), 0);
  const totalRevenue = supplements.reduce((sum, s) => sum + (s.price * (s.salesThisMonth || 0)), 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#F4D03F] p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-4xl font-black uppercase text-black">Supplements</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black text-sm uppercase tracking-wider px-6 py-2 transition-all"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-[#2B2621] p-6 rounded">
              <div className="text-[#F4D03F] text-sm font-black uppercase tracking-wider mb-2">📦</div>
              <div className="text-white text-4xl font-black mb-1">{totalProducts}</div>
              <div className="text-gray-400 text-xs uppercase">Total Products</div>
            </div>
            <div className="bg-[#2B2621] p-6 rounded">
              <div className="text-[#F4D03F] text-sm font-black uppercase tracking-wider mb-2">💰</div>
              <div className="text-white text-4xl font-black mb-1">LKR {(totalRevenue / 1000).toFixed(0)}K</div>
              <div className="text-gray-400 text-xs uppercase">Total Sales</div>
              <div className="text-yellow-400 text-xs mt-1">This month</div>
            </div>
            <div className="bg-[#2B2621] p-6 rounded">
              <div className="text-[#F4D03F] text-sm font-black uppercase tracking-wider mb-2">📈</div>
              <div className="text-white text-4xl font-black mb-1">{totalSales}</div>
              <div className="text-gray-400 text-xs uppercase">Units Sold</div>
            </div>
            <div className="bg-[#2B2621] p-6 rounded">
              <div className="text-[#F4D03F] text-sm font-black uppercase tracking-wider mb-2">📦</div>
              <div className="text-white text-4xl font-black mb-1">{totalStock}</div>
              <div className="text-gray-400 text-xs uppercase">Total Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Inventory */}
      <div className="bg-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-black uppercase text-black mb-6">Product Inventory</h2>

          {loading && <p className="text-center text-gray-600">Loading supplements...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}

          {!loading && !error && supplements.length === 0 && (
            <p className="text-center text-gray-600 py-12">No supplements found. Click "+ Add Product" to add one.</p>
          )}

          {!loading && !error && supplements.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#2B2621] text-[#F4D03F]">
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {supplements.map((supplement, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{supplement.name}</div>
                        {supplement.dosage && <div className="text-xs text-gray-500">{supplement.dosage}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded ${categoryColors[supplement.category] || 'bg-gray-100 text-gray-800'}`}>
                          {supplement.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">LKR {supplement.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-900">
                        {supplement.stock} units
                        {supplement.stock <= 10 && supplement.stock > 0 && <span className="text-orange-600 text-xs ml-2">⚠️</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{supplement.salesThisMonth} sold</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-black uppercase ${statusColors[supplement.status] || 'text-gray-600'}`}>
                          {supplement.status === 'low-stock' ? '🟠 Low Stock' : supplement.status === 'out-of-stock' ? '🔴 Out of Stock' : '🟢 Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditClick(supplement)}
                            className="border-2 border-[#F4D03F] text-[#F4D03F] hover:bg-[#F4D03F] hover:text-black font-black text-xs uppercase px-3 py-1 transition-all">
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteSupplement(supplement._id)}
                            className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black text-xs uppercase px-3 py-1 transition-all">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Supplement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#F4D03F]/5 via-white to-blue-50 rounded-2xl border-2 border-[#F4D03F] max-w-2xl w-full my-8 p-8 shadow-[0_0_40px_rgba(244,208,63,0.15)]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-[#F4D03F]">
              <div>
                <p className="text-[#F4D03F] text-xs font-black uppercase tracking-widest mb-2">Management</p>
                <h2 className="text-4xl font-black uppercase text-slate-700 tracking-tight">Add New Supplement</h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAdditionalInfo({});
                }}
                className="text-4xl font-black text-slate-700 hover:text-[#F4D03F] transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSupplement} className="space-y-6">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Product Name *</label>
                  <input
                    type="text"
                    placeholder="Whey Gold Standard"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  >
                    <option value="Protein">Protein</option>
                    <option value="Mass Gainer">Mass Gainer</option>
                    <option value="Creatine">Creatine</option>
                    <option value="Fat Burner">Fat Burner</option>
                    <option value="Vitamins">Vitamins</option>
                  </select>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Price (LKR) *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Stock Units *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Dosage & Servings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Dosage</label>
                  <input
                    type="text"
                    placeholder="25g per serving"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Servings Per Container</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
              </div>

              {/* Product Image */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Product Image</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none transition-all cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-2">Max 5MB • Supported: JPG, PNG, GIF, WebP</p>
                  </div>
                  {imagePreview && (
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover border-2 border-[#F4D03F] rounded"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Description</label>
                <textarea
                  placeholder="Product description, ingredients, benefits, usage instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all resize-none"
                  rows={4}
                />
              </div>

              {/* Manufacturer & Flavor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Manufacturer/Brand</label>
                  <input
                    type="text"
                    placeholder="Gold Standard, Optimum Nutrition, etc."
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Flavor</label>
                  <input
                    type="text"
                    placeholder="Chocolate, Vanilla, Strawberry..."
                    value={formData.flavor}
                    onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
              </div>

              {/* Size & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Package Size</label>
                  <input
                    type="text"
                    placeholder="500g, 1kg, 2.2lbs..."
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">SKU/Barcode</label>
                  <input
                    type="text"
                    placeholder="Product SKU or barcode"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
              </div>

              {/* Nutritional Information */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-3">Per Serving Nutrition</label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Protein (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                      className="w-full bg-white text-gray-900 px-3 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                      className="w-full bg-white text-gray-900 px-3 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Fats (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.fats}
                      onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                      className="w-full bg-white text-gray-900 px-3 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Calories</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full bg-white text-gray-900 px-3 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Ingredients List</label>
                <textarea
                  placeholder="Whey Protein Isolate, Maltodextrin, Cocoa Powder, Natural Flavors..."
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all resize-none text-sm"
                  rows={2}
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-3">Certifications</label>
                <div className="grid grid-cols-4 gap-2">
                  {certificationOptions.map(cert => (
                    <label key={cert} className="flex items-center gap-2 cursor-pointer bg-white p-2 border-2 border-gray-300 hover:border-[#F4D03F] transition-all">
                      <input
                        type="checkbox"
                        checked={formData.certifications.includes(cert)}
                        onChange={() => handleCertificationToggle(cert)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-gray-700">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-3">Allergen Information</label>
                <div className="grid grid-cols-4 gap-2">
                  {allergenOptions.map(allergen => (
                    <label key={allergen} className="flex items-center gap-2 cursor-pointer bg-white p-2 border-2 border-gray-300 hover:border-[#F4D03F] transition-all">
                      <input
                        type="checkbox"
                        checked={formData.allergens.includes(allergen)}
                        onChange={() => handleAllergenToggle(allergen)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-gray-700">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Warnings & Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Warnings/Side Effects</label>
                  <textarea
                    placeholder="May cause nausea. Not for pregnant women. Consult doctor..."
                    value={formData.warnings}
                    onChange={(e) => setFormData({ ...formData, warnings: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all resize-none text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
              </div>

              {/* Discount & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Discount (%)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Rating (⭐ 1-5)</label>
                  <input
                    type="number"
                    placeholder="4.5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    min="1"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Dynamic Category Questions */}
              {getCategoryQuestions(formData.category).length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4">📋 Supplement-Specific Questions</h3>
                  <div className="space-y-4">
                    {getCategoryQuestions(formData.category).map((q) => (
                      <div key={q.key}>
                        <label className="text-xs font-bold text-blue-800 block mb-2">{q.question}</label>
                        {q.type === 'text' ? (
                          <input
                            type="text"
                            placeholder="Enter value..."
                            value={additionalInfo[q.key] || ''}
                            onChange={(e) => setAdditionalInfo({ ...additionalInfo, [q.key]: e.target.value })}
                            className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-blue-300 focus:border-blue-500 outline-none text-sm"
                          />
                        ) : (
                          <select
                            value={additionalInfo[q.key] || ''}
                            onChange={(e) => setAdditionalInfo({ ...additionalInfo, [q.key]: e.target.value })}
                            className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-blue-300 focus:border-blue-500 outline-none text-sm"
                          >
                            <option value="">Select an option...</option>
                            {q.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-gradient-to-r from-[#F4D03F] to-yellow-400 hover:from-[#E5C730] hover:to-yellow-300 disabled:opacity-50 text-black font-black text-lg uppercase tracking-wider py-4 transition-all shadow-[0_4px_20px_rgba(244,208,63,0.3)] hover:shadow-[0_6px_30px_rgba(244,208,63,0.5)]"
                >
                  {formLoading ? '🔄 Adding...' : '✓ Add Supplement'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 font-black text-lg uppercase tracking-wider py-4 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditModal && editingId && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#F4D03F]/5 via-white to-blue-50 rounded-2xl border-2 border-[#F4D03F] max-w-2xl w-full my-8 p-8 shadow-[0_0_40px_rgba(244,208,63,0.15)]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-[#F4D03F]">
              <div>
                <p className="text-[#F4D03F] text-xs font-black uppercase tracking-widest mb-2">Management</p>
                <h2 className="text-4xl font-black uppercase text-slate-700 tracking-tight">Edit Supplement</h2>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setAdditionalInfo({});
                }}
                className="text-4xl font-black text-slate-700 hover:text-[#F4D03F] transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSupplement} className="space-y-6">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Product Name *</label>
                  <input
                    type="text"
                    placeholder="Whey Gold Standard"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  >
                    <option value="Protein">Protein</option>
                    <option value="Mass Gainer">Mass Gainer</option>
                    <option value="Creatine">Creatine</option>
                    <option value="Fat Burner">Fat Burner</option>
                    <option value="Vitamins">Vitamins</option>
                  </select>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Price (LKR) *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Stock Units *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Dosage & Servings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Dosage</label>
                  <input
                    type="text"
                    placeholder="25g per serving"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Servings Per Container</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
              </div>

              {/* Product Image */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Product Image</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none transition-all cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-2">Max 5MB • Supported: JPG, PNG, GIF, WebP</p>
                  </div>
                  {imagePreview && (
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover border-2 border-[#F4D03F] rounded"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Description</label>
                <textarea
                  placeholder="Product description, ingredients, benefits, usage instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all resize-none"
                  rows={4}
                />
              </div>

              {/* Manufacturer & Flavor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Manufacturer/Brand</label>
                  <input
                    type="text"
                    placeholder="Gold Standard, Optimum Nutrition, etc."
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Flavor</label>
                  <input
                    type="text"
                    placeholder="Chocolate, Vanilla, Strawberry..."
                    value={formData.flavor}
                    onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
              </div>

              {/* Size & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Package Size</label>
                  <input
                    type="text"
                    placeholder="500g, 1kg, 2.2lbs..."
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">SKU/Barcode</label>
                  <input
                    type="text"
                    placeholder="Product SKU or barcode"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
              </div>

              {/* Nutritional Information */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-3">Per Serving Nutrition</label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Protein (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                      className="w-full bg-white text-gray-900 px-3 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                      className="w-full bg-white text-gray-900 px-3 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Fats (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.fats}
                      onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                      className="w-full bg-white text-gray-900 px-3 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Calories</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full bg-white text-gray-900 px-3 py-2 border-2 border-gray-300 focus:border-[#F4D03F] outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Ingredients List</label>
                <textarea
                  placeholder="Whey Protein Isolate, Maltodextrin, Cocoa Powder, Natural Flavors..."
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all resize-none text-sm"
                  rows={2}
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-3">Certifications</label>
                <div className="grid grid-cols-4 gap-2">
                  {certificationOptions.map(cert => (
                    <label key={cert} className="flex items-center gap-2 cursor-pointer bg-white p-2 border-2 border-gray-300 hover:border-[#F4D03F] transition-all">
                      <input
                        type="checkbox"
                        checked={formData.certifications.includes(cert)}
                        onChange={() => handleCertificationToggle(cert)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-gray-700">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-3">Allergen Information</label>
                <div className="grid grid-cols-4 gap-2">
                  {allergenOptions.map(allergen => (
                    <label key={allergen} className="flex items-center gap-2 cursor-pointer bg-white p-2 border-2 border-gray-300 hover:border-[#F4D03F] transition-all">
                      <input
                        type="checkbox"
                        checked={formData.allergens.includes(allergen)}
                        onChange={() => handleAllergenToggle(allergen)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-gray-700">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Warnings & Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Warnings/Side Effects</label>
                  <textarea
                    placeholder="May cause nausea. Not for pregnant women. Consult doctor..."
                    value={formData.warnings}
                    onChange={(e) => setFormData({ ...formData, warnings: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all resize-none text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                  />
                </div>
              </div>

              {/* Discount & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Discount (%)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#F4D03F] uppercase tracking-widest block mb-2">Rating (⭐ 1-5)</label>
                  <input
                    type="number"
                    placeholder="4.5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-white text-gray-900 px-4 py-3 border-2 border-gray-300 focus:border-[#F4D03F] outline-none focus:bg-[#F4D03F]/5 transition-all"
                    min="1"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Dynamic Category Questions */}
              {getCategoryQuestions(formData.category).length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4">📋 Supplement-Specific Questions</h3>
                  <div className="space-y-4">
                    {getCategoryQuestions(formData.category).map((q) => (
                      <div key={q.key}>
                        <label className="text-xs font-bold text-blue-800 block mb-2">{q.question}</label>
                        {q.type === 'text' ? (
                          <input
                            type="text"
                            placeholder="Enter value..."
                            value={additionalInfo[q.key] || ''}
                            onChange={(e) => setAdditionalInfo({ ...additionalInfo, [q.key]: e.target.value })}
                            className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-blue-300 focus:border-blue-500 outline-none text-sm"
                          />
                        ) : (
                          <select
                            value={additionalInfo[q.key] || ''}
                            onChange={(e) => setAdditionalInfo({ ...additionalInfo, [q.key]: e.target.value })}
                            className="w-full bg-white text-gray-900 px-4 py-2 border-2 border-blue-300 focus:border-blue-500 outline-none text-sm"
                          >
                            <option value="">Select an option...</option>
                            {q.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-gradient-to-r from-[#F4D03F] to-yellow-400 hover:from-[#E5C730] hover:to-yellow-300 disabled:opacity-50 text-black font-black text-lg uppercase tracking-wider py-4 transition-all shadow-[0_4px_20px_rgba(244,208,63,0.3)] hover:shadow-[0_6px_30px_rgba(244,208,63,0.5)]"
                >
                  {formLoading ? '🔄 Updating...' : '✓ Update Supplement'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      category: 'Protein',
                      price: '',
                      stock: '',
                      dosage: '',
                      servings: '',
                      description: '',
                      image: '',
                      manufacturer: '',
                      flavor: '',
                      size: '',
                      protein: '',
                      carbs: '',
                      fats: '',
                      calories: '',
                      ingredients: '',
                      certifications: [],
                      allergens: [],
                      warnings: '',
                      expiryDate: '',
                      sku: '',
                      discount: '',
                      rating: '',
                    });
                  }}
                  className="flex-1 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 font-black text-lg uppercase tracking-wider py-4 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
