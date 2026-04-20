'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { ActivityGraph } from '../study/ActivityGraph';
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
        totalStudySeconds: 0,
        totalPoints: 0,
        averageDailySeconds: 0,
        bestDay: null,
        currentStreak: 0,
        longestStreak: 0
      };
    }

    const totalStudySeconds = contributions.reduce((sum, c) => sum + c.studySeconds, 0);
    const totalPoints = contributions.reduce((sum, c) => sum + c.pointsEarned, 0);
    const averageDailySeconds = Math.round(totalStudySeconds / contributions.length);
    
    const bestDay = contributions.reduce((best, current) => 
      current.studySeconds > (best?.studySeconds || 0) ? current : best, null as ActivityContribution | null
    );

    const currentStreak = calculateCurrentStreak(contributions);
    const longestStreak = calculateLongestStreak(contributions);

    return {
      totalStudySeconds,
      totalPoints,
      averageDailySeconds,
      bestDay,
      currentStreak,
      longestStreak
    };
  };

  const calculateCurrentStreak = (contributions: ActivityContribution[]) => {
    if (contributions.length === 0) return 0;
    
    // Create a Set of dates with study seconds > 0 for faster lookup
    const studyDates = new Set(
      contributions
        .filter(c => c.studySeconds > 0)
        .map(c => c.date)
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    // Debug: Log the study dates to see what we have
    
    // Check backwards from today
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      // Debug: Log what we're checking
      
      if (studyDates.has(dateStr)) {
        streak++;
      } else {
        break; // Break on first day without study
      }
    }

    return streak;
  };

  const calculateLongestStreak = (contributions: ActivityContribution[]) => {
    const activeContributions = contributions.filter(c => c.studySeconds > 0);
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
  const formatStudyTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (seconds < 60) {
      return `${secs}${t.timeToday.includes('وقت') ? 'ث' : 's'}`;
    } else if (seconds < 3600) {
      return `${minutes}${t.timeToday.includes('وقت') ? 'د' : 'm'} ${secs}${t.timeToday.includes('وقت') ? 'ث' : 's'}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
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
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500/30 border-t-blue-500"></div>
        <p className={`text-sm ${
          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {t.rank === 'ترتيب' ? 'جاري تحميل النشاط...' : 'Loading activity...'}
        </p>
      </div>
    );
  }

  if (!targetAccountId) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 space-y-3 ${
        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <div className={`p-4 rounded-full ${
          theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
        }`}>
          <div className={`h-8 w-8 ${
            theme === 'light' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            ⚠️
          </div>
        </div>
        <p className="text-lg font-medium">
          {t.rank === 'ترتيب' ? 'لم يتم تحديد مستخدم' : 'No user selected'}
        </p>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 -mb-16">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        theme === 'light' ? 'text-gray-900' : 'text-gray-100'
      }`}>
        <div>
          <h2 className="text-2xl font-bold">
            {currentUser?.username}{t.rank === 'ترتيب' ? ' لوحة تحكم النشاط' : "'s Activity Dashboard"}
          </h2>
          <p className={`text-sm mt-1 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {t.rank === 'ترتيب' ? 'تتبع تقدمك الدراسي' : 'Track your study progress'}
          </p>
        </div>
        
        {/* Period selector */}
        <div className={`flex rounded-xl overflow-hidden ${
          theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'
        }`}>
          {(['week', 'month', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-all duration-200 ${
                selectedPeriod === period
                  ? theme === 'light' 
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-blue-600 text-white shadow-md'
                  : theme === 'light'
                    ? 'text-gray-600 hover:bg-gray-200'
                    : 'text-gray-400 hover:bg-gray-800'
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
        <div className={`p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
          theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black border border-gray-800'
        }`}>
          <div className={`text-sm font-medium mb-2 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {t.rank === 'ترتيب' ? 'إجمالي وقت الدراسة' : 'Total Study Time'}
          </div>
          <div className={`text-2xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-gray-100'
          }`}>
            {formatStudyTime(stats.totalStudySeconds)}
          </div>
        </div>

        <div className={`p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
          theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black border border-gray-800'
        }`}>
          <div className={`text-sm font-medium mb-2 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {t.rank === 'ترتيب' ? 'العملات المكتسبة' : 'Points Earned'}
          </div>
          <div className={`text-2xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-gray-100'
          }`}>
            {stats.totalPoints}
          </div>
        </div>

        <div className={`p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
          theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black border border-gray-800'
        }`}>
          <div className={`text-sm font-medium mb-2 ${
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

        <div className={`p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
          theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black border border-gray-800'
        }`}>
          <div className={`text-sm font-medium mb-2 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {t.rank === 'ترتيب' ? 'متوسط الدراسة اليومي' : 'Daily Average'}
          </div>
          <div className={`text-2xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-gray-100'
          }`}>
            {formatStudyTime(stats.averageDailySeconds)}
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Graph - Takes 2 columns */}
        <div className={`lg:col-span-2 p-6 rounded-xl shadow-sm ${
          theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black border border-gray-800'
        }`}>
          <ActivityGraph 
            contributions={contributions} 
            username={currentUser?.username}
          />
        </div>

        {/* Recent Activities - Takes 1 column */}
        <div className={`p-6 rounded-xl shadow-sm ${
          theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black border border-gray-800'
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${
            theme === 'light' ? 'text-gray-900' : 'text-gray-100'
          }`}>
            {t.rank === 'ترتيب' ? 'الأنشطة الحديثة' : 'Recent Activities'}
          </h3>
          
          {dailyActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className={`p-4 rounded-full ${
                theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'
              }`}>
                <div className={`h-8 w-8 ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  📅
                </div>
              </div>
              <p className={`text-center text-sm ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {t.rank === 'ترتيب' ? 'لا توجد أنشطة حديثة' : 'No recent activities'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {dailyActivities.slice(0, 10).map((activity, index) => (
                <div key={activity.id} className={`flex justify-between items-center p-4 rounded-xl transition-all duration-200 hover:shadow-md ${
                  theme === 'light' ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-900 hover:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                      theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-blue-900 text-blue-400'
                    }`}>
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className={`font-semibold ${
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
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                    }`}>
                      {formatStudyTime(activity.studySeconds)}
                    </div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
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
    </div>
  );
}
