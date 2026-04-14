'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
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
  const { isSessionActive, getSessionDuration } = useStudySession();
  const customTheme = useCustomThemeClasses();
  const [displayUsers, setDisplayUsers] = useState<UserAccount[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyRankings, setDailyRankings] = useState<DailyActivityFrontend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't update rankings if there's an active session
    if (isSessionActive) {
      setLoading(false);
      return;
    }
    
    loadDailyRankings();
  }, []); // Empty dependency array - only run on mount

  useEffect(() => {
    // Handle session state changes
    if (isSessionActive) {
      setLoading(false);
    } else {
      // Force update rankings immediately when session ends
      loadDailyRankings(true, true);
    }
  }, [isSessionActive]);

  useEffect(() => {
    // Don't update users if there's an active session
    if (isSessionActive) {
      return;
    }
    
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
  }, [users, dailyRankings, isSessionActive]);

  const loadDailyRankings = async (showLoading = true, forceUpdate = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // Force update if requested, otherwise use the 2-minute cache
      const lastRankUpdate = localStorage.getItem('lastRankUpdate');
      const now = Date.now();
      const shouldUpdateRankings = forceUpdate || !lastRankUpdate || (now - parseInt(lastRankUpdate)) > 120000; // 2 minutes
      
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
    // Don't update rankings if there's an active session
    if (isSessionActive) {
      return;
    }
    
    // Update rankings every 2 minutes for live changes (without loading indicator)
    const interval = setInterval(() => {
      loadDailyRankings(false);
      setCurrentTime(new Date());
    }, 120000); // Changed from 30000 to 120000 (2 minutes)

    return () => clearInterval(interval);
  }, [isSessionActive]);

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSessionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة ${secs} ثانية`;
    } else if (minutes > 0) {
      return `${minutes} دقيقة ${secs} ثانية`;
    } else {
      return `${secs} ثانية`;
    }
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
    // Check if user was active in the last 2 minutes
    const lastActiveTime = new Date(user.lastActive);
    const now = new Date();
    const timeDiff = now.getTime() - lastActiveTime.getTime();
    const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
    
    return timeDiff < twoMinutes;
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
      <div className="h-[calc(100vh-180px)] overflow-y-auto">
        {isSessionActive ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === 'light' ? 'text-black' : 'text-white'
                }`}>
                  جلسة دراسية نشطة
                </h3>
                <p className={`text-sm mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  مدة الجلسة الحالية: {formatSessionTime(getSessionDuration())}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg mb-6 ${
                theme === 'light' 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-yellow-900/20 border border-yellow-700/50'
              }`}>
                <p className={`text-sm font-medium ${
                  theme === 'light' ? 'text-yellow-800' : 'text-yellow-200'
                }`}>
                  ⚠️ لا يمكنك عرض الترتيب الحالي لمنع التشتت
                </p>
                <p className={`text-xs mt-1 ${
                  theme === 'light' ? 'text-yellow-700' : 'text-yellow-300'
                }`}>
                  بعد انهاء جلستك يمكنك رؤية الترتيب مباشرة
                </p>
              </div>
              
              <div className={`text-xs ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                ركز على دراستك! الترتيب في انتظارك 🎯
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
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
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer w-full ${
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
                          {formatStudyTime(getTodayStudyTime(user))}
                        </div>

                       </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
