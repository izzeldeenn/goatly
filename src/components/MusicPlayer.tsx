'use client';

import React, { useState } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { MUSIC_CATEGORIES, MUSIC_MOODS, MusicTrack } from '@/constants/musicTracks';

export function MusicPlayer() {
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
  const [isVisible, setIsVisible] = useState(true);

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
    setIsVisible(false);
  };

  const handleShow = () => {
    setIsVisible(true);
  };

  const formatTime = (seconds: string) => {
    const totalSeconds = parseInt(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Music Toggle Button - Always visible */}
      <button
        onClick={handleShow}
        className="fixed bottom-4 right-4 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-full p-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 transition-all duration-200"
        title="فتح المشغل"
      >
        <span className="text-lg">🎵</span>
      </button>

      {/* Music Player - Conditional rendering */}
      {isVisible && (
        <div className="fixed bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-4 w-80 border border-gray-200/50 dark:border-gray-700/50 max-h-[60vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-sm">🎵</span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">موسيقى التركيز</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ⚙️
              </button>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
      {hasError && (
        <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center max-w-xs">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
              خطأ في تشغيل الموسيقى
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              جرب مقطعًا آخر أو تحقق من اتصالك بالإنترنت
            </p>
            <button
              onClick={() => setHasError(false)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}
      
      {/* User Interaction Overlay */}
      {needsUserInteraction && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🎵</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              ابدأ الاستماع
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              المتصفح يتطلب تفاعل المستخدم لتشغيل الموسيقى
            </p>
            <button
              onClick={handleInitialPlay}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:scale-105 transition-transform"
            >
              تشغيل الموسيقى
            </button>
          </div>
        </div>
      )}
      
      {/* Current Track */}
      {currentTrack && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xl">
                {selectedCategory === 'lofi' && '🎧'}
                {selectedCategory === 'ambient' && '🌌'}
                {selectedCategory === 'nature' && '🌿'}
                {selectedCategory === 'classical' && '🎼'}
                {selectedCategory === 'piano' && '🎹'}
                {selectedCategory === 'all' && '🎵'}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {currentTrack.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {currentTrack.artist} • {formatTime(currentTrack.duration)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Player Controls */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={previousTrack}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          ⏮️
        </button>
        
        <button
          onClick={isPlaying ? pauseTrack : (currentTrack ? () => handlePlayTrack(currentTrack) : undefined)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:scale-105 transition-transform"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <button
          onClick={nextTrack}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          ⏭️
        </button>
        
        <button
          onClick={stopTrack}
          className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          ⏹️
        </button>
      </div>

      {/* Volume Control */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          {/* Auto Play */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">تشغيل تلقائي</span>
          </label>

          {/* Loop */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">تكرار</span>
          </label>

          {/* Fade In */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fadeIn}
              onChange={(e) => setFadeIn(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">تدريجي في البداية</span>
          </label>

          {/* Fade Out */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fadeOut}
              onChange={(e) => setFadeOut(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">تدريجي في النهاية</span>
          </label>
        </div>
      )}

      {/* Filters */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder="بحث في الموسيقى..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            الكل
          </button>
          {MUSIC_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* Mood Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedMood('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedMood === 'all'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            كل الأحوال
          </button>
          {MUSIC_MOODS.map(mood => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedMood === mood.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {mood.icon} {mood.name}
            </button>
          ))}
        </div>
      </div>

      {/* Track List */}
      <div className="mt-4 overflow-y-auto">
        {filteredTracks.map(track => (
          <div
            key={track.id}
            onClick={() => handlePlayTrack(track)}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
              currentTrack?.id === track.id
                ? 'bg-purple-100 dark:bg-purple-900/30'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm">
              {track.category === 'lofi' && '🎧'}
              {track.category === 'ambient' && '🌌'}
              {track.category === 'nature' && '🌿'}
              {track.category === 'classical' && '🎼'}
              {track.category === 'piano' && '🎹'}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                {track.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {track.artist} • {formatTime(track.duration)}
              </p>
            </div>
            {currentTrack?.id === track.id && isPlaying && (
              <span className="text-xs text-purple-500">▶️</span>
            )}
          </div>
        ))}
      </div>
        </div>
      )}
    </>
  );
}
