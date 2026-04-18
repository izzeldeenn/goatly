'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { usePoints } from '@/contexts/PointsContext';

interface StoreRewards {
  dailyLogin: number;
  sessionComplete: number;
  pomodoroSession: number;
  streakDay: number;
  levelUp: number;
  achievement: number;
}

interface UserStoreData {
  totalEarned: number;
  totalSpent: number;
  lastDailyReward: string;
  currentStreak: number;
  achievements: string[];
}

export const useStoreSystem = () => {
  const { getCurrentUser } = useUser();
  const { coins, addCoins, removeCoins, level } = usePoints();
  const [userStoreData, setUserStoreData] = useState<UserStoreData>({
    totalEarned: 0,
    totalSpent: 0,
    lastDailyReward: '',
    currentStreak: 0,
    achievements: []
  });

  const currentUser = getCurrentUser();

  const REWARDS: StoreRewards = {
    dailyLogin: 10,
    sessionComplete: 5,
    pomodoroSession: 15,
    streakDay: 20,
    levelUp: 50,
    achievement: 25
  };

  useEffect(() => {
    if (currentUser) {
      loadUserStoreData();
      checkDailyReward();
    }
  }, [currentUser]);

  const loadUserStoreData = () => {
    if (!currentUser) return;

    const savedData = localStorage.getItem(`userStoreData_${currentUser.accountId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUserStoreData(parsed);
      } catch (error) {
        console.error('Failed to load store data:', error);
      }
    }
  };

  const saveUserStoreData = (data: UserStoreData) => {
    if (!currentUser) return;
    
    localStorage.setItem(`userStoreData_${currentUser.accountId}`, JSON.stringify(data));
    setUserStoreData(data);
  };

  const checkDailyReward = () => {
    if (!currentUser) return;

    const today = new Date().toDateString();
    const lastReward = userStoreData.lastDailyReward;

    if (lastReward !== today) {
      // Give daily reward
      addCoins(REWARDS.dailyLogin);
      
      // Update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = 1;
      if (lastReward === yesterday.toDateString()) {
        newStreak = userStoreData.currentStreak + 1;
      }

      // Give streak bonus
      if (newStreak > 1) {
        setTimeout(() => addCoins(REWARDS.streakDay), 100);
      }

      const updatedData = {
        ...userStoreData,
        totalEarned: userStoreData.totalEarned + REWARDS.dailyLogin + (newStreak > 1 ? REWARDS.streakDay : 0),
        lastDailyReward: today,
        currentStreak: newStreak
      };

      saveUserStoreData(updatedData);
      return true;
    }

    return false;
  };

  const rewardSessionComplete = (minutes: number) => {
    if (!currentUser) return 0;

    // Use the existing point system from dailyActivity
    // Points are already calculated and added by the session system
    // This function just notifies about the reward
    const baseReward = REWARDS.sessionComplete;
    const bonusReward = Math.floor(minutes / 30) * 2; // 2 coins per 30 minutes
    
    const totalReward = baseReward + bonusReward;
    
    // Add bonus coins from store system (in addition to the main point system)
    setTimeout(() => addCoins(totalReward), 50);

    const updatedData = {
      ...userStoreData,
      totalEarned: userStoreData.totalEarned + totalReward
    };

    saveUserStoreData(updatedData);
    return totalReward;
  };

  const rewardPomodoroSession = () => {
    if (!currentUser) return 0;

    // Use the existing point system from dailyActivity
    // Points are already calculated and added by the session system
    // This function just notifies about the reward
    const rewardPoints = REWARDS.pomodoroSession;
    
    // Add bonus coins from store system (in addition to the main point system)
    setTimeout(() => addCoins(rewardPoints), 50);

    const updatedData = {
      ...userStoreData,
      totalEarned: userStoreData.totalEarned + rewardPoints
    };

    saveUserStoreData(updatedData);
    return rewardPoints;
  };

  const rewardLevelUp = () => {
    if (!currentUser) return 0;

    // Use the existing point system from users table
    // Points are already calculated and added by the level system
    // This function just notifies about the reward
    const rewardPoints = REWARDS.levelUp;
    
    // Add bonus coins from store system (in addition to the main point system)
    setTimeout(() => addCoins(rewardPoints), 50);

    const updatedData = {
      ...userStoreData,
      totalEarned: userStoreData.totalEarned + rewardPoints
    };

    saveUserStoreData(updatedData);
    return rewardPoints;
  };

  const rewardAchievement = (achievementId: string) => {
    if (!currentUser) return 0;

    // Check if achievement already rewarded
    if (userStoreData.achievements.includes(achievementId)) return 0;

    // Use the existing point system from users table
    // Points are already calculated and added by the achievement system
    // This function just notifies about the reward and tracks it
    const rewardPoints = REWARDS.achievement;
    
    // Add bonus coins from store system (in addition to the main point system)
    setTimeout(() => addCoins(rewardPoints), 50);

    const updatedData = {
      ...userStoreData,
      totalEarned: userStoreData.totalEarned + rewardPoints,
      achievements: [...userStoreData.achievements, achievementId]
    };

    saveUserStoreData(updatedData);
    return rewardPoints;
  };

  const purchaseItem = (price: number) => {
    if (!currentUser) return false;

    if (coins < price) return false;

    removeCoins(price);

    const updatedData = {
      ...userStoreData,
      totalSpent: userStoreData.totalSpent + price
    };

    saveUserStoreData(updatedData);
    return true;
  };

  const getStoreStats = () => {
    return {
      coins, // This is the real user score from users table
      level,
      totalEarned: userStoreData.totalEarned,
      totalSpent: userStoreData.totalSpent,
      currentStreak: userStoreData.currentStreak,
      achievements: userStoreData.achievements.length,
      canClaimDaily: userStoreData.lastDailyReward !== new Date().toDateString()
    };
  };

  const getRewardsInfo = () => {
    return {
      dailyLogin: REWARDS.dailyLogin,
      sessionComplete: REWARDS.sessionComplete,
      pomodoroSession: REWARDS.pomodoroSession,
      streakDay: REWARDS.streakDay,
      levelUp: REWARDS.levelUp,
      achievement: REWARDS.achievement
    };
  };

  return {
    // Data
    userStoreData,
    
    // Actions
    checkDailyReward,
    rewardSessionComplete,
    rewardPomodoroSession,
    rewardLevelUp,
    rewardAchievement,
    purchaseItem,
    
    // Getters
    getStoreStats,
    getRewardsInfo
  };
};
