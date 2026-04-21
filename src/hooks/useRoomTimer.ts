'use client';

import { useState, useEffect, useRef } from 'react';
import { roomDB } from '@/lib/supabase';
import { dailyActivityDB } from '@/lib/dailyActivity';

interface UseRoomTimerReturn {
  localSeconds: number;
  isRunning: boolean;
  leaveRoom: () => Promise<void>;
  error: string | null;
}

export function useRoomTimer(roomId: string, userId: string, accountId?: string): UseRoomTimerReturn {
  const [localSeconds, setLocalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const joinedAtRef = useRef<number>(Date.now());
  const lastUpdateRef = useRef<number>(0);
  const totalSecondsRef = useRef<number>(0);

  // Load saved timer state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`room_timer_${roomId}_${userId}`);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setLocalSeconds(state.seconds || 0);
        joinedAtRef.current = state.joinedAt || Date.now();
        setIsRunning(state.isRunning || false);
      } catch (e) {
        console.error('Error loading saved timer state:', e);
      }
    }
  }, [roomId, userId]);

  // Local timer - counts every second locally
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setLocalSeconds(prev => {
        const newSeconds = prev + 1;
        // Save to localStorage
        const state = {
          seconds: newSeconds,
          joinedAt: joinedAtRef.current,
          isRunning: true
        };
        localStorage.setItem(`room_timer_${roomId}_${userId}`, JSON.stringify(state));
        return newSeconds;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, roomId, userId]);

  // Heartbeat every 60 seconds - minimal data usage
  useEffect(() => {
    if (!isRunning) return;

    heartbeatRef.current = setInterval(() => {
      roomDB.updateHeartbeat(roomId, userId).catch(err => {
        console.error('Heartbeat error:', err);
        setError('Failed to update heartbeat');
      });
    }, 60000); // 60 seconds only

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [isRunning, roomId, userId]);

  // Update study time every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (accountId && localSeconds > 0) {
        const delta = localSeconds - lastUpdateRef.current;

        if (delta >= 30) {
          await dailyActivityDB.updateStudyTimeRealtime(accountId, delta);
          lastUpdateRef.current = localSeconds;
          totalSecondsRef.current += delta;
        }
      }
    }, 10000); // Check every 10 seconds, but only update if 30+ seconds passed

    return () => clearInterval(interval);
  }, [accountId, localSeconds]);

  // Save study time on unmount (when closing tab/browser)
  useEffect(() => {
    return () => {
      if (accountId && localSeconds > 0) {
        const remainingDelta = localSeconds - lastUpdateRef.current;
        if (remainingDelta > 0) {
          dailyActivityDB.updateStudyTimeRealtime(accountId, remainingDelta);
        }
      }
    };
  }, [accountId, localSeconds]);

  // Check if user is still in the room before starting timer
  useEffect(() => {
    const checkMembership = async () => {
      try {
        const members = await roomDB.getRoomMembers(roomId);
        const isMember = members.some(m => m.user_id === userId);
        
        if (isMember) {
          setIsRunning(true);
        } else {
          // User is not in the room, stop timer and clear localStorage
          setIsRunning(false);
          localStorage.removeItem(`room_timer_${roomId}_${userId}`);
        }
      } catch (err) {
        console.error('Error checking membership:', err);
        // If we can't check, don't start the timer to be safe
        setIsRunning(false);
      }
    };

    checkMembership();

    // Handle beforeunload event - leave room when closing tab/browser
    const handleBeforeUnload = async () => {
      // Use fetch with keepalive to ensure request completes during unload
      try {
        await fetch('/api/rooms/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, userId }),
          keepalive: true
        });
      } catch (err) {
        console.error('Error leaving room on unload:', err);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount - stop timer and clear localStorage
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      localStorage.removeItem(`room_timer_${roomId}_${userId}`);
    };
  }, [roomId, userId]);

  // Leave room function
  const leaveRoom = async () => {
    try {
      setIsRunning(false);
      
      // Clear intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }

      // Leave room in database
      await roomDB.leaveRoom(roomId, userId);

      // Clear localStorage
      localStorage.removeItem(`room_timer_${roomId}_${userId}`);
      
      setError(null);
    } catch (err) {
      console.error('Error leaving room:', err);
      setError('Failed to leave room');
    }
  };

  return {
    localSeconds,
    isRunning,
    leaveRoom,
    error
  };
}
