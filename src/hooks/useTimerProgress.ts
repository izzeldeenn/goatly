'use client';

import { useState, useEffect, useRef } from 'react';
import { usePoints } from '@/contexts/PointsContext';

interface UseTimerProgressReturn {
  coins: number;
  progressToNextPoint: number;
  minutesToNextPoint: number;
  secsToNextPoint: number;
  showStopConfirmation: boolean;
  handleStopClick: () => void;
  confirmStop: (handleStop: () => void) => void;
  cancelStop: () => void;
  handleStartWithSound: (handleStart: () => void) => void;
  pendingPoints: number;
  clearPendingPoints: () => void;
}

export function useTimerProgress(sessionTime: number, isRunning: boolean): UseTimerProgressReturn {
  const { coins, addCoins } = usePoints();
  const [showStopConfirmation, setShowStopConfirmation] = useState(false);
  const lastAwardedTimeRef = useRef(0);
  const [pendingPoints, setPendingPoints] = useState(0);

  // Calculate progress to next point based on current session time (every 10 minutes = 600 seconds)
  // Each session starts fresh, so progress is based on current session time only
  const secondsPerPoint = 600;
  const progressToNextPoint = (sessionTime % secondsPerPoint) / secondsPerPoint * 100;
  const secondsToNextPoint = secondsPerPoint - (sessionTime % secondsPerPoint);
  const minutesToNextPoint = Math.floor(secondsToNextPoint / 60);
  const secsToNextPoint = secondsToNextPoint % 60;

  // Track pending points (display only, not added to database yet)
  useEffect(() => {
    if (isRunning && sessionTime > 0) {
      const currentMilestone = Math.floor(sessionTime / secondsPerPoint);
      const lastMilestone = Math.floor(lastAwardedTimeRef.current / secondsPerPoint);

      // If we've reached a new milestone (every 10 minutes), track pending points
      if (currentMilestone > lastMilestone) {
        const pointsEarned = currentMilestone - lastMilestone;
        setPendingPoints(prev => prev + pointsEarned);
        lastAwardedTimeRef.current = sessionTime;
      }
    }
  }, [sessionTime, isRunning]);

  // Clear pending points when session starts fresh
  useEffect(() => {
    if (sessionTime === 0) {
      setPendingPoints(0);
      lastAwardedTimeRef.current = 0;
    }
  }, [sessionTime]);

  // Function to add pending points to database and clear them
  const clearPendingPoints = () => {
    if (pendingPoints > 0) {
      addCoins(pendingPoints);
      setPendingPoints(0);
    }
  };

  // Sound effects using Web Audio API
  const playStartSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing start sound:', error);
    }
  };

  const playStopSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(392, audioContext.currentTime); // G4
      oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.15); // F4
      oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.3); // E4
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing stop sound:', error);
    }
  };

  const handleStopClick = () => {
    if (isRunning) {
      setShowStopConfirmation(true);
    }
  };

  const confirmStop = (handleStop: () => void) => {
    setShowStopConfirmation(false);
    playStopSound();
    handleStop();
  };

  const cancelStop = () => {
    setShowStopConfirmation(false);
  };

  const handleStartWithSound = (handleStart: () => void) => {
    playStartSound();
    handleStart();
  };

  return {
    coins,
    progressToNextPoint,
    minutesToNextPoint,
    secsToNextPoint,
    showStopConfirmation,
    handleStopClick,
    confirmStop,
    cancelStop,
    handleStartWithSound,
    pendingPoints,
    clearPendingPoints
  };
}
