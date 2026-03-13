'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

export function YouTubeTimer() {
  const { theme } = useTheme();
  const { getCurrentUser, updateUserStudyTime, setTimerActive } = useUser();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const studyTimeRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    if (isRunning) {
      setTimerActive(true);
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
      
      // Update device study time every second
      studyTimeRef.current = setInterval(() => {
        updateUserStudyTime(1); // Add 1 second of study time
      }, 1000);
    } else {
      setTimerActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
    }

    return () => {
      setTimerActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (studyTimeRef.current) {
        clearInterval(studyTimeRef.current);
      }
    };
  }, [isRunning, updateUserStudyTime, setTimerActive]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (videoUrl && getVideoId(videoUrl)) {
      setIsRunning(true);
      setShowVideo(true);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setShowVideo(false);
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
