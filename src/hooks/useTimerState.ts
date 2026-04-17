'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
import { getTimerDesignStyle } from '@/constants/timerDesignStyles';

interface TimerSettings {
  color: string;
  font: string;
  design: string;
  size: string;
  completedIcon: 'star' | 'dot' | 'heart';
}

interface BackgroundData {
  timestamp: number;
  time: number;
  isRunning: boolean;
}

export function useTimerState() {
  const { theme } = useTheme();
  const { getCurrentUser, setTimerActive } = useUser();
  const { startSession, endSession, updateSessionTime, isSessionActive } = useStudySession();
  
  // Timer settings from localStorage
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    color: '#ffffff',
    font: 'font-mono',
    design: 'minimal',
    size: 'text-4xl',
    completedIcon: 'star'
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
  const currentTimeRef = useRef(0);

  // Load timer settings from localStorage and listen for changes
  useEffect(() => {
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

      const handleCustomEvent = (e: CustomEvent) => {
        setTimerSettings(e.detail);
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('timerSettingsChanged', handleCustomEvent as EventListener);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('timerSettingsChanged', handleCustomEvent as EventListener);
      };
    }
  }, []);

  // Save timer settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timer_settings', JSON.stringify(timerSettings));
    }
  }, [timerSettings]);

  // Optimized single useEffect for initialization
  useEffect(() => {
    if (!hasHydrated) {
      setHasHydrated(true);
      
      // Load timer state from localStorage
      const savedState = localStorage.getItem('timer_state');
      
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setTime(state.time || 0);
        } catch (error) {
          console.error('Failed to load timer state:', error);
        }
      }
    }
  }, [hasHydrated]);

  // Save state to localStorage whenever it changes (optimized)
  useEffect(() => {
    if (typeof window !== 'undefined' && hasHydrated) {
      const state = {
        time
      };
      localStorage.setItem('timer_state', JSON.stringify(state));
    }
    // Update ref to current time value
    currentTimeRef.current = time;
  }, [time, hasHydrated]);

  // Clear saved state
  const clearSavedState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('timer_state');
    }
  };

  // Optimized single useEffect for timer control and background handling
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Timer control logic
    if (isRunning) {
      setTimerActive(true);
      
      // Start study session if not already active
      const currentUser = getCurrentUser();
      if (!isSessionActive && currentUser?.accountId) {
        startSession(currentUser.accountId);
      }
      
      // Update timer display every 1 second
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

    // Background tab handling - stop interval when hidden, use correction when visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab goes to background - stop the interval
        if (intervalId && isRunning) {
          clearInterval(intervalId);
          intervalId = null;
          
          // Save current state for correction later - use ref for fresh time value
          const currentTime = Date.now();
          const currentTimerTime = currentTimeRef.current;
          localStorage.setItem('timer_background_data', JSON.stringify({
            timestamp: currentTime,
            time: currentTimerTime,
            isRunning: true
          }));
          console.log(`Background: Saved time ${currentTimerTime}s at ${currentTime}`);
        }
      } else {
        // Tab becomes visible again
        const backgroundData = localStorage.getItem('timer_background_data');
        
        if (backgroundData && isRunning) {
          try {
            const data = JSON.parse(backgroundData);
            const timePassed = Math.floor((Date.now() - data.timestamp) / 1000);
            
            // Only restore if reasonable time passed (between 1 second and 1 hour)
            if (timePassed > 0 && timePassed < 3600) {
              const correctedTime = data.time + timePassed;
              
              // Update both timer and session
              setTime(correctedTime);
              updateSessionTime(timePassed);
              
              console.log(`Background: ${timePassed}s passed, saved time ${data.time}s, corrected time: ${correctedTime}s`);
            }
            
            // Clear background data
            localStorage.removeItem('timer_background_data');
            
            // Restart the interval
            intervalId = setInterval(async () => {
              setTime((prevTime: number) => prevTime + 1);
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
      if (intervalId) {
        clearInterval(intervalId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning]);

  // Clear saved state when time changes
  useEffect(() => {
    clearSavedState();
  }, [time]);

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

  return {
    // State
    timerSettings,
    time,
    isRunning,
    hasHydrated,
    theme,
    
    // Actions
    handleStart,
    handleStop,
    handleReset,
    formatTime,
    
    // Setters
    setTimerSettings,
    setTime,
    setIsRunning
  };
}
