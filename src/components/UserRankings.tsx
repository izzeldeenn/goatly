'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';

interface UserAccount {
  accountId: string;
  username: string;
  email: string;
  hashKey: string;
  avatar?: string;
  score: number;
  rank: number;
  studyTime: number;
  createdAt: string;
  lastActive: string;
}

export function UserRankings() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { users, isTimerActive, getCurrentUser } = useUser();
  const customTheme = useCustomThemeClasses();
  const [displayUsers, setDisplayUsers] = useState<UserAccount[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Sort users by study time (highest to lowest) and update ranks
    const sortedUsers = [...users].sort((a, b) => b.studyTime - a.studyTime);
    const rankedUsers = sortedUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    setDisplayUsers(rankedUsers);
  }, [users]);

  useEffect(() => {
    // Update rankings every second for live changes
    const interval = setInterval(() => {
      // Sort users by study time (highest to lowest) and update ranks
      const sortedUsers = [...users].sort((a, b) => b.studyTime - a.studyTime);
      const rankedUsers = sortedUsers.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
      setDisplayUsers(rankedUsers);
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [users]);

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayStudyTime = (user: UserAccount) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActiveDate = new Date(user.lastActive);
    
    // If last active was today, return the actual study time for today
    if (lastActiveDate >= today) {
      // For simplicity, we'll use a portion of total study time based on recent activity
      // In a real app, you'd track daily study time separately
      const todayPortion = Math.min(user.studyTime, 4 * 60 * 60); // Max 4 hours today display
      return todayPortion; // Return in seconds
    }
    return 0;
  };

  const getCoinsFromStudyTime = (studySeconds: number) => {
    // 1 coin every 10 minutes (600 seconds)
    return Math.floor(studySeconds / 600);
  };

  const isCurrentUserActive = (user: UserAccount) => {
    // Check if this is the current account and timer is active
    // In a real app, you'd track which user is currently studying
    // For now, we'll assume the user with currentAccountId is the active one
    const isActive = isTimerActive();
    const isCurrent = users.length > 0 && users[0]?.accountId === user.accountId;
    
    // Debug logging
    console.log('UserRankings Debug:', {
      userId: user.accountId,
      username: user.username,
      isActive,
      isCurrent,
      result: isActive && isCurrent
    });
    
    return isActive && isCurrent;
  };

  const isCurrentUser = (user: UserAccount) => {
    const currentUser = getCurrentUser();
    return currentUser?.accountId === user.accountId;
  };

  return (
    <div className="flex-1">
      <h2 className={`text-2xl font-bold mb-6 text-center ${
        theme === 'light' ? 'text-black' : 'text-white'
      }`}>{t.rankings}</h2>
      <div className="h-[calc(100vh-180px)] overflow-y-auto space-y-2">
        {displayUsers.length === 0 ? (
          <p className={`text-center py-12 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {t.noDevices}
          </p>
        ) : (
          displayUsers.map((user) => {
            const todaySeconds = getTodayStudyTime(user);
            const todayTimeFormatted = formatStudyTime(todaySeconds);
            const todayCoins = getCoinsFromStudyTime(todaySeconds);
            const userIsActive = isCurrentUserActive(user);
            const isCurrent = isCurrentUser(user);
            
            return (
              <div
                key={user.accountId}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                  isCurrent ? 'ring-4 ring-blue-400 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: isCurrent
                    ? 'rgba(59, 130, 246, 0.4)'
                    : user.rank === 1 
                    ? `${customTheme.colors.secondary}20`
                    : user.rank % 2 === 0 
                    ? `${customTheme.colors.primary}10`
                    : `${customTheme.colors.secondary}10`,
                  boxShadow: isCurrent 
                    ? '0 10px 15px -3px rgba(59, 130, 246, 0.5), 0 4px 6px -2px rgba(59, 130, 246, 0.3)' 
                    : user.rank <= 3 
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    : 'none'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span 
                      className="text-sm font-bold"
                      style={{
                        color: user.rank === 1 
                          ? customTheme.colors.secondary
                          : user.rank % 2 === 0 
                          ? customTheme.colors.primary 
                          : customTheme.colors.secondary
                      }}
                    >
                      {user.rank}
                    </span>
                    
                    <div className="text-xl">
                      {user.avatar?.startsWith('http') ? (
                        <img 
                          src={user.avatar} 
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        user.avatar || '👤'
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold ${
                        theme === 'light' ? 'text-black' : 'text-white'
                      } truncate`}>{user.username}</span>
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-yellow-50 to-green-50 text-green-700 border border-yellow-200'
                      : 'bg-gradient-to-r from-yellow-900/30 to-green-900/30 text-green-300 border border-yellow-700/50'
                  }`}>
                    <span className="w-1 h-1 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    {Math.floor(user.studyTime / 60)}m ⏱️
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
