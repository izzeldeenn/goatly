'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { getAccountId, getAccountInfo } from '@/utils/deviceId';
import { useGamification } from '@/contexts/GamificationContext';
import { formatStudyTime } from '@/utils/timeFormat';
import { userDB, isSupabaseAvailable, UserAccount, UserAccountFrontend } from '@/lib/supabase';

// Convert Supabase DB format to frontend format
const convertToUserAccountFrontend = (dbUser: UserAccount): UserAccountFrontend => ({
  id: dbUser.id,
  accountId: dbUser.account_id,
  username: dbUser.username,
  email: dbUser.email,
  hashKey: dbUser.hash_key,
  avatar: dbUser.avatar,
  score: dbUser.score,
  rank: dbUser.rank,
  studyTime: dbUser.study_time,
  studyTimeFormatted: formatStudyTime(dbUser.study_time),
  createdAt: dbUser.created_at,
  lastActive: dbUser.last_active
});

// Convert frontend format to Supabase DB format
const convertToUserAccount = (user: UserAccountFrontend): UserAccount => ({
  id: user.id,
  account_id: user.accountId,
  username: user.username,
  email: user.email,
  hash_key: user.hashKey,
  avatar: user.avatar,
  score: user.score,
  rank: user.rank,
  study_time: user.studyTime,
  created_at: user.createdAt,
  last_active: user.lastActive
});

interface UserContextType {
  users: UserAccountFrontend[];
  currentAccountId: string;
  isTimerRunning: boolean;
  getCurrentUser: () => UserAccountFrontend | null;
  getAllDeviceUsers: () => UserAccountFrontend[];
  updateUserName: (name: string) => void;
  updateUserAvatar: (avatar: string) => void;
  updateUserStudyTime: (additionalTime: number) => void;
  updateUserScore: (additionalScore: number) => void;
  setTimerActive: (active: boolean) => void;
  isTimerActive: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { addCoins } = useGamification();
  const [users, setUsers] = useState<UserAccountFrontend[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string>('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const dbSyncAccumulator = useRef(0);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing UserContext...');
      
      // Get account ID
      console.log('🔍 Getting account ID...');
      const accountId = getAccountId();
      console.log('✅ Account ID:', accountId);
      setCurrentAccountId(accountId);
      
      // Load initial leaderboard
      console.log('📊 Loading initial leaderboard...');
      await loadInitialLeaderboard();
      
      // Set up real-time updates
      try {
        const pocketBaseReady = await isSupabaseAvailable();
        console.log('🔗 Supabase available:', pocketBaseReady);
        if (pocketBaseReady) {
          console.log('🔄 Setting up real-time subscription...');
          userDB.subscribeToUsers((updatedUsers: UserAccount[]) => {
            console.log('🔄 Real-time update received, users count:', updatedUsers.length);
            const userAccounts: UserAccountFrontend[] = updatedUsers.map((dbUser: UserAccount) => ({
              id: dbUser.id,
              accountId: dbUser.account_id,
              username: dbUser.username,
              email: dbUser.email,
              hashKey: dbUser.hash_key,
              avatar: dbUser.avatar || '👤',
              score: dbUser.score,
              rank: dbUser.rank,
              studyTime: dbUser.study_time,
              studyTimeFormatted: formatStudyTime(dbUser.study_time),
              createdAt: dbUser.created_at,
              lastActive: dbUser.last_active
            }));
            console.log('📊 Mapped users to frontend format:', userAccounts.length);
            setUsers(userAccounts);
          });
          console.log('✅ Real-time subscription established');
        } else {
          console.log('🔄 Real-time updates disabled (Supabase not available)');
        }
      } catch (error) {
        console.log('🔄 Real-time subscription failed, using fallback mode');
        // Continue without real-time updates
      }
      
      console.log('✅ UserContext initialization complete');
    };
    
    initializeApp();
    
