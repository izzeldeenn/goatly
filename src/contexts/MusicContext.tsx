'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { MusicTrack, MUSIC_TRACKS, DEFAULT_MUSIC_SETTINGS } from '@/constants/musicTracks';

interface MusicContextType {
  // Current playing state
  isPlaying: boolean;
  currentTrack: MusicTrack | null;
  volume: number;
  
  // Settings
  autoPlay: boolean;
  loop: boolean;
  fadeIn: boolean;
  fadeOut: boolean;
  
  // Player controls
  playTrack: (track: MusicTrack) => void;
  pauseTrack: () => void;
  stopTrack: () => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  
  // Settings controls
  setAutoPlay: (autoPlay: boolean) => void;
  setLoop: (loop: boolean) => void;
  setFadeIn: (fadeIn: boolean) => void;
  setFadeOut: (fadeOut: boolean) => void;
  
  // Data
  tracks: MusicTrack[];
  filteredTracks: MusicTrack[];
  selectedCategory: string;
  selectedMood: string;
  
  // Filters
  setSelectedCategory: (category: string) => void;
  setSelectedMood: (mood: string) => void;
  searchTracks: (query: string) => void;
  
  // Timer integration
  startTimerMusic: (duration: number) => void;
  stopTimerMusic: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [volume, setVolume] = useState(DEFAULT_MUSIC_SETTINGS.volume);
  const [autoPlay, setAutoPlay] = useState(DEFAULT_MUSIC_SETTINGS.autoPlay);
  const [loop, setLoop] = useState(DEFAULT_MUSIC_SETTINGS.loop);
  const [fadeIn, setFadeIn] = useState(DEFAULT_MUSIC_SETTINGS.fadeIn);
  const [fadeOut, setFadeOut] = useState(DEFAULT_MUSIC_SETTINGS.fadeOut);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerMusicRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('musicVolume');
      const savedAutoPlay = localStorage.getItem('musicAutoPlay');
      const savedLoop = localStorage.getItem('musicLoop');
      const savedFadeIn = localStorage.getItem('musicFadeIn');
      const savedFadeOut = localStorage.getItem('musicFadeOut');
      
