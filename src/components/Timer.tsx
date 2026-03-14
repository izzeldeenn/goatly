'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useFullscreen } from '@/contexts/FullscreenContext';

export function Timer() {
  const { theme } = useTheme();
  const { getCurrentUser, updateUserStudyTime, setTimerActive } = useUser();
  const { showFullscreenPrompt, setShowFullscreenPrompt, requestFullscreen } = useFullscreen();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
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
    if (isRunning) {
      setTimerActive(true);
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
      
      // Update device study time every second
      studyTimeRef.current = setInterval(() => {
        updateUserStudyTime(1); // Add 1 second of study time
      }, 1000);
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
  }, [isRunning]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    // Check if fullscreen is active, if not show prompt
    if (!document.fullscreenElement) {
      setShowFullscreenPrompt(true);
      return;
    }
    setIsRunning(true);
  };
  const handleStop = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <div className="text-center">
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
    </div>
  );
}
