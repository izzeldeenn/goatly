'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { ActivityGraph } from './ActivityGraph';
import { dailyActivityDB, ActivityContribution, DailyActivityFrontend } from '@/lib/dailyActivity';

interface UserActivityDashboardProps {
  accountId?: string;
}

export function UserActivityDashboard({ accountId }: UserActivityDashboardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { getCurrentUser } = useUser();
  const customTheme = useCustomThemeClasses();
  
  const [contributions, setContributions] = useState<ActivityContribution[]>([]);
  const [dailyActivities, setDailyActivities] = useState<DailyActivityFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('year');
  
  const targetAccountId = accountId || getCurrentUser()?.accountId;
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!targetAccountId) return;
    
    loadUserActivity();
  }, [targetAccountId, selectedPeriod]);

  const loadUserActivity = async () => {
    if (!targetAccountId) return;
    
    setLoading(true);
    try {
      // Load activity contributions
      const contributions = await dailyActivityDB.getUserActivityContributions(targetAccountId);
      
      // Filter based on selected period
      const filteredContributions = filterContributionsByPeriod(contributions, selectedPeriod);
      setContributions(filteredContributions);

      // Load daily activities for detailed view
      const activities = await dailyActivityDB.getUserDailyActivities(targetAccountId, getLimitByPeriod(selectedPeriod));
      setDailyActivities(activities.map(activity => ({
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
      })));
    } catch (error) {
      console.error('Error loading user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterContributionsByPeriod = (contributions: ActivityContribution[], period: 'week' | 'month' | 'year') => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (period) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return contributions.filter(c => new Date(c.date) >= cutoffDate);
  };

  const getLimitByPeriod = (period: 'week' | 'month' | 'year') => {
    switch (period) {
      case 'week': return 7;
      case 'month': return 30;
      case 'year': return 365;
      default: return 365;
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    if (contributions.length === 0) {
      return {
        totalStudyMinutes: 0,
        totalPoints: 0,
        averageDailyMinutes: 0,
        bestDay: null,
        currentStreak: 0,
        longestStreak: 0
      };
    }

    const totalStudyMinutes = contributions.reduce((sum, c) => sum + c.studyMinutes, 0);
    const totalPoints = contributions.reduce((sum, c) => sum + c.pointsEarned, 0);
    const averageDailyMinutes = Math.round(totalStudyMinutes / contributions.length);
    
    const bestDay = contributions.reduce((best, current) => 
      current.studyMinutes > (best?.studyMinutes || 0) ? current : best, null as ActivityContribution | null
    );

    const currentStreak = calculateCurrentStreak(contributions);
    const longestStreak = calculateLongestStreak(contributions);

    return {
      totalStudyMinutes,
      totalPoints,
      averageDailyMinutes,
      bestDay,
      currentStreak,
      longestStreak
    };
  };

  const calculateCurrentStreak = (contributions: ActivityContribution[]) => {
    if (contributions.length === 0) return 0;
    
    // Create a Set of dates with study minutes > 0 for faster lookup
    const studyDates = new Set(
      contributions
        .filter(c => c.studyMinutes > 0)
        .map(c => c.date)
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    // Debug: Log the study dates to see what we have
    console.log('Dashboard Study dates found:', Array.from(studyDates).sort());
    console.log('Dashboard Today is:', today.toISOString().split('T')[0]);
    
    // Check backwards from today
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      // Debug: Log what we're checking
      console.log(`Dashboard Checking day ${i}: ${dateStr}, has study:`, studyDates.has(dateStr));
      
      if (studyDates.has(dateStr)) {
        streak++;
        console.log(`Dashboard Found study for ${dateStr}, streak is now:`, streak);
      } else {
        console.log(`Dashboard No study for ${dateStr}, breaking streak at:`, streak);
        break; // Break on first day without study
      }
    }

    console.log('Dashboard Final streak:', streak);
    return streak;
  };

  const calculateLongestStreak = (contributions: ActivityContribution[]) => {
    const activeContributions = contributions.filter(c => c.studyMinutes > 0);
    if (activeContributions.length === 0) return 0;
    
    const sorted = activeContributions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const contribution of sorted) {
      const contribDate = new Date(contribution.date);
      
      if (lastDate) {
        const daysDiff = Math.floor((contribDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      lastDate = contribDate;
    }
    
    return Math.max(longestStreak, currentStreak);
  };

  // Format study time
  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}${t.timeToday.includes('وقت') ? 'د' : 'm'}`;
    } else if (minutes < 120) {
      return `1${t.timeToday.includes('وقت') ? 'س' : 'h'} ${minutes - 60}${t.timeToday.includes('وقت') ? 'د' : 'm'}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}${t.timeToday.includes('وقت') ? 'س' : 'h'} ${mins}${t.timeToday.includes('وقت') ? 'د' : 'm'}`;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const locale = t.rank === 'ترتيب' ? 'ar-SA' : 'en-US';
    return date.toLocaleDateString(locale, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!targetAccountId) {
    return (
      <div className={`text-center py-8 ${
        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
      }`}>
        {t.rank === 'ترتيب' ? 'لم يتم تحديد مستخدم' : 'No user selected'}
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      {/* Header */}
      <div className={`flex justify-between items-center ${
        theme === 'light' ? 'text-gray-900' : 'text-gray-100'
      }`}>
        <h2 className="text-2xl font-bold">
          {currentUser?.username}{t.rank === 'ترتيب' ? ' لوحة تحكم النشاط' : "'s Activity Dashboard"}
        </h2>
        
        {/* Period selector */}
        <div className={`flex rounded-lg overflow-hidden ${
          theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
        }`}>
          {(['week', 'month', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                selectedPeriod === period
                  ? theme === 'light' 
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-600 text-white'
                  : theme === 'light'
                    ? 'text-gray-600 hover:bg-gray-200'
                    : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              {period === 'week' ? (t.rank === 'ترتيب' ? 'أسبوع' : 'Week') : 
               period === 'month' ? (t.rank === 'ترتيب' ? 'شهر' : 'Month') : 
               (t.rank === 'ترتيب' ? 'سنة' : 'Year')}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${
          theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
        }`}>
          <div className={`text-sm font-medium mb-1 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {t.rank === 'ترتيب' ? 'إجمالي وقت الدراسة' : 'Total Study Time'}
          </div>
          <div className={`text-2xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-gray-100'
          }`}>
            {formatStudyTime(stats.totalStudyMinutes)}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
        }`}>
          <div className={`text-sm font-medium mb-1 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {t.rank === 'ترتيب' ? 'النقاط المكتسبة' : 'Points Earned'}
          </div>
          <div className={`text-2xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-gray-100'
          }`}>
            {stats.totalPoints}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
        }`}>
          <div className={`text-sm font-medium mb-1 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {t.rank === 'ترتيب' ? 'السلسلة الحالية' : 'Current Streak'}
          </div>
          <div className={`text-2xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-gray-100'
          }`}>
            {stats.currentStreak} {t.rank === 'ترتيب' ? 'يوم' : 'days'}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
        }`}>
          <div className={`text-sm font-medium mb-1 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {t.rank === 'ترتيب' ? 'متوسط الدراسة اليومي' : 'Daily Average'}
          </div>
          <div className={`text-2xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-gray-100'
          }`}>
            {formatStudyTime(stats.averageDailyMinutes)}
          </div>
        </div>
      </div>

      {/* Activity Graph */}
      <div className={`p-6 rounded-lg ${
        theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
      }`}>
        <ActivityGraph 
          contributions={contributions} 
          username={currentUser?.username}
        />
      </div>

      {/* Recent Activities */}
      <div className={`p-6 rounded-lg ${
        theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          {t.rank === 'ترتيب' ? 'الأنشطة الحديثة' : 'Recent Activities'}
        </h3>
        
        {dailyActivities.length === 0 ? (
          <p className={`text-center py-8 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {t.rank === 'ترتيب' ? 'لا توجد أنشطة حديثة' : 'No recent activities'}
          </p>
        ) : (
          <div className="space-y-3">
            {dailyActivities.slice(0, 10).map(activity => (
              <div key={activity.id} className={`flex justify-between items-center p-3 rounded-lg ${
                theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
              }`}>
                <div>
                  <div className={`font-medium ${
                    theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                  }`}>
                    {formatDate(activity.date)}
                  </div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {activity.sessionsCount} {t.rank === 'ترتيب' ? 'جلسات' : 'sessions'} • {t.rank === 'ترتيب' ? 'الترتيب' : 'Rank'} #{activity.dailyRank}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                  }`}>
                    {formatStudyTime(activity.studyMinutes)}
                  </div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {activity.pointsEarned} {t.points}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
