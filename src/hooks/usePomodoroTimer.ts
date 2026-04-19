'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
import { useTimerIndicator } from '@/contexts/TimerIndicatorContext';

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

interface TimerSettings {
  color: string;
  font: string;
  design: string;
  size: string;
  completedIcon: 'star' | 'dot' | 'heart';
}

interface PomodoroState {
  currentSession: 'work' | 'shortBreak' | 'longBreak';
  completedSessions: number;
  timeLeft: number;
  isRunning: boolean;
}

export function usePomodoroTimer() {
  const { theme } = useTheme();
  const { getCurrentUser, setTimerActive } = useUser();
  const { startSession, endSession, updateSessionTime, isSessionActive } = useStudySession();
  const { setTimerActive: setTimerActiveIndicator } = useTimerIndicator();
  
  // Timer settings from localStorage for Pomodoro
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoro_timer_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Failed to load pomodoro timer settings:', error);
        }
      }
    }
    return {
      color: '#ffffff',
      font: 'font-mono',
      design: 'minimal',
      size: 'text-4xl',
      completedIcon: 'star'
    };
  });
  
  // Pomodoro-specific state
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

  const [state, setState] = useState<PomodoroState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state || { currentSession: 'work', completedSessions: 0, timeLeft: 25 * 60, isRunning: false };
      }
    }
    return { currentSession: 'work', completedSessions: 0, timeLeft: 25 * 60, isRunning: false };
  });

  const [showSettings, setShowSettings] = useState(false);
  const currentTimeLeftRef = useRef(0);

  // Load timer settings from localStorage and listen for changes
  useEffect(() => {
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

      const handleCustomEvent = (e: CustomEvent) => {
        setTimerSettings(e.detail);
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('pomodoroTimerSettingsChanged', handleCustomEvent as EventListener);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('pomodoroTimerSettingsChanged', handleCustomEvent as EventListener);
      };
    }
  }, []);

  // Save timer settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoro_timer_settings', JSON.stringify(timerSettings));
    }
  }, [timerSettings]);

  // Extract individual state properties
  const { currentSession, completedSessions, timeLeft, isRunning } = state;

  // Create setter functions
  const setTimeLeft = (value: number | ((prev: number) => number)) => {
    setState(prev => ({
      ...prev,
      timeLeft: typeof value === 'function' ? value(prev.timeLeft) : value
    }));
  };

  const setIsRunning = (value: boolean | ((prev: boolean) => boolean)) => {
    setState(prev => ({
      ...prev,
      isRunning: typeof value === 'function' ? value(prev.isRunning) : value
    }));
  };

  const setCurrentSession = (value: 'work' | 'shortBreak' | 'longBreak') => {
    setState(prev => ({
      ...prev,
      currentSession: value
    }));
  };

  const setCompletedSessions = (value: number | ((prev: number) => number)) => {
    setState(prev => ({
      ...prev,
      completedSessions: typeof value === 'function' ? value(prev.completedSessions) : value
    }));
  };

  // Load timer settings from localStorage and listen for changes
  useEffect(() => {
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

      const handleCustomEvent = (e: CustomEvent) => {
        setTimerSettings(e.detail);
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('pomodoroTimerSettingsChanged', handleCustomEvent as EventListener);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('pomodoroTimerSettingsChanged', handleCustomEvent as EventListener);
      };
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateData = {
        currentSession,
        completedSessions,
        timeLeft,
        isRunning
      };
      localStorage.setItem('pomodoroTimer_state', JSON.stringify(stateData));
      localStorage.setItem('pomodoroTimer_settings', JSON.stringify(settings));
    }
    // Update ref to current timeLeft value
    currentTimeLeftRef.current = timeLeft;
  }, [currentSession, completedSessions, timeLeft, isRunning, settings]);

  // Clear saved state
  const clearSavedState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pomodoroTimer_state');
      localStorage.removeItem('pomodoroTimer_settings');
    }
  };

  // Optimized single useEffect for timer control and background handling
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    const currentUser = getCurrentUser();
    if (isRunning && timeLeft > 0) {
      setTimerActive(true);
      setTimerActiveIndicator(true);
      
      // Start study session if this is a work session and no session is active
      if (currentSession === 'work' && !isSessionActive && currentUser?.accountId) {
        startSession(currentUser.accountId);
      }
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
    }

    // Background tab handling - stop interval when hidden, use correction when visible
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && currentSession === 'work') {
        // Tab goes to background - stop the interval
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        
        const currentTime = Date.now();
        const currentTimeLeft = currentTimeLeftRef.current;
        localStorage.setItem('pomodoro_background_start', currentTime.toString());
        localStorage.setItem('pomodoro_background_timeleft', currentTimeLeft.toString());
        console.log(`Pomodoro Background: Saved timeLeft ${currentTimeLeft}s at ${currentTime}`);
      } else if (!document.hidden && isRunning && currentSession === 'work') {
        const backgroundStart = localStorage.getItem('pomodoro_background_start');
        const backgroundTimeLeft = localStorage.getItem('pomodoro_background_timeleft');
        
        if (backgroundStart && backgroundTimeLeft) {
          try {
            const timePassed = Math.floor((Date.now() - parseInt(backgroundStart)) / 1000);
            const newTimeLeft = Math.max(0, parseInt(backgroundTimeLeft) - timePassed);
            
            if (timePassed > 0 && timePassed < 3600) {
              if (currentSession === 'work') {
                updateSessionTime(timePassed);
              }
              setTimeLeft(newTimeLeft);
              console.log(`Pomodoro Background: ${timePassed}s passed, saved timeLeft ${backgroundTimeLeft}s, corrected timeLeft: ${newTimeLeft}s`);
            }
            
            localStorage.removeItem('pomodoro_background_start');
            localStorage.removeItem('pomodoro_background_timeleft');
            
            // Restart the interval
            intervalId = setInterval(() => {
              setTimeLeft((prev: number) => prev - 1);
              if (currentSession === 'work') {
                updateSessionTime(1);
              }
            }, 1000);
          } catch (error) {
            console.error('Error processing background data:', error);
          }
        }
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      setTimerActive(false);
      setTimerActiveIndicator(false);
      if (intervalId) {
        clearInterval(intervalId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, currentSession]);

  // Separate useEffect for starting interval when session becomes active
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isRunning && timeLeft > 0 && isSessionActive && currentSession === 'work') {
      intervalId = setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
        updateSessionTime(1);
      }, 1000);
    } else if (isRunning && timeLeft > 0 && currentSession !== 'work') {
      // For break sessions, just update timeLeft without session tracking
      intervalId = setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeLeft, isSessionActive, currentSession]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
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
      const currentUser = getCurrentUser();
      if (currentUser?.accountId) {
        await endSession(currentUser.accountId);
      }
    }
    setIsRunning(false);
    setTimeLeft(settings.workMinutes * 60);
    setCurrentSession('work');
    clearSavedState();
  };

  const handleSessionComplete = () => {
    if (currentSession === 'work') {
      setCompletedSessions(prev => prev + 1);
      // Check if it's time for a long break
      if ((completedSessions + 1) % settings.longBreakInterval === 0) {
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

  const handleSkip = () => {
    setIsRunning(false);
    if (currentSession === 'work') {
      // Check if it's time for a long break
      if (completedSessions % settings.longBreakInterval === 0) {
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

  const handleResetSessions = () => {
    setCompletedSessions(0);
  };

  return {
    // State
    timerSettings,
    settings,
    state,
    currentSession,
    completedSessions,
    timeLeft,
    isRunning,
    showSettings,
    theme,
    
    // Actions
    handleStart,
    handleStop,
    handleReset,
    handleSessionComplete,
    handleSkip,
    handleResetSessions,
    formatTime,
    clearSavedState,
    
    // Setters
    setSettings,
    setState,
    setTimeLeft,
    setIsRunning,
    setCurrentSession,
    setCompletedSessions,
    setShowSettings,
    
    // User functions
    getCurrentUser,
    setTimerActive,
    startSession,
    endSession,
    updateSessionTime,
    isSessionActive,
    setTimerActiveIndicator
  };
}
