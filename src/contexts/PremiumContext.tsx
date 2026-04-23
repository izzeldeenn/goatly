'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';

export interface SubscriptionData {
  plan: SubscriptionPlan;
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean;
}

interface PremiumContextType {
  subscription: SubscriptionData;
  isPremium: boolean;
  isExpired: boolean;
  daysRemaining: number;
  isLoading: boolean;
  subscribeMonthly: () => Promise<boolean>;
  subscribeYearly: () => Promise<boolean>;
  subscribeMonthlyWithCoins: (coins: number) => Promise<boolean>;
  subscribeYearlyWithCoins: (coins: number) => Promise<boolean>;
  subscribeMonthlyWithPayment: () => Promise<boolean>;
  subscribeYearlyWithPayment: () => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  checkSubscription: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const defaultSubscription: SubscriptionData = {
  plan: 'free',
  startDate: null,
  endDate: null,
  autoRenew: false,
};

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData>(defaultSubscription);
  const [isLoading, setIsLoading] = useState(true);

  const isPremium = subscription.plan !== 'free';
  const isExpired = subscription.endDate ? new Date(subscription.endDate) < new Date() : false;
  const daysRemaining = subscription.endDate
    ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(defaultSubscription);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('subscription_plan, subscription_start_date, subscription_end_date, auto_renew')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data) {
        setSubscription(defaultSubscription);
      } else {
        setSubscription({
          plan: data.subscription_plan || 'free',
          startDate: data.subscription_start_date,
          endDate: data.subscription_end_date,
          autoRenew: data.auto_renew || false,
        });

        // Check if expired and reset to free
        if (data.subscription_end_date && new Date(data.subscription_end_date) < new Date()) {
          await supabase
            .from('users')
            .update({
              subscription_plan: 'free',
              subscription_start_date: null,
              subscription_end_date: null,
              auto_renew: false,
            })
            .eq('id', user.id);
          setSubscription(defaultSubscription);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(defaultSubscription);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeMonthly = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { error } = await supabase
        .from('users')
        .update({
          subscription_plan: 'monthly',
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString(),
          auto_renew: false,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error subscribing monthly:', error);
        return false;
      }

      setSubscription({
        plan: 'monthly',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: false,
      });

      return true;
    } catch (error) {
      console.error('Error subscribing monthly:', error);
      return false;
    }
  };

  const subscribeYearly = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      const { error } = await supabase
        .from('users')
        .update({
          subscription_plan: 'yearly',
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString(),
          auto_renew: false,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error subscribing yearly:', error);
        return false;
      }

      setSubscription({
        plan: 'yearly',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: false,
      });

      return true;
    } catch (error) {
      console.error('Error subscribing yearly:', error);
      return false;
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('users')
        .update({
          subscription_plan: 'free',
          subscription_start_date: null,
          subscription_end_date: null,
          auto_renew: false,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error cancelling subscription:', error);
        return false;
      }

      setSubscription(defaultSubscription);
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  };

  const subscribeMonthlyWithCoins = async (coins: number): Promise<boolean> => {
    // This function assumes coins are already deducted by the caller
    return await subscribeMonthly();
  };

  const subscribeYearlyWithCoins = async (coins: number): Promise<boolean> => {
    // This function assumes coins are already deducted by the caller
    return await subscribeYearly();
  };

  const subscribeMonthlyWithPayment = async (): Promise<boolean> => {
    // TODO: Implement payment integration (Stripe, etc.)
    alert('Payment integration coming soon!');
    return false;
  };

  const subscribeYearlyWithPayment = async (): Promise<boolean> => {
    // TODO: Implement payment integration (Stripe, etc.)
    alert('Payment integration coming soon!');
    return false;
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        subscription,
        isPremium,
        isExpired,
        daysRemaining,
        isLoading,
        subscribeMonthly,
        subscribeYearly,
        subscribeMonthlyWithCoins,
        subscribeYearlyWithCoins,
        subscribeMonthlyWithPayment,
        subscribeYearlyWithPayment,
        cancelSubscription,
        checkSubscription,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
