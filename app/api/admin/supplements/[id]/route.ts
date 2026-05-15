export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Supplement from '@/src/models/Supplement';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get id from the promise params
    const { id } = await params;
    
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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
        { success: false, error: 'Only admins can update supplements' },
        { status: 403 }
      );
    }

    await connectDB();

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid supplement ID' },
        { status: 400 }
      );
    }

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

    // Calculate status based on stock
    const status = stock > 10 ? 'active' : stock > 0 ? 'low-stock' : 'out-of-stock';

    const supplement = await Supplement.findByIdAndUpdate(
      id,
      {
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
        status,
      },
      { new: true }
    );

    if (!supplement) {
      return NextResponse.json(
        { success: false, error: 'Supplement not found' },
        { status: 404 }
      );
    }

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
      { success: false, error: 'Failed to update supplement: ' + String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get id from the promise params
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded: any = verify(token, JWT_SECRET);

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admins can delete supplements' },
        { status: 403 }
      );
    }

    await connectDB();

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid supplement ID' },
        { status: 400 }
      );
    }

    const supplement = await Supplement.findByIdAndDelete(id);

    if (!supplement) {
      return NextResponse.json(
        { success: false, error: 'Supplement not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Supplement deleted successfully',
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete supplement' },
      { status: 500 }
    );
  }
}
