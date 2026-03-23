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
  rank: number;
  dailyRank?: number;
  studyTime: number;
  dailyStudyTime?: number;
  createdAt: string;
  lastActive: string;
}

export function UserRankings() {
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
    console.log('👥 All users:', allUsers.map(u => ({ id: u.accountId, name: u.username })));
    console.log('👤 Current user:', currentUser ? { id: currentUser.accountId, name: currentUser.username } : 'No current user');
    console.log('🏆 Daily rankings available:', dailyRankings.map(dr => ({ 
        id: dr.id, 
        accountId: dr.accountId, 
        rank: dr.dailyRank, 
        minutes: dr.studyMinutes,
        username: 'Unknown'
      })));
    
    const usersWithDailyRank = allUsers.map(user => {
      const dailyActivity = dailyRankings.find(dr => dr.accountId === user.accountId);
      const result = {
        ...user,
        dailyRank: dailyActivity?.dailyRank || 999,
        dailyStudyTime: dailyActivity?.studyMinutes || 0
      };
      
      // Log for all users to debug the mapping issue
      console.log('🎯 User mapping:', {
        accountId: user.accountId,
        username: user.username,
        foundActivity: !!dailyActivity,
        dailyRank: result.dailyRank,
        dailyStudyTime: result.dailyStudyTime,
        dailyActivityData: dailyActivity
      });
      
      return result;
    });
    
    // Sort by daily rank
    const sortedUsers = usersWithDailyRank.sort((a, b) => a.dailyRank - b.dailyRank);
    console.log('📊 Final sorted users (top 10):', sortedUsers.slice(0, 10).map(u => ({ 
      rank: u.dailyRank, 
      name: u.username, 
      minutes: u.dailyStudyTime 
    })));
    setDisplayUsers(sortedUsers);
  }, [users, dailyRankings]);

  const loadDailyRankings = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading daily rankings...');
      
      // Force update rankings before loading
      await dailyActivityDB.updateTodayRankings();
      
      const rankings = await dailyActivityDB.getTodayRankings();
      console.log('📊 Raw rankings from DB:', rankings);
      
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
      console.log('📊 Formatted rankings:', formattedRankings);
      
      // Debug: Check if we have any rankings with valid ranks
      const validRanks = formattedRankings.filter(r => r.dailyRank < 999);
      console.log('📊 Valid rankings (rank < 999):', validRanks);
      
      setDailyRankings(formattedRankings);
    } catch (error) {
      console.error('❌ Error loading daily rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Update rankings every 30 seconds for live changes
    const interval = setInterval(() => {
      loadDailyRankings();
      setCurrentTime(new Date());
    }, 30000);

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

  const isCurrentUserActive = (user: UserAccount) => {
    // Check if this is the current account and timer is active
    // In a real app, you'd track which user is currently studying
    // For now, we'll assume the user with currentAccountId is the active one
    const isActive = isTimerActive();
    const isCurrent = users.length > 0 && users[0]?.accountId === user.accountId;
    
    return isActive && isCurrent;
  };

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
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                  isCurrent ? 'ring-4 ring-blue-400 ring-offset-2' : ''
                }`}
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
                  <div className="flex items-center space-x-3">
                    <span 
                      className="text-sm font-bold"
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
                    {Math.floor(getTodayStudyTime(user) / 60)}m
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
