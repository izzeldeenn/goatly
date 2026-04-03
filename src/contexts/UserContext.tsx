'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { getAccountId, getAccountInfo } from '@/utils/deviceId';
import { useGamification } from '@/contexts/GamificationContext';
import { formatStudyTime } from '@/utils/timeFormat';
import { userDB, isSupabaseAvailable, UserAccount, UserAccountFrontend } from '@/lib/supabase';
import { dailyActivityDB, DailyActivityFrontend } from '@/lib/dailyActivity';
import { supabase } from '@/lib/supabase';
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/utils/password';

// Convert Supabase DB format to frontend format
const convertToUserAccountFrontend = (dbUser: UserAccount): UserAccountFrontend => ({
  id: dbUser.id,
  accountId: dbUser.account_id,
  username: dbUser.username,
  email: dbUser.email,
  hashKey: dbUser.hash_key,
  avatar: dbUser.avatar,
  score: dbUser.score,
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
  created_at: user.createdAt,
  last_active: user.lastActive
});

interface UserContextType {
  users: UserAccountFrontend[];
  currentAccountId: string;
  isTimerRunning: boolean;
  isLoggedIn: boolean;
  getCurrentUser: () => UserAccountFrontend | null;
  getAllDeviceUsers: () => UserAccountFrontend[];
  updateUserName: (name: string) => void;
  updateUserAvatar: (avatar: string) => void;
  updateUserEmail: (email: string) => void;
  updateUserStudyTime: (additionalTime: number) => void;
  updateUserScore: (additionalScore: number) => void;
  setTimerActive: (active: boolean) => void;
  isTimerActive: () => boolean;
  isVirtualUser: (accountId: string) => boolean;
  getUserDailyActivity: (accountId: string) => Promise<DailyActivityFrontend | null>;
  // New authentication methods
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchAccount: (accountId: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { addCoins } = useGamification();
  const [users, setUsers] = useState<UserAccountFrontend[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string>('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const dbSyncAccumulator = useRef(0);

  useEffect(() => {
    const initializeApp = async () => {
      // Clean up any virtual users data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fahman-hub-virtual-users-state');
        localStorage.removeItem('timerIndicatorActive');
        localStorage.removeItem('timerActive');
      }
      
      // Check for existing session
      let savedAccountId = '';
      let hasValidSession = false;
      
      if (typeof window !== 'undefined') {
        savedAccountId = localStorage.getItem('currentAccountId') || '';
        const savedLoginState = localStorage.getItem('isLoggedIn') === 'true';
        
        if (savedAccountId && savedLoginState) {
          // Verify that account still exists in database
          try {
            const user = await userDB.getUserByAccountId(savedAccountId);
            if (user) {
              setCurrentAccountId(savedAccountId);
              setIsLoggedIn(true);
              hasValidSession = true;
            } else {
              localStorage.removeItem('currentAccountId');
              localStorage.removeItem('isLoggedIn');
            }
          } catch (error) {
            localStorage.removeItem('currentAccountId');
            localStorage.removeItem('isLoggedIn');
          }
        }
      }
      
      // If no valid session, get/create device account
      if (!hasValidSession) {
        const accountId = getAccountId();
        setCurrentAccountId(accountId);
        setIsLoggedIn(false);
        createCurrentAccount();
      }
      
      // Load initial leaderboard
      await loadInitialLeaderboard();
      
      // Set up real-time updates
      try {
        const pocketBaseReady = await isSupabaseAvailable();
        if (pocketBaseReady) {
          userDB.subscribeToUsers((payload: any) => {
            if (payload.eventType === 'INITIAL_LOAD') {
              // Initial load of all users
              const userAccounts: UserAccountFrontend[] = payload.new.map((dbUser: UserAccount) => ({
                id: dbUser.id,
                accountId: dbUser.account_id,
                username: dbUser.username,
                email: dbUser.email,
                hashKey: dbUser.hash_key,
                avatar: dbUser.avatar || '👤',
                score: dbUser.score,
                createdAt: dbUser.created_at,
                lastActive: dbUser.last_active
              }));
              setUsers(userAccounts);
            } else {
              // Handle individual user changes
              const changedUser = payload.new;
              if (changedUser) {
                setUsers(prevUsers => {
                  return prevUsers.map(user => {
                    if (user.accountId === changedUser.account_id) {
                      // For current user, preserve existing local state to avoid overriding changes
                      if (user.accountId === currentAccountId) {
                        const localUsernameTimestamp = parseInt(localStorage.getItem(`username_${currentAccountId}_timestamp`) || '0');
                        const localEmailTimestamp = parseInt(localStorage.getItem(`email_${currentAccountId}_timestamp`) || '0');
                        const localAvatarTimestamp = parseInt(localStorage.getItem(`avatar_${currentAccountId}_timestamp`) || '0');
                        const dbLastActive = new Date(changedUser.last_active).getTime();
                        
                        return {
                          ...user,
                          score: changedUser.score,
                          // Use local data if it was modified more recently than database
                          username: localUsernameTimestamp > dbLastActive ? 
                            localStorage.getItem(`username_${currentAccountId}`) || user.username : 
                            changedUser.username,
                          email: localEmailTimestamp > dbLastActive ? 
                            localStorage.getItem(`email_${currentAccountId}`) || user.email : 
                            changedUser.email,
                          avatar: localAvatarTimestamp > dbLastActive ? 
                            localStorage.getItem(`avatar_${currentAccountId}`) || user.avatar : 
                            changedUser.avatar,
                        };
                      } else {
                        // For other users, update all fields
                        return {
                          ...user,
                          username: changedUser.username,
                          email: changedUser.email,
                          avatar: changedUser.avatar || '👤',
                          score: changedUser.score,
                          lastActive: changedUser.last_active
                        };
                      }
                    }
                    return user;
                  });
                });
              } else if (payload.eventType === 'DELETE') {
                // Handle user deletion
                const deletedUserId = payload.old.account_id;
                setUsers(prevUsers => prevUsers.filter(user => user.accountId !== deletedUserId));
              }
            }
          });
        }
      } catch (error) {
        // Continue without real-time updates
      }
      
    };
    
    initializeApp();
    
    // Cleanup subscription on unmount
    return () => {
      userDB.unsubscribeFromUsers();
    };
  }, []);


  const loadInitialLeaderboard = async () => {
    try {
      // Get current account ID for comparison
      const currentAccountId = getAccountId();
      
      // Check if Supabase is available
      const pocketBaseReady = await isSupabaseAvailable();
      
      if (pocketBaseReady) {
        // Try Supabase first
        const users = await userDB.getAllUsers();
        
        if (users && users.length > 0) {
          const userAccounts: UserAccountFrontend[] = users.map((dbUser: UserAccount) => ({
              id: dbUser.id,
              accountId: dbUser.account_id,
              username: dbUser.username,
              email: dbUser.email,
              hashKey: dbUser.hash_key,
              avatar: dbUser.avatar || '👤',
              score: dbUser.score,
              createdAt: dbUser.created_at,
              lastActive: dbUser.last_active
            }));
          
          // Check if current user exists in the database
          const currentUserExists = userAccounts.some(user => user.accountId === currentAccountId);
          
          if (!currentUserExists) {
            createCurrentAccount();
          } else {
            setUsers(userAccounts);
          }
        } else {
          createCurrentAccount();
        }
      } else {
        // Fallback to in-memory storage
        createCurrentAccount();
      }
    } catch (error) {
      // Fallback to in-memory storage until Supabase is set up
      createCurrentAccount();
    }
  };

  const createCurrentAccount = async () => {
    const accountInfo = getAccountInfo();
    
    // Restore username, email, and avatar from localStorage if available
    let savedUsername = accountInfo.username;
    let savedEmail = accountInfo.email;
    let savedAvatar = '👤';
    
    if (typeof window !== 'undefined') {
      const localUsername = localStorage.getItem(`username_${accountInfo.accountId}`);
      const localEmail = localStorage.getItem(`email_${accountInfo.accountId}`);
      const localAvatar = localStorage.getItem(`avatar_${accountInfo.accountId}`);
      
      if (localUsername) {
        savedUsername = localUsername;
      }
      
      if (localEmail) {
        savedEmail = localEmail;
      }
      
      if (localAvatar) {
        savedAvatar = localAvatar;
      }
    }
    
    const currentAccount: UserAccountFrontend = {
      id: undefined, // Will be set by database
      accountId: accountInfo.accountId,
      username: savedUsername,
      email: savedEmail,
      hashKey: accountInfo.hashKey,
      avatar: savedAvatar,
      score: 0,
      createdAt: accountInfo.createdAt,
      lastActive: accountInfo.lastLogin
    };
    
    await saveAccountToDatabase(currentAccount);
    setUsers([currentAccount]);
  };

  const saveAccountToDatabase = async (userAccount: UserAccountFrontend) => {
    try {
      // First check if account exists
      const existingUser = await userDB.getUserByAccountId(userAccount.accountId);
      
      if (existingUser) {
        // Update existing account
        const result = await userDB.updateUserByAccountId(userAccount.accountId, {
          account_id: userAccount.accountId,
          username: userAccount.username,
          email: userAccount.email,
          hash_key: userAccount.hashKey,
          avatar: userAccount.avatar,
          score: userAccount.score,
          created_at: userAccount.createdAt,
          last_active: userAccount.lastActive
        });
        
        // Update local user object with database UUID
        if (result && result.id) {
          userAccount.id = result.id;
        }
        return result;
      } else {
        // Create new account
        const result = await userDB.upsertUser({
          account_id: userAccount.accountId,
          username: userAccount.username,
          email: userAccount.email,
          hash_key: userAccount.hashKey,
          avatar: userAccount.avatar,
          score: userAccount.score,
          created_at: userAccount.createdAt,
          last_active: userAccount.lastActive
        });
        
        // Update local user object with database UUID
        if (result && result.id) {
          userAccount.id = result.id;
        }
        return result;
      }
    } catch (error: any) {
      return null;
    }
  };

  const getCurrentUser = (): UserAccountFrontend | null => {
    if (!currentAccountId) return null;
    return users.find(user => user.accountId === currentAccountId) || null;
  };

  const updateUserName = async (name: string) => {
    if (!currentAccountId) return;
    
    // Update in Supabase first to ensure consistency
    try {
      const available = await isSupabaseAvailable();
      if (available) {
        const result = await userDB.updateUserProfile(currentAccountId, name);
        if (!result) {
          return;
        }
      }
    } catch (error) {
      // Error updating username in database
    }
  };

  const updateUserAvatar = async (avatar: string) => {
    if (!currentAccountId) return;
    
    // Update in Supabase first to ensure consistency
    try {
      const available = await isSupabaseAvailable();
      if (available) {
        const result = await userDB.updateUserProfile(currentAccountId, '', avatar);
        if (!result) {
          return;
        }
      }
    } catch (error) {
      // Error updating avatar in database
      return;
    }
    
    // Only update local state after successful database update
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return { ...user, avatar, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
    
    // Save to localStorage as backup after successful update
    if (typeof window !== 'undefined') {
      localStorage.setItem(`avatar_${currentAccountId}`, avatar);
      localStorage.setItem(`avatar_${currentAccountId}_timestamp`, Date.now().toString());
    }
  };

  const updateUserEmail = async (email: string) => {
    if (!currentAccountId) return;
    
    // Update in Supabase first to ensure consistency
    try {
      const available = await isSupabaseAvailable();
      if (available) {
        const result = await userDB.updateUserByAccountId(currentAccountId, { email });
        if (!result) {
          return;
        }
      }
    } catch (error) {
      // Error updating email in database
      return;
    }
    
    // Only update local state after successful database update
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return { ...user, email, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
    
    // Save to localStorage as backup after successful update
    if (typeof window !== 'undefined') {
      localStorage.setItem(`email_${currentAccountId}`, email);
      localStorage.setItem(`email_${currentAccountId}_timestamp`, Date.now().toString());
    }
  };

  const updateUserStudyTime = async (additionalTime: number) => {
    if (!currentAccountId) return;

    const pointsEarned = Math.floor(additionalTime / 10); // 1 point per 10 seconds

    // Only update local state, not database (to avoid double counting)
    // Database will be updated by endStudySession
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return {
            ...user,
            score: user.score + pointsEarned,
            lastActive: new Date().toISOString()
          };
        }
        return user;
      });

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
    // Return only real users, no virtual users
    return users.map(user => ({
      ...user
    }));
  };

  const isVirtualUser = (accountId: string): boolean => {
    // Always return false since we removed virtual users
    return false;
  };

  const setTimerActive = (isActive: boolean) => {
    setIsTimerRunning(isActive);
  };

  const isTimerActive = (): boolean => {
    return isTimerRunning;
  };

  const getUserDailyActivity = async (accountId: string): Promise<DailyActivityFrontend | null> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const activity = await dailyActivityDB.getDailyActivity(accountId, today);
      
      if (!activity) return null;
      
      return {
        id: activity.id,
        accountId: activity.account_id,
        date: activity.date,
        studyMinutes: activity.study_minutes,
        studySeconds: activity.study_seconds || 0,
        lastUpdated: activity.last_updated || activity.updated_at,
        startTime: activity.start_time,
        endTime: activity.end_time,
        pointsEarned: activity.points_earned,
        dailyRank: activity.daily_rank,
        sessionsCount: activity.sessions_count,
        focusScore: activity.focus_score,
        createdAt: activity.created_at,
        updatedAt: activity.updated_at
      };
    } catch (error) {
      return null;
    }
  };

  // Authentication methods
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Find user by email
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !users) {
        return { success: false, error: 'User not found' };
      }

      // Check if user has a password (registered user)
      if (!users.password) {
        return { success: false, error: 'This account has not been upgraded with a password yet' };
      }

      // Verify password using bcrypt
      const isPasswordValid = await verifyPassword(password, users.password);
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid password' };
      }

      // Set current account and mark as logged in
      setCurrentAccountId(users.account_id);
      setIsLoggedIn(true);
      
      // Store session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentAccountId', users.account_id);
        localStorage.setItem('isLoggedIn', 'true');
        // Save email to localStorage for preservation
        localStorage.setItem(`email_${users.account_id}`, users.email);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    // Clear session but keep account data intact
    setCurrentAccountId('');
    setIsLoggedIn(false);
    
    // Clear session from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentAccountId');
      localStorage.removeItem('isLoggedIn');
    }
    
    // Don't create a new account - just clear session
    // The account remains in database for future login
  };

  const switchAccount = async (accountId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = await userDB.getUserByAccountId(accountId);
      if (!user) {
        return { success: false, error: 'Account not found' };
      }

      setCurrentAccountId(accountId);
      setIsLoggedIn(true);
      
      // Store session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentAccountId', accountId);
        localStorage.setItem('isLoggedIn', 'true');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to switch account' };
    }
  };

  const register = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validation
      if (!email || !password || !username) {
        return { success: false, error: 'All fields are required' };
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      if (!email.includes('@')) {
        return { success: false, error: 'Invalid email address' };
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Get current user to upgrade their existing account
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'No current user found' };
      }

      // Hash password before storing
      const hashedPassword = await hashPassword(password);

      // Update current user's account with email, hashed password, and new username
      const updatedUserData: Partial<UserAccount> = {
        account_id: currentUser.accountId,
        username: username, // Update username
        email: email, // Add email
        password: hashedPassword, // Add hashed password
        avatar: currentUser.avatar, // Keep existing avatar
        score: currentUser.score, // Keep existing score
        created_at: currentUser.createdAt, // Keep original creation date
        last_active: new Date().toISOString(), // Update last active
        hash_key: currentUser.hashKey // Keep existing hash key
      };

      const result = await userDB.updateUserByAccountId(currentUser.accountId, updatedUserData);
      
      if (result) {
        // Mark as logged in
        setIsLoggedIn(true);
        
        // Store session in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentAccountId', currentUser.accountId);
          localStorage.setItem('isLoggedIn', 'true');
        }

        // Update local state with new user data
        setUsers(prevUsers => {
          return prevUsers.map(user => {
            if (user.accountId === currentUser.accountId) {
              return {
                ...user,
                username: username,
                email: email,
                lastActive: new Date().toISOString()
              };
            }
            return user;
          });
        });

        // Save email to localStorage for preservation
        if (typeof window !== 'undefined') {
          localStorage.setItem(`email_${currentUser.accountId}`, email);
          localStorage.setItem(`username_${currentUser.accountId}`, username);
        }

        return { success: true };
      } else {
        return { success: false, error: 'Account upgrade failed' };
      }
    } catch (error) {
      return { success: false, error: 'Account upgrade failed' };
    }
  };

  return (
    <UserContext.Provider value={{
      users,
      currentAccountId,
      isTimerRunning,
      isLoggedIn,
      getCurrentUser,
      getAllDeviceUsers,
      updateUserName,
      updateUserAvatar,
      updateUserEmail,
      updateUserStudyTime,
      updateUserScore,
      setTimerActive,
      isTimerActive,
      isVirtualUser,
      getUserDailyActivity,
      login,
      logout,
      switchAccount,
      register
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

// Export the context directly for components that need it
export { UserContext };