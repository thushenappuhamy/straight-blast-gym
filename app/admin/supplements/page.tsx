'use client';

import React, { useState, useEffect } from 'react';
import {
  AdminLayout,
  AdminSidebar,
  AdminHeader,
  AdminStatsGrid,
  AdminTable,
} from '@/src/components/admin';
import AdminSupplementFormModal from '@/src/components/admin/AdminSupplementFormModal';
import Toast from '@/src/components/ui/Toast';

const categoryColors: Record<string, string> = {
  Protein: 'bg-[#E63C2F]/20 text-[#E63C2F] border border-[#E63C2F]/30',
  'Mass Gainer': 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  Creatine: 'bg-violet-500/15 text-violet-300 border border-violet-500/30',
  'Fat Burner': 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
  Vitamins: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
};

const statusColors: Record<string, string> = {
  active: 'text-emerald-400',
  'low-stock': 'text-amber-400',
  'out-of-stock': 'text-rose-400',
};

export default function SupplementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [supplements, setSupplements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
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
  const [imagePreview, setImagePreview] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<Record<string, string>>({});

  const handleCloseSupplementModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingId(null);
    setAdditionalInfo({});
  };

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

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: 'Image size must be less than 5MB', type: 'error' });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setToast({ message: 'Please select a valid image file', type: 'error' });
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
    setImagePreview('');
  };

  // Handle adding supplement
  const handleAddSupplement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (!formData.image) {
        throw new Error('Product image is required. Please upload an image before adding the supplement.');
      }

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

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


      const response = await fetch('/api/admin/supplements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();


      if (!response.ok) {
        throw new Error(data.error || `Failed to add supplement (Status: ${response.status})`);
      }

      setToast({ message: 'Supplement added successfully!', type: 'success' });

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
      setImagePreview('');
      setShowAddModal(false);
    } catch (err: any) {
      setToast({ message: `Error: ${err.message || 'Failed to add supplement'}`, type: 'error' });
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
    setImagePreview(supplement.image || '');
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

      setToast({ message: 'Supplement updated successfully!', type: 'success' });

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
      setEditingId(null);
      setShowEditModal(false);
    } catch (err: any) {
      setToast({ message: `Error: ${err.message || 'Failed to update supplement'}`, type: 'error' });
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

      setToast({ message: 'Supplement deleted successfully!', type: 'success' });

      // Refresh list
      const refreshResponse = await fetch('/api/admin/supplements');
      const refreshData = await refreshResponse.json();
      setSupplements(refreshData.data || []);
    } catch (err: any) {
      setToast({ message: `Error: ${err.message || 'Failed to delete supplement'}`, type: 'error' });
    }
  };

  // Calculate stats
  const totalProducts = supplements.length;
  const totalStock = supplements.reduce((sum, s) => sum + (s.stock || 0), 0);
  const totalSales = supplements.reduce((sum, s) => sum + (s.salesThisMonth || 0), 0);
  const totalRevenue = supplements.reduce((sum, s) => sum + (s.price * (s.salesThisMonth || 0)), 0);

  const stats = [
    { icon: '📦', label: 'Total Products', value: totalProducts },
    { icon: '💰', label: 'Total Sales', value: `LKR ${(totalRevenue / 1000).toFixed(0)}K` },
    { icon: '📈', label: 'Units Sold', value: totalSales },
    { icon: '🧴', label: 'Total Stock', value: totalStock },
  ];

  const getStatus = (supplement: any) => {
    if ((supplement?.stock || 0) <= 0) return 'out-of-stock';
    if ((supplement?.stock || 0) <= 10) return 'low-stock';
    return supplement?.status || 'active';
  };

  const filteredSupplements = supplements.filter((supplement) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      `${supplement?.name || ''}`.toLowerCase().includes(q) ||
      `${supplement?.category || ''}`.toLowerCase().includes(q) ||
      `${supplement?.sku || ''}`.toLowerCase().includes(q) ||
      `${supplement?.manufacturer || ''}`.toLowerCase().includes(q)
    );
  });

  const supplementColumns = [
    {
      key: 'name',
      label: 'Product',
      render: (value: string, row: any) => (
        <div>
          <p className="font-semibold text-white">{value}</p>
          {row?.dosage && <p className="text-xs text-white/45 mt-0.5">{row.dosage}</p>}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => (
        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${categoryColors[value] || 'bg-white/10 text-white/70 border border-white/20'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (value: number) => <span className="font-semibold text-white">LKR {(value || 0).toLocaleString()}</span>,
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (value: number) => (
        <span className="text-white/80">
          {value || 0} units {(value || 0) <= 10 && (value || 0) > 0 ? <span className="text-amber-400">⚠</span> : null}
        </span>
      ),
    },
    {
      key: 'salesThisMonth',
      label: 'Sales',
      render: (value: number) => <span className="text-white/80">{value || 0} sold</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: string, row: any) => {
        const status = getStatus(row);
        return (
          <span className={`text-xs font-black uppercase ${statusColors[status] || 'text-white/60'}`}>
            {status === 'low-stock' ? 'Low Stock' : status === 'out-of-stock' ? 'Out Of Stock' : 'Active'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditClick(row)}
            className="border border-[#E63C2F]/50 text-[#E63C2F] hover:bg-[#E63C2F]/10 font-bold text-xs uppercase px-2.5 py-1.5 rounded-md transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteSupplement(row._id)}
            className="border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 font-bold text-xs uppercase px-2.5 py-1.5 rounded-md transition-colors"
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      sidebar={<AdminSidebar />}
      header={
        <AdminHeader
          title="Supplements"
          description="Manage inventory, pricing, and stock levels"
          searchPlaceholder="Search product, category, SKU..."
          onSearch={setSearchQuery}
          actionButton={{
            label: '+ Add Product',
            onClick: () => {
              setEditingId(null);
              setShowEditModal(false);
              setShowAddModal(true);
            },
            variant: 'primary',
          }}
        />
      }
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="space-y-6">
        <AdminStatsGrid stats={stats} columns={4} />

        {error && (
          <div className="rounded-xl border border-[#E63C2F]/40 bg-[#E63C2F]/10 p-4 text-sm text-[#ffb4ae]">
            {error}
          </div>
        )}

        <AdminTable
          title={`Product Inventory (${filteredSupplements.length})`}
          columns={supplementColumns}
          data={filteredSupplements}
          emptyMessage={loading ? 'Loading supplements...' : 'No supplements found. Click "+ Add Product" to add one.'}
        />
      </div>

      <AdminSupplementFormModal
        isOpen={showAddModal || (showEditModal && !!editingId)}
        isEdit={showEditModal && !!editingId}
        formData={formData}
        additionalInfo={additionalInfo}
        imagePreview={imagePreview}
        formLoading={formLoading}
        certificationOptions={certificationOptions}
        allergenOptions={allergenOptions}
        getCategoryQuestions={getCategoryQuestions}
        onClose={handleCloseSupplementModal}
        onSubmit={showEditModal && editingId ? handleUpdateSupplement : handleAddSupplement}
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
        onFormDataChange={setFormData}
        onAdditionalInfoChange={setAdditionalInfo}
        onCertificationToggle={handleCertificationToggle}
        onAllergenToggle={handleAllergenToggle}
      />

      {/* Add Supplement Modal */}
      {false && showAddModal && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-linear-to-br from-[#F4D03F]/5 via-white to-blue-50 rounded-2xl border-2 border-[#F4D03F] max-w-2xl w-full my-8 p-8 shadow-[0_0_40px_rgba(244,208,63,0.15)]">
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
                    <div className="w-20 h-20 relative shrink-0">
                      <img
                        src={imagePreview ?? undefined}
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
                  className="flex-1 bg-linear-to-r from-[#F4D03F] to-yellow-400 hover:from-[#E5C730] hover:to-yellow-300 disabled:opacity-50 text-black font-black text-lg uppercase tracking-wider py-4 transition-all shadow-[0_4px_20px_rgba(244,208,63,0.3)] hover:shadow-[0_6px_30px_rgba(244,208,63,0.5)]"
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
      {false && showEditModal && editingId && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-linear-to-br from-[#F4D03F]/5 via-white to-blue-50 rounded-2xl border-2 border-[#F4D03F] max-w-2xl w-full my-8 p-8 shadow-[0_0_40px_rgba(244,208,63,0.15)]">
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
                    <div className="w-20 h-20 relative shrink-0">
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
                  className="flex-1 bg-linear-to-r from-[#F4D03F] to-yellow-400 hover:from-[#E5C730] hover:to-yellow-300 disabled:opacity-50 text-black font-black text-lg uppercase tracking-wider py-4 transition-all shadow-[0_4px_20px_rgba(244,208,63,0.3)] hover:shadow-[0_6px_30px_rgba(244,208,63,0.5)]"
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
    </AdminLayout>
  );
}
