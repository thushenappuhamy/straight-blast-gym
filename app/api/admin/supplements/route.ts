export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Supplement from '@/src/models/Supplement';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const supplements = await Supplement.find().sort({ createdAt: -1 });

    const response = NextResponse.json({
      success: true,
      data: supplements,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supplements' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    
    // Verify JWT token
    const authHeader = req.headers.get('authorization');
    
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (tokenErr) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admins can add supplements' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await req.json();


    const { 
      name, 
      category, 
      price, 
      stock, 
      description, 
      dosage, 
      servings,
      image,
      manufacturer,
      flavor,
      size,
      protein,
      carbs,
      fats,
      calories,
      ingredients,
      certifications,
      allergens,
      warnings,
      expiryDate,
      sku,
      discount,
      rating
    } = body;

    // Validate required fields
    if (!name || !category || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, category, price' },
        { status: 400 }
      );
    }

    const supplement = new Supplement({
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      description,
      dosage,
      servings: servings ? parseInt(servings) : undefined,
      image,
      manufacturer,
      flavor,
      size,
      protein: protein ? parseFloat(protein) : undefined,
      carbs: carbs ? parseFloat(carbs) : undefined,
      fats: fats ? parseFloat(fats) : undefined,
      calories: calories ? parseFloat(calories) : undefined,
      ingredients,
      certifications: certifications || [],
      allergens: allergens || [],
      warnings,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      sku,
      discount: discount ? parseFloat(discount) : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      status: (parseInt(stock) || 0) > 10 ? 'active' : (parseInt(stock) || 0) > 0 ? 'low-stock' : 'out-of-stock',
    });

    await supplement.save();

    const response = NextResponse.json({
      success: true,
      data: supplement,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add supplement: ' + String(error) },
      { status: 500 }
    );
  }
}
