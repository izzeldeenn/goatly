'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useStudySession } from '@/contexts/StudySessionContext';
import { useTimerIndicator } from '@/contexts/TimerIndicatorContext';
import { useFullscreen } from '@/contexts/FullscreenContext';
import { useTimerState } from '@/hooks/useTimerState';
import { useTimerProgress } from '@/hooks/useTimerProgress';
import { useLanguage } from '@/contexts/LanguageContext';

export function YouTubeTimer() {
  const { theme } = useTheme();
  const { getCurrentUser } = useUser();
  const { startSession, endSession, updateSessionTime, isSessionActive } = useStudySession();
  const { setTimerActive: setTimerActiveIndicator } = useTimerIndicator();
  const { showFullscreenPrompt, setShowFullscreenPrompt, requestFullscreen } = useFullscreen();
  const { language, t } = useLanguage();
  
  // Use timer state hook
  const {
    timerSettings,
    time,
    isRunning,
    hasHydrated,
    theme: timerTheme,
    handleStart,
    handleStop,
    handleReset,
    formatTime
  } = useTimerState();

  // Use timer progress hook
  const { getSessionDuration } = useStudySession();
  const sessionTime = getSessionDuration();
  
  const {
    coins,
    progressToNextPoint,
    minutesToNextPoint,
    secsToNextPoint,
    showStopConfirmation,
    handleStopClick,
    confirmStop,
    cancelStop,
    handleStartWithSound
  } = useTimerProgress(sessionTime, isRunning);

  const handleStartClick = () => handleStartWithSound(handleStart);
  const handleConfirmStop = () => confirmStop(handleStop);

  const [videoUrl, setVideoUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('youtubeTimer_videoUrl') || '';
    }
    return '';
  });
  const [showVideo, setShowVideo] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('youtubeTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.showVideo || false;
      }
    }
    return false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const studyTimeRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Save video state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = {
        showVideo
      };
      localStorage.setItem('youtubeTimer_state', JSON.stringify(state));
      localStorage.setItem('youtubeTimer_videoUrl', videoUrl);
    }
  }, [showVideo, videoUrl]);

  // Clear saved state
  const clearSavedState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('youtubeTimer_state');
      localStorage.removeItem('youtubeTimer_videoUrl');
    }
  };

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get embed URL from video ID
  const getEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=1&hl=ar&fs=1&autohide=1&showinfo=0`;
  };

  // Search YouTube videos using API
  const searchYouTubeVideos = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!apiKey) {
        console.error('YouTube API key not found');
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.items) {
        setSearchResults(data.items);
      }
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Check fullscreen status and stop timer if not in fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isRunning) {
        handleStopClick();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isRunning, handleStopClick]);

  // Custom handle start for YouTube timer with fullscreen check
  const handleYouTubeStart = async () => {
    const videoId = selectedVideo?.id?.videoId || (videoUrl && getVideoId(videoUrl));
    
    if (videoId) {
      // Check if fullscreen is active, if not show prompt
      if (!document.fullscreenElement) {
        setShowFullscreenPrompt(true);
        return;
      }
      
      // Get current user and validate
      const currentUser = getCurrentUser();
      if (!currentUser?.accountId) {
        console.error('❌ No current user found');
        return;
      }
      
      setShowVideo(true);
      handleStartClick();
    }
  };

  // Custom handle stop for YouTube timer
  const handleYouTubeStop = async () => {
    handleStopClick();
    setShowVideo(false);
  };

  // Custom handle reset for YouTube timer
  const handleYouTubeReset = async () => {
    handleReset();
    setShowVideo(false);
    clearSavedState();
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    setShowVideo(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check if it's a YouTube URL
    if (searchQuery.includes('youtube.com') || searchQuery.includes('youtu.be')) {
      setVideoUrl(searchQuery);
      const videoId = getVideoId(searchQuery);
      if (videoId) {
        setIsSearching(true);
        try {
          const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
          if (apiKey) {
            // Fetch video info from YouTube API
            const response = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
            );
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
              const videoInfo = data.items[0];
              setSelectedVideo({
                id: { videoId },
                snippet: {
                  title: videoInfo.snippet.title,
                  channelTitle: videoInfo.snippet.channelTitle,
                  thumbnails: {
                    medium: { url: videoInfo.snippet.thumbnails.medium?.url || videoInfo.snippet.thumbnails.default?.url || '' }
                  }
                }
              });
            } else {
              // Fallback if API fails
              setSelectedVideo({
                id: { videoId },
                snippet: {
                  title: 'YouTube Video',
                  channelTitle: 'YouTube',
                  thumbnails: {
                    medium: { url: '' }
                  }
                }
              });
            }
          } else {
            // Fallback if no API key
            setSelectedVideo({
              id: { videoId },
              snippet: {
                title: 'YouTube Video',
                channelTitle: 'YouTube',
                thumbnails: {
                  medium: { url: '' }
                }
              }
            });
          }
        } catch (error) {
          console.error('Error fetching video info:', error);
          setSelectedVideo({
            id: { videoId },
            snippet: {
              title: 'YouTube Video',
              channelTitle: 'YouTube',
              thumbnails: {
                medium: { url: '' }
              }
            }
          });
        } finally {
          setIsSearching(false);
        }
      }
    } else {
      // It's a search query
      searchYouTubeVideos(searchQuery);
    }
  };

  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video);
    setSearchResults([]);
    setSearchQuery('');
    setVideoUrl(`https://www.youtube.com/watch?v=${video.id.videoId}`);
  };

  const videoId = selectedVideo?.id?.videoId || (videoUrl ? getVideoId(videoUrl) : null);
  const embedUrl = videoId ? getEmbedUrl(videoId) : '';

  return (
    <div className={`w-full h-full flex flex-col ${
      theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-white'
    }`}>
      {/* YouTube-style Header with Search */}
      {!showVideo && (
        <div className={`flex items-center gap-4 px-4 py-3 border-b ${
          theme === 'dark' ? 'border-gray-800 bg-[#0f0f0f]' : 'border-gray-200 bg-white'
        }`}>
          {/* YouTube Logo */}
          <div className="flex items-center gap-1">
            <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              YouTube
            </span>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex max-w-2xl">
            <div className="flex flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="بحث أو لصق رابط يوتيوب..."
                className={`flex-1 px-4 py-2 border text-right ${
                  theme === 'dark'
                    ? 'bg-[#121212] border-gray-700 text-white placeholder-gray-500 rounded-l-full'
                    : 'bg-white border-gray-300 text-black placeholder-gray-500 rounded-l-full'
                }`}
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className={`px-6 py-2 border-l-0 ${
                  theme === 'dark'
                    ? 'bg-[#222222] border-gray-700 text-gray-300 rounded-r-full hover:bg-[#303030] disabled:opacity-50'
                    : 'bg-gray-100 border-gray-300 text-gray-700 rounded-r-full hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </button>
            </div>
          </form>

          {/* Timer Display */}
          <div className="flex flex-col items-center">
            <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg ${
              theme === 'dark' ? 'text-white bg-[#222222]' : 'text-black bg-gray-100'
            }`}>
              {formatTime(time)}
            </div>
            
            {/* Progress bar to next point */}
            {isRunning && (
              <div className="mt-2 w-48">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" fill="#FFD700"/>
                      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#B8860B">$</text>
                    </svg>
                    <span className={`font-bold text-sm ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                      {coins}
                    </span>
                  </div>
                  <span className={`text-xs ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                    {minutesToNextPoint}:{secsToNextPoint.toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
                  <div
                    className="relative h-full transition-all duration-500 ease-out rounded-full"
                    style={{
                      width: `${progressToNextPoint}%`,
                      background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Player Area */}
      {showVideo && videoId && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black">
            <iframe
              ref={iframeRef}
              width="100%"
              height="100%"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          
          {/* Video Controls Bar */}
          <div className={`flex items-center justify-between px-4 py-3 border-t ${
            theme === 'dark' ? 'border-gray-800 bg-[#0f0f0f]' : 'border-gray-200 bg-white'
          }`}>
            <div className="flex items-center gap-4">
              {/* Selected Video Info */}
              {selectedVideo && selectedVideo.snippet.thumbnails.medium?.url && (
                <div className="flex items-center gap-3">
                  <img
                    src={selectedVideo.snippet.thumbnails.medium.url}
                    alt={selectedVideo.snippet.title}
                    className="w-16 h-9 object-cover rounded"
                  />
                  <div>
                    <h3 className={`text-sm font-medium line-clamp-1 ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>
                      {selectedVideo.snippet.title}
                    </h3>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {selectedVideo.snippet.channelTitle}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Timer Display with Progress */}
            <div className="flex flex-col items-center">
              <div className={`text-3xl font-mono font-bold px-6 py-2 rounded-lg ${
                theme === 'dark' ? 'text-white bg-[#222222]' : 'text-black bg-gray-100'
              }`}>
                {formatTime(time)}
              </div>
              
              {/* Progress bar to next point */}
              {isRunning && (
                <div className="mt-2 w-48">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" fill="#FFD700"/>
                        <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#B8860B">$</text>
                      </svg>
                      <span className={`font-bold text-sm ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                        {coins}
                      </span>
                    </div>
                    <span className={`text-xs ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                      {minutesToNextPoint}:{secsToNextPoint.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
                    <div
                      className="relative h-full transition-all duration-500 ease-out rounded-full"
                      style={{
                        width: `${progressToNextPoint}%`,
                        background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                        boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleYouTubeReset}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:bg-[#303030]'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg
                  className="w-6 h-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </button>

              <button
                onClick={handleYouTubeStop}
                disabled={!isRunning}
                className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:bg-[#303030]'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg
                  className="w-6 h-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9A2.25 2.25 0 015.25 16.5v-9z"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </button>

              <button
                onClick={handleYouTubeStart}
                disabled={isRunning}
                className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:bg-[#303030]'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg
                  className="w-6 h-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Area */}
      {!showVideo && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Selected Video Display */}
          {selectedVideo && selectedVideo.snippet.thumbnails.medium?.url && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <img
                  src={selectedVideo.snippet.thumbnails.medium.url}
                  alt={selectedVideo.snippet.title}
                  className="w-32 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className={`font-medium line-clamp-2 mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    {selectedVideo.snippet.title}
                  </h3>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {selectedVideo.snippet.channelTitle}
                  </p>
                  <button
                    onClick={handleYouTubeStart}
                    disabled={isRunning}
                    className={`px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50 ${
                      theme === 'dark'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    تشغيل
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedVideo(null);
                    setVideoUrl('');
                  }}
                  className={`p-2 rounded-lg ${
                    theme === 'dark'
                      ? 'hover:bg-[#303030] text-gray-400'
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className={`mt-4 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                جاري البحث...
              </p>
            </div>
          )}

          {/* Search Results Grid */}
          {searchResults.length > 0 && !isSearching && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchResults.map((video) => (
                video.snippet.thumbnails.medium?.url && (
                  <div
                    key={video.id.videoId}
                    onClick={() => handleVideoSelect(video)}
                    className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
                      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className={`text-sm font-medium line-clamp-2 mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}>
                        {video.snippet.title}
                      </h3>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {video.snippet.channelTitle}
                      </p>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

        </div>
      )}

      {/* Confirmation Modal */}
      {showStopConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 max-w-sm w-full ${
            theme === 'light' ? 'bg-white' : 'bg-gray-800'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {t.confirmStopTimer}
            </h3>
            <p className={`mb-6 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {t.stopTimerMessage}
            </p>
            <div className="flex gap-3 rtl:flex-row-reverse">
              <button
                onClick={handleConfirmStop}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {t.confirmStop}
              </button>
              <button
                onClick={cancelStop}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
