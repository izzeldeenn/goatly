'use client';

import React from 'react';
import { useMusic } from '@/contexts/MusicContext';

export function MusicToggleButton() {
  const { isPlaying, currentTrack, playTrack, pauseTrack, filteredTracks, controlYoutubePlayer } = useMusic();

  const toggleMusic = () => {
    if (isPlaying) {
      pauseTrack();
      controlYoutubePlayer('pause');
    } else if (currentTrack) {
      playTrack(currentTrack);
      controlYoutubePlayer('play');
    } else if (filteredTracks.length > 0) {
      // Play first available track if no current track
      playTrack(filteredTracks[0]);
    }
  };

  return (
    <button
      onClick={toggleMusic}
      className="relative w-10 h-10 flex items-center justify-center group"
      title={isPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
      <span className="relative z-10 text-white font-bold text-lg">
        {isPlaying ? '♫' : '♪'}
      </span>
      {isPlaying && (
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      )}
    </button>
  );
}
