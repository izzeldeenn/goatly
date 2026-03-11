'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

export function CurrentUserSelector() {
  const { theme } = useTheme();
  const { users, getCurrentUser } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const currentUser = getCurrentUser();

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    localStorage.setItem('fahman_hub_current_user', userId.toString());
  };

  return (
    <div className="mb-6">
      <h3 className={`text-lg font-bold mb-3 ${
        theme === 'light' ? 'text-black' : 'text-white'
      }`}>المستخدم الحالي</h3>
      
      {users.length === 0 ? (
        <p className={`text-sm ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          لا يوجد مستخدمون. قم بإضافة مستخدم أولاً.
        </p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user.id)}
              className={`w-full p-3 border-2 rounded-lg text-right transition-all ${
                (currentUser?.id === user.id)
                  ? theme === 'light'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-blue-400 bg-blue-900/30'
                  : theme === 'light'
                    ? 'border-gray-300 bg-white hover:border-gray-400'
                    : 'border-gray-600 bg-black hover:border-gray-500'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  theme === 'light' ? 'text-black' : 'text-white'
                }`}>
                  {user.name}
                </span>
                {(currentUser?.id === user.id) && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    theme === 'light'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 text-white'
                  }`}>
                    نشط
                  </span>
                )}
              </div>
              <div className={`text-xs mt-1 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                نقاط: {user.score} | وقت الدراسة: {Math.floor(user.studyTime / 60)} دقيقة
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
