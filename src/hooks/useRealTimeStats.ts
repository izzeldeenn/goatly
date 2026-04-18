'use client';

import { useState, useEffect } from 'react';
import { userDB } from '@/lib/supabase';
import { dailyActivityDB } from '@/lib/dailyActivity';

interface RealTimeStats {
  totalUsers: number;
  totalFocusHours: number;
  totalGoalsAchieved: number;
  communitySuccessRate: number;
  loading: boolean;
}

export function useRealTimeStats(): RealTimeStats {
  const [stats, setStats] = useState<RealTimeStats>({
    totalUsers: 0,
    totalFocusHours: 0,
    totalGoalsAchieved: 0,
    communitySuccessRate: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all users to get total count
        const allUsers = await userDB.getAllUsers();
        const totalUsers = allUsers.length;

        // Fetch all daily activities to get real study hours and goals
        const allActivities = await dailyActivityDB.getAllDailyActivities();
        
        // Calculate real focus hours from daily activities
        const totalStudySeconds = allActivities.reduce((sum, activity) => {
          return sum + (activity.study_seconds || 0);
        }, 0);
        const totalFocusHours = Math.floor(totalStudySeconds / 3600);

        // Calculate goals achieved based on points earned from daily activities
        const totalGoalsAchieved = allActivities.reduce((sum, activity) => {
          return sum + Math.floor((activity.points_earned || 0) / 100);
        }, 0);

        // Calculate success rate (percentage of users with study activities)
        const usersWithActivities = new Set(allActivities.map(activity => activity.account_id)).size;
        const communitySuccessRate = totalUsers > 0 ? Math.round((usersWithActivities / totalUsers) * 100) : 0;

        setStats({
          totalUsers,
          totalFocusHours,
          totalGoalsAchieved,
          communitySuccessRate,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching real-time stats:', error);
        // Fallback to default values if there's an error
        setStats({
          totalUsers: 0,
          totalFocusHours: 0,
          totalGoalsAchieved: 0,
          communitySuccessRate: 0,
          loading: false
        });
      }
    };

    fetchStats();

    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}
