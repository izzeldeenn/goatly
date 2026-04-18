'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface YouTubeTrack {
  id: string;
  name: string;
  artist: string;
  thumbnail: string;
  embedUrl: string;
}

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: YouTubeTrack | null;
  volume: number;
  autoPlay: boolean;
  loop: boolean;
  playTrack: (track: YouTubeTrack) => void;
  pauseTrack: () => void;
  stopTrack: () => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setAutoPlay: (autoPlay: boolean) => void;
  setLoop: (loop: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setYoutubePlayer: (player: any) => void;
  controlYoutubePlayer: (action: 'play' | 'pause') => void;
  tracks: YouTubeTrack[];
  filteredTracks: YouTubeTrack[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchYouTube: (query: string) => Promise<void>;
  addTrack: (videoId: string) => void;
  removeTrack: (id: string) => void;
  isLoading: boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [autoPlay, setAutoPlay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [tracks, setTracks] = useState<YouTubeTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTracks, setFilteredTracks] = useState<YouTubeTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const youtubePlayerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('musicVolume');
      const savedAutoPlay = localStorage.getItem('musicAutoPlay');
      const savedLoop = localStorage.getItem('musicLoop');
      
      if (savedVolume) setVolume(parseFloat(savedVolume));
      if (savedAutoPlay) setAutoPlay(savedAutoPlay === 'true');
      if (savedLoop) setLoop(savedLoop === 'true');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('musicVolume', volume.toString());
      localStorage.setItem('musicAutoPlay', autoPlay.toString());
      localStorage.setItem('musicLoop', loop.toString());
    }
  }, [volume, autoPlay, loop]);

  useEffect(() => {
    // Always show all tracks when not searching
    setFilteredTracks(tracks);
  }, [tracks]);

  const searchYouTube = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.videos && data.videos.length > 0) {
        const newTracks: YouTubeTrack[] = data.videos.map((video: any) => ({
          id: video.id,
          name: video.title,
          artist: video.channelTitle,
          thumbnail: video.thumbnail,
          embedUrl: `https://www.youtube.com/embed/${video.id}`
        }));
        
        setTracks(newTracks);
        setFilteredTracks(newTracks);
      }
    } catch (error) {
      console.error('Error searching YouTube:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTrack = (videoId: string) => {
    // Check if track already exists
    if (tracks.some(track => track.id === videoId)) {
      return;
    }

    const newTrack: YouTubeTrack = {
      id: videoId,
      name: `Track ${videoId}`,
      artist: 'Custom',
      thumbnail: '',
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    };

    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (id: string) => {
    const newTracks = tracks.filter(track => track.id !== id);
    setTracks(newTracks);
    if (currentTrack?.id === id) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const playTrack = (track: YouTubeTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  // Auto-play when track changes
  useEffect(() => {
    if (currentTrack) {
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const stopTrack = () => {
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  const updateVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  };

  const nextTrack = () => {
    const currentIndex = filteredTracks.findIndex(track => track.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % filteredTracks.length;
    
    if (filteredTracks.length > 0) {
      playTrack(filteredTracks[nextIndex]);
    }
  };

  const previousTrack = () => {
    const currentIndex = filteredTracks.findIndex(track => track.id === currentTrack?.id);
    const prevIndex = currentIndex === 0 ? filteredTracks.length - 1 : currentIndex - 1;

    if (filteredTracks.length > 0) {
      playTrack(filteredTracks[prevIndex]);
    }
  };

  const setYoutubePlayer = (player: any) => {
    youtubePlayerRef.current = player;
  };

  const controlYoutubePlayer = (action: 'play' | 'pause') => {
    if (youtubePlayerRef.current && typeof youtubePlayerRef.current[action + 'Video'] === 'function') {
      youtubePlayerRef.current[action + 'Video']();
    }
  };

  return (
    <MusicContext.Provider value={{
      isPlaying,
      currentTrack,
      volume,
      autoPlay,
      loop,
      playTrack,
      pauseTrack,
      stopTrack,
      setVolume: updateVolume,
      nextTrack,
      previousTrack,
      setAutoPlay,
      setLoop,
      setIsPlaying,
      setYoutubePlayer,
      controlYoutubePlayer,
      tracks,
      filteredTracks,
      searchQuery,
      setSearchQuery,
      searchYouTube,
      addTrack,
      removeTrack,
      isLoading
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
