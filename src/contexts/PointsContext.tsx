'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { useCoins } from './CoinsContext';

interface PointsState {
  coins: number;
  level: number;
  experience: number;
}

interface RewardData {
  totalEarned: number;
  totalSpent: number;
  lastDailyReward: string;
  currentStreak: number;
  achievements: string[];
}

interface PointsContextType {
  coins: number;
  level: number;
  experience: number;
  addCoins: (amount: number) => Promise<void>;
  removeCoins: (amount: number) => Promise<void>;
  // Helper functions for common operations
  calculateCoinsFromStudyTime: (studySeconds: number) => number;
  rewardDailyLogin: () => Promise<boolean>;
  rewardSessionComplete: (minutes: number, pendingPoints?: number) => Promise<number>;
  rewardPomodoroSession: () => Promise<number>;
  rewardLevelUp: () => Promise<number>;
  rewardAchievement: (achievementId: string) => Promise<number>;
  purchaseItem: (price: number) => Promise<boolean>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: ReactNode }) {
  const { getCurrentUser } = useUser();
  const { coins, addCoins: addCoinsToDB, removeCoins: removeCoinsFromDB } = useCoins();
  const currentUser = getCurrentUser();
  
  // Track if we're in the middle of a purchase operation
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Track reward data
  const [rewardData, setRewardData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fahman_hub_rewards');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Failed to parse rewards data:', error);
        }
      }
    }
    return {
      totalEarned: 0,
      totalSpent: 0,
      lastDailyReward: '',
      currentStreak: 0,
      achievements: [] as string[]
    };
  });


  useEffect(() => {
    localStorage.setItem('fahman_hub_rewards', JSON.stringify(rewardData));
  }, [rewardData]);

  const calculateLevel = (exp: number) => {
    return Math.floor(exp / 100) + 1;
  };

  const addCoins = async (amount: number) => {
    // Set updating flag to prevent sync override
    setIsUpdating(true);
    
    // Update coins using CoinsContext
    await addCoinsToDB(amount, 'points_reward', 'Points reward', undefined);
    
    // Clear updating flag after a short delay
    setTimeout(() => {
      setIsUpdating(false);
    }, 1000);
  };

  const removeCoins = async (amount: number) => {
    // Set updating flag to prevent sync override
    setIsUpdating(true);
    
    // Update coins using CoinsContext
    await removeCoinsFromDB(amount, 'points_spend', 'Points spent', undefined);
    
    // Clear updating flag after a short delay
    setTimeout(() => {
      setIsUpdating(false);
    }, 1000);
  };

  // Helper function to calculate coins from study time
  const calculateCoinsFromStudyTime = (studySeconds: number): number => {
    // 1 coin every 10 minutes (600 seconds)
    return Math.floor(studySeconds / 600);
  };

  // Daily login reward
  const rewardDailyLogin = async (): Promise<boolean> => {
    if (!currentUser) return false;

    const today = new Date().toDateString();
    const lastReward = rewardData.lastDailyReward;

    if (lastReward !== today) {
      // Give daily reward
      await addCoins(10);
      
      // Update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = 1;
      if (lastReward === yesterday.toDateString()) {
        newStreak = rewardData.currentStreak + 1;
      }

      // Give streak bonus
      if (newStreak > 1) {
        setTimeout(() => addCoins(20), 100);
      }

      setRewardData((prev: RewardData) => ({
        ...prev,
        totalEarned: prev.totalEarned + 10 + (newStreak > 1 ? 20 : 0),
        lastDailyReward: today,
        currentStreak: newStreak
      }));
      return true;
    }

    return false;
  };

  // Session complete reward - adds pending points that were tracked during the session
  const rewardSessionComplete = async (minutes: number, pendingPoints: number = 0): Promise<number> => {
    if (!currentUser) return 0;

    // Add pending points that were tracked during the session
    const totalReward = pendingPoints;

    if (totalReward > 0) {
      await addCoins(totalReward);

      setRewardData((prev: RewardData) => ({
        ...prev,
        totalEarned: prev.totalEarned + totalReward
      }));
    }

    return totalReward;
  };

  // Pomodoro session reward
  const rewardPomodoroSession = async (): Promise<number> => {
    if (!currentUser) return 0;

    const rewardPoints = 15;
    
    await addCoins(rewardPoints);

    setRewardData((prev: RewardData) => ({
      ...prev,
      totalEarned: prev.totalEarned + rewardPoints
    }));

    return rewardPoints;
  };

  // Level up reward
  const rewardLevelUp = async (): Promise<number> => {
    if (!currentUser) return 0;

    const rewardPoints = 50;
    
    await addCoins(rewardPoints);

    setRewardData((prev: RewardData) => ({
      ...prev,
      totalEarned: prev.totalEarned + rewardPoints
    }));

    return rewardPoints;
  };

  // Achievement reward
  const rewardAchievement = async (achievementId: string): Promise<number> => {
    if (!currentUser) return 0;

    // Check if achievement already rewarded
    if (rewardData.achievements.includes(achievementId)) return 0;

    const rewardPoints = 25;
    
    await addCoins(rewardPoints);

    setRewardData((prev: RewardData) => ({
      ...prev,
      totalEarned: prev.totalEarned + rewardPoints,
      achievements: [...prev.achievements, achievementId]
    }));

    return rewardPoints;
  };

  // Purchase item
  const purchaseItem = async (price: number): Promise<boolean> => {
    if (!currentUser) return false;

    if (coins < price) return false;

    const success = await removeCoinsFromDB(price, 'purchase', 'Item purchase');
    
    if (success) {
      setRewardData((prev: RewardData) => ({
        ...prev,
        totalSpent: prev.totalSpent + price
      }));
    }

    return success;
  };

  return (
    <PointsContext.Provider value={{
      coins: coins,
      level: Math.floor(coins / 100) + 1,
      experience: coins,
      addCoins,
      removeCoins,
      calculateCoinsFromStudyTime,
      rewardDailyLogin,
      rewardSessionComplete,
      rewardPomodoroSession,
      rewardLevelUp,
      rewardAchievement,
      purchaseItem
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
