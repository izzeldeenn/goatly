'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

interface User {
  id: number;
  name: string;
  score: number;
  rank: number;
}

export function UserRankings() {
  const { theme } = useTheme();
  const { users } = useUser();
  const [displayUsers, setDisplayUsers] = useState(users);

  useEffect(() => {
    setDisplayUsers(users);
  }, [users]);

  useEffect(() => {
    // Simulate score changes for demo purposes
    const interval = setInterval(() => {
      setDisplayUsers(prevUsers => {
        if (prevUsers.length === 0) return prevUsers;
        
        const newUsers = [...prevUsers];
        const randomIndex = Math.floor(Math.random() * newUsers.length);
        const scoreChange = Math.floor(Math.random() * 100) - 50;
        newUsers[randomIndex].score = Math.max(0, newUsers[randomIndex].score + scoreChange);
        
        newUsers.sort((a, b) => b.score - a.score);
        newUsers.forEach((user, index) => {
          user.rank = index + 1;
        });
        
        return newUsers;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1">
      <h2 className={`text-xl font-bold mb-4 text-center ${
        theme === 'light' ? 'text-black' : 'text-white'
      }`}>الترتيب</h2>
      <div className="space-y-2">
        {displayUsers.length === 0 ? (
          <p className={`text-center py-8 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            لا يوجد مستخدمون بعد
          </p>
        ) : (
          displayUsers.map((user) => (
            <div
              key={user.id}
              className={`p-3 border rounded-lg flex items-center justify-between transition-all duration-300 ${
                user.rank === 1
                  ? theme === 'light' 
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-yellow-600 bg-yellow-900/20'
                  : user.rank === 2
                  ? theme === 'light'
                    ? 'border-gray-400 bg-gray-50'
                    : 'border-gray-500 bg-gray-700/50'
                  : user.rank === 3
                  ? theme === 'light'
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-orange-600 bg-orange-900/20'
                  : theme === 'light'
                    ? 'border-gray-300 bg-white'
                    : 'border-gray-600 bg-black'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`font-bold text-lg w-6 ${
                  theme === 'light' ? 'text-black' : 'text-white'
                }`}>{user.rank}</span>
                <span className={`font-medium ${
                  theme === 'light' ? 'text-black' : 'text-white'
                }`}>{user.name}</span>
              </div>
              <span className={`font-bold ${
                theme === 'light' ? 'text-black' : 'text-white'
              }`}>{user.score}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
