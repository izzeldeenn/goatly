import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Try to get all admins
    const admins = await adminDB.getAllAdmins();
    
    return NextResponse.json({
      success: true,
      adminsCount: admins.length,
      admins: admins.map(admin => ({
        adminId: admin.admin_id,
        username: admin.username,
        email: admin.email,
        isSuperAdmin: admin.is_super_admin,
        createdAt: admin.created_at
      }))
    });
  } catch (error: any) {
    console.error('Error checking admins:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Failed to check admins',
        details: String(error)
      },
      { status: 500 }
    );
  }
}
