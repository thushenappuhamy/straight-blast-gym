'use client';

import React, { useEffect, useState } from 'react';

type CategoryQuestion = {
  question: string;
  key: string;
  type: 'text' | 'select';
  options?: string[];
};

interface AdminSupplementFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  formData: any;
  additionalInfo: Record<string, string>;
  imagePreview: string | null;
  formLoading: boolean;
  certificationOptions: string[];
  allergenOptions: string[];
  getCategoryQuestions: (category: string) => CategoryQuestion[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onFormDataChange: (next: any) => void;
  onAdditionalInfoChange: (next: Record<string, string>) => void;
  onCertificationToggle: (cert: string) => void;
  onAllergenToggle: (allergen: string) => void;
}

export default function AdminSupplementFormModal({
  isOpen,
  isEdit,
  formData,
  additionalInfo,
  imagePreview,
  formLoading,
  certificationOptions,
  allergenOptions,
  getCategoryQuestions,
  onClose,
  onSubmit,
  onImageChange,
  onRemoveImage,
  onFormDataChange,
  onAdditionalInfoChange,
  onCertificationToggle,
  onAllergenToggle,
}: AdminSupplementFormModalProps) {
  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setLocalError('');
    }
  }, [isOpen, isEdit]);

  if (!isOpen) return null;

  const labelClass = 'text-[11px] font-bold text-white/45 uppercase tracking-wider block mb-2';
  const inputClass = 'w-full bg-white/5 text-white px-4 py-2.5 border border-white/15 rounded-lg focus:border-[#E63C2F] outline-none transition-colors';

  const goNext = () => {
    setLocalError('');

    if (step === 1) {
      if (!formData.name?.trim()) {
        setLocalError('Product name is required');
        return;
      }
      if (!formData.category?.trim()) {
        setLocalError('Category is required');
        return;
      }
      if (!formData.price?.toString().trim()) {
        setLocalError('Price is required');
        return;
      }
      if (!formData.stock?.toString().trim()) {
        setLocalError('Stock is required');
        return;
      }
      if (!isEdit && !imagePreview) {
        setLocalError('Product image is required for new supplements');
        return;
      }
    }

    setStep((prev) => Math.min(3, prev + 1));
  };

  const title = isEdit ? 'Edit Supplement' : 'Add New Supplement';

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#161616] rounded-2xl border border-white/15 max-w-2xl w-full shadow-2xl overflow-hidden">
        <div className="px-5 md:px-6 py-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[#E63C2F] text-xs font-black uppercase tracking-widest mb-1">Management</p>
            <h2 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight">{title}</h2>
            <p className="text-white/45 text-xs mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/60 hover:text-white transition-colors text-2xl font-black leading-none"
          >
            x
          </button>
        </div>

        <div className="px-5 md:px-6 pt-4 pb-2">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 rounded-full ${s <= step ? 'bg-[#E63C2F]' : 'bg-white/12'}`} />
            ))}
          </div>
        </div>

        {(localError || false) && (
          <div className="mx-5 md:mx-6 mt-3 p-3 rounded-lg border border-[#E63C2F]/40 bg-[#E63C2F]/10 text-[#ffb4ae] text-sm">
            {localError}
          </div>
        )}

        <form onSubmit={onSubmit} className="px-5 md:px-6 py-4 max-h-[62vh] overflow-y-auto space-y-5">
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Product Name *</label>
                  <input
                    type="text"
                    placeholder="Whey Gold Standard"
                    value={formData.name}
                    onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => onFormDataChange({ ...formData, category: e.target.value })}
                    className={inputClass}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price (LKR) *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => onFormDataChange({ ...formData, price: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Stock Units *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => onFormDataChange({ ...formData, stock: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Dosage</label>
                  <input
                    type="text"
                    placeholder="25g per serving"
                    value={formData.dosage}
                    onChange={(e) => onFormDataChange({ ...formData, dosage: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Servings Per Container</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={formData.servings}
                    onChange={(e) => onFormDataChange({ ...formData, servings: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  placeholder="Product description, ingredients, benefits, usage instructions..."
                  value={formData.description}
                  onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                  className={`${inputClass} resize-none`}
                  rows={3}
                />
              </div>

              <div>
                <label className={labelClass}>Product Image {isEdit ? '' : '*'}</label>
                <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onImageChange}
                        className={`${inputClass} cursor-pointer`}
                        required={!isEdit}
                      />
                      <p className="mt-2 text-xs text-white/35">Upload a clear product image. JPG, PNG, GIF, or WebP. Max 5MB.</p>
                    </div>
                    <div className="shrink-0">
                      {imagePreview ? (
                        <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-white/20 bg-black/30">
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={onRemoveImage}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#E63C2F] text-xs font-black text-white hover:bg-[#cf3529]"
                          >
                            x
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
                          Preview
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Manufacturer/Brand</label>
                  <input type="text" placeholder="Optimum Nutrition" value={formData.manufacturer} onChange={(e) => onFormDataChange({ ...formData, manufacturer: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Flavor</label>
                  <input type="text" placeholder="Chocolate" value={formData.flavor} onChange={(e) => onFormDataChange({ ...formData, flavor: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Package Size</label>
                  <input type="text" placeholder="1kg" value={formData.size} onChange={(e) => onFormDataChange({ ...formData, size: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>SKU/Barcode</label>
                  <input type="text" placeholder="SKU-001" value={formData.sku} onChange={(e) => onFormDataChange({ ...formData, sku: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Per Serving Nutrition</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <input type="number" placeholder="Protein (g)" value={formData.protein} onChange={(e) => onFormDataChange({ ...formData, protein: e.target.value })} className={inputClass} />
                  <input type="number" placeholder="Carbs (g)" value={formData.carbs} onChange={(e) => onFormDataChange({ ...formData, carbs: e.target.value })} className={inputClass} />
                  <input type="number" placeholder="Fats (g)" value={formData.fats} onChange={(e) => onFormDataChange({ ...formData, fats: e.target.value })} className={inputClass} />
                  <input type="number" placeholder="Calories" value={formData.calories} onChange={(e) => onFormDataChange({ ...formData, calories: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Ingredients List</label>
                <textarea
                  placeholder="Whey Protein Isolate, Cocoa Powder..."
                  value={formData.ingredients}
                  onChange={(e) => onFormDataChange({ ...formData, ingredients: e.target.value })}
                  className={`${inputClass} resize-none`}
                  rows={2}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className={labelClass}>Certifications</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {certificationOptions.map((cert) => (
                    <label key={cert} className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 border border-white/15 rounded-lg hover:border-[#E63C2F]/40 transition-colors">
                      <input type="checkbox" checked={formData.certifications.includes(cert)} onChange={() => onCertificationToggle(cert)} className="w-4 h-4 accent-[#E63C2F]" />
                      <span className="text-xs font-semibold text-white/80">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Allergen Information</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {allergenOptions.map((allergen) => (
                    <label key={allergen} className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 border border-white/15 rounded-lg hover:border-[#E63C2F]/40 transition-colors">
                      <input type="checkbox" checked={formData.allergens.includes(allergen)} onChange={() => onAllergenToggle(allergen)} className="w-4 h-4 accent-[#E63C2F]" />
                      <span className="text-xs font-semibold text-white/80">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Warnings/Side Effects</label>
                  <textarea
                    placeholder="Any warnings for usage..."
                    value={formData.warnings}
                    onChange={(e) => onFormDataChange({ ...formData, warnings: e.target.value })}
                    className={`${inputClass} resize-none`}
                    rows={3}
                  />
                </div>
                <div>
                  <label className={labelClass}>Expiry Date</label>
                  <input type="date" value={formData.expiryDate} onChange={(e) => onFormDataChange({ ...formData, expiryDate: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Discount (%)</label>
                  <input type="number" placeholder="0" value={formData.discount} onChange={(e) => onFormDataChange({ ...formData, discount: e.target.value })} className={inputClass} min="0" max="100" />
                </div>
                <div>
                  <label className={labelClass}>Rating (1-5)</label>
                  <input type="number" placeholder="4.5" value={formData.rating} onChange={(e) => onFormDataChange({ ...formData, rating: e.target.value })} className={inputClass} min="1" max="5" step="0.1" />
                </div>
              </div>

              {getCategoryQuestions(formData.category).length > 0 && (
                <div className="bg-white/5 border border-white/15 rounded-xl p-4">
                  <h3 className="text-sm font-black text-[#E63C2F] uppercase tracking-widest mb-3">Category Questions</h3>
                  <div className="space-y-3">
                    {getCategoryQuestions(formData.category).map((q) => (
                      <div key={q.key}>
                        <label className="text-xs font-bold text-white/70 block mb-2">{q.question}</label>
                        {q.type === 'text' ? (
                          <input
                            type="text"
                            placeholder="Enter value..."
                            value={additionalInfo[q.key] || ''}
                            onChange={(e) => onAdditionalInfoChange({ ...additionalInfo, [q.key]: e.target.value })}
                            className={inputClass}
                          />
                        ) : (
                          <select
                            value={additionalInfo[q.key] || ''}
                            onChange={(e) => onAdditionalInfoChange({ ...additionalInfo, [q.key]: e.target.value })}
                            className={inputClass}
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
            </>
          )}
        </form>

        <div className="px-5 md:px-6 py-4 border-t border-white/10 flex justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="px-4 py-2 text-white/60 hover:text-white uppercase text-xs font-bold tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/25 text-white/80 hover:text-white hover:border-white/50 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              Cancel
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="px-5 py-2 bg-[#E63C2F] hover:bg-[#cf3529] text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                formNoValidate
                onClick={(e) => onSubmit(e as unknown as React.FormEvent)}
                disabled={formLoading}
                className="px-5 py-2 bg-[#E63C2F] hover:bg-[#cf3529] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                {formLoading ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Supplement' : 'Add Supplement')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
