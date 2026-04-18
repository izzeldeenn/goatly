'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
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

export function useUserRankings() {
  const { users, isTimerActive, getCurrentUser, getAllDeviceUsers } = useUser();
  const { isSessionActive, getSessionDuration } = useStudySession();
  
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

  const isCurrentUser = (user: UserAccount) => {
    const currentUser = getCurrentUser();
    return currentUser?.accountId === user.accountId;
  };

  return {
    // State
    displayUsers,
    currentTime,
    dailyRankings,
    loading,
    isSessionActive,
    getSessionDuration,
    
    // Functions
    formatStudyTime,
    formatSessionTime,
    getTodayStudyTime,
    getCoinsFromStudyTime,
    isRecentlyActive,
    isCurrentUserActive,
    isCurrentUser,
    loadDailyRankings
  };
}
