'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Logo } from '@/components/ui/Logo';
import { UserRankings } from '@/components/users/UserRankings';
import { CurrentUserSelector } from '@/components/users/CurrentUserSelector';
import { ServiceSelector } from '@/components/ui/ServiceSelector';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { FullscreenPrompt } from '@/components/ui/FullscreenPrompt';
import { FullscreenProvider } from '@/contexts/FullscreenContext';
import { CustomThemeProvider } from '@/contexts/CustomThemeContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { useUser } from '@/contexts/UserContext';
import { useCoins } from '@/contexts/CoinsContext';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TimerIndicatorProvider } from '@/contexts/TimerIndicatorContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RankingDisplay } from '@/components/study/RankingDisplay';
import { ActionButtons } from '@/components/study/ActionButtons';
import { BACKGROUNDS } from '@/constants/backgrounds';
import { useFirstTimeSetup } from '@/hooks/useFirstTimeSetup';
import { OnboardingWizard } from '@/components/auth/OnboardingWizard';
import { MusicPlayer } from '@/components/music/MusicPlayer';
import { dailyActivityDB } from '@/lib/dailyActivity';
import { useBackgroundValue } from '@/hooks/useBackgroundValue';
import { UserProfileModal } from '@/components/users/UserProfileModal';

// User account interface for profile modal
interface UserAccount {
  accountId: string;
  username: string;
  email: string;
  hashKey: string;
  avatar?: string;
  rank: number;
  dailyRank?: number;
  studyTime: number;
  dailyStudyTime?: number;
  createdAt: string;
  lastActive: string;
}

// Motivational quotes
const MOTIVATIONAL_QUOTES = {
  ar: [
    "النجاح يبدأ بالخطوة الأولى",
    "استمر في التقدم، كل خطوة مهمة",
    "التركيز هو مفتاح الإنجاز",
    "الأوقات الثمينة تولد النتائج العظيمة",
    "اجعل كل لحظة تحسب",
    "القوة تأتي من الاستمرارية",
    "التميز يبدأ من الداخل",
    "لا تؤجل عمل اليوم إلى الغد",
    "الإصرار يصنع المستحيل",
    "كل يوم هو فرصة جديدة"
  ],
  en: [
    "Success begins with the first step",
    "Keep progressing, every step matters",
    "Focus is the key to achievement",
    "Precious time creates great results",
    "Make every moment count",
    "Strength comes from consistency",
    "Excellence starts from within",
    "Don't postpone today's work until tomorrow",
    "Persistence makes the impossible possible",
    "Every day is a new opportunity"
  ]
};

