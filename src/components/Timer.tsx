'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useFullscreen } from '@/contexts/FullscreenContext';
import { dailyActivityDB } from '@/lib/dailyActivity';

export function Timer() {
  const { theme } = useTheme();
  const { getCurrentUser, updateUserStudyTime, setTimerActive } = useUser();
  const { showFullscreenPrompt, setShowFullscreenPrompt, requestFullscreen } = useFullscreen();
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

  // Check fullscreen status and stop timer if not in fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isRunning) {
        // End the current session when exiting fullscreen
        handleStop();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isRunning]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      setTimerActive(true);
      
      // Update the timer display every 1 second
      intervalId = setInterval(async () => {
        setTime((prevTime: number) => prevTime + 1);
      }, 1000);
      
      // Update study time every 1 second
      const studyInterval = setInterval(async () => {
        const currentUser = getCurrentUser();
        if (currentUser?.accountId) {
          console.log('⏰ Updating study time for user:', currentUser.accountId);
          await dailyActivityDB.updateStudyTimeRealtime(currentUser.accountId, 1); // Add 1 second
          updateUserStudyTime(1); // Add 1 second for points
        }
      }, 1000);
      
      // Store the study interval reference for cleanup
      realtimeUpdateRef.current = studyInterval;
    } else {
      setTimerActive(false);
      if (realtimeUpdateRef.current) {
        clearInterval(realtimeUpdateRef.current);
      }
    }

    return () => {
      setTimerActive(false);
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (realtimeUpdateRef.current) {
        clearInterval(realtimeUpdateRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    // Check if fullscreen is active, if not show prompt
    if (!document.fullscreenElement) {
      setShowFullscreenPrompt(true);
      return;
    }
    
    // Get current user and validate
    const currentUser = getCurrentUser();
    if (!currentUser?.accountId) {
      console.error('❌ No current user found');
      return;
    }
    
    console.log('🚀 Starting timer for user:', currentUser.accountId, currentUser.username);
    
    // Start a new study session
    const success = await dailyActivityDB.startStudySession(currentUser.accountId);
    if (success) {
      setIsRunning(true);
      console.log('✅ Timer started successfully');
    } else {
      console.error('❌ Failed to start study session');
    }
  };
  const handleStop = async () => {
    if (isRunning) {
      const currentUser = getCurrentUser();
      if (currentUser?.accountId) {
        await dailyActivityDB.endStudySession(currentUser.accountId);
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
        <h1 className={`text-6xl font-bold mb-8 font-mono ${
          theme === 'light' ? 'text-black' : 'text-white'
        }`}>
          00:00:00
        </h1>
      ) : (
        <>
          <h1 className={`text-6xl font-bold mb-8 font-mono ${
            theme === 'light' ? 'text-black' : 'text-white'
          }`}>
            {formatTime(time)}
          </h1>
          
          <div className="flex justify-center items-center space-x-4 space-x-reverse">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 ${
                theme === 'light'
                  ? 'bg-black/10 text-black hover:bg-black/20'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ▶️
            </button>
            <button
              onClick={handleStop}
              disabled={!isRunning}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 ${
                theme === 'light'
                  ? 'bg-black/10 text-black hover:bg-black/20'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ⏸️
            </button>
            <button
              onClick={handleReset}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 ${
                theme === 'light'
                  ? 'bg-black/10 text-black hover:bg-black/20'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🔄
            </button>
          </div>
        </>
      )}
    </div>
  );
}
