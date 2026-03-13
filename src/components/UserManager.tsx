'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

export function UserManager() {
  const { theme } = useTheme();
  const { getAllDeviceUsers } = useUser();
  
  const users = getAllDeviceUsers();

  return (
    <div className="mb-6">
      <h3 className={`text-lg font-bold mb-4 ${
        theme === 'light' ? 'text-black' : 'text-white'
      }`}>الأجهزة</h3>
      
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {users.length === 0 ? (
          <p className={`text-sm ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            لا يوجد أجهزة بعد
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-2 border rounded ${
                theme === 'light'
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-700 bg-gray-900'
              }`}
            >
              <span className={`text-sm ${
                theme === 'light' ? 'text-black' : 'text-white'
              }`}>{user.username}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                theme === 'light'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
              }`}>
                ترتيب {user.rank}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
