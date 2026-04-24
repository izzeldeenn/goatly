'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminDB, AdminAccount, AdminAccountFrontend } from '@/lib/supabase';
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/utils/password';

// Convert Supabase DB format to frontend format
const convertToAdminAccountFrontend = (dbAdmin: AdminAccount): AdminAccountFrontend => ({
  id: dbAdmin.id,
  adminId: dbAdmin.admin_id,
  username: dbAdmin.username,
  email: dbAdmin.email,
  avatar: dbAdmin.avatar,
  role: dbAdmin.role,
  isSuperAdmin: dbAdmin.is_super_admin,
  createdAt: dbAdmin.created_at,
  lastActive: dbAdmin.last_active
});

// Convert frontend format to Supabase DB format
const convertToAdminAccount = (admin: AdminAccountFrontend): AdminAccount => ({
  id: admin.id,
  admin_id: admin.adminId,
  username: admin.username,
  email: admin.email,
  password: '', // Password should never be sent to frontend
  avatar: admin.avatar,
  role: admin.role,
  is_super_admin: admin.isSuperAdmin,
  created_at: admin.createdAt,
  last_active: admin.lastActive
});

interface AdminContextType {
  currentAdmin: AdminAccountFrontend | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (email: string, password: string, username: string, isSuperAdmin?: boolean) => Promise<{ success: boolean; error?: string }>;
  updateAdminProfile: (username?: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  getAllAdmins: () => Promise<AdminAccountFrontend[]>;
  deleteAdmin: (adminId: string) => Promise<{ success: boolean; error?: string }>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccountFrontend | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session
    const initializeAdminSession = async () => {
      if (typeof window !== 'undefined') {
        const savedAdminId = localStorage.getItem('adminId');
        const savedLoginState = localStorage.getItem('adminLoggedIn') === 'true';

        console.log('Initializing admin session:', { savedAdminId, savedLoginState });

        if (savedAdminId && savedLoginState) {
          // Verify that admin still exists in database
          try {
            const admin = await adminDB.getAdminByAdminId(savedAdminId);
            console.log('Admin from DB:', admin);
            if (admin) {
              setCurrentAdmin(convertToAdminAccountFrontend(admin));
              setIsLoggedIn(true);
              // Update last active
              await adminDB.updateAdminLastActive(savedAdminId);
            } else {
              console.log('Admin not found in DB, clearing session');
              localStorage.removeItem('adminId');
              localStorage.removeItem('adminLoggedIn');
            }
          } catch (error) {
            console.error('Error loading admin session:', error);
            localStorage.removeItem('adminId');
            localStorage.removeItem('adminLoggedIn');
          }
        }
      }
      setIsLoading(false);
    };

    initializeAdminSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Find admin by email
      const admin = await adminDB.getAdminByEmail(email);

      if (!admin) {
        return { success: false, error: 'Admin not found' };
      }

      // Verify password using bcrypt
      const isPasswordValid = await verifyPassword(password, admin.password);
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid password' };
      }

      console.log('Login successful, admin:', admin.admin_id);

      // Set current admin and mark as logged in
      setCurrentAdmin(convertToAdminAccountFrontend(admin));
      setIsLoggedIn(true);

      // Update last active
      await adminDB.updateAdminLastActive(admin.admin_id);

      // Store session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminId', admin.admin_id);
        localStorage.setItem('adminLoggedIn', 'true');
        console.log('Session saved to localStorage:', admin.admin_id);
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    // Clear session
    setCurrentAdmin(null);
    setIsLoggedIn(false);

    // Clear session from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminLoggedIn');
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string,
    isSuperAdmin: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validation
      if (!email || !password || !username) {
        return { success: false, error: 'All fields are required' };
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      if (!email.includes('@')) {
        return { success: false, error: 'Invalid email address' };
      }

      // Check if admin already exists
      const existingAdmin = await adminDB.getAdminByEmail(email);
      if (existingAdmin) {
        return { success: false, error: 'Email already registered' };
      }

      // Check if current user is super admin (only super admins can create new admins)
      if (currentAdmin && !currentAdmin.isSuperAdmin) {
        return { success: false, error: 'Only super admins can create new admins' };
      }

      // Hash password before storing
      const hashedPassword = await hashPassword(password);

      // Generate admin ID
      const adminId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate random avatar seed
      const randomAvatarSeed = `admin${Math.floor(Math.random() * 1000)}`;
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomAvatarSeed}`;

      // Create new admin
      const newAdminData: Partial<AdminAccount> = {
        admin_id: adminId,
        username: username,
        email: email,
        password: hashedPassword,
        avatar: avatarUrl,
        role: 'admin',
        is_super_admin: isSuperAdmin,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      };

      const result = await adminDB.createAdmin(newAdminData);

      if (result) {
        return { success: true };
      } else {
        return { success: false, error: 'Admin creation failed' };
      }
    } catch (error) {
      return { success: false, error: 'Admin creation failed' };
    }
  };

  const updateAdminProfile = async (
    username?: string,
    avatar?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!currentAdmin) {
        return { success: false, error: 'No admin logged in' };
      }

      const updateData: Partial<AdminAccount> = {};
      if (username) updateData.username = username;
      if (avatar) updateData.avatar = avatar;

      const result = await adminDB.updateAdminByAdminId(currentAdmin.adminId, updateData);

      if (result) {
        // Update local state
        setCurrentAdmin(prev => prev ? { ...prev, ...convertToAdminAccountFrontend(result) } : null);
        return { success: true };
      } else {
        return { success: false, error: 'Profile update failed' };
      }
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  };

  const getAllAdmins = async (): Promise<AdminAccountFrontend[]> => {
    try {
      const admins = await adminDB.getAllAdmins();
      return admins.map(admin => convertToAdminAccountFrontend(admin));
    } catch (error) {
      return [];
    }
  };

  const deleteAdmin = async (adminId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if current user is super admin
      if (!currentAdmin || !currentAdmin.isSuperAdmin) {
        return { success: false, error: 'Only super admins can delete admins' };
      }

      // Prevent deleting yourself
      if (adminId === currentAdmin.adminId) {
        return { success: false, error: 'Cannot delete yourself' };
      }

      const result = await adminDB.deleteAdminByAdminId(adminId);

      if (result) {
        return { success: true };
      } else {
        return { success: false, error: 'Admin deletion failed' };
      }
    } catch (error) {
      return { success: false, error: 'Admin deletion failed' };
    }
  };

  return (
    <AdminContext.Provider value={{
      currentAdmin,
      isLoggedIn,
      isLoading,
      login,
      logout,
      register,
      updateAdminProfile,
      getAllAdmins,
      deleteAdmin
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

// Export the context directly for components that need it
export { AdminContext };
