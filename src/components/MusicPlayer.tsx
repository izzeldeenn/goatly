'use client';

import React, { useState } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { MUSIC_CATEGORIES, MUSIC_MOODS, MusicTrack } from '@/constants/musicTracks';

export function MusicPlayer({ isVisible: externalVisible, setIsVisible: externalSetVisible }: { isVisible?: boolean; setIsVisible?: (visible: boolean) => void } = {}) {
  const {
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
    setVolume,
    nextTrack,
    previousTrack,
    setAutoPlay,
    setLoop,
    setFadeIn,
    setFadeOut,
    filteredTracks,
    selectedCategory,
    selectedMood,
    setSelectedCategory,
    setSelectedMood,
    searchTracks
  } = useMusic();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(externalVisible || false);

  // Use external visibility if provided
  const currentVisible = externalVisible !== undefined ? externalVisible : isVisible;
  const currentSetVisible = externalSetVisible || setIsVisible;
  const [currentView, setCurrentView] = useState<'player' | 'library' | 'settings'>('library');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchTracks(query);
  };

  const handlePlayTrack = (track: MusicTrack) => {
    setNeedsUserInteraction(false);
    setHasError(false);
    playTrack(track);
  };

  const handleInitialPlay = () => {
    if (filteredTracks.length > 0) {
      setNeedsUserInteraction(false);
      setHasError(false);
      playTrack(filteredTracks[0]);
    }
  };

  const handleClose = () => {
    console.log('Closing music player');
    currentSetVisible(false);
  };

  const handleShow = () => {
    currentSetVisible(true);
  };

  const formatTime = (seconds: string) => {
    const totalSeconds = parseInt(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Sidebar Music Player */}
      {currentVisible && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-black/95 backdrop-blur-xl border-l border-gray-800 z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <span className="text-lg">🎵</span>
                </div>
                <h2 className="text-white font-semibold">Music Player</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Current Track */}
          <div className="p-4 border-b border-gray-800">
            {currentTrack ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <span className="text-2xl">
                      {selectedCategory === 'lofi' && '🎧'}
                      {selectedCategory === 'ambient' && '🌌'}
                      {selectedCategory === 'nature' && '🌿'}
                      {selectedCategory === 'classical' && '🎼'}
                      {selectedCategory === 'piano' && '🎹'}
                      {selectedCategory === 'all' && '🎵'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm truncate">{currentTrack.name}</h3>
                    <p className="text-gray-400 text-xs">{currentTrack.artist}</p>
                    <p className="text-gray-500 text-xs">{formatTime(currentTrack.duration)}</p>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={previousTrack}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 9.168V6a1 1 0 00-2 0v8a1 1 0 002 0v-3.168l5.445 4z"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={isPlaying ? pauseTrack : (currentTrack ? () => handlePlayTrack(currentTrack) : handleInitialPlay)}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={nextTrack}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832L17 10.832V14a1 1 0 002 0V6a1 1 0 00-2 0v3.168l-5.445-4z"/>
                    </svg>
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"/>
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-400 w-8 text-center">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎵</span>
                </div>
                <p className="text-gray-400 text-sm">No track playing</p>
                <button
                  onClick={handleInitialPlay}
                  className="mt-3 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm"
                >
                  Start Listening
                </button>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setCurrentView('library')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                currentView === 'library' ? 'bg-gray-800 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              Library
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                currentView === 'settings' ? 'bg-gray-800 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {currentView === 'library' && (
              <div className="h-full overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search tracks..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                    </svg>
                  </div>

                  {/* Categories */}
                  <div className="space-y-2">
                    <h4 className="text-gray-400 text-xs font-semibold uppercase">Categories</h4>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                          selectedCategory === 'all' ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        All
                      </button>
                      {MUSIC_CATEGORIES.map(category => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                            selectedCategory === category.id ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          {category.icon} {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Track List */}
                  <div className="space-y-2">
                    <h4 className="text-gray-400 text-xs font-semibold uppercase">Tracks</h4>
                    <div className="space-y-1">
                      {filteredTracks.map(track => (
                        <div
                          key={track.id}
                          onClick={() => handlePlayTrack(track)}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            currentTrack?.id === track.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                          }`}
                        >
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs">
                            {track.category === 'lofi' && '🎧'}
                            {track.category === 'ambient' && '🌌'}
                            {track.category === 'nature' && '🌿'}
                            {track.category === 'classical' && '🎼'}
                            {track.category === 'piano' && '🎹'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">{track.name}</p>
                            <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                          </div>
                          <div className="text-xs text-gray-500">{formatTime(track.duration)}</div>
                          {currentTrack?.id === track.id && isPlaying && (
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'settings' && (
              <div className="p-4 space-y-4">
                <h4 className="text-gray-400 text-xs font-semibold uppercase">Playback Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300 text-sm">Auto Play</span>
                    <input
                      type="checkbox"
                      checked={autoPlay}
                      onChange={(e) => setAutoPlay(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300 text-sm">Loop</span>
                    <input
                      type="checkbox"
                      checked={loop}
                      onChange={(e) => setLoop(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300 text-sm">Fade In</span>
                    <input
                      type="checkbox"
                      checked={fadeIn}
                      onChange={(e) => setFadeIn(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300 text-sm">Fade Out</span>
                    <input
                      type="checkbox"
                      checked={fadeOut}
                      onChange={(e) => setFadeOut(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 text-center max-w-sm border border-gray-800">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Playback Error</h3>
            <p className="text-gray-400 text-sm mb-4">Try another track or check your connection</p>
            <button
              onClick={() => setHasError(false)}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* User Interaction Overlay */}
      {needsUserInteraction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 text-center max-w-sm border border-gray-800">
            <div className="text-4xl mb-4">🎵</div>
            <h3 className="text-lg font-semibold text-white mb-2">Start Listening</h3>
            <p className="text-gray-400 text-sm mb-4">Click to start playing music</p>
            <button
              onClick={handleInitialPlay}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Play Music
            </button>
          </div>
        </div>
      )}
    </>
  );
}
