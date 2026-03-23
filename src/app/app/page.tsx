'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Logo } from '@/components/Logo';
import { UserRankings } from '@/components/UserRankings';
import { CurrentUserSelector } from '@/components/CurrentUserSelector';
import { SettingsButton } from '@/components/SettingsButton';
import { ServiceSelector } from '@/components/ServiceSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserProfile } from '@/components/UserProfile';
import { FullscreenPrompt } from '@/components/FullscreenPrompt';
import { FullscreenProvider } from '@/contexts/FullscreenContext';
import { CustomThemeProvider } from '@/contexts/CustomThemeContext';
import { ThemeSelector } from '@/components/ThemeSelector';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { useUser } from '@/contexts/UserContext';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TimerIndicatorProvider } from '@/contexts/TimerIndicatorContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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
    backgroundImage: background
  };
};

const BACKGROUNDS = [
  { id: 'default', name: 'افتراضي', value: 'transparent' },
  { id: 'gradient1', name: 'تدرج أخضر', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient2', name: 'تدرج أزرق', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient3', name: 'تدرج برتقالي', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'gradient4', name: 'تدرج بنفسجي', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 'gradient5', name: 'تدرج رمادي', value: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
  // Focus-friendly commercial backgrounds
  { id: 'focus1', name: 'غابة مركزة', value: 'url("https://images.unsplash.com/photo-1540206395-68808572332f?w=1920&h=1080&fit=crop&crop=entropy&cs=tinysrgb")' },
  { id: 'focus2', name: 'مكتبة هادئة', value: 'url("https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920&h=1080&fit=crop&crop=entropy&cs=tinysrgb")' },
  { id: 'focus3', name: 'سماء صافية', value: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=entropy&cs=tinysrgb")' },
  { id: 'focus4', name: 'طبيعة calm', value: 'url("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop&crop=entropy&cs=tinysrgb")' },
  { id: 'focus5', name: 'محيط طبيعي', value: 'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&crop=entropy&cs=tinysrgb")' },
  // Animated focus backgrounds
  { id: 'animated1', name: 'غيوم متحرك', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3YzYyaWJyMXQ0YWtyYzFyZWVvdDFha3M1bWFkeTg0c3F6YmszeWYwdSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/SjkNtYAuV4OXbRIGEc/giphy.gif")' },
  { id: 'animated2', name: 'مطر متحركة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3YzYyaWJyMXQ0YWtyYzFyZWVvdDFha3M1bWFkeTg0c3F6YmszeWYwdSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/LlDxkLadoRcmlcMbP8/giphy.gif")' },
  { id: 'animated3', name: 'نجوم ساقطة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/jDl06sVsg4WVrCEJtS/giphy.gif")' },
  { id: 'animated4', name: 'موجات متحركة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/j3OL6mSc2FeV0UHMDg/giphy.gif")' },
  { id: 'animated5', name: 'غيوم لطيف', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/LXxWO0pgGEma8W40A9/giphy.gif")' },
  // Additional animated backgrounds
  { id: 'animated6', name: 'غابة متحركة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3YzYyaWJyMXQ0YWtyYzFyZWVvdDFha3M1bWFkeTg0c3F6YmszeWYwdSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/SjkNtYAuV4OXbRIGEc/giphy.gif")' },
  { id: 'animated7', name: 'مطر هادئ', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3YzYyaWJyMXQ0YWtyYzFyZWVvdDFha3M1bWFkeTg0c3F6YmszeWYwdSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/LlDxkLadoRcmlcMbP8/giphy.gif")' },
  { id: 'animated8', name: 'نجوم لامعة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/jDl06sVsg4WVrCEJtS/giphy.gif")' },
  { id: 'animated9', name: 'أمواج هادئة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/j3OL6mSc2FeV0UHMDg/giphy.gif")' },
  { id: 'animated10', name: 'غيوم ناعمة', value: 'url("https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2Z3eTNmdm5qcjY0enNhdWwwbjY5aDFiZ2tzc3AycjM3MG5ma3VucSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/LXxWO0pgGEma8W40A9/giphy.gif")' },
];

function HomeContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { setTimerActive, getCurrentUser } = useUser();
  const customTheme = useCustomThemeClasses();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [studyStreak, setStudyStreak] = useState(0);

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

      for (const activity of studyActivities) {
        const activityDate = new Date(activity.date);
        activityDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((checkDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
          checkDate = activityDate;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating study streak:', error);
      return 0;
    }
  };

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

  return (
    <>
    <div className={`flex h-screen overflow-hidden ${
      theme === 'light' ? 'bg-white' : 'bg-black'
    }`}>
      <FullscreenPrompt />
      {isLoading && <LoadingSpinner onComplete={() => setIsLoading(false)} />}
      
      {/* Desktop Layout - Side by side */}
      <div className="hidden md:flex w-full h-full">
        {/* Left section - 1/4 width */}
        <div 
          className="w-1/4 p-6 flex flex-col h-full overflow-y-auto"
          style={{
            backgroundColor: customTheme.colors.surface,
            borderLeft: `2px solid ${customTheme.colors.border}`
          }}
        >
          <div className="flex justify-between items-start mb-6 flex-shrink-0">
            <Logo />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowThemeSelector(true)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: customTheme.colors.text
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = customTheme.colors.primary;
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = customTheme.colors.text;
                }}
                title={language === 'ar' ? 'تخصيص الثيم' : 'Customize Theme'}
              >
                🎨
              </button>
              <SettingsButton />
            </div>
          </div>
          <CurrentUserSelector />
          <UserRankings />
        </div>
        
        {/* Right section - 3/4 width */}
        <div 
          className="w-3/4 flex items-center justify-center p-8 relative h-full overflow-hidden"
          style={getBackgroundStyles(selectedBackground)}
        >
          <div className="absolute top-4 left-4 flex items-center space-x-3 space-x-reverse z-[9998] flex-shrink-0">
            {/* Study Streak */}
            <div className="flex items-center space-x-1 space-x-reverse bg-black/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full shadow-lg border border-white/30">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-bold">{studyStreak} أيام</span>
            </div>
          </div>
          <ServiceSelector />
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
          <div className="flex items-center space-x-1 space-x-reverse">

          <button
                onClick={() => setShowThemeSelector(true)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: customTheme.colors.text
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = customTheme.colors.primary;
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = customTheme.colors.text;
                }}
                title={language === 'ar' ? 'تخصيص الثيم' : 'Customize Theme'}
              >
                🎨
              </button>
            <UserProfile />
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Timer Section - Takes most space */}
          <div 
            className="flex-1 flex items-center justify-center p-4 min-h-[60vh] flex-shrink-0 relative"
            style={getBackgroundStyles(selectedBackground)}
          >
            {/* Study Streak - Mobile */}
            <div className="absolute top-2 left-2 flex items-center space-x-1 space-x-reverse bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-full shadow-lg border border-white/30">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-bold">{studyStreak} أيام</span>
            </div>
            <ServiceSelector />
          </div>

          {/* User Section - Bottom */}
          <div 
            className="p-4 border-t flex-shrink-0"
            style={{
              backgroundColor: customTheme.colors.surface,
              borderColor: customTheme.colors.border
            }}
          >
            <CurrentUserSelector />
            <div className="mt-4">
              <UserRankings />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Theme Selector Modal */}
    {showThemeSelector && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl">
          <div className={`p-6 border-b ${
            theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-200'
              }`}>
                {language === 'ar' ? 'تخصيص الثيم' : 'Theme Customization'}
              </h3>
              <button
                onClick={() => setShowThemeSelector(false)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  theme === 'light'
                    ? 'hover:bg-gray-100 text-gray-600'
                    : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                ✕
              </button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <ThemeSelector />
          </div>
        </div>
      </div>
    )}
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
