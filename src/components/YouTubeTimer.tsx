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
      
      // Update device study time every second
      studyTimeRef.current = setInterval(() => {
        // Only update daily activity, not user study time (to avoid double counting)
        if (currentUser?.accountId) {
          dailyActivityDB.updateStudyTimeRealtime(currentUser.accountId, 1); // Update daily activity
        }
      }, 1000);
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
      
      console.log('🚀 Starting YouTube timer for user:', currentUser.accountId, currentUser.username);
      
      // Start a new study session
      const success = await dailyActivityDB.startStudySession(currentUser.accountId);
      if (success) {
        setIsRunning(true);
        setShowVideo(true);
        console.log('✅ YouTube timer started successfully');
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
      <div className="absolute top-4 right-4 z-10">
        <div className={`text-4xl font-bold font-mono px-4 py-2 rounded-lg backdrop-blur-sm mb-2 ${
          theme === 'light' 
            ? 'text-white bg-black/50' 
            : 'text-black bg-white/50'
        }`}>
          {formatTime(time)}
        </div>
        
        {/* Control Buttons */}
        {videoUrl && videoId && (
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 ${
                theme === 'light'
                  ? 'bg-black/10 text-black hover:bg-black/20'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ▶️
            </button>
            <button
              onClick={handleStop}
              disabled={!isRunning}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 ${
                theme === 'light'
                  ? 'bg-black/10 text-black hover:bg-black/20'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ⏸️
            </button>
            <button
              onClick={handleReset}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 ${
                theme === 'light'
                  ? 'bg-black/10 text-black hover:bg-black/20'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🔄
            </button>
          </div>
        )}
      </div>

      {/* URL Input Overlay - Hidden when video is playing */}
      {!showVideo && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="mb-4">
            <input
              type="text"
              value={videoUrl}
              onChange={handleUrlChange}
              placeholder="أدخل رابط فيديو يوتيوب..."
              className={`w-full max-w-md px-4 py-2 border-2 rounded-lg text-right backdrop-blur-sm ${
                theme === 'light'
                  ? 'border-gray-300 bg-white/80 text-black placeholder-gray-500'
                  : 'border-gray-600 bg-black/80 text-white placeholder-gray-400'
              }`}
            />
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
