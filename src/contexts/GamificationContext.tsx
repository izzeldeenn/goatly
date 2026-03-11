'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'daily' | 'weekly' | 'achievement';
  completed: boolean;
  completedAt?: string;
}

interface GamificationState {
  coins: number;
  level: number;
  experience: number;
  tasks: Task[];
  streak: number;
  lastStudyDate: string | null;
}

interface GamificationContextType {
  coins: number;
  level: number;
  experience: number;
  tasks: Task[];
  streak: number;
  completeTask: (taskId: string) => void;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
  generateDailyTasks: () => void;
  resetDailyTasks: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GamificationState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fahman_hub_gamification');
      return saved ? JSON.parse(saved) : {
        coins: 100,
        level: 1,
        experience: 0,
        tasks: [],
        streak: 0,
        lastStudyDate: null
      };
    }
    return {
      coins: 100,
      level: 1,
      experience: 0,
      tasks: [],
      streak: 0,
      lastStudyDate: null
    };
  });

  useEffect(() => {
    localStorage.setItem('fahman_hub_gamification', JSON.stringify(state));
  }, [state]);

  const calculateLevel = (exp: number) => {
    return Math.floor(exp / 100) + 1;
  };

  const completeTask = (taskId: string) => {
    setState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task || task.completed) return prev;

      const newTasks = prev.tasks.map(t => 
        t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
      );

      const newExperience = prev.experience + task.points;
      const newLevel = calculateLevel(newExperience);
      const newCoins = prev.coins + task.points;

      return {
        ...prev,
        tasks: newTasks,
        experience: newExperience,
        level: newLevel,
        coins: newCoins
      };
    });
  };

  const addCoins = (amount: number) => {
    setState(prev => ({
      ...prev,
      coins: prev.coins + amount
    }));
  };

  const removeCoins = (amount: number) => {
    setState(prev => ({
      ...prev,
      coins: Math.max(0, prev.coins - amount)
    }));
  };

  const generateDailyTasks = () => {
    const dailyTasks: Task[] = [
      {
        id: 'daily-1',
        title: 'دراسة لمدة 30 دقيقة',
        description: 'ادرس لمدة 30 دقيقة متتالية',
        points: 20,
        type: 'daily',
        completed: false
      },
      {
        id: 'daily-2',
        title: 'إكمال 3 جلسات بومودورو',
        description: 'أكمل 3 جلسات بومودورو كاملة',
        points: 30,
        type: 'daily',
        completed: false
      },
      {
        id: 'daily-3',
        title: 'الدراسة في وقت متأخر',
        description: 'ادرس بعد الساعة 10 مساءً',
        points: 15,
        type: 'daily',
        completed: false
      }
    ];

    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks.filter(t => t.type !== 'daily'), ...dailyTasks]
    }));
  };

  const resetDailyTasks = () => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.type !== 'daily')
    }));
  };

  // Check for daily reset
  useEffect(() => {
    const checkDailyReset = () => {
      const now = new Date();
      const lastReset = localStorage.getItem('fahman_hub_daily_reset');
      
      if (!lastReset || new Date(lastReset).toDateString() !== now.toDateString()) {
        resetDailyTasks();
        localStorage.setItem('fahman_hub_daily_reset', now.toISOString());
      }
    };

    checkDailyReset();
    const interval = setInterval(checkDailyReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Generate initial tasks if none exist
  useEffect(() => {
    if (state.tasks.length === 0) {
      generateDailyTasks();
    }
  }, []);

  return (
    <GamificationContext.Provider value={{
      coins: state.coins,
      level: state.level,
      experience: state.experience,
      tasks: state.tasks,
      streak: state.streak,
      completeTask,
      addCoins,
      removeCoins,
      generateDailyTasks,
      resetDailyTasks
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
