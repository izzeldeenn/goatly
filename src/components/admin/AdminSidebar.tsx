'use client';

import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Settings, 
  LogOut,
  UserPlus
} from 'lucide-react';

export default function AdminSidebar() {
  const { currentAdmin, logout } = useAdmin();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin-auth/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Shield, label: 'Admins', path: '/admin/admins', superAdminOnly: true },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white/10 backdrop-blur-lg border-r border-white/20 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Admin Panel</h2>
        <p className="text-gray-400 text-sm">Management Dashboard</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          if (item.superAdminOnly && !currentAdmin?.isSuperAdmin) {
            return null;
          }

          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200"
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="border-t border-white/20 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {currentAdmin?.avatar ? (
                <img 
                  src={currentAdmin.avatar} 
                  alt={currentAdmin.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-white font-semibold">
                  {currentAdmin?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{currentAdmin?.username}</p>
              <p className="text-gray-400 text-xs truncate">{currentAdmin?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