      if (savedVolume) setVolume(parseFloat(savedVolume));
      if (savedAutoPlay) setAutoPlay(savedAutoPlay === 'true');
      if (savedLoop) setLoop(savedLoop === 'true');
      if (savedFadeIn) setFadeIn(savedFadeIn === 'true');
      if (savedFadeOut) setFadeOut(savedFadeOut === 'true');
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('musicVolume', volume.toString());
      localStorage.setItem('musicAutoPlay', autoPlay.toString());
      localStorage.setItem('musicLoop', loop.toString());
      localStorage.setItem('musicFadeIn', fadeIn.toString());
      localStorage.setItem('musicFadeOut', fadeOut.toString());
    }
  }, [volume, autoPlay, loop, fadeIn, fadeOut]);

  // Filter tracks based on category, mood, and search
  const filteredTracks = MUSIC_TRACKS.filter(track => {
    const categoryMatch = selectedCategory === 'all' || track.category === selectedCategory;
    const moodMatch = selectedMood === 'all' || track.mood === selectedMood;
    const searchMatch = searchQuery === '' || 
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && moodMatch && searchMatch;
  });

  // Audio controls
  const playTrack = (track: MusicTrack) => {
    if (audioRef.current) {
      // Reset any existing audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // Set new source with error handling
      audioRef.current.src = track.url;
      audioRef.current.volume = fadeIn ? 0 : volume;
      
      // Add comprehensive error handling
      audioRef.current.addEventListener('error', (e) => {
        const audioError = audioRef.current?.error;
        console.error('Audio error details:', {
          error: e,
          audioError: audioError,
          src: track.url,
          trackId: track.id
        });
        
        // Try fallback track (different from current)
        const fallbackTrack = MUSIC_TRACKS.find(t => t.id !== track.id && t.url !== track.url);
        if (fallbackTrack) {
          console.log('Trying fallback track:', fallbackTrack.name);
          setTimeout(() => playTrack(fallbackTrack), 1000); // Delay to prevent infinite loops
        } else {
          console.error('No fallback tracks available');
          setIsPlaying(false);
          setCurrentTrack(null);
        }
      }, { once: true });
      
      // Add load success handler
      audioRef.current.addEventListener('canplay', () => {
        console.log('Audio loaded successfully:', track.name);
      }, { once: true });
      
      // Attempt to play
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setCurrentTrack(track);
            
            if (fadeIn) {
              fadeAudioIn();
            }
          })
          .catch(error => {
            console.error('Error playing track:', error);
            // Handle autoplay policy restrictions
            if (error.name === 'NotAllowedError') {
              console.log('Autoplay prevented by browser. User interaction required.');
              setIsPlaying(false);
              setCurrentTrack(null);
            } else if (error.name === 'NotSupportedError') {
              console.log('Media format not supported:', track.url);
              // Try next track
              const nextTrack = MUSIC_TRACKS.find(t => t.id !== track.id);
              if (nextTrack) {
                setTimeout(() => playTrack(nextTrack), 500);
              }
            }
          });
      }
    }
  };

  const pauseTrack = () => {
    if (audioRef.current && isPlaying) {
      if (fadeOut) {
        fadeAudioOut(() => {
          audioRef.current?.pause();
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const stopTrack = () => {
    if (audioRef.current) {
      if (fadeOut) {
        fadeAudioOut(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
          setIsPlaying(false);
          setCurrentTrack(null);
        });
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setCurrentTrack(null);
      }
    }
  };

  const updateVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setVolume(clampedVolume);
  };

  const fadeAudioIn = () => {
    if (audioRef.current && fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    
    let currentVolume = 0;
    const targetVolume = volume;
    const step = targetVolume / 20; // 20 steps for smooth fade
    
    fadeIntervalRef.current = setInterval(() => {
      currentVolume += step;
      if (currentVolume >= targetVolume) {
        currentVolume = targetVolume;
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      }
      if (audioRef.current) {
        audioRef.current.volume = currentVolume;
      }
    }, 100);
  };

  const fadeAudioOut = (callback?: () => void) => {
    if (audioRef.current && fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    
    let currentVolume = volume;
    const step = volume / 20; // 20 steps for smooth fade
    
    fadeIntervalRef.current = setInterval(() => {
      currentVolume -= step;
      if (currentVolume <= 0) {
        currentVolume = 0;
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
        if (callback) callback();
      }
      if (audioRef.current) {
        audioRef.current.volume = currentVolume;
      }
    }, 100);
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

  const searchTracks = (query: string) => {
    setSearchQuery(query);
  };

  // Timer integration
  const startTimerMusic = (duration: number) => {
    if (autoPlay && filteredTracks.length > 0) {
      const randomTrack = filteredTracks[Math.floor(Math.random() * filteredTracks.length)];
      playTrack(randomTrack);
    }
    
    // Auto-stop when timer ends
    if (timerMusicRef.current) {
      clearTimeout(timerMusicRef.current);
    }
    
    timerMusicRef.current = setTimeout(() => {
      stopTrack();
    }, duration * 1000);
  };

  const stopTimerMusic = () => {
    if (timerMusicRef.current) {
      clearTimeout(timerMusicRef.current);
    }
    stopTrack();
  };

  // Handle track end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (loop) {
        // Replay current track
        if (currentTrack) {
          playTrack(currentTrack);
        }
      } else {
        // Play next track
        nextTrack();
      }
    };

    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, loop, filteredTracks]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (timerMusicRef.current) {
        clearTimeout(timerMusicRef.current);
      }
    };
  }, []);

  return (
    <MusicContext.Provider value={{
      isPlaying,
      currentTrack,
      volume,
      autoPlay,
      loop,
      fadeIn,
      fadeOut,
      playTrack,
      pauseTrack,
      stopTrack,
      setVolume: updateVolume,
      nextTrack,
      previousTrack,
      setAutoPlay,
      setLoop,
      setFadeIn,
      setFadeOut,
      tracks: MUSIC_TRACKS,
      filteredTracks,
      selectedCategory,
      selectedMood,
      setSelectedCategory,
      setSelectedMood,
      searchTracks,
      startTimerMusic,
      stopTimerMusic
    }}>
      {children}
      <audio ref={audioRef} />
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
