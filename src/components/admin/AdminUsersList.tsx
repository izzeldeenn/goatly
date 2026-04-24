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
        <h2 className="text-lg font-semibold text-white">Users</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-400 text-center py-6 text-sm">No users found</p>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.accountId}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-md hover:bg-gray-700 transition-all duration-150"
            >
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">{user.username}</h3>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-gray-400 text-xs flex-shrink-0">
                <Calendar className="w-3 h-3" />
                <span>{new Date(user.lastActive).toLocaleDateString()}</span>
              </div>

              <button className="p-1.5 hover:bg-gray-700 rounded-md transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800">
        <p className="text-gray-400 text-xs">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>
    </div>
  );
}
