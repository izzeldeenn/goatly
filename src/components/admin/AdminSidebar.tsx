'use client';

import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Settings, 
  LogOut,
  UserPlus,
  Bot,
  Bell
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
    { icon: Bot, label: 'AI', path: '/admin/ai' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="w-56 min-h-screen bg-black border-r border-gray-800 p-4">
      <div className="mb-6 flex items-center gap-3">
        <img 
          src="/goat.png" 
          alt="Goatly Logo" 
          className="w-10 h-10 rounded-lg"
        />
        <div>
          <h2 className="text-lg font-bold text-white mb-0.5">Admin Panel</h2>
          <p className="text-gray-400 text-xs">Management Dashboard</p>
        </div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          if (item.superAdminOnly && !currentAdmin?.isSuperAdmin) {
            return null;
          }

          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-all duration-150 text-sm"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              {currentAdmin?.avatar ? (
                <img 
                  src={currentAdmin.avatar} 
                  alt={currentAdmin.username}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {currentAdmin?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{currentAdmin?.username}</p>
              <p className="text-gray-400 text-xs truncate">{currentAdmin?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-auto items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-all duration-150 text-sm"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
