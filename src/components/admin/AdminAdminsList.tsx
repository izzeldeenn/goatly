'use client';

import { useEffect, useState } from 'react';
import { adminDB, AdminAccountFrontend } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { Search, MoreVertical, Shield, Trash2, UserPlus } from 'lucide-react';

export default function AdminAdminsList() {
  const [admins, setAdmins] = useState<AdminAccountFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentAdmin, deleteAdmin } = useAdmin();

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const allAdmins = await adminDB.getAllAdmins();
        setAdmins(allAdmins.map(admin => ({
          id: admin.id,
          adminId: admin.admin_id,
          username: admin.username,
          email: admin.email,
          avatar: admin.avatar,
          role: admin.role,
          isSuperAdmin: admin.is_super_admin,
          createdAt: admin.created_at,
          lastActive: admin.last_active
        })));
      } catch (error) {
        console.error('Error loading admins:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdmins();
  }, []);

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    const result = await deleteAdmin(adminId);
    if (result.success) {
      setAdmins(admins.filter(admin => admin.adminId !== adminId));
    } else {
      alert(result.error || 'Failed to delete admin');
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-black rounded-lg p-4 border border-gray-800">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-800 rounded w-1/4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Admins</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredAdmins.length === 0 ? (
          <p className="text-gray-400 text-center py-6 text-sm">No admins found</p>
        ) : (
          filteredAdmins.map((admin) => (
            <div
              key={admin.adminId}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-md hover:bg-gray-700 transition-all duration-150"
            >
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                {admin.avatar ? (
                  <img 
                    src={admin.avatar} 
                    alt={admin.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {admin.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium text-sm truncate">{admin.username}</h3>
                  {admin.isSuperAdmin && (
                    <span className="px-2 py-0.5 bg-gray-700 text-white text-xs rounded-full">
                      Super
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <Shield className="w-3 h-3" />
                  <span className="truncate">{admin.email}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-gray-400 text-xs">
                  {new Date(admin.lastActive).toLocaleDateString()}
                </p>
              </div>

              {currentAdmin?.isSuperAdmin && admin.adminId !== currentAdmin.adminId && (
                <button
                  onClick={() => handleDeleteAdmin(admin.adminId)}
                  className="p-1.5 hover:bg-red-900 rounded-md transition-colors group"
                  title="Delete admin"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                </button>
              )}

              <button className="p-1.5 hover:bg-gray-700 rounded-md transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800">
        <p className="text-gray-400 text-xs">
          Showing {filteredAdmins.length} of {admins.length} admins
        </p>
      </div>
    </div>
  );
}
