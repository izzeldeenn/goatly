'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { messageDB } from '@/lib/friendship';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { SettingsButton } from '@/components/settings/Settings';
import { MusicPlayer } from '@/components/music/MusicPlayer';
import { Timer } from '../timers/Timer';
import { PomodoroTimer } from '../timers/PomodoroTimer';
import { CountdownTimer } from '../timers/CountdownTimer';
import { YouTubeTimer } from '../timers/YouTubeTimer';
import { UserActivityDashboard } from '../users/UserActivityDashboard';
import { PDFStudyTimer } from '../timers/PDFStudyTimer';

type TimerType = 'stopwatch' | 'pomodoro' | 'countdown' | 'youtube' | 'dashboard' | 'pdf';

export function ServiceSelector() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const { getCurrentUser } = useUser();
  const [activeTimer, setActiveTimer] = useState<TimerType>('stopwatch');
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);

  // Load enabled services from localStorage
  const [enabledServices, setEnabledServices] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enabled_services');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Failed to load enabled services:', error);
        }
      }
    }
    // Default: all services enabled
    return {
      stopwatch: true,
      pomodoro: true,
      countdown: true,
      youtube: true,
      dashboard: true,
      pdf: true
    };
  });
  
  // Refs for scroll containers
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  
  // State for scroll visibility
  const [canScrollMobile, setCanScrollMobile] = useState({ left: false, right: false });
  const [canScrollDesktop, setCanScrollDesktop] = useState({ up: false, down: false });

  
  const renderTimer = () => {
    switch (activeTimer) {
      case 'stopwatch':
        return <Timer />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'countdown':
        return <CountdownTimer />;
      case 'youtube':
        return <YouTubeTimer />;
      case 'dashboard':
        return <UserActivityDashboard />;
      case 'pdf':
        return <PDFStudyTimer />;
      default:
        return <Timer />;
    }
  };

  // Timer buttons array - focus timers only
  const allTimerButtons = [
    { id: 'stopwatch', type: 'stopwatch' as TimerType, label: t.stopwatch, icon: '⏱️' },
    { id: 'pomodoro', type: 'pomodoro' as TimerType, label: t.pomodoro, icon: '🍅' },
    { id: 'countdown', type: 'countdown' as TimerType, label: t.countdown, icon: '⏳' },
    { id: 'youtube', type: 'youtube' as TimerType, label: t.youtube, icon: '🎬' },
    { id: 'dashboard', type: 'dashboard' as TimerType, label: t.rank === 'ترتيب' ? 'لوحة التحكم' : 'Dashboard', icon: '📈' },
    { id: 'pdf', type: 'pdf' as TimerType, label: t.rank === 'ترتيب' ? 'دراسة PDF' : 'PDF Study', icon: '📚' }
  ];

  // Filter timer buttons to only show enabled services
  const timerButtons = allTimerButtons.filter(button => enabledServices[button.id]);

  // Check scroll position for mobile
  const checkMobileScroll = () => {
    if (mobileScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = mobileScrollRef.current;
      setCanScrollMobile({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 1
      });
    }
  };

  // Check scroll position for desktop
  const checkDesktopScroll = () => {
    if (desktopScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = desktopScrollRef.current;
      setCanScrollDesktop({
        up: scrollTop > 0,
        down: scrollTop < scrollHeight - clientHeight - 1
      });
    }
  };

  // Scroll functions for mobile (horizontal)
  const scrollMobileLeft = () => {
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollMobileRight = () => {
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Scroll functions for desktop (vertical)
  const scrollDesktopUp = () => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollBy({ top: -200, behavior: 'smooth' });
    }
  };

  const scrollDesktopDown = () => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollBy({ top: 200, behavior: 'smooth' });
    }
  };

  // Setup scroll listeners and unread count
  useEffect(() => {
    const mobileRef = mobileScrollRef.current;
    const desktopRef = desktopScrollRef.current;

    if (mobileRef) {
      mobileRef.addEventListener('scroll', checkMobileScroll);
      checkMobileScroll(); // Initial check
    }

    if (desktopRef) {
      desktopRef.addEventListener('scroll', checkDesktopScroll);
      checkDesktopScroll(); // Initial check
    }

    // Check if scrolling is needed
    setTimeout(() => {
      checkMobileScroll();
      checkDesktopScroll();
    }, 100);

    return () => {
      if (mobileRef) {
        mobileRef.removeEventListener('scroll', checkMobileScroll);
      }
      if (desktopRef) {
        desktopRef.removeEventListener('scroll', checkDesktopScroll);
      }
    };
  }, []);

  // Listen for enabled services changes from localStorage
  useEffect(() => {
    const handleServicesChange = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('enabled_services');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setEnabledServices(parsed);
          } catch (error) {
            console.error('Failed to load enabled services:', error);
          }
        }
      }
    };

    // Listen for custom event from settings
    const handleServicesUpdated = (e: CustomEvent) => {
      handleServicesChange();
    };

    window.addEventListener('servicesUpdated', handleServicesUpdated as EventListener);

    // Also listen to storage events (for changes in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'enabled_services') {
        handleServicesChange();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('servicesUpdated', handleServicesUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  
  return (
    <div className="w-full h-full md:h-screen flex flex-col overflow-hidden">
      {/* Active Timer - Scrollable Container */}
      <div className="flex-1 overflow-hidden pt-4">
        <div className="h-full overflow-y-auto">
          <div className="h-full flex items-center justify-center py-2">
            {renderTimer()}
          </div>
        </div>
      </div>

      {/* Bottom Icons - All Screens with Horizontal Scroll */}
      <div className="relative flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
        {/* Left Arrow */}
        {canScrollMobile.left && (
          <button
            onClick={scrollMobileLeft}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 border-2 ${
              theme === 'light'
                ? 'bg-white text-gray-700 border-gray-400 hover:bg-gray-100 hover:border-gray-600'
                : 'bg-gray-900 text-gray-300 border-gray-500 hover:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <span className="text-sm">←</span>
          </button>
        )}
        
        {/* Scrollable Container */}
        <div className="flex items-center">
          {/* Fixed Music Button */}
          <div className="px-4 py-2 flex-shrink-0">
            <button
              className={`group relative w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200 flex-shrink-0 border-2 ${
                theme === 'light'
                  ? 'bg-purple-500 text-white border-purple-600 hover:bg-purple-600 hover:border-purple-700 hover:shadow-md'
                  : 'bg-purple-600 text-white border-purple-500 hover:bg-purple-700 hover:border-purple-400 hover:shadow-md'
              }`}
              title="Music Player"
              onClick={() => setIsMusicPlayerOpen(true)}
            >
              <span className="transition-transform duration-200 group-hover:scale-110">
                🎵
              </span>
              {/* Music Indicator */}
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </button>
          </div>
          
          {/* Service Buttons */}
          <div
            ref={mobileScrollRef}
            className="flex items-center gap-4 p-4 overflow-x-auto flex-1 min-w-0 snap-x snap-mandatory md:justify-center"
          >
            {timerButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => setActiveTimer(button.type)}
                className={`group relative w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200 flex-shrink-0 border-2 ${
                  activeTimer === button.type
                    ? theme === 'light'
                      ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                      : 'bg-white text-gray-900 border-white shadow-lg'
                    : theme === 'light'
                      ? 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100 hover:border-gray-600 hover:shadow-md'
                      : 'bg-gray-900 text-gray-100 border-gray-500 hover:bg-gray-800 hover:border-gray-300 hover:shadow-md'
                }`}
                title={button.label}
              >
                <span className={`transition-transform duration-200 group-hover:scale-110 ${
                  activeTimer === button.type
                    ? theme === 'light' ? 'text-white' : 'text-gray-900'
                    : theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                }`}>
                  {button.icon}
                </span>
                {/* Active Indicator - More visible */}
                {activeTimer === button.type && (
                  <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${
                    theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'
                  } border-2 border-white shadow-sm`}></div>
                )}
                              </button>
            ))}
          </div>
          
          {/* Fixed Settings Button */}
          <div className="px-4 py-2 flex-shrink-0">
            <SettingsButton />
          </div>
        </div>
      </div>

      {/* Music Player */}
      <MusicPlayer isVisible={isMusicPlayerOpen} setIsVisible={setIsMusicPlayerOpen} />
    </div>
  );
}
