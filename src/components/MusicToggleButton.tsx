'use client';

import React from 'react';
import { useMusic } from '@/contexts/MusicContext';

export function MusicToggleButton() {
  const { isPlaying, currentTrack, playTrack, pauseTrack, filteredTracks } = useMusic();

  const toggleMusic = () => {
    if (isPlaying) {
      pauseTrack();
    } else if (currentTrack) {
      playTrack(currentTrack);
    } else if (filteredTracks.length > 0) {
      // Play first available track if no current track
      playTrack(filteredTracks[0]);
    }
  };

  return (
    <button
      onClick={toggleMusic}
      className="w-10 h-10 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-200 border border-white/30 dark:border-white/10"
      title={isPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
    >
      <span className="text-lg">
        {isPlaying ? '🎵' : '🎶'}
      </span>
    </button>
  );
}