// Helper function to get background properties
const getBackgroundStyles = (backgroundId: string) => {
  // Check for custom backgrounds
  const customValue = typeof window !== 'undefined' ? localStorage.getItem('customBackgroundValue') : null;
  
  // Handle custom backgrounds
  if (backgroundId?.startsWith('custom-') && customValue) {
    return {
      backgroundImage: customValue.startsWith('url(') ? customValue : `url(${customValue})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  }
  
  // Handle default backgrounds
  const background = BACKGROUNDS.find(bg => bg.id === backgroundId)?.value || 'transparent';
  const isImageUrl = background?.startsWith('url(');
  
  if (isImageUrl) {
    return {
      backgroundImage: background,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  }
  
  return {
    backgroundImage: background
  };
};

function HomeContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { setTimerActive, isTimerActive, getCurrentUser } = useUser();
  const { addCoins } = useCoins();
  const customTheme = useCustomThemeClasses();
  const { isFirstTime, isLoading: setupLoading, markOnboardingComplete } = useFirstTimeSetup();
  const [selectedBackground, setSelectedBackground] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [studyStreak, setStudyStreak] = useState(0);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dailyRankings, setDailyRankings] = useState<any[]>([]);

  // Calculate study streak based on user activity (matching ActivityGraph logic)
  const calculateStudyStreak = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return 0;
    
    // Get user activities from localStorage (same data as ActivityGraph)
    const activitiesKey = `user_activities_${currentUser.id}`;
    const storedActivities = localStorage.getItem(activitiesKey);
    
    if (!storedActivities) {
      // If no activities stored, check if user has any activity today
      const today = new Date().toDateString();
      const lastActivity = localStorage.getItem(`last_activity_${currentUser.id}`);
      
      if (lastActivity) {
        const lastActivityDate = new Date(lastActivity).toDateString();
        if (lastActivityDate === today) {
          return 1; // Active today, streak of 1 day
        }
      }
      return 0;
    }
    
    try {
      const activities = JSON.parse(storedActivities);
      if (!Array.isArray(activities) || activities.length === 0) return 0;
      
      // Filter activities with study time > 0 and sort by date (most recent first)
      const studyActivities = activities
        .filter(c => c.studyMinutes > 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);
      
      // Check if there's activity today
      const todayActivity = studyActivities.find(activity => {
        const activityDate = new Date(activity.date);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === checkDate.getTime();
      });
      
      if (!todayActivity) return 0; // No activity today, streak is 0
      
      streak = 1; // Today has activity, streak starts at 1
      
      // Check consecutive days going backwards
      checkDate.setDate(checkDate.getDate() - 1);
      
      while (streak < studyActivities.length) {
        const foundActivity = studyActivities.find(activity => {
          const activityDate = new Date(activity.date);
          activityDate.setHours(0, 0, 0, 0);
          return activityDate.getTime() === checkDate.getTime();
        });
        
        if (foundActivity) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break; // Break streak if no activity found for this day
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating study streak:', error);
      return 0;
    }
  };

  // Update study streak
  useEffect(() => {
    // Calculate initial streak
    const streak = calculateStudyStreak();
    setStudyStreak(streak);
    
    // Update streak daily
    const streakInterval = setInterval(() => {
      const newStreak = calculateStudyStreak();
      setStudyStreak(newStreak);
    }, 60000); // Check every minute
    
    return () => clearInterval(streakInterval);
  }, [getCurrentUser]);

  // Load daily rankings for user profiles
  useEffect(() => {
    const loadDailyRankings = async () => {
      try {
        // Only update rankings if it's been more than 2 minutes since last update
        const lastRankUpdate = localStorage.getItem('lastRankUpdate');
        const now = Date.now();
        const shouldUpdateRankings = !lastRankUpdate || (now - parseInt(lastRankUpdate)) > 120000; // 2 minutes
        
        if (shouldUpdateRankings) {
          await dailyActivityDB.updateTodayRankings();
          localStorage.setItem('lastRankUpdate', now.toString());
        }
        
        const rankings = await dailyActivityDB.getTodayRankings();
        setDailyRankings(rankings);
      } catch (error) {
        console.error('❌ Error loading daily rankings:', error);
      }
    };

    loadDailyRankings();
    // Update rankings every 2 minutes instead of 30 seconds
    const interval = setInterval(loadDailyRankings, 120000);
    return () => clearInterval(interval);
  }, []);

  // Wake lock functionality
  const requestWakeLock = async () => {
    try {
      // Check if document is visible and in focus
      if (document.hidden || !document.hasFocus()) {
        console.warn('⚠️ Document is hidden or not in focus, skipping Wake Lock request');
        return;
      }

      if ('wakeLock' in navigator && 'request' in (navigator as any).wakeLock) {
        const wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        setWakeLock(wakeLockSentinel);
        
        // Listen for wake lock release
        wakeLockSentinel.addEventListener('release', () => {
          setWakeLock(null);
        });
      } else {
        console.warn('⚠️ Wake Lock API not supported on this device');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.warn('⚠️ Wake Lock request denied - document may be hidden or not in focus');
      } else {
        console.error('❌ Error requesting Wake Lock:', error);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release();
      setWakeLock(null);
    }
  };

  // Request wake lock when timer starts
  useEffect(() => {
    const timerIsActive = isTimerActive();
    
    if (timerIsActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    
    return () => {
      releaseWakeLock();
    };
  }, []); // Empty dependency array, will be called on mount and unmount

  // Profile modal functions
  const openUserProfile = (user: UserAccount) => {
    // Merge with daily rankings data
    const dailyActivity = dailyRankings.find(dr => dr.account_id === user.accountId);
    const userWithDailyData = {
      ...user,
      dailyRank: dailyActivity?.daily_rank || 999,
      dailyStudyTime: dailyActivity?.study_seconds || 0
    };
    
    setSelectedUser(userWithDailyData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayStudyTime = (user: UserAccount) => {
    return (user.dailyStudyTime || 0) * 60;
  };

  const isCurrentUser = (user: UserAccount) => {
    const currentUser = getCurrentUser();
    return currentUser?.accountId === user.accountId;
  };

  // Handle visibility changes to retry wake lock when document becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isTimerActive()) {
        // Document became visible and timer is active, try to request wake lock
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTimerActive]);

  // Separate effect to handle timer state changes
  useEffect(() => {
    const timerIsActive = isTimerActive();
    
    if (timerIsActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [isTimerActive]);

  useEffect(() => {
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // User exited fullscreen, stop timer
        setTimerActive(false);
      }
    };

    // Listen for background changes
    const handleBackgroundChange = (event: CustomEvent) => {
      // Handle both old format (string) and new format (object)
      const detail = event.detail;
      if (typeof detail === 'string') {
        setSelectedBackground(detail);
      } else if (detail && typeof detail === 'object') {
        setSelectedBackground(detail.backgroundId);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('backgroundChange', handleBackgroundChange as EventListener);

    // Load saved background
    const savedBackground = localStorage.getItem('selectedBackground');
    if (savedBackground) {
      setSelectedBackground(savedBackground);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('backgroundChange', handleBackgroundChange as EventListener);
    };
  }, [setTimerActive]);

  // Motivational quote rotation
  useEffect(() => {
    // Rotate quotes every hour (3600000 ms)
    const rotateQuote = () => {
      const quotes = MOTIVATIONAL_QUOTES[language as keyof typeof MOTIVATIONAL_QUOTES];
      setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
    };

    // Initial quote
    const quotes = MOTIVATIONAL_QUOTES[language as keyof typeof MOTIVATIONAL_QUOTES];
    setCurrentQuoteIndex(Math.floor(Math.random() * quotes.length));

    // Set up rotation interval
    const interval = setInterval(rotateQuote, 3600000); // Every hour

    return () => clearInterval(interval);
  }, [language]);

  return (
    <>
      <OnboardingWizard 
        isOpen={isFirstTime && !setupLoading} 
        onComplete={markOnboardingComplete} 
      />
      <div className={`flex h-screen overflow-hidden ${
        theme === 'light' ? 'bg-white' : 'bg-black'
      }`}>
        <FullscreenPrompt />
        {isLoading && <LoadingSpinner onComplete={() => setIsLoading(false)} />}
        
        {/* Music Player - Fixed positioning for all screen sizes */}
        <div className="fixed bottom-4 right-4 z-50 md:hidden lg:hidden">
          <MusicPlayer />
        </div>
        <div className="hidden md:block lg:hidden fixed bottom-4 right-4 z-50">
          <MusicPlayer />
        </div>
        <div className="hidden lg:block fixed bottom-4 right-4 z-50">
          <MusicPlayer />
        </div>
        
        {/* Desktop Layout - Full screen with floating sidebar */}
        <div className="hidden md:flex w-full h-full relative">
          
          {/* Right section - Full width */}
          <div 
            className="w-full flex items-center justify-center p-8 relative h-full overflow-hidden"
            style={getBackgroundStyles(selectedBackground)}
          >
            <div className="absolute top-8 right-8">
              <Logo />
            </div>
            <div className="absolute top-8 left-8 flex gap-2">
              <button
                onClick={() => window.location.href = '/social'}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                title="الانتقال إلى الاجتماعي"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
            <ServiceSelector />
            <div className="flex flex-col gap-3">
              <ActionButtons />
              <RankingDisplay studyStreak={studyStreak} onUserClick={openUserProfile} />
            </div>
          </div>
        </div>

        {/* Mobile Layout - Vertical */}
        <div 
          className="md:hidden flex flex-col w-full h-screen overflow-hidden"
          style={getBackgroundStyles(selectedBackground)}
        >
          {/* Mobile Header */}
          <div className="flex justify-between items-center p-4">
            <Logo />
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/social'}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                title="الانتقال إلى الاجتماعي"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Timer Section - Takes most space */}
            <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
              <ServiceSelector />
            </div>
            
            {/* Buttons Section - Fixed position above timer */}
            <div className="absolute top-4 left-4 flex flex-col gap-3 z-[100]">
              <ActionButtons />
              <RankingDisplay studyStreak={studyStreak} onUserClick={openUserProfile} />
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={closeModal}
      />
    </>
  );
}

export default function Home() {
  return (
    <TimerIndicatorProvider>
      <CustomThemeProvider>
        <FullscreenProvider>
          <HomeContent />
        </FullscreenProvider>
      </CustomThemeProvider>
    </TimerIndicatorProvider>
  );
}
