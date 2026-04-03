'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { dailyActivityDB, DailyActivityFrontend } from '@/lib/dailyActivity';

interface UserAccount {
  accountId: string;
  username: string;
  email: string;
  hashKey: string;
  avatar?: string;
  score: number;
  dailyRank?: number;
  dailyStudyTime?: number;
  createdAt: string;
  lastActive: string;
}

interface UserRankingsProps {
  onUserClick?: (user: UserAccount) => void;
}

export function UserRankings({ onUserClick }: UserRankingsProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { users, isTimerActive, getCurrentUser, getAllDeviceUsers, isVirtualUser } = useUser();
  const customTheme = useCustomThemeClasses();
  const [displayUsers, setDisplayUsers] = useState<UserAccount[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyRankings, setDailyRankings] = useState<DailyActivityFrontend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyRankings();
  }, []);

  useEffect(() => {
    // Get all users including virtual ones and merge with daily rankings
    const allUsers = getAllDeviceUsers();
    const currentUser = getCurrentUser();
    
    const usersWithDailyRank = allUsers.map(user => {
      const dailyActivity = dailyRankings.find(dr => dr.accountId === user.accountId);
      const result = {
        ...user,
        dailyRank: dailyActivity?.dailyRank || 999,
        dailyStudyTime: dailyActivity?.studyMinutes || 0
      };
      
      return result;
    });
    
    // Sort by daily rank
    const sortedUsers = usersWithDailyRank.sort((a, b) => a.dailyRank - b.dailyRank);
    setDisplayUsers(sortedUsers);
  }, [users, dailyRankings]);

  const loadDailyRankings = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // Only update rankings if it's been more than 2 minutes since last update
      const lastRankUpdate = localStorage.getItem('lastRankUpdate');
      const now = Date.now();
      const shouldUpdateRankings = !lastRankUpdate || (now - parseInt(lastRankUpdate)) > 120000; // 2 minutes
      
      if (shouldUpdateRankings) {
        await dailyActivityDB.updateTodayRankings();
        localStorage.setItem('lastRankUpdate', now.toString());
      }
      
      const rankings = await dailyActivityDB.getTodayRankings();
      
      const formattedRankings = rankings.map(activity => ({
        id: activity.id,
        accountId: activity.account_id,
        date: activity.date,
        studyMinutes: activity.study_minutes,
        studySeconds: activity.study_seconds || 0,
        lastUpdated: activity.last_updated || activity.updated_at,
        startTime: activity.start_time,
        endTime: activity.end_time,
        pointsEarned: activity.points_earned,
        dailyRank: activity.daily_rank,
        sessionsCount: activity.sessions_count,
        focusScore: activity.focus_score,
        createdAt: activity.created_at,
        updatedAt: activity.updated_at
      }));
      
      // Debug: Check if we have any rankings with valid ranks
      const validRanks = formattedRankings.filter(r => r.dailyRank < 999);
      
      setDailyRankings(formattedRankings);
    } catch (error) {
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Update rankings every 2 minutes for live changes (without loading indicator)
    const interval = setInterval(() => {
      loadDailyRankings(false);
      setCurrentTime(new Date());
    }, 120000); // Changed from 30000 to 120000 (2 minutes)

    return () => clearInterval(interval);
  }, []);

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayStudyTime = (user: UserAccount) => {
    // Convert daily study time from minutes to seconds for formatting
    return (user.dailyStudyTime || 0) * 60;
  };

  const getCoinsFromStudyTime = (studySeconds: number) => {
    // 1 coin every 10 minutes (600 seconds)
    return Math.floor(studySeconds / 600);
  };

  const isRecentlyActive = (user: UserAccount) => {
    // Check if user was active in the last minute
    const lastActiveTime = new Date(user.lastActive);
    const now = new Date();
    const timeDiff = now.getTime() - lastActiveTime.getTime();
    const oneMinute = 60 * 1000; // 1 minute in milliseconds
    
    return timeDiff < oneMinute;
  };

  const isCurrentUserActive = (user: UserAccount) => {
    // Check if this is the current account and timer is active
    const isActive = isTimerActive();
    const currentUser = getCurrentUser();
    const isCurrent = currentUser?.accountId === user.accountId;
    
    return isActive && isCurrent;
  };

  // Add effect to update current time every second for accurate activity detection
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const isCurrentUser = (user: UserAccount) => {
    const currentUser = getCurrentUser();
    return currentUser?.accountId === user.accountId;
  };

  return (
    <div className="flex-1">
      <div className="flex justify-center items-center mb-6">
        <h2 className={`text-2xl font-bold text-center ${
          theme === 'light' ? 'text-black' : 'text-white'
        }`}>{t.dailyRankings}</h2>
      </div>
      <div className="h-[calc(100vh-180px)] overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : displayUsers.length === 0 ? (
          <p className={`text-center py-12 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {t.noDailyActivity}
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
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer w-full max-w-md ${
                  isCurrent ? 'ring-4 ring-blue-400 ring-offset-2' : ''
                }`}
                onClick={() => onUserClick && onUserClick(user)}
                style={{
                  backgroundColor: isCurrent
                    ? 'rgba(59, 130, 246, 0.4)'
                    : (user.dailyRank || 0) === 1 
                    ? `${customTheme.colors.secondary}20`
                    : (user.dailyRank || 0) % 2 === 0 
                    ? `${customTheme.colors.primary}10`
                    : `${customTheme.colors.secondary}10`,
                  boxShadow: isCurrent 
                    ? '0 10px 15px -3px rgba(59, 130, 246, 0.5), 0 4px 6px -2px rgba(59, 130, 246, 0.3)' 
                    : (user.dailyRank || 0) <= 3 
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    : 'none'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span 
                      className="text-sm font-bold flex-shrink-0"
                      style={{
                        color: (user.dailyRank || 0) === 1 
                          ? customTheme.colors.secondary
                          : (user.dailyRank || 0) % 2 === 0 
                          ? customTheme.colors.primary 
                          : customTheme.colors.secondary
                      }}
                    >
                      #{user.dailyRank || 999}
                    </span>
                    
                    <div className="text-xl flex-shrink-0">
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
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm font-semibold block ${
                          theme === 'light' ? 'text-black' : 'text-white'
                        } truncate`} title={user.username}>{user.username}</span>
                        
                        {isRecentlyActive(user) && (
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" title="نشط الآن"></span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      theme === 'light'
                        ? 'bg-gradient-to-r from-yellow-50 to-green-50 text-green-700 border border-yellow-200'
                        : 'bg-gradient-to-r from-yellow-900/30 to-green-900/30 text-green-300 border border-yellow-700/50'
                    }`}>
                      <span className="w-1 h-1 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                      {Math.floor(getTodayStudyTime(user) / 60)}m
                    </div>

                    {userIsActive && (
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full ${
                          theme === 'light' ? 'bg-green-500' : 'bg-green-400'
                        } animate-pulse shadow-lg shadow-green-500/50`}></span>
                      </div>
                    )}
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
