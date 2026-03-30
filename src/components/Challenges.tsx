'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  manuallyCompleted?: boolean;
  category: 'focus' | 'productivity' | 'wellness' | 'learning';
  requiredMinutes?: number;
  targetDate?: string;
}

export function Challenges() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userStats, setUserStats] = useState({
    totalFocusMinutes: 0,
    todayFocusMinutes: 0,
    pomodoroSessions: 0,
    todayPomodoroSessions: 0,
    weeklyPomodoroSessions: 0,
    consecutiveDays: 0,
    earlySessions: 0,
    studyModeUsed: false,
    breaksTaken: 0
  });

  const defaultChallenges: Challenge[] = [
    {
      id: '1',
      title: t.rank === 'ترتيب' ? 'تركيز لمدة 25 دقيقة' : 'Focus for 25 minutes',
      description: t.rank === 'ترتيب' ? 'استخدم مؤقت البومودورو لجلسة واحدة' : 'Use Pomodoro timer for one session',
      icon: '🍅',
      completed: false,
      category: 'focus',
      requiredMinutes: 25
    },
    {
      id: '2',
      title: t.rank === 'ترتيب' ? '5 جلسات بومودورو' : '5 Pomodoro sessions',
      description: t.rank === 'ترتيب' ? 'أكمل 5 جلسات بومودورو في يوم واحد' : 'Complete 5 Pomodoro sessions in one day',
      icon: '🎯',
      completed: false,
      category: 'focus',
      requiredMinutes: 125
    },
    {
      id: '3',
      title: t.rank === 'ترتيب' ? 'ساعة من التركيز' : '1 hour of focus',
      description: t.rank === 'ترتيب' ? 'احصل على 60 دقيقة من وقت التركيز' : 'Get 60 minutes of focus time',
      icon: '⏰',
      completed: false,
      category: 'focus',
      requiredMinutes: 60
    },
    {
      id: '4',
      title: t.rank === 'ترتيب' ? 'بداية مبكرة' : 'Early bird',
      description: t.rank === 'ترتيب' ? 'ابدأ جلسة قبل الساعة 9 صباحاً' : 'Start a session before 9 AM',
      icon: '🌅',
      completed: false,
      category: 'productivity'
    },
    {
      id: '5',
      title: t.rank === 'ترتيب' ? 'استمرارية' : 'Consistency',
      description: t.rank === 'ترتيب' ? 'استخدم التطبيق 3 أيام متتالية' : 'Use the app for 3 consecutive days',
      icon: '📅',
      completed: false,
      category: 'productivity'
    },
    {
      id: '6',
      title: t.rank === 'ترتيب' ? 'قوة العقل' : 'Mind power',
      description: t.rank === 'ترتيب' ? '10 جلسات بومودورو في أسبوع' : '10 Pomodoro sessions in a week',
      icon: '🧠',
      completed: false,
      category: 'wellness',
      requiredMinutes: 250
    },
    {
      id: '7',
      title: t.rank === 'ترتيب' ? 'استراحة نشطة' : 'Active break',
      description: t.rank === 'ترتيب' ? 'خذ 5 استراحات قصيرة' : 'Take 5 short breaks',
      icon: '🚶',
      completed: false,
      category: 'wellness'
    },
    {
      id: '8',
      title: t.rank === 'ترتيب' ? 'متعلم' : 'Learner',
      description: t.rank === 'ترتيب' ? 'استخدم وضع دراسة PDF' : 'Use PDF study mode',
      icon: '📚',
      completed: false,
      category: 'learning'
    }
  ];

  useEffect(() => {
    const savedChallenges = localStorage.getItem('userChallenges');
    if (savedChallenges) {
      try {
        const parsed = JSON.parse(savedChallenges);
        setChallenges(parsed);
      } catch (error) {
        console.error('Failed to load challenges:', error);
        setChallenges(defaultChallenges);
      }
    } else {
      setChallenges(defaultChallenges);
    }
  }, []);

  useEffect(() => {
    if (challenges.length > 0) {
      localStorage.setItem('userChallenges', JSON.stringify(challenges));
      // Emit custom event to notify other components
      window.dispatchEvent(new CustomEvent('challengesUpdated'));
    }
  }, [challenges]);

  // Auto-detection system for challenges
  useEffect(() => {
    const detectAndCompleteChallenges = () => {
      if (typeof window === 'undefined') return;

      // Get user activity data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const activitiesKey = `user_activities_${currentUser.id}`;
      const storedActivities = localStorage.getItem(activitiesKey);
      
      if (!storedActivities) return;

      try {
        const activities = JSON.parse(storedActivities);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate user stats
        const stats = {
          totalFocusMinutes: 0,
          todayFocusMinutes: 0,
          pomodoroSessions: 0,
          todayPomodoroSessions: 0,
          weeklyPomodoroSessions: 0,
          consecutiveDays: 0,
          earlySessions: 0,
          studyModeUsed: false,
          breaksTaken: 0
        };

        // Process activities
        activities.forEach((activity: any) => {
          const activityDate = new Date(activity.date);
          activityDate.setHours(0, 0, 0, 0);
          
          // Total focus minutes
          stats.totalFocusMinutes += activity.studyMinutes || 0;
          
          // Today's focus minutes
          if (activityDate.getTime() === today.getTime()) {
            stats.todayFocusMinutes += activity.studyMinutes || 0;
            stats.todayPomodoroSessions += activity.pomodoroSessions || 0;
            
            // Check for early session (before 9 AM)
            const sessionTime = new Date(activity.date);
            if (sessionTime.getHours() < 9) {
              stats.earlySessions++;
            }
          }
          
          // Total pomodoro sessions
          stats.pomodoroSessions += activity.pomodoroSessions || 0;
          
          // Weekly pomodoro sessions (last 7 days)
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (activityDate >= weekAgo) {
            stats.weeklyPomodoroSessions += activity.pomodoroSessions || 0;
          }
          
          // Check for study mode usage
          if (activity.pdfStudyMinutes && activity.pdfStudyMinutes > 0) {
            stats.studyModeUsed = true;
          }
          
          // Count breaks taken
          stats.breaksTaken += activity.breaksTaken || 0;
        });

        // Calculate consecutive days
        let consecutiveCount = 0;
        let checkDate = new Date(today);
        
        while (consecutiveCount < 30) { // Check up to 30 days back
          const dayActivity = activities.find((activity: any) => {
            const activityDate = new Date(activity.date);
            activityDate.setHours(0, 0, 0, 0);
            return activityDate.getTime() === checkDate.getTime() && 
                   (activity.studyMinutes > 0 || activity.pomodoroSessions > 0);
          });
          
          if (dayActivity) {
            consecutiveCount++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
        
        stats.consecutiveDays = consecutiveCount;
        setUserStats(stats);

        // Auto-complete challenges based on stats
        setChallenges(prevChallenges => {
          return prevChallenges.map(challenge => {
            if (challenge.completed) return challenge; // Skip already completed

            let shouldComplete = false;

            switch (challenge.id) {
              case '1': // Focus for 25 minutes
                shouldComplete = stats.totalFocusMinutes >= 25;
                break;
              case '2': // 5 Pomodoro sessions in one day
                shouldComplete = stats.todayPomodoroSessions >= 5;
                break;
              case '3': // 1 hour of focus
                shouldComplete = stats.totalFocusMinutes >= 60;
                break;
              case '4': // Early bird
                shouldComplete = stats.earlySessions > 0;
                break;
              case '5': // Consistency - 3 consecutive days
                shouldComplete = stats.consecutiveDays >= 3;
                break;
              case '6': // Mind power - 10 pomodoro sessions in a week
                shouldComplete = stats.weeklyPomodoroSessions >= 10;
                break;
              case '7': // Active break - 5 short breaks
                shouldComplete = stats.breaksTaken >= 5;
                break;
              case '8': // Learner - use PDF study mode
                shouldComplete = stats.studyModeUsed;
                break;
            }

            return shouldComplete ? { ...challenge, completed: true } : challenge;
          });
        });
      } catch (error) {
        console.error('Error in auto-detection:', error);
      }
    };

    // Initial detection
    detectAndCompleteChallenges();

    // Listen for timer events and activity updates
    const handleTimerComplete = () => {
      setTimeout(detectAndCompleteChallenges, 1000); // Delay to ensure data is saved
    };

    const handleActivityUpdate = () => {
      detectAndCompleteChallenges();
    };

    window.addEventListener('timerCompleted', handleTimerComplete);
    window.addEventListener('activityUpdated', handleActivityUpdate);
    window.addEventListener('pomodoroCompleted', handleTimerComplete);
    
    // Check every 30 seconds for updates
    const interval = setInterval(detectAndCompleteChallenges, 30000);

    return () => {
      window.removeEventListener('timerCompleted', handleTimerComplete);
      window.removeEventListener('activityUpdated', handleActivityUpdate);
      window.removeEventListener('pomodoroCompleted', handleTimerComplete);
      clearInterval(interval);
    };
  }, []);

  
  const filteredChallenges = selectedCategory === 'all' 
    ? challenges 
    : challenges.filter(c => c.category === selectedCategory);

  const completedCount = challenges.filter(c => c.completed).length;
  const totalCount = challenges.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const categories = [
    { id: 'all', label: t.rank === 'ترتيب' ? 'الكل' : 'All', icon: '🎯' },
    { id: 'focus', label: t.rank === 'ترتيب' ? 'التركيز' : 'Focus', icon: '🎯' },
    { id: 'productivity', label: t.rank === 'ترتيب' ? 'الإنتاجية' : 'Productivity', icon: '📈' },
    { id: 'wellness', label: t.rank === 'ترتيب' ? 'الصحة' : 'Wellness', icon: '🌿' },
    { id: 'learning', label: t.rank === 'ترتيب' ? 'التعلم' : 'Learning', icon: '📚' }
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-8 pt-6">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
              <span className="text-4xl">🏆</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-white font-bold text-sm">{completedCount}</span>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
          {t.rank === 'ترتيب' ? 'التحديات' : 'Challenges'}
        </h1>
        <div className="flex items-center justify-center gap-6">
          <div className="text-white/80 text-sm">
            {t.rank === 'ترتيب' ? 'مكتمل' : 'Completed'}: <span className="text-yellow-400 font-bold">{completedCount}</span>/{totalCount}
          </div>
          <div className="w-48 h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      
      {/* Achievements Grid */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className={`relative group transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                challenge.completed
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border-2 border-yellow-400/50 shadow-2xl shadow-yellow-500/25'
                  : 'bg-white/5 border-2 border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20'
              } rounded-3xl p-6 cursor-pointer overflow-hidden`}
              onClick={() => {
                // Only allow clicking if not completed (for viewing details)
                if (!challenge.completed) {
                  // Could show details or requirements here
                  console.log('Challenge requirements:', challenge.description);
                }
              }}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideInUp 0.6s ease-out forwards'
              }}
            >
              {/* Glow Effect */}
              {challenge.completed && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-3xl animate-pulse" />
              )}
              
              {/* Achievement Badge */}
              <div className="absolute top-4 right-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                  challenge.completed
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/50'
                    : 'bg-white/10 backdrop-blur-sm text-white/50'
                }`}>
                  {challenge.completed ? '✓' : 'ℹ️'}
                </div>
                {/* Auto-completed indicator */}
                {challenge.completed && !challenge.manuallyCompleted && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" title="Auto-completed" />
                )}
              </div>

              {/* Icon Container */}
              <div className="flex justify-center mb-4">
                <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center text-4xl transition-all duration-500 ${
                  challenge.completed
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl shadow-yellow-500/50 transform rotate-12 group-hover:rotate-0'
                    : 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm group-hover:from-white/20 group-hover:to-white/10'
                }`}>
                  <span className={`transition-all duration-500 ${
                    challenge.completed ? '' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'
                  }`}>
                    {challenge.icon}
                  </span>
                  {/* Shine Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className={`font-bold text-base mb-3 transition-colors duration-300 ${
                  challenge.completed
                    ? 'text-yellow-300'
                    : 'text-white group-hover:text-yellow-300'
                }`}>
                  {challenge.title}
                </h3>
                <p className={`text-sm leading-relaxed mb-4 transition-colors duration-300 ${
                  challenge.completed
                    ? 'text-yellow-200/80'
                    : 'text-white/60 group-hover:text-white/80'
                }`}>
                  {challenge.description}
                </p>
                {challenge.requiredMinutes && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    challenge.completed
                      ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                      : 'bg-white/10 text-white/60 border border-white/20 group-hover:bg-yellow-400/20 group-hover:text-yellow-300 group-hover:border-yellow-400/30'
                  }`}>
                    <span>⏱️</span>
                    <span>{challenge.requiredMinutes} {t.rank === 'ترتيب' ? 'دقيقة' : 'min'}</span>
                  </div>
                )}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
              
              {/* Completion Particles */}
              {challenge.completed && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-orange-400 rounded-full animate-ping delay-300" />
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-ping delay-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Celebration */}
      {completedCount === totalCount && (
        <div className="relative z-10 mt-6 mb-6 mx-6">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-1 rounded-3xl shadow-2xl animate-pulse">
            <div className="bg-slate-900 rounded-3xl p-8 text-center">
              <div className="flex justify-center gap-4 mb-4">
                <span className="text-6xl animate-bounce">🏆</span>
                <span className="text-6xl animate-bounce delay-200">⭐</span>
                <span className="text-6xl animate-bounce delay-400">�</span>
              </div>
              <h3 className="font-bold text-2xl mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                {t.rank === 'ترتيب' ? 'ممتاز! لقد أكملت كل التحديات!' : 'Excellent! You completed all challenges!'}
              </h3>
              <p className="text-white/80 text-sm">
                {t.rank === 'ترتيب' ? 'أنت أسطورة في الإنتاجية!' : 'You are a productivity legend!'}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse delay-200" />
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
