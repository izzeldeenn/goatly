'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function Logo() {
  const { theme } = useTheme();
  
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-3 space-x-reverse">
        <img 
          src="/mrfrogo.png" 
          alt="Mr Frogo" 
          className="w-20 h-20 object-contain"
        />
        <div className="flex flex-col items-center" style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
          <div className="text-4xl font-bold tracking-tight">
            <span className="inline-block font-black text-white" style={{ fontFamily: "'ADLaM Display', sans-serif" }}>
              Frogo
            </span>
          </div>
          <div className="text-xs mt-1 font-medium tracking-wider text-white/90">
            Focus. Rise. Organize. Go.
          </div>
        </div>
      </div>
    </div>
  );
}
