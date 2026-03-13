'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

export function CountdownTimer() {
  const { theme } = useTheme();
  const { updateUserStudyTime, setTimerActive } = useUser();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSet, setIsSet] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const studyTimeRef = useRef<NodeJS.Timeout | null>(null);

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
    if (isRunning && timeLeft > 0) {
      setTimerActive(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      // Update device study time every second
      studyTimeRef.current = setInterval(() => {
        updateUserStudyTime(1); // Add 1 second of study time
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setTimerActive(false);
      // Play notification or alert
      alert('الوقت انتهى!');
    } else {
      setTimerActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
    }

    return () => {
      setTimerActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
    };
  }, [isRunning, timeLeft, updateUserStudyTime, setTimerActive]);

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

  const handleStart = () => {
    if (isSet && timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const handleStop = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setIsSet(false);
    setTimeLeft(0);
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
