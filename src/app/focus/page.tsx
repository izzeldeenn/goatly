'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Logo } from '@/components/Logo';
import { UserRankings } from '@/components/UserRankings';
import { CurrentUserSelector } from '@/components/CurrentUserSelector';
import { SettingsMobileButton } from '@/components/SettingsMobile';
import { ServiceSelector } from '@/components/ServiceSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FullscreenPrompt } from '@/components/FullscreenPrompt';
import { FullscreenProvider } from '@/contexts/FullscreenContext';
import { CustomThemeProvider } from '@/contexts/CustomThemeContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { useUser } from '@/contexts/UserContext';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TimerIndicatorProvider } from '@/contexts/TimerIndicatorContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RankingDisplay } from '@/components/RankingDisplay';
import { BACKGROUNDS } from '@/constants/backgrounds';
import { useFirstTimeSetup } from '@/hooks/useFirstTimeSetup';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { MusicPlayer } from '@/components/MusicPlayer';
import { MusicToggleButton } from '@/components/MusicToggleButton';

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
    backgroundImage: backgroundId
  };
};

function HomeContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { setTimerActive, isTimerActive, getCurrentUser } = useUser();
  const customTheme = useCustomThemeClasses();
  const { isFirstTime, isLoading: setupLoading, markOnboardingComplete } = useFirstTimeSetup();
  const [selectedBackground, setSelectedBackground] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [studyStreak, setStudyStreak] = useState(0);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

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
        console.log('🔒 Wake Lock activated - screen will stay awake');
        
        // Listen for wake lock release
        wakeLockSentinel.addEventListener('release', () => {
          console.log('🔓 Wake Lock released');
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
  }, []); // Empty dependency array, will be called on mount and unmount only

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
    setSelectedBackground(event.detail);
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
          
          {/* Top Bar with Logo and Social */}
          <div className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Logo />
              <MusicToggleButton />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div 
                className="text-2xl transition-all duration-300 max-w-lg text-center"
                style={{ 
                  fontFamily: "'ADLaM Display', sans-serif",
                  color: theme === 'light' ? '#1f2937' : '#f3f4f6',
                  textShadow: theme === 'light' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(255,255,255,0.1)',
                  fontWeight: 400
                }}
              >
                "{MOTIVATIONAL_QUOTES[language as keyof typeof MOTIVATIONAL_QUOTES][currentQuoteIndex]}"
              </div>
              {currentQuoteIndex < MOTIVATIONAL_QUOTES[language as keyof typeof MOTIVATIONAL_QUOTES].length - 1 && (
                <div 
                  className="text-lg transition-all duration-300 max-w-lg text-center opacity-75"
                  style={{ 
                    fontFamily: "'ADLaM Display', sans-serif",
                    color: theme === 'light' ? '#4b5563' : '#d1d5db',
                    textShadow: theme === 'light' ? '0 1px 2px rgba(0,0,0,0.05)' : '0 1px 2px rgba(255,255,255,0.05)',
                    fontWeight: 400
                  }}
                >
                  "{MOTIVATIONAL_QUOTES[language as keyof typeof MOTIVATIONAL_QUOTES][(currentQuoteIndex + 1) % MOTIVATIONAL_QUOTES[language as keyof typeof MOTIVATIONAL_QUOTES].length]}"
                </div>
              )}
            </div>
          </div>

          {/* Right section - Full width */}
          <div 
            className="w-full flex items-center justify-center p-8 relative h-full overflow-hidden"
            style={getBackgroundStyles(selectedBackground)}
          >
            <ServiceSelector />
            <RankingDisplay studyStreak={studyStreak} />
          </div>
        </div>

        {/* Mobile Layout - Vertical */}
        <div className="md:hidden flex flex-col w-full h-screen overflow-hidden">
          {/* Mobile Header */}
          <div 
            className="flex justify-between items-center p-4 border-b sticky top-0 z-10 flex-shrink-0"
            style={{
              backgroundColor: customTheme.colors.surface,
              borderColor: customTheme.colors.border
            }}
          >
            <Logo />
            <div className="flex flex-col items-center space-y-1 space-x-reverse">
              <div 
                className="text-base transition-all duration-300 max-w-[200px] text-center"
                style={{ 
                  fontFamily: "'ADLaM Display', sans-serif",
                  color: theme === 'light' ? '#1f2937' : '#f3f4f6',
                  textShadow: theme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : '0 1px 2px rgba(255,255,255,0.1)',
                  fontWeight: 400
                }}
              >
                "{MOTIVATIONAL_QUOTES[language as keyof typeof MOTIVATIONAL_QUOTES][currentQuoteIndex]}"
              </div>
              {currentQuoteIndex < MOTIVATIONAL_QUOTES[language as keyof typeof MOTIVATIONAL_QUOTES].length - 1 && (
                <div 
                  className="text-xs transition-all duration-300 max-w-[200px] text-center opacity-75"
                  style={{ 
                    fontFamily: "'ADLaM Display', sans-serif",
                    color: theme === 'light' ? '#4b5563' : '#d1d5db',
                    textShadow: theme === 'light' ? '0 1px 1px rgba(0,0,0,0.05)' : '0 1px 1px rgba(255,255,255,0.05)',
                    fontWeight: 400
                  }}
                >
                  "{MOTIVATIONAL_QUOTES[language as keyof typeof MOTIVATIONAL_QUOTES][(currentQuoteIndex + 1) % MOTIVATIONAL_QUOTES[language as keyof typeof MOTIVATIONAL_QUOTES].length]}"
                </div>
              )}
              <SettingsMobileButton />
            </div>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Timer Section - Takes most space */}
            <div 
              className="flex-1 flex items-center justify-center p-4 min-h-[60vh] flex-shrink-0 relative"
              style={getBackgroundStyles(selectedBackground)}
            >
              <ServiceSelector />
              <RankingDisplay studyStreak={studyStreak} />
            </div>
          </div>
        </div>
      </div>
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
