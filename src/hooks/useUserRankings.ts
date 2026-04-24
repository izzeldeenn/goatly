'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
import { usePoints } from '@/contexts/PointsContext';
import { dailyActivityDB, DailyActivityFrontend } from '@/lib/dailyActivity';
import { activitySessionDB } from '@/lib/activitySessions';

interface UserAccount {
  accountId: string;
  username: string;
  email: string;
  hashKey: string;
  avatar?: string;
  dailyRank?: number;
  dailyStudyTime?: number;
  createdAt: string;
  lastActive: string;
}

export function useUserRankings() {
  const { users, isTimerActive, getCurrentUser, getAllDeviceUsers } = useUser();
  const { isSessionActive, getSessionDuration } = useStudySession();
  const { calculateCoinsFromStudyTime } = usePoints();

  const [displayUsers, setDisplayUsers] = useState<UserAccount[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyRankings, setDailyRankings] = useState<DailyActivityFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());

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
      // Force update rankings after a small delay to ensure session data is updated
      setTimeout(() => {
        loadDailyRankings(true, true);
      }, 2000); // Wait 2 seconds for database to update
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
        dailyStudyTime: dailyActivity?.studySeconds || 0
      };

      return result;
    });

    // Sort by daily rank
    const sortedUsers = usersWithDailyRank.sort((a, b) => a.dailyRank - b.dailyRank);

    // Find current user's position in sorted list
    if (currentUser) {
      const currentUserIndex = sortedUsers.findIndex(user => user.accountId === currentUser.accountId);
      if (currentUserIndex !== -1) {
        // Calculate which page the current user is on
        const userPage = Math.floor(currentUserIndex / itemsPerPage) + 1;
        // Automatically navigate to the page containing the current user
        if (userPage !== currentPage) {
          setCurrentPage(userPage);
        }
      }
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    setDisplayUsers(paginatedUsers);
  }, [users, dailyRankings, isSessionActive, currentPage, itemsPerPage]);

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
        studyMinutes: Math.floor((activity.study_seconds || 0) / 60),
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
      
      setDailyRankings(formattedRankings);
    } catch (error) {
      console.error('Failed to load daily rankings:', error);
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
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Add effect to update current time every second for accurate activity detection
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Check for active users in the database
  useEffect(() => {
    const checkActiveUsers = async () => {
      if (isSessionActive) return;
      
      try {
        const activeSet = new Set<string>();
        
        // Check all display users for active sessions
        for (const user of displayUsers) {
          const activeSession = await activitySessionDB.getActiveSession(user.accountId);
          if (activeSession) {
            activeSet.add(user.accountId);
          }
        }
        
        setActiveUsers(activeSet);
      } catch (error) {
        console.error('Error checking active users:', error);
      }
    };

    // Check immediately
    checkActiveUsers();
    
    // Check every 10 seconds
    const interval = setInterval(checkActiveUsers, 10000);
    
    return () => clearInterval(interval);
  }, [displayUsers, isSessionActive]);

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
    // Return daily study time in seconds
    return user.dailyStudyTime || 0;
  };

  const isRecentlyActive = useCallback((user: UserAccount): boolean => {
    // Check if user has an active session based on the activeUsers state
    return activeUsers.has(user.accountId);
  }, [activeUsers]);

  const isCurrentUserActive = (user: UserAccount) => {
    // Check if this is the current account and timer is active
    const isActive = isTimerActive();
    const currentUser = getCurrentUser();
    const isCurrent = currentUser?.accountId === user.accountId;
    
    return isActive && isCurrent;
  };

  const isCurrentUser = (user: UserAccount) => {
    const currentUser = getCurrentUser();
    return currentUser?.accountId === user.accountId;
  };

  // Calculate total pages
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Pagination functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    // State
    displayUsers,
    currentTime,
    dailyRankings,
    loading,
    isSessionActive,
    getSessionDuration,
    currentPage,
    totalPages,
    itemsPerPage,

    // Functions
    formatStudyTime,
    formatSessionTime,
    getTodayStudyTime,
    calculateCoinsFromStudyTime,
    isRecentlyActive,
    isCurrentUserActive,
    isCurrentUser,
    loadDailyRankings,
    nextPage,
    prevPage,
    goToPage
  };
}
