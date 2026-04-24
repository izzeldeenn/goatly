'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { User, Shield, Lock, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  const { currentAdmin, isLoggedIn, isLoading, logout } = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
            <p className="text-gray-400 text-sm">
              Manage your account settings
            </p>
          </div>

          <div className="bg-black rounded-lg border border-gray-800 p-6">
            <div className="flex gap-4 mb-6 border-b border-gray-800 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-150 text-sm ${
                      activeTab === tab.id
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                    {currentAdmin.avatar ? (
                      <img 
                        src={currentAdmin.avatar} 
                        alt={currentAdmin.username}
                        className="w-20 h-20 rounded-full"
                      />
                    ) : (
                      <span className="text-white font-semibold text-2xl">
                        {currentAdmin.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{currentAdmin.username}</h3>
                    <p className="text-gray-400 text-sm">{currentAdmin.email}</p>
                    {currentAdmin.isSuperAdmin && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-gray-800 text-white text-xs rounded-full">
                        Super Admin
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Username</label>
                    <input
                      type="text"
                      defaultValue={currentAdmin.username}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={currentAdmin.email}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    />
                  </div>
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  />
                </div>
                <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
                  Update Password
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-md">
                  <div>
                    <h4 className="text-white font-medium">Email Notifications</h4>
                    <p className="text-gray-400 text-sm">Receive email updates about user activity</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-700 rounded-full relative">
                    <div className="w-5 h-5 bg-gray-400 rounded-full absolute top-0.5 left-0.5 transition-all" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-md">
                  <div>
                    <h4 className="text-white font-medium">Security Alerts</h4>
                    <p className="text-gray-400 text-sm">Get notified about security events</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-700 rounded-full relative">
                    <div className="w-5 h-5 bg-gray-400 rounded-full absolute top-0.5 left-0.5 transition-all" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-md">
                  <div>
                    <h4 className="text-white font-medium">System Updates</h4>
                    <p className="text-gray-400 text-sm">Receive notifications about system updates</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-700 rounded-full relative">
                    <div className="w-5 h-5 bg-gray-400 rounded-full absolute top-0.5 left-0.5 transition-all" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
