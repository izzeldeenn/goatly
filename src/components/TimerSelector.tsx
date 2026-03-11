'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Timer } from './Timer';
import { PomodoroTimer } from './PomodoroTimer';
import { CountdownTimer } from './CountdownTimer';

type TimerType = 'stopwatch' | 'pomodoro' | 'countdown';

export function TimerSelector() {
  const { theme } = useTheme();
  const [activeTimer, setActiveTimer] = useState<TimerType>('stopwatch');

  const renderTimer = () => {
    switch (activeTimer) {
      case 'stopwatch':
        return <Timer />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'countdown':
        return <CountdownTimer />;
      default:
        return <Timer />;
    }
  };

  const timerButtons = [
    { type: 'stopwatch' as TimerType, label: 'ساعة إيقاف' },
    { type: 'pomodoro' as TimerType, label: 'بومودورو' },
    { type: 'countdown' as TimerType, label: 'عد تنازلي' }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Timer Type Selector */}
      <div className="mb-8">
        <div className="flex justify-center items-center gap-8">
          {timerButtons.map((button) => (
            <button
              key={button.type}
              onClick={() => setActiveTimer(button.type)}
              className={`px-8 py-3 border-2 rounded-lg font-semibold transition-all duration-200 ${
                activeTimer === button.type
                  ? theme === 'light'
                    ? 'border-black bg-black text-white'
                    : 'border-white bg-white text-black'
                  : theme === 'light'
                    ? 'border-gray-300 bg-white text-black hover:border-gray-400'
                    : 'border-gray-600 bg-black text-white hover:border-gray-500'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Timer */}
      <div className="flex-1 flex items-center justify-center">
        {renderTimer()}
      </div>
    </div>
  );
}
