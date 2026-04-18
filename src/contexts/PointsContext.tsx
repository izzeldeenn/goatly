'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';

interface PointsState {
  coins: number;
  level: number;
  experience: number;
}

interface PointsContextType {
  coins: number;
  level: number;
  experience: number;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: ReactNode }) {
  const { getCurrentUser, updateUserScore } = useUser();
  const currentUser = getCurrentUser();
  
  const [state, setState] = useState<PointsState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fahman_hub_points');
      if (saved) {
        try {
          const parsedState = JSON.parse(saved);
          // If we have a current user with a score, prioritize the database score
          if (currentUser?.score !== undefined) {
            return {
              ...parsedState,
              coins: currentUser.score,
              level: Math.floor(currentUser.score / 100) + 1,
              experience: currentUser.score
            };
          }
          return parsedState;
        } catch (error) {
          console.error('Failed to parse points state:', error);
        }
      }
      
      // Initialize with current user score if available, otherwise default to 0
      const initialScore = currentUser?.score !== undefined ? currentUser.score : 0;
      return {
        coins: initialScore,
        level: Math.floor(initialScore / 100) + 1,
        experience: initialScore
      };
    }
    
    // Fallback for server-side rendering
    return {
      coins: 0,
      level: 1,
      experience: 0
    };
  });

  // Track if we're in the middle of a purchase operation
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync coins with real user score from database (only when not updating and when user first loads)
  useEffect(() => {
    if (currentUser?.score !== undefined && !isUpdating) {
      // Only sync if current state coins are different from user score
      const hasSyncedBefore = localStorage.getItem('fahman_hub_points_synced');
      if (!hasSyncedBefore || state.coins !== currentUser.score) {
        setState(prev => ({
          ...prev,
          coins: currentUser.score,
          level: Math.floor(currentUser.score / 100) + 1,
          experience: currentUser.score
        }));
        localStorage.setItem('fahman_hub_points_synced', 'true');
      }
    }
  }, [currentUser?.score, isUpdating]);

  useEffect(() => {
    localStorage.setItem('fahman_hub_points', JSON.stringify(state));
  }, [state]);

  const calculateLevel = (exp: number) => {
    return Math.floor(exp / 100) + 1;
  };

  const addCoins = (amount: number) => {
    // Set updating flag to prevent sync override
    setIsUpdating(true);
    
    // Update real user score in database
    if (currentUser) {
      updateUserScore(amount);
    }
    
    // Update local state for immediate UI feedback
    setState(prev => {
      const newState = {
        ...prev,
        coins: prev.coins + amount,
        experience: prev.experience + amount,
        level: Math.floor((prev.experience + amount) / 100) + 1
      };
      return newState;
    });
    
    // Clear updating flag after a short delay to allow database update
    setTimeout(() => {
      setIsUpdating(false);
      // Clear sync flag to allow proper sync next time
      localStorage.removeItem('fahman_hub_points_synced');
    }, 1000);
  };

  const removeCoins = (amount: number) => {
    // Set updating flag to prevent sync override
    setIsUpdating(true);
    
    // Update real user score in database
    if (currentUser) {
      updateUserScore(-amount);
    }
    
    // Update local state for immediate UI feedback
    setState(prev => {
      const newState = {
        ...prev,
        coins: Math.max(0, prev.coins - amount),
        experience: Math.max(0, prev.experience - amount),
        level: Math.floor(Math.max(0, prev.experience - amount) / 100) + 1
      };
      return newState;
    });
    
    // Clear updating flag after a short delay to allow database update
    setTimeout(() => {
      setIsUpdating(false);
      // Clear sync flag to allow proper sync next time
      localStorage.removeItem('fahman_hub_points_synced');
    }, 1000);
  };

  return (
    <PointsContext.Provider value={{
      coins: state.coins,
      level: state.level,
      experience: state.experience,
      addCoins,
      removeCoins
    }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}
