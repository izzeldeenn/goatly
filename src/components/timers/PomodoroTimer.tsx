'use client';

import { useState } from 'react';
import { getTimerDesignStyle } from '@/constants/timerDesignStyles';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { useTimerProgress } from '@/hooks/useTimerProgress';
import { useStudySession } from '@/contexts/StudySessionContext';

export function PomodoroTimer() {
  const {
    timerSettings,
    settings,
    currentSession,
    completedSessions,
    timeLeft,
    isRunning,
    showSettings,
    theme,
    handleStart,
    handleStop,
    handleReset,
    handleSessionComplete,
    handleSkip,
    handleResetSessions,
    formatTime,
    setSettings,
    setTimeLeft,
    setCurrentSession,
    setCompletedSessions,
    setShowSettings
  } = usePomodoroTimer();

  const { getSessionDuration } = useStudySession();
  const sessionTime = getSessionDuration();
  
  const {
    coins,
    progressToNextPoint,
    minutesToNextPoint,
    secsToNextPoint,
    showStopConfirmation,
    handleStopClick,
    confirmStop,
    cancelStop,
    handleStartWithSound,
    pendingPoints,
    clearPendingPoints
  } = useTimerProgress(sessionTime, isRunning);

  const handleStartClick = () => handleStartWithSound(handleStart);
  const handleConfirmStop = () => confirmStop(handleStop);

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

  // Render completed sessions icons
  const renderCompletedSessions = () => {
    const icons = [];
    const maxDisplay = 10; // Maximum icons to display
    
    for (let i = 0; i < Math.min(completedSessions, maxDisplay); i++) {
      let icon = '';
      switch (timerSettings.completedIcon) {
        case 'star':
          icon = '⭐';
          break;
        case 'dot':
          icon = '🔵';
          break;
        case 'heart':
          icon = '❤️';
          break;
        default:
          icon = '⭐';
      }
      icons.push(
        <span key={i} className="inline-block mx-1 text-lg">
          {icon}
        </span>
      );
    }
    
    // Add "+X" if there are more sessions than displayed
    if (completedSessions > maxDisplay) {
      icons.push(
        <span key="more" className="inline-block mx-1 text-lg">
          +{completedSessions - maxDisplay}
        </span>
      );
    }
    
    return icons;
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
        <div className={`mt-2 ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          <div className="flex items-center justify-center flex-wrap">
            {renderCompletedSessions()}
          </div>
        </div>
      </div>

      <h1 className={`${timerSettings.size} font-bold mb-8 ${timerSettings.font}`}
        style={{ 
          color: timerSettings.color,
          ...getTimerDesignStyle(timerSettings.design)
        }}
      >
        {formatTime(timeLeft)}
      </h1>

      {/* Progress bar to next point (only for work sessions) */}
      {isRunning && currentSession === 'work' && (
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                النقطة القادمة
              </span>
              <span className={`font-bold text-lg ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                {minutesToNextPoint}:{secsToNextPoint.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#FFD700"/>
                <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#B8860B">$</text>
              </svg>
              <span className={`font-bold text-lg ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                {coins}
              </span>
            </div>
          </div>
          <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 blur-sm" />
            <div
              className="relative h-full transition-all duration-500 ease-out rounded-full shadow-lg"
              style={{
                width: `${progressToNextPoint}%`,
                background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
          <p className={`text-sm mt-3 font-medium ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>
            🎯 أكمل 10 دقائق للحصول على نقطة
          </p>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div
          className={`flex overflow-hidden rounded-lg divide-x ${
            theme === 'light' 
              ? 'bg-white border border-gray-200' 
              : 'bg-gray-900 border border-gray-700 divide-gray-700'
          } rtl:flex-row-reverse`}
        >
          <button
            onClick={handleSkip}
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
                d="M11.25 4.5l-6.318 9.319a1.125 1.125 0 001.003 1.681H15.75a1.125 1.125 0 001.003-1.681L10.5 4.5a1.125 1.125 0 00-1.25 0z"
                strokeLinejoin="round"
                strokeLinecap="round"
              ></path>
            </svg>
          </button>

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
            onClick={handleResetSessions}
            className={`px-4 py-2 font-medium transition-colors duration-200 sm:px-6 ${
              theme === 'light'
                ? 'text-red-600 hover:bg-red-100'
                : 'text-red-400 hover:bg-red-900'
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                strokeLinejoin="round"
                strokeLinecap="round"
              ></path>
            </svg>
          </button>

          <button
            onClick={handleStopClick}
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
            onClick={handleStartClick}
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

      {/* Confirmation Modal */}
      {showStopConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 max-w-sm w-full ${
            theme === 'light' ? 'bg-white' : 'bg-gray-800'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              تأكيد إيقاف التايمر
            </h3>
            <p className={`mb-6 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              إذا أوقفت التايمر الآن، ستفقد تركيزك ولن تحصل على العملات لهذه الجلسة.
            </p>
            <div className="flex gap-3 rtl:flex-row-reverse">
              <button
                onClick={handleConfirmStop}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                تأكيد الإيقاف
              </button>
              <button
                onClick={cancelStop}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
