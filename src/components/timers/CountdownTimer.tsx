'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
import { useTimerIndicator } from '@/contexts/TimerIndicatorContext';
import { getTimerDesignStyle } from '@/constants/timerDesignStyles';

export function CountdownTimer() {
  const { theme } = useTheme();
  const { getCurrentUser, setTimerActive } = useUser();
  const { startSession, endSession, updateSessionTime, isSessionActive } = useStudySession();
  const { setTimerActive: setTimerActiveIndicator } = useTimerIndicator();
  
  // Timer settings from localStorage
  const [timerSettings, setTimerSettings] = useState({
    color: '#ffffff',
    font: 'font-mono',
    design: 'minimal',
    size: 'text-4xl'
  });
  const [hours, setHours] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('countdownTimer_inputs');
      if (saved) {
        const inputs = JSON.parse(saved);
        return inputs.hours || 0;
      }
    }
    return 0;
  });
  const [minutes, setMinutes] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('countdownTimer_inputs');
      if (saved) {
        const inputs = JSON.parse(saved);
        return inputs.minutes || 5;
      }
    }
    return 5;
  });
  const [seconds, setSeconds] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('countdownTimer_inputs');
      if (saved) {
        const inputs = JSON.parse(saved);
        return inputs.seconds || 0;
      }
    }
    return 0;
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('countdownTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.timeLeft || 0;
      }
    }
    return 0;
  });
  const [isRunning, setIsRunning] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('countdownTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.isRunning || false;
      }
    }
    return false;
  });
  const [isSet, setIsSet] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('countdownTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.isSet || false;
      }
    }
    return false;
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const studyTimeRef = useRef<NodeJS.Timeout | null>(null);

  // Load countdown timer settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('countdown_timer_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setTimerSettings(settings);
        } catch (error) {
          console.error('Failed to load countdown timer settings:', error);
        }
      }
    }
  }, []);

  // Listen for countdown timer settings changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'countdown_timer_settings' && e.newValue) {
          try {
            const settings = JSON.parse(e.newValue);
            setTimerSettings(settings);
          } catch (error) {
            console.error('Failed to parse countdown timer settings:', error);
          }
        }
      };

      // Listen for custom event from settings
      const handleCustomEvent = (e: CustomEvent) => {
        setTimerSettings(e.detail);
      };

      // Listen for storage changes
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('countdownTimerSettingsChanged', handleCustomEvent as EventListener);

      // Also check for direct localStorage changes (same tab)
      const checkInterval = setInterval(() => {
        const savedSettings = localStorage.getItem('countdown_timer_settings');
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
            console.error('Failed to parse countdown timer settings:', error);
          }
        }
      }, 500);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('countdownTimerSettingsChanged', handleCustomEvent as EventListener);
        clearInterval(checkInterval);
      };
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = {
        timeLeft,
        isRunning,
        isSet
      };
      const inputs = {
        hours,
        minutes,
        seconds
      };
      localStorage.setItem('countdownTimer_state', JSON.stringify(state));
      localStorage.setItem('countdownTimer_inputs', JSON.stringify(inputs));
    }
  }, [timeLeft, isRunning, isSet, hours, minutes, seconds]);

  // Clear saved state
  const clearSavedState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('countdownTimer_state');
      localStorage.removeItem('countdownTimer_inputs');
    }
  };

  useEffect(() => {
    clearSavedState();
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (isRunning && timeLeft > 0) {
      setTimerActive(true);
      setTimerActiveIndicator(true);
      
      // Start study session if not already active
      if (!isSessionActive && currentUser?.accountId) {
        startSession(currentUser.accountId);
      }
      
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
        updateSessionTime(1); // Update session time by 1 second
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setTimerActive(false);
      setTimerActiveIndicator(false);
      
      // End study session when timer completes
      if (isSessionActive && currentUser?.accountId) {
        endSession(currentUser.accountId);
      }
      
      // Play notification or alert
      alert('الوقت انتهى!');
    } else {
      setTimerActive(false);
      setTimerActiveIndicator(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
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
    };
  }, [isRunning, timeLeft]);

  // Handle background tab throttling with Document Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // Save timestamp and current timeLeft when tab goes to background
        const lastActiveTime = Date.now();
        localStorage.setItem('countdown_background_start', lastActiveTime.toString());
        localStorage.setItem('countdown_background_timeleft', timeLeft.toString());
      } else if (!document.hidden && isRunning) {
        // Calculate correct time when tab becomes visible again
        const backgroundStart = localStorage.getItem('countdown_background_start');
        const backgroundTimeLeft = localStorage.getItem('countdown_background_timeleft');
        
        if (backgroundStart && backgroundTimeLeft) {
          const timePassed = Math.floor((Date.now() - parseInt(backgroundStart)) / 1000);
          const newTimeLeft = Math.max(0, parseInt(backgroundTimeLeft) - timePassed);
          
          if (timePassed > 0 && timePassed < 3600) { // Only restore if less than 1 hour lost
            updateSessionTime(timePassed);
            setTimeLeft(newTimeLeft);
          }
          
          localStorage.removeItem('countdown_background_start');
          localStorage.removeItem('countdown_background_timeleft');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, timeLeft]);


  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSet = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsSet(true);
      setIsRunning(false);
    }
  };

  const handleStart = async () => {
    if (isSet && timeLeft > 0) {
      // Get current user and validate
      const currentUser = getCurrentUser();
      if (!currentUser?.accountId) {
        console.error('❌ No current user found');
        return;
      }
      
      setIsRunning(true);
    }
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
    setIsSet(false);
    setTimeLeft(0);
    clearSavedState();
  };

  return (
    <div className="text-center">
      {!isSet ? (
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${
            theme === 'light' ? 'text-black' : 'text-white'
          }`}>ضبط المؤقت</h2>
          <div className="flex justify-center items-center space-x-4 space-x-reverse mb-6">
            <div className="text-center">
              <label className={`block mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>ساعات</label>
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                className={`w-20 px-3 py-2 border-2 rounded focus:outline-none text-center ${
                  theme === 'light'
                    ? 'border-gray-300 bg-white text-black focus:border-black'
                    : 'border-gray-600 bg-black text-white focus:border-white'
                }`}
              />
            </div>
            <div className={`text-2xl font-bold ${
              theme === 'light' ? 'text-black' : 'text-white'
            }`}>:</div>
            <div className="text-center">
              <label className={`block mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>دقائق</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className={`w-20 px-3 py-2 border-2 rounded focus:outline-none text-center ${
                  theme === 'light'
                    ? 'border-gray-300 bg-white text-black focus:border-black'
                    : 'border-gray-600 bg-black text-white focus:border-white'
                }`}
              />
            </div>
            <div className={`text-2xl font-bold ${
              theme === 'light' ? 'text-black' : 'text-white'
            }`}>:</div>
            <div className="text-center">
              <label className={`block mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>ثواني</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className={`w-20 px-3 py-2 border-2 rounded focus:outline-none text-center ${
                  theme === 'light'
                    ? 'border-gray-300 bg-white text-black focus:border-black'
                    : 'border-gray-600 bg-black text-white focus:border-white'
                }`}
              />
            </div>
          </div>
          <button
            onClick={handleSet}
            className={`px-8 py-3 border-2 rounded-lg font-semibold transition-colors ${
              theme === 'light'
                ? 'border-black bg-white text-black hover:bg-black hover:text-white'
                : 'border-white bg-black text-white hover:bg-white hover:text-black'
            }`}
          >
            ضبط المؤقت
          </button>
        </div>
      ) : (
        <div>
          <h1 className={`${timerSettings.size} font-bold mb-8 ${timerSettings.font}`}
            style={{ 
              color: timerSettings.color,
              ...getTimerDesignStyle(timerSettings.design)
            }}
          >
            {formatTime(timeLeft)}
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
        </div>
      )}
    </div>
  );
}
