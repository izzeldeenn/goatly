'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

export function Timer() {
  const { theme } = useTheme();
  const { getCurrentUser, updateUserStudyTime } = useUser();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const studyTimeRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
      
      // Update user study time every second
      studyTimeRef.current = setInterval(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
          updateUserStudyTime(currentUser.id, 1); // Add 1 second of study time
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
    };
  }, [isRunning, getCurrentUser, updateUserStudyTime]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <div className="text-center">
      {!getCurrentUser() && (
        <div className={`mb-4 p-3 border-2 rounded-lg ${
          theme === 'light'
            ? 'border-yellow-400 bg-yellow-50'
            : 'border-yellow-600 bg-yellow-900/30'
        }`}>
          <p className={`text-sm ${
            theme === 'light' ? 'text-yellow-800' : 'text-yellow-200'
          }`}>
            يرجى اختيار مستخدم لتسجيل وقت الدراسة
          </p>
        </div>
      )}
      <h1 className={`text-6xl font-bold mb-8 font-mono ${
        theme === 'light' ? 'text-black' : 'text-white'
      }`}>
        {formatTime(time)}
      </h1>
      <div className="space-x-4">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className={`px-8 py-3 border-2 rounded-lg font-semibold transition-colors ${
            theme === 'light'
              ? 'border-black bg-white text-black hover:bg-black hover:text-white disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400'
              : 'border-white bg-black text-white hover:bg-white hover:text-black disabled:bg-gray-900 disabled:border-gray-700 disabled:text-gray-700'
          } disabled:cursor-not-allowed`}
        >
          بدء
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className={`px-8 py-3 border-2 rounded-lg font-semibold transition-colors ${
            theme === 'light'
              ? 'border-black bg-white text-black hover:bg-black hover:text-white disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400'
              : 'border-white bg-black text-white hover:bg-white hover:text-black disabled:bg-gray-900 disabled:border-gray-700 disabled:text-gray-700'
          } disabled:cursor-not-allowed`}
        >
          إيقاف
        </button>
        <button
          onClick={handleReset}
          className={`px-8 py-3 border-2 rounded-lg font-semibold transition-colors ${
            theme === 'light'
              ? 'border-black bg-white text-black hover:bg-black hover:text-white'
              : 'border-white bg-black text-white hover:bg-white hover:text-black'
          }`}
        >
          إعادة تعيين
        </button>
      </div>
    </div>
  );
}
