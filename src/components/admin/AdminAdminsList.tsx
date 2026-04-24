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
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/20 rounded w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/10 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Admins</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAdmins.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No admins found</p>
        ) : (
          filteredAdmins.map((admin) => (
            <div
              key={admin.adminId}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                {admin.avatar ? (
                  <img 
                    src={admin.avatar} 
                    alt={admin.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {admin.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium truncate">{admin.username}</h3>
                  {admin.isSuperAdmin && (
                    <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 text-xs rounded-full border border-purple-500/50">
                      Super
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
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
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                  title="Delete admin"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                </button>
              )}

              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-gray-400 text-sm">
          Showing {filteredAdmins.length} of {admins.length} admins
        </p>
      </div>
    </div>
  );
}
