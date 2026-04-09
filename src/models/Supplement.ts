import mongoose from 'mongoose';

const SupplementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String,
      enum: ['Protein', 'Mass Gainer', 'Creatine', 'Fat Burner', 'Vitamins'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    salesThisMonth: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'low-stock', 'out-of-stock'],
      default: 'active',
    },
    image: String,
    dosage: String,
    servings: Number,
    manufacturer: String,
    flavor: String,
    size: String,
    protein: Number,
    carbs: Number,
    fats: Number,
    calories: Number,
    ingredients: String,
    certifications: [String],
    allergens: [String],
    warnings: String,
    expiryDate: Date,
    sku: String,
    discount: Number,
    rating: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Supplement || mongoose.model('Supplement', SupplementSchema);
