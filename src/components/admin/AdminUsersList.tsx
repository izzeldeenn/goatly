'use client';

import { useEffect, useState } from 'react';
import { userDB, UserAccountFrontend } from '@/lib/supabase';
import { Search, MoreVertical, Mail, Calendar } from 'lucide-react';

export default function AdminUsersList() {
  const [users, setUsers] = useState<UserAccountFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await userDB.getAllUsers();
        setUsers(allUsers.map(user => ({
          id: user.id,
          accountId: user.account_id,
          username: user.username,
          email: user.email,
          hashKey: user.hash_key,
          avatar: user.avatar,
          referralCode: user.referral_code,
          country: user.country,
          browserId: user.browser_id,
          deviceId: user.device_id,
          createdAt: user.created_at,
          lastActive: user.last_active
        })));
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-xl font-semibold text-white">Users</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No users found</p>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.accountId}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{user.username}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-white font-semibold">-</p>
                <p className="text-gray-400 text-xs">points</p>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-xs flex-shrink-0">
                <Calendar className="w-3 h-3" />
                <span>{new Date(user.lastActive).toLocaleDateString()}</span>
              </div>

              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-gray-400 text-sm">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>
    </div>
  );
}
