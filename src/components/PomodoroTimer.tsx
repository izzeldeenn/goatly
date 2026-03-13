'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

export function PomodoroTimer() {
  const { theme } = useTheme();
  const { getCurrentUser, updateUserStudyTime, setTimerActive } = useUser();
  const [settings, setSettings] = useState<PomodoroSettings>({
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4
  });

  const [showSettings, setShowSettings] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
        
        // Update user study time every second during work session
        if (currentSession === 'work') {
          updateUserStudyTime(1); // Add 1 second of study time
        }
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    } else {
      setTimerActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      setTimerActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, currentSession, updateUserStudyTime, setTimerActive]);

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

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(currentSession === 'work' ? settings.workMinutes * 60 : 
               currentSession === 'shortBreak' ? settings.shortBreakMinutes * 60 : 
               settings.longBreakMinutes * 60);
  };

  const handleSkip = () => {
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
        <p className={`mt-2 ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          الجلسات المكتملة: {completedSessions}
        </p>
      </div>

      <h1 className={`text-7xl font-bold mb-8 font-mono ${
        theme === 'light' ? 'text-black' : 'text-white'
      }`}>
        {formatTime(timeLeft)}
      </h1>

      <div className="flex justify-center items-center space-x-4 space-x-reverse mb-6">
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
        <button
          onClick={handleSkip}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 ${
            theme === 'light'
              ? 'bg-black/10 text-black hover:bg-black/20'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          ⏭️
        </button>
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