    // Cleanup subscription on unmount
    return () => {
      userDB.unsubscribeFromUsers();
    };
  }, []);


  const loadInitialLeaderboard = async () => {
    console.log('📊 Starting loadInitialLeaderboard...');
    try {
      // Get current account ID for comparison
      const currentAccountId = getAccountId();
      console.log('🔍 Current account ID for comparison:', currentAccountId);
      
      // Check if Supabase is available
      const pocketBaseReady = await isSupabaseAvailable();
      console.log('🔗 Supabase available:', pocketBaseReady);
      
      if (pocketBaseReady) {
        console.log('🗄️ Using Supabase database');
        console.log('📊 Fetching users from Supabase...');
        // Try Supabase first
        const users = await userDB.getAllUsers();
        console.log('📊 Retrieved users from Supabase:', users.length);
        
        if (users && users.length > 0) {
          console.log('📊 Mapping users to frontend format...');
          const userAccounts: UserAccountFrontend[] = users.map((dbUser: UserAccount) => ({
              id: dbUser.id,
              accountId: dbUser.account_id,
              username: dbUser.username,
              email: dbUser.email,
              hashKey: dbUser.hash_key,
              avatar: dbUser.avatar || '👤',
              score: dbUser.score,
              rank: dbUser.rank,
              studyTime: dbUser.study_time,
              studyTimeFormatted: formatStudyTime(dbUser.study_time),
              createdAt: dbUser.created_at,
              lastActive: dbUser.last_active
            }));
          console.log('📊 Mapped users:', userAccounts.length);
          
          // Check if current user exists in the database
          const currentUserExists = userAccounts.some(user => user.accountId === currentAccountId);
          console.log('🔍 Current user exists in database:', currentUserExists);
          
          if (!currentUserExists) {
            console.log('🔧 Current user not found, creating new account...');
            createCurrentAccount();
          } else {
            console.log('✅ Current user found, loading existing users');
            setUsers(userAccounts);
            console.log('✅ Loaded leaderboard from Supabase');
          }
        } else {
          console.log('📊 No users in Supabase, creating new account...');
          createCurrentAccount();
        }
      } else {
        console.log('💾 Using in-memory storage (Supabase not available)');
        // Fallback to in-memory storage
        createCurrentAccount();
      }
    } catch (error) {
      console.log('💾 Using in-memory storage (Supabase error):', error);
      // Fallback to in-memory storage until Supabase is set up
      createCurrentAccount();
    }
    
    console.log('📊 loadInitialLeaderboard complete');
  };

  const createCurrentAccount = async () => {
    console.log('🔧 Creating current account...');
    const accountInfo = getAccountInfo();
    console.log('📋 Account info:', accountInfo);
    
    const currentAccount: UserAccountFrontend = {
      id: '', // Will be set by database
      accountId: accountInfo.accountId,
      username: accountInfo.username,
      email: accountInfo.email,
      hashKey: accountInfo.hashKey,
      avatar: '👤',
      score: 0,
      rank: 1,
      studyTime: 0,
      studyTimeFormatted: formatStudyTime(0),
      createdAt: accountInfo.createdAt,
      lastActive: accountInfo.lastLogin
    };
    
    console.log('💾 Saving account to database...');
    await saveAccountToDatabase(currentAccount);
    console.log('📊 Setting users array with current account');
    setUsers([currentAccount]);
    console.log('✅ Current account created and set');
  };

  const saveAccountToDatabase = async (userAccount: UserAccountFrontend) => {
    try {
      console.log('💾 Saving account to database:', userAccount.accountId);
      console.log('📋 Account data to save:', userAccount);
      
      // Save account to Supabase
      const result = await userDB.upsertUser({
        account_id: userAccount.accountId,
        username: userAccount.username,
        email: userAccount.email,
        hash_key: userAccount.hashKey,
        avatar: userAccount.avatar,
        score: userAccount.score,
        rank: userAccount.rank,
        study_time: userAccount.studyTime,
        created_at: userAccount.createdAt,
        last_active: userAccount.lastActive
      });
      
      console.log('✅ Account saved to database successfully:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Error saving account to database:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return null;
    }
  };

  const getCurrentUser = (): UserAccountFrontend | null => {
    if (!currentAccountId) return null;
    return users.find(user => user.accountId === currentAccountId) || null;
  };

  const updateUserName = (name: string) => {
    if (!currentAccountId) return;
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return { ...user, username: name, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
    
    // Update in PocketBase if available
    isSupabaseAvailable().then(available => {
      if (available) {
        userDB.updateUserProfile(currentAccountId, name).catch((error: any) => {
          console.error('Error updating username:', error);
        });
      }
    });
  };

  const updateUserAvatar = (avatar: string) => {
    if (!currentAccountId) return;
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return { ...user, avatar, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
    
    // Update in PocketBase if available
    const currentUser = users.find(u => u.accountId === currentAccountId);
    if (currentUser) {
      isSupabaseAvailable().then(available => {
        if (available) {
          userDB.updateUserProfile(currentAccountId, currentUser.username, avatar).catch((error: any) => {
            console.error('Error updating avatar:', error);
          });
        }
      });
    }
  };

  const updateUserStudyTime = async (additionalTime: number) => {
    if (!currentAccountId) return;

    const pointsEarned = Math.floor(additionalTime / 10); // 1 point per 10 seconds

    // Accumulate time for database sync
    dbSyncAccumulator.current += additionalTime;

    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return {
            ...user,
            studyTime: user.studyTime + additionalTime,
            score: user.score + pointsEarned,
            lastActive: new Date().toISOString(),
            studyTimeFormatted: formatStudyTime(user.studyTime + additionalTime)
          };
        }
        return user;
      });

      // Sort by score and update ranks
      newUsers.sort((a, b) => b.score - a.score);
      newUsers.forEach((user, index) => {
        user.rank = index + 1;
      });

      // Send to database every 10 seconds
      if (dbSyncAccumulator.current >= 10) {
        const currentUser = newUsers.find(u => u.accountId === currentAccountId);
        if (currentUser) {
          // Check if PocketBase is available before saving
          isSupabaseAvailable().then(available => {
            if (available) {
              userDB.updateUserStudyTime(
                currentAccountId,
                currentUser.studyTime,
                currentUser.score
              ).then(() => {
                console.log('💾 User study time saved to PocketBase');
              }).catch((error: any) => {
                console.error('Error saving user study time:', error);
              });
            } else {
              console.log('💾 PocketBase not available, using in-memory storage');
            }
          });
        }
        dbSyncAccumulator.current = 0;
      }

      return newUsers;
    });

    // Add coins to gamification system
    addCoins(pointsEarned);
  };

  const updateUserScore = async (additionalScore: number) => {
    if (!currentAccountId) return;

    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return { ...user, score: user.score + additionalScore, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
  };

  const getAllDeviceUsers = (): UserAccountFrontend[] => {
    return users.map(user => ({
      ...user,
      studyTimeFormatted: formatStudyTime(user.studyTime)
    })).sort((a, b) => b.score - a.score);
  };

  const setTimerActive = (isActive: boolean) => {
    setIsTimerRunning(isActive);
  };

  const isTimerActive = (): boolean => {
    return isTimerRunning;
  };

  return (
    <UserContext.Provider value={{
      users,
      currentAccountId,
      isTimerRunning,
      getCurrentUser,
      getAllDeviceUsers,
      updateUserName,
      updateUserAvatar,
      updateUserStudyTime,
      updateUserScore,
      setTimerActive,
      isTimerActive
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