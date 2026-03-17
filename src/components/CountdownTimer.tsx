'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useTimerIndicator } from '@/contexts/TimerIndicatorContext';
import { useFullscreen } from '@/contexts/FullscreenContext';
import { dailyActivityDB } from '@/lib/dailyActivity';

export function CountdownTimer() {
  const { theme } = useTheme();
  const { getCurrentUser, updateUserStudyTime, setTimerActive } = useUser();
  const { setTimerActive: setTimerActiveIndicator } = useTimerIndicator();
  const { showFullscreenPrompt, setShowFullscreenPrompt, requestFullscreen } = useFullscreen();
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

  // Check fullscreen status and stop timer if not in fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isRunning) {
        setIsRunning(false);
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
    const currentUser = getCurrentUser();
    if (isRunning && timeLeft > 0) {
      setTimerActive(true);
      setTimerActiveIndicator(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
      }, 1000);
      
      // Update device study time every second
      studyTimeRef.current = setInterval(() => {
        // Only update daily activity, not user study time (to avoid double counting)
        if (currentUser?.accountId) {
          dailyActivityDB.updateStudyTimeRealtime(currentUser.accountId, 1); // Update daily activity
        }
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setTimerActive(false);
      setTimerActiveIndicator(false);
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
      
      console.log('🚀 Starting Countdown timer for user:', currentUser.accountId, currentUser.username);
      
      // Start a new study session
      const success = await dailyActivityDB.startStudySession(currentUser.accountId);
      if (success) {
        setIsRunning(true);
        console.log('✅ Countdown timer started successfully');
      } else {
        console.error('❌ Failed to start study session');
      }
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
          <h1 className={`text-7xl font-bold mb-8 font-mono ${
            theme === 'light' ? 'text-black' : 'text-white'
          }`}>
            {formatTime(timeLeft)}
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
        </div>
      )}
    </div>
  );
}
