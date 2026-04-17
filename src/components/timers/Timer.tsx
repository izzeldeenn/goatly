'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
import { getTimerDesignStyle } from '@/constants/timerDesignStyles';

export function Timer() {
  const { theme } = useTheme();
  const { getCurrentUser, setTimerActive } = useUser();
  const { startSession, endSession, updateSessionTime, isSessionActive } = useStudySession();
  
  // Timer settings from localStorage
  const [timerSettings, setTimerSettings] = useState({
    color: '#ffffff',
    font: 'font-mono',
    design: 'minimal',
    size: 'text-4xl'
  });
  const [time, setTime] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.time || 0;
      }
    }
    return 0;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const realtimeUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Handle hydration
  useEffect(() => {
    setHasHydrated(true);
    
    // Load timer settings from localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('timer_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setTimerSettings(settings);
        } catch (error) {
          console.error('Failed to load timer settings:', error);
        }
      }
    }
  }, []);

  // Listen for timer settings changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'timer_settings' && e.newValue) {
          try {
            const settings = JSON.parse(e.newValue);
            setTimerSettings(settings);
          } catch (error) {
            console.error('Failed to parse timer settings:', error);
          }
        }
      };

      // Listen for custom event from settings
      const handleCustomEvent = (e: CustomEvent) => {
        setTimerSettings(e.detail);
      };

      // Listen for storage changes
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('timerSettingsChanged', handleCustomEvent as EventListener);

      // Also check for direct localStorage changes (same tab)
      const checkInterval = setInterval(() => {
        const savedSettings = localStorage.getItem('timer_settings');
        if (savedSettings) {
          try {
            const settings = JSON.parse(savedSettings);
            setTimerSettings(prev => {
              // Only update if actually different
              if (JSON.stringify(prev) !== JSON.stringify(settings)) {
                return settings;
              }
              return prev;
            });
          } catch (error) {
            console.error('Failed to parse timer settings:', error);
          }
        }
      }, 500);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('timerSettingsChanged', handleCustomEvent as EventListener);
        clearInterval(checkInterval);
      };
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = {
        time
      };
      localStorage.setItem('timer_state', JSON.stringify(state));
    }
  }, [time]);

  // Clear saved state
  const clearSavedState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('timer_state');
    }
  };

  useEffect(() => {
    clearSavedState();
  }, [time]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      setTimerActive(true);
      
      // Start study session if not already active
      const currentUser = getCurrentUser();
      if (!isSessionActive && currentUser?.accountId) {
        startSession(currentUser.accountId);
      }
      
      // Update the timer display every 1 second
      intervalId = setInterval(async () => {
        setTime((prevTime: number) => prevTime + 1);
        updateSessionTime(1); // Update session time by 1 second
      }, 1000);
    } else {
      setTimerActive(false);
      
      // End study session when timer stops
      if (isSessionActive) {
        const currentUser = getCurrentUser();
        if (currentUser?.accountId) {
          endSession(currentUser.accountId);
        }
      }
    }

    return () => {
      setTimerActive(false);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]); // Remove isSessionActive from dependencies

  // Handle background tab throttling with Document Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // Save timestamp and current time when tab goes to background
        const lastActiveTime = Date.now();
        localStorage.setItem('timer_background_start', lastActiveTime.toString());
        localStorage.setItem('timer_background_time', time.toString());
      } else if (!document.hidden && isRunning) {
        // Calculate correct time when tab becomes visible again
        const backgroundStart = localStorage.getItem('timer_background_start');
        const backgroundTime = localStorage.getItem('timer_background_time');
        
        if (backgroundStart && backgroundTime) {
          const timePassed = Math.floor((Date.now() - parseInt(backgroundStart)) / 1000);
          const newTime = parseInt(backgroundTime) + timePassed;
          
          if (timePassed > 0 && timePassed < 3600) { // Only restore if less than 1 hour lost
            updateSessionTime(timePassed);
            setTime(newTime);
          }
          
          localStorage.removeItem('timer_background_start');
          localStorage.removeItem('timer_background_time');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    // Get current user and validate
    const currentUser = getCurrentUser();
    if (!currentUser?.accountId) {
      console.error('❌ No current user found');
      return;
    }
    
    setIsRunning(true);
  };

  const handleStop = async () => {
    if (isRunning) {
      const currentUser = getCurrentUser();
      if (currentUser?.accountId) {
        await endSession(currentUser.accountId);
      }
    }
    setIsRunning(false);
  };
  const handleReset = async () => {
    if (isRunning) {
      await handleStop();
    }
    setTime(0);
    clearSavedState();
  };


  return (
    <div className="text-center">
      {!hasHydrated ? (
        <h1 className={`${timerSettings.size} font-bold mb-8 ${timerSettings.font}`}
          style={{ 
            color: timerSettings.color,
            ...getTimerDesignStyle(timerSettings.design)
          }}
        >
          00:00:00
        </h1>
      ) : (
        <>
          <h1 className={`${timerSettings.size} font-bold mb-8 ${timerSettings.font}`}
            style={{ 
              color: timerSettings.color,
              ...getTimerDesignStyle(timerSettings.design)
            }}
          >
            {formatTime(time)}
          </h1>
          
          <div className="flex justify-center">
            <div
              className={`flex overflow-hidden rounded-lg divide-x ${
                theme === 'light' 
                  ? 'bg-white border border-gray-200' 
                  : 'bg-gray-900 border border-gray-700 divide-gray-700'
              } rtl:flex-row-reverse`}
            >
              <button
                onClick={handleReset}
                className={`px-4 py-2 font-medium transition-colors duration-200 sm:px-6 ${
                  theme === 'light'
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </button>

              <button
                onClick={handleStop}
                disabled={!isRunning}
                className={`px-4 py-2 font-medium transition-colors duration-200 sm:px-6 disabled:cursor-not-allowed disabled:opacity-50 ${
                  theme === 'light'
                    ? 'text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent'
                    : 'text-gray-300 hover:bg-gray-800 disabled:hover:bg-transparent'
                }`}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9A2.25 2.25 0 015.25 16.5v-9z"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </button>

              <button
                onClick={handleStart}
                disabled={isRunning}
                className={`px-4 py-2 font-medium transition-colors duration-200 sm:px-6 disabled:cursor-not-allowed disabled:opacity-50 ${
                  theme === 'light'
                    ? 'text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent'
                    : 'text-gray-300 hover:bg-gray-800 disabled:hover:bg-transparent'
                }`}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
