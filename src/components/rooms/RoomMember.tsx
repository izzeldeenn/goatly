'use client';

import React from 'react';

interface RoomMemberProps {
  username: string;
  avatar?: string;
  studySeconds: number;
  isCurrentUser?: boolean;
}

export function RoomMember({ username, avatar, studySeconds, isCurrentUser = false }: RoomMemberProps) {
  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Check if avatar is a URL
  const isAvatarUrl = avatar && (avatar.startsWith('http://') || avatar.startsWith('https://'));

  return (
    <div className={`
      relative flex flex-col items-center justify-center
      w-32 h-32 rounded-full
      bg-gradient-to-br from-gray-900 to-black
      border border-purple-900/50
      transition-all duration-300
      hover:scale-105 hover:border-gray-700
    `}>
      {/* Static space warping/lensing effect around the card */}
      <div className="absolute inset-[-40px] rounded-full border border-purple-500/10 blur-sm" />
      <div className="absolute inset-[-60px] rounded-full border border-purple-400/5 blur-md" />
      <div className="absolute inset-[-80px] rounded-full border border-purple-300/5 blur-lg" />

      {/* Static pulsing circles (black hole effect) */}
      <div className="absolute inset-0 rounded-full border-2 border-purple-500/30" />
      <div className="absolute inset-[-8px] rounded-full border border-purple-400/20" />
      <div className="absolute inset-[-16px] rounded-full border border-purple-300/10" />

      {/* Avatar */}
      <div className={`
        w-20 h-20
        rounded-full flex items-center justify-center overflow-hidden
        bg-gradient-to-br from-purple-900 to-black
        shadow-lg z-10
      `}>
        {isAvatarUrl ? (
          <img 
            src={avatar} 
            alt={username}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.textContent = '👤';
            }}
          />
        ) : (
          <span className="text-4xl">{avatar || '👤'}</span>
        )}
      </div>
      
      {/* Username */}
      <p className="absolute -bottom-8 text-xs font-medium text-center text-gray-300 w-full truncate px-2">
        {username}
        {isCurrentUser && <span className="ml-1 text-xs">(You)</span>}
      </p>
      
      {/* Timer - small badge */}
      <div className="absolute -bottom-16 px-2 py-1 rounded-md font-mono text-xs bg-purple-900/50 text-purple-300 border border-purple-700/30">
        {formatTime(studySeconds)}
      </div>
      
      {/* Black hole glow */}
      <div className="absolute inset-0 rounded-full bg-purple-900/20 blur-2xl -z-10" />
    </div>
  );
}
