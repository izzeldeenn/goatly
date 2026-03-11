'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGamification } from './GamificationContext';

interface User {
  id: number;
  name: string;
  score: number;
  rank: number;
  studyTime: number; // in seconds
}

interface UserContextType {
  users: User[];
  addUser: (name: string) => void;
  updateUserStudyTime: (userId: number, additionalTime: number) => void;
  getCurrentUser: () => User | null;
  removeUser: (userId: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { addCoins, removeCoins } = useGamification();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users from localStorage on mount
    const savedUsers = localStorage.getItem('fahman_hub_users');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save users to localStorage whenever they change
    localStorage.setItem('fahman_hub_users', JSON.stringify(users));
  }, [users]);

  const addUser = (name: string) => {
    const newUser: User = {
      id: Date.now(),
      name,
      score: 0,
      rank: users.length + 1,
      studyTime: 0
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUserStudyTime = (userId: number, additionalTime: number) => {
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.id === userId) {
          const pointsEarned = Math.floor(additionalTime / 10); // 1 point per 10 seconds
          addCoins(pointsEarned); // Add coins to gamification system
          return {
            ...user,
            studyTime: user.studyTime + additionalTime,
            score: user.score + pointsEarned
          };
        }
        return user;
      });

      // Sort by score and update ranks
      newUsers.sort((a, b) => b.score - a.score);
      newUsers.forEach((user, index) => {
        user.rank = index + 1;
      });

      return newUsers;
    });
  };

  const getCurrentUser = (): User | null => {
    const currentUserId = localStorage.getItem('fahman_hub_current_user');
    if (currentUserId) {
      return users.find(user => user.id === parseInt(currentUserId)) || null;
    }
    return null;
  };

  const removeUser = (userId: number) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  return (
    <UserContext.Provider value={{
      users,
      addUser,
      updateUserStudyTime,
      getCurrentUser,
      removeUser
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
