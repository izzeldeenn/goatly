'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SpotifyAuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const SpotifyAuthContext = createContext<SpotifyAuthState | undefined>(undefined);

export function SpotifyAuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for access token in localStorage
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
    }

    // Check for token in URL hash (after OAuth callback from API route)
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token'))?.split('=')[1];
      if (token) {
        setAccessToken(token);
        localStorage.setItem('spotify_access_token', token);
        // Clear hash from URL
        window.location.hash = '';
      }
    }
  }, []);

  const login = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = window.location.origin + '/api/spotify/callback';
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-modify-playback-state',
      'user-read-playback-state',
      'user-read-currently-playing',
      'user-read-recently-played',
      'user-top-read',
      'user-library-read',
      'user-library-modify',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'streaming'
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&show_dialog=true`;
    
    window.location.href = authUrl;
  };

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem('spotify_access_token');
  };

  return (
    <SpotifyAuthContext.Provider value={{
      accessToken,
      isAuthenticated: !!accessToken,
      login,
      logout
    }}>
      {children}
    </SpotifyAuthContext.Provider>
  );
}

export function useSpotifyAuth() {
  const context = useContext(SpotifyAuthContext);
  if (context === undefined) {
    throw new Error('useSpotifyAuth must be used within a SpotifyAuthProvider');
  }
  return context;
}
