'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Logo } from '@/components/Logo';
import { UserRankings } from '@/components/UserRankings';
import { TimerSelector } from '@/components/TimerSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserManager } from '@/components/UserManager';
import { CurrentUserSelector } from '@/components/CurrentUserSelector';
import { CoinsButton } from '@/components/CoinsButton';
import { UserProfile } from '@/components/UserProfile';

export default function Home() {
  const { theme } = useTheme();

  return (
    <div className={`flex h-screen ${
      theme === 'light' ? 'bg-white' : 'bg-black'
    }`}>
      {/* Left section - 1/4 width */}
      <div className={`w-1/4 p-6 flex flex-col ${
        theme === 'light' 
          ? 'bg-white border-l border-gray-200' 
          : 'bg-black border-l border-gray-800'
      }`}>
        <div className="flex justify-between items-start mb-8">
          <Logo />
          <ThemeToggle />
        </div>
        <UserManager />
        <CurrentUserSelector />
        <UserRankings />
      </div>
      
      {/* Right section - 3/4 width */}
      <div className="w-3/4 flex items-center justify-center p-8 relative">
        <div className="absolute top-4 left-4 flex flex-col items-center space-y-2 space-y-reverse z-20">
          <CoinsButton />
          <UserProfile />
        </div>
        <TimerSelector />
      </div>
    </div>
  );
}
