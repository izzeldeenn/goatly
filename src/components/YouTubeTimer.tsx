'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useTimerIndicator } from '@/contexts/TimerIndicatorContext';
import { useFullscreen } from '@/contexts/FullscreenContext';
import { dailyActivityDB } from '@/lib/dailyActivity';

export function YouTubeTimer() {
  const { theme } = useTheme();
  const { getCurrentUser, updateUserStudyTime, setTimerActive } = useUser();
  const { setTimerActive: setTimerActiveIndicator } = useTimerIndicator();
  const { showFullscreenPrompt, setShowFullscreenPrompt, requestFullscreen } = useFullscreen();
  const [time, setTime] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('youtubeTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.time || 0;
      }
    }
    return 0;
  });
  const [isRunning, setIsRunning] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('youtubeTimer_state');
      if (saved) {
        const state = JSON.parse(saved);
        return state.isRunning || false;
      }
    }
    return false;
  });
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const studyTimeRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = {
        time,
        isRunning,
        showVideo
      };
      localStorage.setItem('youtubeTimer_state', JSON.stringify(state));
      localStorage.setItem('youtubeTimer_videoUrl', videoUrl);
    }
  }, [time, isRunning, showVideo, videoUrl]);

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
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&hl=ar&fs=1&autohide=1&showinfo=0`;
  };

  // Check fullscreen status and stop timer if not in fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isRunning) {
        setIsRunning(false);
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
  }, [isRunning]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (isRunning) {
      setTimerActive(true);
      setTimerActiveIndicator(true);
      intervalRef.current = setInterval(() => {
        setTime((prevTime: number) => prevTime + 10);
      }, 10);
      
      // Update device study time every 30 seconds
      studyTimeRef.current = setInterval(() => {
        // Only update daily activity, not user study time (to avoid double counting)
        if (currentUser?.accountId) {
          dailyActivityDB.updateStudyTimeRealtime(currentUser.accountId, 120); // 120 seconds = 2 minutes
        }
      }, 120000); // Update every 2 minutes instead of 30 seconds
    } else {
      setTimerActive(false);
      setTimerActiveIndicator(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
    }

    return () => {
      setTimerActive(false);
      setTimerActiveIndicator(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
    };
  }, [isRunning, updateUserStudyTime, setTimerActive, setTimerActiveIndicator, getCurrentUser]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (videoUrl && getVideoId(videoUrl)) {
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
      
      
      // Start a new study session
      const success = await dailyActivityDB.startStudySession(currentUser.accountId);
      if (success) {
        setIsRunning(true);
        setShowVideo(true);
      } else {
        console.error('❌ Failed to start study session');
      }
    }
  };

  const handleStop = async () => {
    if (isRunning) {
      const currentUser = getCurrentUser();
      if (currentUser?.accountId) {
        await dailyActivityDB.endStudySession(currentUser.accountId);
      }
    }
    setIsRunning(false);
  };

  const handleReset = async () => {
    if (isRunning) {
      await handleStop();
    }
    setTime(0);
    setShowVideo(false);
    clearSavedState();
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    setShowVideo(false);
  };

  const videoId = videoUrl ? getVideoId(videoUrl) : null;
  const embedUrl = videoId ? getEmbedUrl(videoId) : '';

  return (
    <div className={`relative w-full h-full overflow-hidden ${
      theme === 'dark' ? 'border-4 border-white' : ''
    }`}>
      {/* Full Screen Video */}
      {showVideo && videoId && (
        <div className="absolute inset-0">
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
      )}

      {/* Floating Timer with Controls */}
      <div className="absolute bottom-4 right-4 z-10">
        {/* Control Buttons */}
        {videoUrl && videoId && (
          <div
            className={`flex overflow-hidden rounded-lg divide-x mb-2 ${
              theme === 'light' 
                ? 'bg-white/90 border border-gray-200' 
                : 'bg-gray-900/90 border border-gray-700 divide-gray-700'
            } rtl:flex-row-reverse`}
          >
            <button
              onClick={handleReset}
              className={`px-3 py-2 font-medium transition-colors duration-200 sm:px-4 ${
                theme === 'light'
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
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
              onClick={handleStop}
              disabled={!isRunning}
              className={`px-3 py-2 font-medium transition-colors duration-200 sm:px-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                theme === 'light'
                  ? 'text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent'
                  : 'text-gray-300 hover:bg-gray-800 disabled:hover:bg-transparent'
              }`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
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
              onClick={handleStart}
              disabled={isRunning}
              className={`px-3 py-2 font-medium transition-colors duration-200 sm:px-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                theme === 'light'
                  ? 'text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent'
                  : 'text-gray-300 hover:bg-gray-800 disabled:hover:bg-transparent'
              }`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
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
        )}
        
        <div className={`text-4xl font-bold font-mono px-4 py-2 rounded-lg backdrop-blur-sm ${
          theme === 'light' 
            ? 'text-white bg-black/50' 
            : 'text-black bg-white/50'
        }`}>
          {formatTime(time)}
        </div>
      </div>

      {/* URL Input Overlay - Hidden when video is playing */}
      {!showVideo && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="mb-4">
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={videoUrl}
                onChange={handleUrlChange}
                placeholder="أدخل رابط فيديو يوتيوب..."
                className={`flex-1 px-4 py-2 border-2 rounded-lg text-right backdrop-blur-sm ${
                  theme === 'light'
                    ? 'border-gray-300 bg-white/80 text-black placeholder-gray-500'
                    : 'border-gray-600 bg-black/80 text-white placeholder-gray-400'
                }`}
              />
              {videoId && (
                <button
                  onClick={handleStart}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    theme === 'light'
                      ? 'bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300'
                      : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600'
                  }`}
                >
                  <svg
                    className="w-4 h-4"
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
                  تشغيل
                </button>
              )}
            </div>
            {videoUrl && !videoId && (
              <p className={`text-sm mt-2 ${
                theme === 'light' ? 'text-red-600' : 'text-red-400'
              }`}>
                رابط يوتيوب غير صحيح
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
