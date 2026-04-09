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
    console.error('Error fetching supplements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supplements' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('📝 [SUPPLEMENTS API] POST request received');
    
    // Verify JWT token
    const authHeader = req.headers.get('authorization');
    console.log('🔐 [SUPPLEMENTS API] Auth header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.split(' ')[1];
    if (!token) {
      console.log('❌ [SUPPLEMENTS API] No token found');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
      console.log('✅ [SUPPLEMENTS API] Token verified, role:', decoded.role);
    } catch (tokenErr) {
      console.error('❌ [SUPPLEMENTS API] Token verification failed:', tokenErr);
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      console.log('❌ [SUPPLEMENTS API] User is not admin, role:', decoded.role);
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admins can add supplements' },
        { status: 403 }
      );
    }

    console.log('📡 [SUPPLEMENTS API] Connecting to database...');
    await connectDB();
    console.log('✅ [SUPPLEMENTS API] Database connected');

    const body = await req.json();
    console.log('📥 [SUPPLEMENTS API] Request body:', {
      name: body.name,
      category: body.category,
      price: body.price,
      stock: body.stock,
    });

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
      console.log('❌ [SUPPLEMENTS API] Missing required fields:', { name, category, price });
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

    console.log('💾 [SUPPLEMENTS API] Saving supplement...');
    await supplement.save();
    console.log('✅ [SUPPLEMENTS API] Supplement saved:', supplement._id);

    const response = NextResponse.json({
      success: true,
      data: supplement,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('❌ [SUPPLEMENTS API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add supplement: ' + String(error) },
      { status: 500 }
    );
  }
}
