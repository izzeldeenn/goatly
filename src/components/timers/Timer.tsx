'use client';

import { useTimerState } from '@/hooks/useTimerState';
import { useTimerProgress } from '@/hooks/useTimerProgress';
import { getTimerDesignStyle } from '@/constants/timerDesignStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStudySession } from '@/contexts/StudySessionContext';

export function Timer() {
  const {
    timerSettings,
    time,
    isRunning,
    hasHydrated,
    theme,
    handleStart,
    handleStop,
    handleReset,
    formatTime
  } = useTimerState();

  const { language, t } = useLanguage();
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

  return (
    <div className="text-center">
      {!hasHydrated ? (
        <h1 className="text-4xl font-bold mb-8 font-mono"
          style={{ 
            color: '#ffffff',
            ...getTimerDesignStyle('minimal')
          }}
        >
          00:00:00
        </h1>
      ) : (
        <>
          <h1 className={`${timerSettings.size} font-bold mb-8 ${timerSettings.font}`}
            style={{ 
              color: timerSettings.color,
              ...getTimerDesignStyle(timerSettings.design)
            }}
          >
            {formatTime(time)}
          </h1>

          {/* Progress bar to next point */}
          {isRunning && (
            <div className="mb-8 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                    {t.nextPoint}
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
                    {coins + pendingPoints}
                  </span>
                  {pendingPoints > 0 && (
                    <span className={`text-xs ${theme === 'light' ? 'text-amber-500' : 'text-amber-400'}`}>
                      (+{pendingPoints})
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 blur-sm" />
                {/* Progress bar */}
                <div
                  className="relative h-full transition-all duration-500 ease-out rounded-full shadow-lg"
                  style={{
                    width: `${progressToNextPoint}%`,
                    background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
              <p className={`text-sm mt-3 font-medium ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>
                {t.completeTenMinutes}
              </p>
            </div>
          )}
          
          <div className="flex justify-center">
            <div
              className={`flex overflow-hidden rounded-lg divide-x ${
                theme === 'light' 
                  ? 'bg-white border border-gray-200' 
                  : 'bg-gray-900 border border-gray-700 divide-gray-700'
              } rtl:flex-row-reverse`}
            >
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
        </>
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
              {t.confirmStopTimer}
            </h3>
            <p className={`mb-6 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {t.stopTimerMessage}
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
                {t.confirmStop}
              </button>
              <button
                onClick={cancelStop}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
