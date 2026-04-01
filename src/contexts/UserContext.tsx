'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { getAccountId, getAccountInfo } from '@/utils/deviceId';
import { useGamification } from '@/contexts/GamificationContext';
import { formatStudyTime } from '@/utils/timeFormat';
import { userDB, isSupabaseAvailable, UserAccount, UserAccountFrontend } from '@/lib/supabase';
import { dailyActivityDB, DailyActivityFrontend } from '@/lib/dailyActivity';
import { supabase } from '@/lib/supabase';

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
      console.log('🚀 Initializing UserContext...');
      
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
          console.log('🔍 Found existing session for account:', savedAccountId);
          
          // Verify the account still exists in database
          try {
            const user = await userDB.getUserByAccountId(savedAccountId);
            if (user) {
              setCurrentAccountId(savedAccountId);
              setIsLoggedIn(true);
              hasValidSession = true;
              console.log('✅ Existing session restored for:', user.username);
            } else {
              console.log('❌ Saved account not found in database, clearing session');
              localStorage.removeItem('currentAccountId');
              localStorage.removeItem('isLoggedIn');
            }
          } catch (error) {
            console.log('❌ Error verifying saved session, clearing session');
            localStorage.removeItem('currentAccountId');
            localStorage.removeItem('isLoggedIn');
          }
        }
      }
      
      // If no valid session, get/create device account
      if (!hasValidSession) {
        const accountId = getAccountId();
        console.log('🔍 No active session, creating guest account with ID:', accountId);
        setCurrentAccountId(accountId);
        setIsLoggedIn(false);
        createCurrentAccount();
      }
      
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
              createdAt: dbUser.created_at,
              lastActive: dbUser.last_active
            }));
            console.log('📊 Mapped users to frontend format:', userAccounts.length);
            
            // IMPORTANT: Only update other users, preserve current user's local state
            setUsers(prevUsers => {
              return userAccounts.map(updatedUser => {
                if (updatedUser.accountId === currentAccountId) {
                  // For current user, preserve existing local state to avoid overriding changes
                  const currentUser = prevUsers.find(u => u.accountId === currentAccountId);
                  if (currentUser) {
                    // Check timestamps to determine which data is newer
                    const localUsernameTimestamp = parseInt(localStorage.getItem(`username_${currentAccountId}_timestamp`) || '0');
                    const localEmailTimestamp = parseInt(localStorage.getItem(`email_${currentAccountId}_timestamp`) || '0');
                    const localAvatarTimestamp = parseInt(localStorage.getItem(`avatar_${currentAccountId}_timestamp`) || '0');
                    const dbLastActive = new Date(updatedUser.lastActive).getTime();
                    
                    // Keep local state for current user, but update score from database
                    return {
                      ...currentUser,
                      score: updatedUser.score,
                      // Use local data if it was modified more recently than database
                      username: localUsernameTimestamp > dbLastActive ? 
                        localStorage.getItem(`username_${currentAccountId}`) || currentUser.username : 
                        updatedUser.username,
                      email: localEmailTimestamp > dbLastActive ? 
                        localStorage.getItem(`email_${currentAccountId}`) || currentUser.email : 
                        updatedUser.email,
                      avatar: localAvatarTimestamp > dbLastActive ? 
                        localStorage.getItem(`avatar_${currentAccountId}`) || currentUser.avatar : 
                        updatedUser.avatar,
                    };
                  }
                }
                return updatedUser;
              });
            });
          });
        } else {
          console.log('🔄 Real-time subscription failed, using fallback mode');
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
    console.log('🔧 Creating guest account...');
    const accountInfo = getAccountInfo();
    console.log('📋 Account info:', accountInfo);
    
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
        console.log('🔄 Restored username from localStorage:', localUsername);
      }
      
      if (localEmail) {
        savedEmail = localEmail;
        console.log('🔄 Restored email from localStorage:', localEmail);
      }
      
      if (localAvatar) {
        savedAvatar = localAvatar;
        console.log('🔄 Restored avatar from localStorage:', localAvatar);
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
    
    console.log('💾 Saving guest account to database...');
    await saveAccountToDatabase(currentAccount);
    console.log('📊 Setting users array with guest account');
    setUsers([currentAccount]);
    console.log('✅ Guest account created and set');
  };

  const saveAccountToDatabase = async (userAccount: UserAccountFrontend) => {
    try {
      console.log('💾 Saving account to database:', userAccount.accountId);
      console.log('📋 Account data to save:', userAccount);
      
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
        console.log('✅ Account updated successfully:', result);
        
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
        console.log('✅ Account created successfully:', result);
        
        // Update local user object with database UUID
        if (result && result.id) {
          userAccount.id = result.id;
        }
        return result;
      }
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

  const updateUserName = async (name: string) => {
    if (!currentAccountId) return;
    
    // Update in Supabase first to ensure consistency
    try {
      const available = await isSupabaseAvailable();
      if (available) {
        const result = await userDB.updateUserProfile(currentAccountId, name);
        if (!result) {
          console.error('❌ Failed to update username in database');
          return;
        }
        console.log('✅ Username updated in database successfully');
      }
    } catch (error) {
      console.error('❌ Error updating username in database:', error);
      return;
    }
    
    // Only update local state after successful database update
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.accountId === currentAccountId) {
          return { ...user, username: name, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
    
    // Save to localStorage as backup after successful update
    if (typeof window !== 'undefined') {
      localStorage.setItem(`username_${currentAccountId}`, name);
      localStorage.setItem(`username_${currentAccountId}_timestamp`, Date.now().toString());
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
          console.error('❌ Failed to update avatar in database');
          return;
        }
        console.log('✅ Avatar updated in database successfully');
      }
    } catch (error) {
      console.error('❌ Error updating avatar in database:', error);
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
          console.error('❌ Failed to update email in database');
          return;
        }
        console.log('✅ Email updated in database successfully');
      }
    } catch (error) {
      console.error('❌ Error updating email in database:', error);
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
      console.error('Error getting user daily activity:', error);
      return null;
    }
  };

  // Authentication methods
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Attempting login with email:', email);
      
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

      // For now, we'll use simple password comparison
      // In a real app, you'd use proper password hashing (bcrypt, etc.)
      if (users.password !== password) {
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

      console.log('✅ Login successful for:', users.username);
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    
    // Clear session but keep the account data intact
    setCurrentAccountId('');
    setIsLoggedIn(false);
    
    // Clear session from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentAccountId');
      localStorage.removeItem('isLoggedIn');
    }
    
    // Don't create a new account - just clear the session
    // The account remains in database for future login
    console.log('✅ Logged out successfully, account data preserved');
  };

  const switchAccount = async (accountId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔄 Switching to account:', accountId);
      
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

      console.log('✅ Account switch successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Account switch error:', error);
      return { success: false, error: 'Failed to switch account' };
    }
  };

  const register = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('📝 Upgrading guest account to registered user:', email);
      
      // Validation
      if (!email || !password || !username) {
        return { success: false, error: 'All fields are required' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
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

      console.log('🔄 Upgrading existing account:', currentUser.accountId);

      // Update current user's account with email, password, and new username
      const updatedUserData: Partial<UserAccount> = {
        account_id: currentUser.accountId,
        username: username, // Update username
        email: email, // Add email
        password: password, // Add password (in production, this should be hashed)
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

        console.log('✅ Account upgrade successful');
        return { success: true };
      } else {
        return { success: false, error: 'Account upgrade failed' };
      }
    } catch (error) {
      console.error('❌ Account upgrade error:', error);
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