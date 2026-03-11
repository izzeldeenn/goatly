'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function Logo() {
  const { theme } = useTheme();
  
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className={`text-2xl font-bold tracking-tight ${
          theme === 'light' ? 'text-black' : 'text-white'
        }`}>
          <span className="inline-block transform hover:scale-105 transition-transform duration-200">
            hub
          </span>
          <span className={`inline-block ml-1 font-black ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            fahman
          </span>
        </div>
        <div className={`text-xs mt-1 font-medium tracking-widest ${
          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          STUDY TIMER
        </div>
      </div>
    </div>
  );
}
