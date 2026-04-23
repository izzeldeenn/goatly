'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';

export interface CoinTransaction {
  id: string;
  user_id: string;
  type: 'earned' | 'spent' | 'refund' | 'bonus' | 'penalty';
  amount: number;
  balance_after: number;
  description: string | null;
  source: string;
  source_id: string | null;
  created_at: string;
}

export interface UserCoins {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

interface CoinsContextType {
  coins: number;
  totalEarned: number;
  totalSpent: number;
  isLoading: boolean;
  addCoins: (amount: number, source: string, description?: string, sourceId?: string) => Promise<boolean>;
  removeCoins: (amount: number, source: string, description?: string, sourceId?: string) => Promise<boolean>;
  getTransactions: (limit?: number) => Promise<CoinTransaction[]>;
  refreshCoins: () => Promise<void>;
}

const CoinsContext = createContext<CoinsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'frogo_coins_balance';
export function CoinsProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const { getCurrentUser } = useUser();

  const LOCAL_STORAGE_KEY = 'user_coins_balance';
  const LOCAL_STORAGE_TIMESTAMP_KEY = 'user_coins_timestamp';

  // Load coins from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBalance = localStorage.getItem(LOCAL_STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(LOCAL_STORAGE_TIMESTAMP_KEY);
      
      if (savedBalance) {
        setCoins(parseInt(savedBalance, 10));
      }
      
      // If localStorage is older than 5 minutes, we'll refresh from database
      if (savedTimestamp) {
        const timestamp = parseInt(savedTimestamp, 10);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (now - timestamp > fiveMinutes) {
          // Will refresh from database when user is loaded
        }
      }
    }
  }, []);

  // Get current user and load their coins from database
  useEffect(() => {
    const loadUserCoins = async () => {
      try {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
          setIsLoading(false);
          return;
        }

        setUserId(currentUser.accountId);

        // Try to get user coins from database
        const { data: userCoins, error } = await supabase
          .from('user_coins')
          .select('*')
          .eq('user_id', currentUser.accountId)
          .maybeSingle();

        if (error) {
          console.error('Error loading user coins:', error);
          setIsLoading(false);
          return;
        }

        if (userCoins) {
          // Update state with database values
          setCoins(userCoins.balance);
          setTotalEarned(userCoins.total_earned);
          setTotalSpent(userCoins.total_spent);
          
          // Update localStorage
          localStorage.setItem(LOCAL_STORAGE_KEY, userCoins.balance.toString());
          localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, Date.now().toString());
        } else {
          // Create user coins record if it doesn't exist (using upsert to handle duplicates)
          const { data: newCoins, error: insertError } = await supabase
            .from('user_coins')
            .upsert({
              user_id: currentUser.accountId,
              balance: 0,
              total_earned: 0,
              total_spent: 0
            }, {
              onConflict: 'user_id'
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user coins:', insertError);
          } else if (newCoins) {
            setCoins(newCoins.balance);
            setTotalEarned(newCoins.total_earned);
            setTotalSpent(newCoins.total_spent);
            localStorage.setItem(LOCAL_STORAGE_KEY, '0');
            localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, Date.now().toString());
          }
        }
      } catch (error) {
        console.error('Error in loadUserCoins:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserCoins();
  }, [getCurrentUser]);

  // Update localStorage whenever coins change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, coins.toString());
      localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, Date.now().toString());
    }
  }, [coins]);

  const addCoins = async (
    amount: number,
    source: string,
    description?: string,
    sourceId?: string
  ): Promise<boolean> => {
    if (!userId || amount <= 0) return false;

    try {
      // Update local state immediately for responsiveness
      const newBalance = coins + amount;
      setCoins(newBalance);
      setTotalEarned(prev => prev + amount);

      // Update database
      const { error: updateError } = await supabase
        .from('user_coins')
        .update({
          balance: newBalance,
          total_earned: totalEarned + amount
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error adding coins:', updateError);
        // Revert local state on error
        setCoins(coins);
        setTotalEarned(totalEarned);
        return false;
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: userId,
          type: 'earned',
          amount: amount,
          balance_after: newBalance,
          description: description || null,
          source: source,
          source_id: sourceId || null
        });

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
      }

      return true;
    } catch (error) {
      console.error('Error in addCoins:', error);
      setCoins(coins);
      setTotalEarned(totalEarned);
      return false;
    }
  };

  const removeCoins = async (
    amount: number,
    source: string,
    description?: string,
    sourceId?: string
  ): Promise<boolean> => {
    if (!userId || amount <= 0) return false;
    if (coins < amount) return false;

    try {
      // Update local state immediately for responsiveness
      const newBalance = coins - amount;
      setCoins(newBalance);
      setTotalSpent(prev => prev + amount);

      // Update database
      const { error: updateError } = await supabase
        .from('user_coins')
        .update({
          balance: newBalance,
          total_spent: totalSpent + amount
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error removing coins:', updateError);
        // Revert local state on error
        setCoins(coins);
        setTotalSpent(totalSpent);
        return false;
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: userId,
          type: 'spent',
          amount: amount,
          balance_after: newBalance,
          description: description || null,
          source: source,
          source_id: sourceId || null
        });

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
      }

      return true;
    } catch (error) {
      console.error('Error in removeCoins:', error);
      setCoins(coins);
      setTotalSpent(totalSpent);
      return false;
    }
  };

  const getTransactions = async (limit: number = 50): Promise<CoinTransaction[]> => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return [];
    }
  };

  const refreshCoins = async () => {
    if (!userId) return;

    try {
      const { data: userCoins, error } = await supabase
        .from('user_coins')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error refreshing coins:', error);
        return;
      }

      if (userCoins) {
        setCoins(userCoins.balance);
        setTotalEarned(userCoins.total_earned);
        setTotalSpent(userCoins.total_spent);
        localStorage.setItem(LOCAL_STORAGE_KEY, userCoins.balance.toString());
        localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, Date.now().toString());
      }
    } catch (error) {
      console.error('Error in refreshCoins:', error);
    }
  };

  return (
    <CoinsContext.Provider
      value={{
        coins,
        totalEarned,
        totalSpent,
        isLoading,
        addCoins,
        removeCoins,
        getTransactions,
        refreshCoins
      }}
    >
      {children}
    </CoinsContext.Provider>
  );
}

export function useCoins() {
  const context = useContext(CoinsContext);
  if (context === undefined) {
    throw new Error('useCoins must be used within a CoinsProvider');
  }
  return context;
}
