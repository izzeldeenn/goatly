'use client';

import { useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminAdminsList from '@/components/admin/AdminAdminsList';

export default function AdminAdminsPage() {
  const { currentAdmin, isLoggedIn, isLoading, logout } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/admin-auth/login');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn || !currentAdmin) {
    return null;
  }

  if (!currentAdmin.isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Admins Management</h1>
            <p className="text-gray-400 text-sm">
              Manage all admins in the system
            </p>
          </div>

          <AdminAdminsList />
        </main>
      </div>
    </div>
  );
}
