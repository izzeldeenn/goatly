'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

export function UserManager() {
  const { theme } = useTheme();
  const { users, addUser, removeUser } = useUser();
  const [newUserName, setNewUserName] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);

  const handleAddUser = () => {
    if (newUserName.trim()) {
      addUser(newUserName.trim());
      setNewUserName('');
      setShowAddUser(false);
    }
  };

  const handleRemoveUser = (userId: number) => {
    removeUser(userId);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-bold ${
          theme === 'light' ? 'text-black' : 'text-white'
        }`}>المستخدمون</h3>
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className={`px-3 py-1 border-2 rounded text-sm font-medium transition-colors ${
            theme === 'light'
              ? 'border-black bg-white text-black hover:bg-black hover:text-white'
              : 'border-white bg-black text-white hover:bg-white hover:text-black'
          }`}
        >
          + إضافة مستخدم
        </button>
      </div>

      {showAddUser && (
        <div className={`mb-4 p-3 border-2 rounded-lg ${
          theme === 'light'
            ? 'border-gray-300 bg-white'
            : 'border-gray-600 bg-black'
        }`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="اسم المستخدم"
              className={`flex-1 px-3 py-2 border-2 rounded focus:outline-none ${
                theme === 'light'
                  ? 'border-gray-300 bg-white text-black focus:border-black'
                  : 'border-gray-600 bg-black text-white focus:border-white'
              }`}
            />
            <button
              onClick={handleAddUser}
              className={`px-4 py-2 border-2 rounded font-medium transition-colors ${
                theme === 'light'
                  ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                  : 'border-green-500 bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              إضافة
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {users.map((user) => (
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
            }`}>{user.name}</span>
            <button
              onClick={() => handleRemoveUser(user.id)}
              className={`px-2 py-1 border rounded text-xs transition-colors ${
                theme === 'light'
                  ? 'border-red-600 bg-red-600 text-white hover:bg-red-700'
                  : 'border-red-500 bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              حذف
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
