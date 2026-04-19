'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function Logo() {
  const { theme } = useTheme();
  
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-2 space-x-reverse">
        <img 
          src="/goat.png" 
          alt="Mr Goatly" 
          className="w-12 h-12 object-contain"
        />
        <div className="flex flex-col items-center" style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
          <div className="text-2xl font-bold tracking-tight">
            <span className="inline-block font-black text-white" style={{ fontFamily: "'ADLaM Display', sans-serif" }}>
              Goatly
            </span>
          </div>
          <div className="text-[10px] mt-0.5 font-medium tracking-wider text-white/90">
            great of all time
          </div>
        </div>
      </div>
    </div>
  );
}
