'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
import { useTimerIndicator } from '@/contexts/TimerIndicatorContext';

interface CountdownInputs {
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimerSettings {
  color: string;
  font: string;
  design: string;
  size: string;
  completedIcon: 'star' | 'dot' | 'heart';
}

interface CountdownState {
  timeLeft: number;
  isRunning: boolean;
  isSet: boolean;
}

export function useCountdownTimer() {
  const { theme } = useTheme();
  const { getCurrentUser, setTimerActive } = useUser();
  const { startSession, endSession, updateSessionTime, isSessionActive } = useStudySession();
  const { setTimerActive: setTimerActiveIndicator } = useTimerIndicator();
  
  // Timer settings from localStorage for Countdown
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('countdown_timer_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Failed to load countdown timer settings:', error);
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
  
  // Countdown-specific state
  const [inputs, setInputs] = useState<CountdownInputs>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('countdownTimer_inputs');
      if (saved) {
        const inputs = JSON.parse(saved);
        return inputs || { hours: 0, minutes: 5, seconds: 0 };
      }
    }
    return { hours: 0, minutes: 5, seconds: 0 };
  });

  const [state, setState] = useState<CountdownState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('countdownTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state || { timeLeft: 0, isRunning: false, isSet: false };
      }
    }
    return { timeLeft: 0, isRunning: false, isSet: false };
  });

  // Extract individual state properties
  const { timeLeft, isRunning, isSet } = state;
  const { hours, minutes, seconds } = inputs;

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

  const setIsSet = (value: boolean | ((prev: boolean) => boolean)) => {
    setState(prev => ({
      ...prev,
      isSet: typeof value === 'function' ? value(prev.isSet) : value
    }));
  };

  const currentTimeLeftRef = useRef(0);

  // Load countdown timer settings from localStorage and listen for changes
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

      const handleCustomEvent = (e: CustomEvent) => {
        setTimerSettings(e.detail);
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('countdownTimerSettingsChanged', handleCustomEvent as EventListener);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('countdownTimerSettingsChanged', handleCustomEvent as EventListener);
      };
    }
  }, []);

  // Save timer settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('countdown_timer_settings', JSON.stringify(timerSettings));
    }
  }, [timerSettings]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateData = {
        timeLeft,
        isRunning,
        isSet
      };
      const inputsData = {
        hours: inputs.hours,
        minutes: inputs.minutes,
        seconds: inputs.seconds
      };
      localStorage.setItem('countdownTimer_state', JSON.stringify(stateData));
      localStorage.setItem('countdownTimer_inputs', JSON.stringify(inputsData));
    }
    // Update ref to current timeLeft value
    currentTimeLeftRef.current = timeLeft;
  }, [timeLeft, isRunning, isSet, inputs.hours, inputs.minutes, inputs.seconds]);

  // Clear saved state
  const clearSavedState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('countdownTimer_state');
      localStorage.removeItem('countdownTimer_inputs');
    }
  };

  // Optimized single useEffect for timer control and background handling
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    const currentUser = getCurrentUser();
    if (isRunning && timeLeft > 0) {
      setTimerActive(true);
      setTimerActiveIndicator(true);
      
      // Start study session if not already active
      if (!isSessionActive && currentUser?.accountId) {
        startSession(currentUser.accountId);
      }
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
    }

    // Background tab handling - stop interval when hidden, use correction when visible
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // Tab goes to background - stop the interval
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        
        const currentTime = Date.now();
        const currentTimeLeft = currentTimeLeftRef.current;
        localStorage.setItem('countdown_background_start', currentTime.toString());
        localStorage.setItem('countdown_background_timeleft', currentTimeLeft.toString());
        console.log(`Countdown Background: Saved timeLeft ${currentTimeLeft}s at ${currentTime}`);
      } else if (!document.hidden && isRunning) {
        const backgroundStart = localStorage.getItem('countdown_background_start');
        const backgroundTimeLeft = localStorage.getItem('countdown_background_timeleft');
        
        if (backgroundStart && backgroundTimeLeft) {
          try {
            const timePassed = Math.floor((Date.now() - parseInt(backgroundStart)) / 1000);
            const newTimeLeft = Math.max(0, parseInt(backgroundTimeLeft) - timePassed);
            
            if (timePassed > 0 && timePassed < 3600) {
              updateSessionTime(timePassed);
              setTimeLeft(newTimeLeft);
              console.log(`Countdown Background: ${timePassed}s passed, saved timeLeft ${backgroundTimeLeft}s, corrected timeLeft: ${newTimeLeft}s`);
            }
            
            localStorage.removeItem('countdown_background_start');
            localStorage.removeItem('countdown_background_timeleft');
            
            // Restart the interval
            intervalId = setInterval(() => {
              setTimeLeft((prev: number) => prev - 1);
              updateSessionTime(1);
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
  }, [isRunning]);

  // Separate useEffect for starting interval when session becomes active
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isRunning && timeLeft > 0 && isSessionActive) {
      intervalId = setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
        updateSessionTime(1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeLeft, isSessionActive]);

  // Clear saved state when inputs change
  useEffect(() => {
    clearSavedState();
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!isSet) {
      const totalSeconds = inputs.hours * 3600 + inputs.minutes * 60 + inputs.seconds;
      setTimeLeft(totalSeconds);
      setIsSet(true);
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
      const currentUser = getCurrentUser();
      if (currentUser?.accountId) {
        await endSession(currentUser.accountId);
      }
    }
    setTimeLeft(0);
    setIsRunning(false);
    setIsSet(false);
    clearSavedState();
  };

  return {
    // State
    timerSettings,
    inputs,
    state,
    timeLeft,
    isRunning,
    isSet,
    theme,
    
    // Input values
    hours: inputs.hours,
    minutes: inputs.minutes,
    seconds: inputs.seconds,
    
    // Actions
    handleStart,
    handleStop,
    handleReset,
    formatTime,
    clearSavedState,
    
    // Setters
    setInputs,
    setState,
    setTimeLeft,
    setIsRunning,
    setIsSet,
    setHours: (value: number) => setInputs(prev => ({ ...prev, hours: value })),
    setMinutes: (value: number) => setInputs(prev => ({ ...prev, minutes: value })),
    setSeconds: (value: number) => setInputs(prev => ({ ...prev, seconds: value })),
    
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
