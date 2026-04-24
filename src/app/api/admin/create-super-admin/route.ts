import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/lib/supabase';
import { hashPassword } from '@/utils/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await adminDB.getAdminByEmail(email);
    console.log('Existing admin check:', existingAdmin);
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate admin ID
    const adminId = `admin_super_${Date.now()}`;

    // Generate avatar
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // Create super admin
    const result = await adminDB.createAdmin({
      admin_id: adminId,
      username: username,
      email: email,
      password: hashedPassword,
      avatar: avatarUrl,
      role: 'admin',
      is_super_admin: true,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    });

    console.log('Create admin result:', result);

    if (!result.admin || result.error) {
      return NextResponse.json(
        { error: 'Failed to create admin: ' + (result.error || 'Unknown error') },
        { status: 500 }
      );
    }

    const newAdmin = result.admin;

    return NextResponse.json({
      success: true,
      message: 'Super admin created successfully',
      admin: {
        adminId: newAdmin.admin_id,
        username: newAdmin.username,
        email: newAdmin.email,
        isSuperAdmin: newAdmin.is_super_admin
      }
    });
  } catch (error) {
    console.error('Error creating super admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
