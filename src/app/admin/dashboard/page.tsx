'use client';

import { useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminStats from '@/components/admin/AdminStats';
import AdminUsersList from '@/components/admin/AdminUsersList';
import AdminAdminsList from '@/components/admin/AdminAdminsList';

export default function AdminDashboard() {
  const { currentAdmin, isLoggedIn, isLoading, logout } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/admin-auth/login');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn || !currentAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">
              Welcome back, {currentAdmin.username}!
              {currentAdmin.isSuperAdmin && (
                <span className="ml-2 px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded-full border border-purple-500/50">
                  Super Admin
                </span>
              )}
            </p>
          </div>

          <div className="space-y-8">
            <AdminStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AdminUsersList />
              {currentAdmin.isSuperAdmin && <AdminAdminsList />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
