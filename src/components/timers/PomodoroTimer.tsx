'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
import { useTimerIndicator } from '@/contexts/TimerIndicatorContext';
import { getTimerDesignStyle } from '@/constants/timerDesignStyles';

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

export function PomodoroTimer() {
  const { theme } = useTheme();
  const { getCurrentUser, setTimerActive } = useUser();
  const { startSession, endSession, updateSessionTime, isSessionActive } = useStudySession();
  const { setTimerActive: setTimerActiveIndicator } = useTimerIndicator();
  
  // Timer settings from localStorage
  const [timerSettings, setTimerSettings] = useState({
    color: '#ffffff',
    font: 'font-mono',
    design: 'minimal',
    size: 'text-4xl',
    completedIcon: 'star' // star, dot, heart
  });
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroTimer_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      workMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      longBreakInterval: 4
    };
  });

  const [showSettings, setShowSettings] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'shortBreak' | 'longBreak'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.currentSession || 'work';
      }
    }
    return 'work';
  });
  const [completedSessions, setCompletedSessions] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.completedSessions || 0;
      }
    }
    return 0;
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.timeLeft || settings.workMinutes * 60;
      }
    }
    return settings.workMinutes * 60;
  });
  const [isRunning, setIsRunning] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.isRunning || false;
      }
    }
    return false;
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const studyTimeRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer settings from localStorage and listen for changes
  useEffect(() => {
    // Load timer settings from localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('pomodoro_timer_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setTimerSettings(settings);
        } catch (error) {
          console.error('Failed to load pomodoro timer settings:', error);
        }
      }

      // Listen for storage changes from other tabs
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'pomodoro_timer_settings' && e.newValue) {
          try {
            const settings = JSON.parse(e.newValue);
            setTimerSettings(settings);
          } catch (error) {
            console.error('Failed to parse pomodoro timer settings:', error);
          }
        }
      };

      // Listen for custom event from settings
      const handleCustomEvent = (e: CustomEvent) => {
        setTimerSettings(e.detail);
      };

      // Listen for storage changes
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('pomodoroTimerSettingsChanged', handleCustomEvent as EventListener);

      // Also check for direct localStorage changes (same tab)
      const checkInterval = setInterval(() => {
        const savedSettings = localStorage.getItem('pomodoro_timer_settings');
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
            console.error('Failed to check pomodoro timer settings:', error);
          }
        }
      }, 1000);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('pomodoroTimerSettingsChanged', handleCustomEvent as EventListener);
        clearInterval(checkInterval);
      };
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = {
        currentSession,
        completedSessions,
        timeLeft,
        isRunning
      };
      localStorage.setItem('pomodoroTimer_state', JSON.stringify(state));
      localStorage.setItem('pomodoroTimer_settings', JSON.stringify(settings));
    }
  }, [currentSession, completedSessions, timeLeft, isRunning, settings]);

  // Clear saved state
  const clearSavedState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pomodoroTimer_state');
      localStorage.removeItem('pomodoroTimer_settings');
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (isRunning && timeLeft > 0) {
      setTimerActive(true);
      setTimerActiveIndicator(true);
      
      // Start study session if this is a work session and no session is active
      if (currentSession === 'work' && !isSessionActive && currentUser?.accountId) {
        startSession(currentUser.accountId);
      }
      
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
        
        // Update session time for work sessions
        if (currentSession === 'work') {
          updateSessionTime(1);
        }
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setTimerActive(false);
      setTimerActiveIndicator(false);
      
      // End study session when work session completes
      if (currentSession === 'work' && isSessionActive && currentUser?.accountId) {
        endSession(currentUser.accountId);
      }
      // Play notification or alert
      alert('الجلسة انتهت!');
    } else {
      setTimerActive(false);
      setTimerActiveIndicator(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
      if (realtimeUpdateRef.current) {
        clearInterval(realtimeUpdateRef.current);
      }
    }

    return () => {
      setTimerActive(false);
      setTimerActiveIndicator(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
      if (realtimeUpdateRef.current) {
        clearInterval(realtimeUpdateRef.current);
      }
    };
  }, [isRunning, timeLeft, currentSession]); // Remove isSessionActive from dependencies

  // Handle background tab throttling with Document Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && currentSession === 'work') {
        // Save timestamp and current timeLeft when tab goes to background
        const lastActiveTime = Date.now();
        localStorage.setItem('pomodoro_background_start', lastActiveTime.toString());
        localStorage.setItem('pomodoro_background_timeleft', timeLeft.toString());
      } else if (!document.hidden && isRunning && currentSession === 'work') {
        // Calculate correct time when tab becomes visible again
        const backgroundStart = localStorage.getItem('pomodoro_background_start');
        const backgroundTimeLeft = localStorage.getItem('pomodoro_background_timeleft');
        
        if (backgroundStart && backgroundTimeLeft) {
          const timePassed = Math.floor((Date.now() - parseInt(backgroundStart)) / 1000);
          const newTimeLeft = Math.max(0, parseInt(backgroundTimeLeft) - timePassed);
          
          if (timePassed > 0 && timePassed < 3600) { // Only restore if less than 1 hour lost
            updateSessionTime(timePassed);
            setTimeLeft(newTimeLeft);
          }
          
          localStorage.removeItem('pomodoro_background_start');
          localStorage.removeItem('pomodoro_background_timeleft');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, currentSession, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    if (currentSession === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      if (newCompletedSessions % settings.longBreakInterval === 0) {
        setCurrentSession('longBreak');
        setTimeLeft(settings.longBreakMinutes * 60);
      } else {
        setCurrentSession('shortBreak');
        setTimeLeft(settings.shortBreakMinutes * 60);
      }
    } else {
      setCurrentSession('work');
      setTimeLeft(settings.workMinutes * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Render completed sessions icons
  const renderCompletedSessions = () => {
    const icons = [];
    const maxDisplay = 10; // Maximum icons to display
    
    for (let i = 0; i < Math.min(completedSessions, maxDisplay); i++) {
      let icon = '';
      switch (timerSettings.completedIcon) {
        case 'star':
          icon = '⭐';
          break;
        case 'dot':
          icon = '🔵';
          break;
        case 'heart':
          icon = '❤️';
          break;
        default:
          icon = '⭐';
      }
      icons.push(
        <span key={i} className="inline-block mx-1 text-lg">
          {icon}
        </span>
      );
    }
    
    // Add "+X" if there are more sessions than displayed
    if (completedSessions > maxDisplay) {
      icons.push(
        <span key="more" className="inline-block mx-1 text-lg">
          +{completedSessions - maxDisplay}
        </span>
      );
    }
    
    return icons;
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
      if (currentUser?.accountId && currentSession === 'work') {
        await endSession(currentUser.accountId);
      }
    }
    setIsRunning(false);
  };
  
  const handleReset = async () => {
    if (isRunning) {
      await handleStop();
    }
    setTimeLeft(currentSession === 'work' ? settings.workMinutes * 60 : 
               currentSession === 'shortBreak' ? settings.shortBreakMinutes * 60 : 
               settings.longBreakMinutes * 60);
    clearSavedState();
  };

  const handleResetSessions = () => {
    setCompletedSessions(0);
  };

  const handleSkip = async () => {
    if (isRunning) {
      await handleStop();
    }
    setIsRunning(false);
    if (currentSession === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      if (newCompletedSessions % settings.longBreakInterval === 0) {
        setCurrentSession('longBreak');
        setTimeLeft(settings.longBreakMinutes * 60);
      } else {
        setCurrentSession('shortBreak');
        setTimeLeft(settings.shortBreakMinutes * 60);
      }
    } else {
      setCurrentSession('work');
      setTimeLeft(settings.workMinutes * 60);
    }
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work': return 'border-red-500 bg-red-50';
      case 'shortBreak': return 'border-green-500 bg-green-50';
      case 'longBreak': return 'border-blue-500 bg-blue-50';
    }
  };

  const getSessionLabel = () => {
    switch (currentSession) {
      case 'work': return 'وقت العمل';
      case 'shortBreak': return 'استراحة قصيرة';
      case 'longBreak': return 'استراحة طويلة';
    }
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className={`inline-block px-4 py-2 border-2 rounded-lg ${getSessionColor()}`}>
          <h2 className={`text-xl font-bold ${
            theme === 'light' ? 'text-black' : 'text-gray-900'
          }`}>
            {getSessionLabel()}
          </h2>
        </div>
        <div className={`mt-2 ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          <div className="flex items-center justify-center flex-wrap">
            {renderCompletedSessions()}
          </div>
        </div>
      </div>

      <h1 className={`${timerSettings.size} font-bold mb-8 ${timerSettings.font}`}
        style={{ 
          color: timerSettings.color,
          ...getTimerDesignStyle(timerSettings.design)
        }}
      >
        {formatTime(timeLeft)}
      </h1>

      <div className="flex justify-center mb-6">
        <div
          className={`flex overflow-hidden rounded-lg divide-x ${
            theme === 'light' 
              ? 'bg-white border border-gray-200' 
              : 'bg-gray-900 border border-gray-700 divide-gray-700'
          } rtl:flex-row-reverse`}
        >
          <button
            onClick={handleSkip}
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
                d="M11.25 4.5l-6.318 9.319a1.125 1.125 0 001.003 1.681H15.75a1.125 1.125 0 001.003-1.681L10.5 4.5a1.125 1.125 0 00-1.25 0z"
                strokeLinejoin="round"
                strokeLinecap="round"
              ></path>
            </svg>
          </button>

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
            onClick={handleResetSessions}
            className={`px-4 py-2 font-medium transition-colors duration-200 sm:px-6 ${
              theme === 'light'
                ? 'text-red-600 hover:bg-red-100'
                : 'text-red-400 hover:bg-red-900'
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
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

      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`px-4 py-2 border-2 rounded-lg font-medium transition-colors ${
          theme === 'light'
            ? 'border-black bg-white text-black hover:bg-black hover:text-white'
            : 'border-white bg-black text-white hover:bg-white hover:text-black'
        }`}
      >
        الإعدادات
      </button>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 border-2 rounded-lg shadow-2xl max-w-md w-full mx-4 ${
            theme === 'light' 
              ? 'border-gray-300 bg-white' 
              : 'border-gray-600 bg-black'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${
              theme === 'light' ? 'text-black' : 'text-white'
            }`}>الإعدادات</h3>
            <div className="space-y-4 text-right">
              <div>
                <label className={`block mb-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>وقت العمل (دقائق)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workMinutes}
                  onChange={(e) => {
                    const newSettings = { ...settings, workMinutes: parseInt(e.target.value) || 25 };
                    setSettings(newSettings);
                    if (currentSession === 'work') {
                      setTimeLeft(newSettings.workMinutes * 60);
                    }
                  }}
                  className={`w-full px-3 py-2 border-2 rounded focus:outline-none ${
                    theme === 'light'
                      ? 'border-gray-300 bg-white text-black focus:border-black'
                      : 'border-gray-600 bg-black text-white focus:border-white'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>الاستراحة القصيرة (دقائق)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakMinutes}
                  onChange={(e) => {
                    const newSettings = { ...settings, shortBreakMinutes: parseInt(e.target.value) || 5 };
                    setSettings(newSettings);
                    if (currentSession === 'shortBreak') {
                      setTimeLeft(newSettings.shortBreakMinutes * 60);
                    }
                  }}
                  className={`w-full px-3 py-2 border-2 rounded focus:outline-none ${
                    theme === 'light'
                      ? 'border-gray-300 bg-white text-black focus:border-black'
                      : 'border-gray-600 bg-black text-white focus:border-white'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>الاستراحة الطويلة (دقائق)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakMinutes}
                  onChange={(e) => {
                    const newSettings = { ...settings, longBreakMinutes: parseInt(e.target.value) || 15 };
                    setSettings(newSettings);
                    if (currentSession === 'longBreak') {
                      setTimeLeft(newSettings.longBreakMinutes * 60);
                    }
                  }}
                  className={`w-full px-3 py-2 border-2 rounded focus:outline-none ${
                    theme === 'light'
                      ? 'border-gray-300 bg-white text-black focus:border-black'
                      : 'border-gray-600 bg-black text-white focus:border-white'
                  }`}
                />
              </div>
              <div>
                <label className={`block mb-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>استراحة طويلة كل (جلسات عمل)</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={settings.longBreakInterval}
                  onChange={(e) => setSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 4 })}
                  className={`w-full px-3 py-2 border-2 rounded focus:outline-none ${
                    theme === 'light'
                      ? 'border-gray-300 bg-white text-black focus:border-black'
                      : 'border-gray-600 bg-black text-white focus:border-white'
                  }`}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className={`px-6 py-2 border-2 rounded-lg font-semibold transition-colors ${
                  theme === 'light'
                    ? 'border-black bg-white text-black hover:bg-black hover:text-white'
                    : 'border-white bg-black text-white hover:bg-white hover:text-black'
                }`}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
