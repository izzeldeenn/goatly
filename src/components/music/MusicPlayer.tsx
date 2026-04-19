'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMusic } from '@/contexts/MusicContext';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function MusicPlayer({ isVisible: externalVisible, setIsVisible: externalSetVisible }: { isVisible?: boolean; setIsVisible?: (visible: boolean) => void } = {}) {
  const {
    isPlaying,
    currentTrack,
    volume,
    autoPlay,
    loop,
    playTrack,
    pauseTrack,
    stopTrack,
    setVolume,
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
  } = useMusic();

  const [isVisible, setIsVisible] = useState(externalVisible || false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(Array(20).fill(8));
  const [hasSearched, setHasSearched] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const playerRef = useRef<any>(null);
  const youtubePlayerRef = useRef<any>(null);

  const currentVisible = externalVisible !== undefined ? externalVisible : isVisible;
  const currentSetVisible = externalSetVisible || setIsVisible;

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready');
      };
    }
  }, []);

  // Initialize player when track changes
  useEffect(() => {
    if (currentTrack && window.YT) {
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.loadVideoById === 'function') {
        youtubePlayerRef.current.loadVideoById(currentTrack.id);
      } else {
        youtubePlayerRef.current = new window.YT.Player('youtube-player', {
          videoId: currentTrack.id,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              setYoutubePlayer(event.target);
              event.target.setVolume(volume * 100);
              if (isPlaying) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                if (loop) {
                  if (typeof event.target.seekTo === 'function') {
                    event.target.seekTo(0);
                  }
                  if (typeof event.target.playVideo === 'function') {
                    event.target.playVideo();
                  }
                } else {
                  nextTrack();
                }
              }
            },
          },
        });
      }
    }
  }, [currentTrack]);

  // Update volume
  useEffect(() => {
    if (youtubePlayerRef.current && typeof youtubePlayerRef.current.setVolume === 'function') {
      youtubePlayerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // Update visualizer bars when music is playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying) {
      interval = setInterval(() => {
        setVisualizerBars(prevBars =>
          prevBars.map(() => Math.floor(Math.random() * 100) + 8)
        );
      }, 100);
    } else {
      setVisualizerBars(Array(20).fill(8));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Handle play/pause - only when explicitly triggered
  const handlePlayPause = () => {
    if (youtubePlayerRef.current && typeof youtubePlayerRef.current.playVideo === 'function') {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true);
      searchYouTube(searchQuery);
    }
  };

  const extractVideoId = (input: string): string | null => {
    // Check if it's a YouTube URL
    const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = input.match(urlRegex);
    if (match) return match[1];
    
    // Check if it's already a video ID (11 characters)
    if (input.length === 11) return input;
    
    return null;
  };

  const handleAddTrack = () => {
    const input = searchQuery.trim();
    if (!input) return;
    
    const videoId = extractVideoId(input);
    if (videoId) {
      // Create a track object and play it immediately
      const newTrack: any = {
        id: videoId,
        name: `Custom Video ${videoId}`,
        artist: 'YouTube',
        thumbnail: '',
        embedUrl: `https://www.youtube.com/embed/${videoId}`
      };
      
      addTrack(videoId);
      playTrack(newTrack);
      setTimeout(() => handlePlayPause(), 100);
      setSearchQuery('');
      setHasSearched(true);
    }
  };

  const handleClose = () => {
    // Just hide the panel, don't stop the music
    currentSetVisible(false);
  };

  return (
    <>
      {/* Hidden YouTube player - always in DOM to keep music playing when panel is closed */}
      <div id="youtube-player" ref={playerRef} className="hidden" />

      {currentVisible && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-gradient-to-b from-gray-900 to-black backdrop-blur-xl border-l border-gray-800 z-50 flex flex-col shadow-2xl">
          <div className="p-5 border-b border-gray-800 bg-black/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">YouTube Music</h2>
                  <p className="text-gray-400 text-xs">Listen to your favorites</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
                  </svg>
                </button>
                <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-5 border-b border-gray-800 bg-black/30">
              <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Settings</h4>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors mb-3">
                <span className="text-gray-300 text-sm">Auto Play</span>
                <div className="relative">
                  <input type="checkbox" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} className="sr-only peer"/>
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors">
                <span className="text-gray-300 text-sm">Loop</span>
                <div className="relative">
                  <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="sr-only peer"/>
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </div>
              </label>
            </div>
          )}

          {/* Player Section - Only show after search */}
          {hasSearched && currentTrack && (
            <div className="p-5 border-b border-gray-800 bg-black/30">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base truncate">{currentTrack.name}</h3>
                    <p className="text-gray-400 text-sm">{currentTrack.artist}</p>
                  </div>
                  <button onClick={() => removeTrack(currentTrack.id)} className="text-red-400 hover:text-red-300 text-sm ml-3 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Music Visualizer */}
                  <div className="flex items-end justify-center gap-1 h-16 px-4">
                    {visualizerBars.map((height, i) => (
                      <div
                        key={i}
                        className="w-2 bg-gradient-to-t from-red-600 to-red-400 rounded-full transition-all duration-75 ease-out"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6">
                    <button onClick={previousTrack} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 9.168V6a1 1 0 00-2 0v8a1 1 0 002 0v-3.168l5.445 4z"/>
                      </svg>
                    </button>
                    <button onClick={() => {
                      if (isPlaying) {
                        pauseTrack();
                        controlYoutubePlayer('pause');
                      } else {
                        playTrack(currentTrack);
                        controlYoutubePlayer('play');
                      }
                    }} className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-red-500/30">
                      {isPlaying ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                        </svg>
                      )}
                    </button>
                    <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832L17 10.832V14a1 1 0 002 0V6a1 1 0 00-2 0v3.168l-5.445-4z"/>
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"/>
                    </svg>
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-red-500"/>
                    <span className="text-xs text-gray-400 w-8 text-center">{Math.round(volume * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search YouTube or paste URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-3 pl-11 bg-gray-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm border border-gray-700 hover:border-gray-600 transition-colors"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                </svg>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSearch} disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20">
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
                <button onClick={handleAddTrack} disabled={!searchQuery.trim()} className="flex-1 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  Add URL
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                {filteredTracks.length > 0 ? `Results (${filteredTracks.length})` : 'Search Results'}
              </h4>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredTracks.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No results found. Try searching for a song or paste a YouTube URL.</p>
              ) : (
                <div className="space-y-2">
                  {filteredTracks.map(track => (
                    <div
                      key={track.id}
                      onClick={() => { playTrack(track); setTimeout(() => controlYoutubePlayer('play'), 100); }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-gray-800/50 border border-transparent ${
                        currentTrack?.id === track.id ? 'bg-gray-800 border-red-500' : ''
                      }`}
                    >
                      <div className="w-14 h-14 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {track.thumbnail ? (
                          <img src={track.thumbnail} alt={track.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{track.name}</p>
                        <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                      </div>
                      {currentTrack?.id === track.id && isPlaying && (
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse delay-75"></div>
                          <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse delay-150"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
