// Daily activity tracking system for users

export interface DailyActivity {
  id: string;
  account_id: string;
  date: string; // YYYY-MM-DD
  study_minutes: number;
  study_seconds: number; // Realtime tracking in seconds
  last_updated: string; // Last time the study_seconds was updated
  start_time?: string; // ISO timestamp when study started
  end_time?: string; // ISO timestamp when study ended
  points_earned: number;
  daily_rank: number;
  sessions_count: number;
  focus_score: number; // 0-100 based on consistency
  created_at: string;
  updated_at: string;
}

export interface DailyActivityFrontend {
  id: string;
  accountId: string;
  date: string;
  studyMinutes: number;
  studySeconds: number; // Realtime tracking in seconds
  lastUpdated: string; // Last time the study_seconds was updated
  startTime?: string;
  endTime?: string;
  pointsEarned: number;
  dailyRank: number;
  sessionsCount: number;
  focusScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitySession {
  id: string;
  account_id: string;
  date: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  points_earned: number;
  created_at: string;
}

export interface ActivitySessionFrontend {
  id: string;
  accountId: string;
  date: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  pointsEarned: number;
  createdAt: string;
}

export interface ActivityContribution {
  date: string;
  level: number; // 0-5 activity level (like GitHub contributions)
  studyMinutes: number;
  pointsEarned: number;
  rank?: number;
}

// Database operations for daily activities
export class DailyActivityDB {
  private static instance: DailyActivityDB;

  static getInstance(): DailyActivityDB {
    if (!DailyActivityDB.instance) {
      DailyActivityDB.instance = new DailyActivityDB();
    }
    return DailyActivityDB.instance;
  }

  // Get daily activity for a specific user and date
  async getDailyActivity(accountId: string, date: string): Promise<DailyActivity | null> {
    try {
      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('account_id', accountId)
        .eq('date', date)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results

      if (error) {
        return null;
      }
      return data;
    } catch (error) {
      return null;
    }
  }

  // Get all daily activities for a user
  async getUserDailyActivities(accountId: string, limit = 365): Promise<DailyActivity[]> {
    try {
      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('account_id', accountId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Get all daily activities for all users (for aggregation)
  async getAllDailyActivities(limit = 365): Promise<DailyActivity[]> {
    try {
      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Get today's rankings for all users
  async getTodayRankings(): Promise<DailyActivity[]> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('date', today)
        .order('daily_rank', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Create or update daily activity
  async upsertDailyActivity(activityData: Partial<DailyActivity>): Promise<DailyActivity | null> {
    try {
      const { data, error } = await supabase
        .from('daily_activities')
        .upsert({
          ...activityData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'account_id,date', // Specify conflict columns
          ignoreDuplicates: false // Allow upsert to update existing records
        })
        .select()
        .single();

      if (error) {
        // If it's a duplicate key error, try to update instead
        if (error.code === '23505') {
          return this.updateExistingActivity(activityData);
        }
        
        throw error;
      }
      
      // Update rankings after successful upsert (only if it's been more than 2 minutes)
      const lastRankUpdate = localStorage.getItem('lastRankUpdate');
      const now = Date.now();
      if (!lastRankUpdate || (now - parseInt(lastRankUpdate)) > 120000) {
        await this.updateTodayRankings();
        localStorage.setItem('lastRankUpdate', now.toString());
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }

  // Helper method to update existing activity
  private async updateExistingActivity(activityData: Partial<DailyActivity>): Promise<DailyActivity | null> {
    try {
      // First get existing record
      const { data: existing, error: fetchError } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('account_id', activityData.account_id!)
        .eq('date', activityData.date!)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Update with accumulated values
      const { data, error } = await supabase
        .from('daily_activities')
        .update({
          study_minutes: (existing.study_minutes || 0) + (activityData.study_minutes || 0),
          points_earned: (existing.points_earned || 0) + (activityData.points_earned || 0),
          sessions_count: (existing.sessions_count || 0) + (activityData.sessions_count || 0),
          focus_score: Math.max(existing.focus_score || 0, activityData.focus_score || 0),
          updated_at: new Date().toISOString()
        })
        .eq('account_id', activityData.account_id!)
        .eq('date', activityData.date!)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      // Update rankings after updating activity (only if it's been more than 2 minutes)
      const lastRankUpdate = localStorage.getItem('lastRankUpdate');
      const now = Date.now();
      if (!lastRankUpdate || (now - parseInt(lastRankUpdate)) > 120000) {
        await this.updateTodayRankings();
        localStorage.setItem('lastRankUpdate', now.toString());
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }

  // Update study time in real-time (every 10 seconds)
  async updateStudyTimeRealtime(accountId: string, additionalSeconds: number): Promise<DailyActivity | null> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Validate inputs
      if (!accountId) {
        return null;
      }
      
      if (additionalSeconds <= 0) {
        return null;
      }
      
      // First, try to get existing activity
      const existing = await this.getDailyActivity(accountId, today);
      
      if (existing) {
        // Update existing activity
        const newStudySeconds = (existing.study_seconds || 0) + additionalSeconds;
        const newStudyMinutes = Math.floor(newStudySeconds / 60);
        // Don't add points here - points are added by updateUserStudyTime to avoid double counting
        
        const { data, error } = await supabase
          .from('daily_activities')
          .update({
            study_seconds: newStudySeconds,
            study_minutes: newStudyMinutes,
            last_updated: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('account_id', accountId)
          .eq('date', today)
          .select()
          .single();

        if (error) {
          return null;
        }
        
        // Update rankings after updating activity (only if it's been more than 2 minutes)
        const lastRankUpdate = localStorage.getItem('lastRankUpdate');
        const now = Date.now();
        if (!lastRankUpdate || (now - parseInt(lastRankUpdate)) > 120000) {
          await this.updateTodayRankings();
          localStorage.setItem('lastRankUpdate', now.toString());
        }
        
        // Also update user's last_active timestamp
        await supabase
          .from('users')
          .update({
            last_active: new Date().toISOString()
          })
          .eq('account_id', accountId);
        
        return data;
      } else {
        // Create new activity record
        const studyMinutes = Math.floor(additionalSeconds / 60);
        // Don't add points here - points are added by updateUserStudyTime to avoid double counting
        
        const { data, error } = await supabase
          .from('daily_activities')
          .insert({
            account_id: accountId,
            date: today,
            study_seconds: additionalSeconds,
            study_minutes: studyMinutes,
            sessions_count: 1,
            focus_score: 50, // Initial focus score
            daily_rank: 999, // Will be updated by updateTodayRankings
            last_updated: new Date().toISOString(),
            start_time: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          return null;
        }
        
        // Update rankings after creating activity (only if it's been more than 2 minutes)
        const lastRankUpdate = localStorage.getItem('lastRankUpdate');
        const now = Date.now();
        if (!lastRankUpdate || (now - parseInt(lastRankUpdate)) > 120000) {
          await this.updateTodayRankings();
          localStorage.setItem('lastRankUpdate', now.toString());
        }
        
        // Also update user's last_active timestamp
        await supabase
          .from('users')
          .update({
            last_active: new Date().toISOString()
          })
          .eq('account_id', accountId);
        
        return data;
      }
    } catch (error) {
      return null;
    }
  }

  // Start a study session (simplified - just mark start time)
  async startStudySession(accountId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Check if user exists
      if (!accountId) {
        return false;
      }

      const existing = await this.getDailyActivity(accountId, today);
      
      if (existing) {
        // Update start time if not already set
        if (!existing.start_time) {
          const { data, error } = await supabase
            .from('daily_activities')
            .update({
              start_time: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('account_id', accountId)
            .eq('date', today)
            .select()
            .single();

          if (error) {
            return false;
          }
        }
      } else {
        // Create new activity with start time
        const { data, error } = await supabase
          .from('daily_activities')
          .insert({
            account_id: accountId,
            date: today,
            study_minutes: 0,
            study_seconds: 0,
            points_earned: 0,
            sessions_count: 0,
            focus_score: 50,
            daily_rank: 999, // Will be updated by updateTodayRankings
            start_time: new Date().toISOString(),
            last_updated: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          return false;
        }
        
        // Update rankings after creating activity (only if it's been more than 2 minutes)
        const lastRankUpdate = localStorage.getItem('lastRankUpdate');
        const now = Date.now();
        if (!lastRankUpdate || (now - parseInt(lastRankUpdate)) > 120000) {
          await this.updateTodayRankings();
          localStorage.setItem('lastRankUpdate', now.toString());
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // End a study session (update total study time in user account)
  async endStudySession(accountId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Check if user exists
      if (!accountId) {
        return false;
      }

      // Get today's activity to calculate total session time
      const { data: activity, error: fetchError } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('account_id', accountId)
        .eq('date', today)
        .single();

      if (fetchError) {
        return false;
      }

      // Update end time and calculate total study time for user account
      const { data, error } = await supabase
        .from('daily_activities')
        .update({
          end_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('account_id', accountId)
        .eq('date', today)
        .select()
        .single();

      if (error) {
        return false;
      }

      // Update user's total study time in their account
      if (activity && activity.study_seconds > 0) {
        // Update user's score instead of study_time (column doesn't exist)
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('score')
          .eq('account_id', accountId)
          .single();

        if (!userError && user) {
          // Add points based on study time (1 point per 10 seconds)
          const pointsToAdd = Math.floor(activity.study_seconds / 10);
          await supabase
            .from('users')
            .update({
              score: user.score + pointsToAdd,
              last_active: new Date().toISOString()
            })
            .eq('account_id', accountId);
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  async addStudySession(sessionData: Partial<ActivitySession>): Promise<ActivitySession | null> {
    try {
      const { data, error } = await supabase
        .from('activity_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }

  // Update study session end time
  async updateStudySession(sessionId: string, endTime: string, durationMinutes: number): Promise<ActivitySession | null> {
    try {
      const { data, error } = await supabase
        .from('activity_sessions')
        .update({
          end_time: endTime,
          duration_minutes: durationMinutes
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      // Also update user's last_active timestamp
      if (data) {
        await supabase
          .from('users')
          .update({
            last_active: new Date().toISOString()
          })
          .eq('account_id', data.account_id);
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }

  // Get user's activity contributions for the last year
  async getUserActivityContributions(accountId: string): Promise<ActivityContribution[]> {
    try {
      const activities = await this.getUserDailyActivities(accountId, 365);
      
      return activities.map(activity => {
        // Calculate activity level (0-5) based on study minutes
        let level = 0;
        if (activity.study_minutes > 0) {
          if (activity.study_minutes >= 240) level = 5; // 4+ hours
          else if (activity.study_minutes >= 180) level = 4; // 3+ hours
          else if (activity.study_minutes >= 120) level = 3; // 2+ hours
          else if (activity.study_minutes >= 60) level = 2; // 1+ hour
          else if (activity.study_minutes >= 15) level = 1; // 15+ minutes
          else level = 1; // Any activity less than 15 minutes still shows as level 1
        }

        return {
          date: activity.date,
          level,
          studyMinutes: activity.study_minutes,
          pointsEarned: activity.points_earned,
          rank: activity.daily_rank
        };
      });
    } catch (error) {
      return [];
    }
  }

  // Update daily rankings for all users today
  async updateTodayRankings(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Get all activities for today
      const { data: activities, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('date', today)
        .order('study_minutes', { ascending: false });

      if (error) {
        throw error;
      }

      // Update ranks using batch operation instead of individual requests
      if (activities && activities.length > 0) {
        // Create batch update payload
        const updatePayload = activities.map((activity, index) => ({
          id: activity.id,
          daily_rank: index + 1
        }));

        // Use RPC function for batch update if available, or fall back to individual updates
        // For now, we'll use a more efficient approach with fewer requests
        const batchSize = 10; // Process 10 records at a time
        for (let i = 0; i < updatePayload.length; i += batchSize) {
          const batch = updatePayload.slice(i, i + batchSize);
          
          // Process batch in parallel
          await Promise.all(
            batch.map(({ id, daily_rank }) =>
              supabase
                .from('daily_activities')
                .update({ daily_rank })
                .eq('id', id)
            )
          );
        }
      }
    } catch (error) {
      // Error updating today rankings
    }
  }

  // Subscribe to real-time daily activity changes
  subscribeToDailyActivities(callback: (records: DailyActivity[]) => void) {
    try {
      const subscription = supabase
        .channel('daily_activities_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'daily_activities' },
          async () => {
            // DISABLED: Prevent infinite loop of ranking updates
            // Real-time ranking updates are handled by the 2-minute interval in components
            // Only update rankings if it's been more than 2 minutes since last update
            // const lastRankUpdate = localStorage.getItem('lastRankUpdate');
            // const now = Date.now();
            // const shouldUpdateRankings = !lastRankUpdate || (now - parseInt(lastRankUpdate)) > 120000;
            
            // if (shouldUpdateRankings) {
            //   await this.updateTodayRankings();
            //   localStorage.setItem('lastRankUpdate', now.toString());
            // }
            
            // Just refetch data without updating rankings
            const activities = await this.getTodayRankings();
            callback(activities);
          }
        )
        .subscribe();

      // Initial load
      this.getTodayRankings().then(callback);
      
      return subscription;
    } catch (error) {
      console.error('❌ Error subscribing to daily activities:', error);
    }
  }

  // Unsubscribe from daily activity changes
  unsubscribeFromDailyActivities() {
    try {
      supabase.channel('daily_activities_changes').unsubscribe();
    } catch (error) {
      // Error unsubscribing from daily activities
    }
  }
}

// Export singleton instance
export const dailyActivityDB = DailyActivityDB.getInstance();

// Import supabase client
import { supabase } from './supabase';

// Add this function at the end of the file
export const createTestActivity = async (accountId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // First check if activity already exists
    const { data: existing, error: checkError } = await supabase
      .from('daily_activities')
      .select('*')
      .eq('account_id', accountId)
      .eq('date', today)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      return null;
    }

    if (existing) {
      // Update existing activity with random additional time
      const additionalMinutes = Math.floor(Math.random() * 30) + 10; // 10-40 additional minutes
      const additionalPoints = Math.floor(additionalMinutes / 10); // 1 point per 10 minutes
      
      const { data, error } = await supabase
        .from('daily_activities')
        .update({
          study_minutes: existing.study_minutes + additionalMinutes,
          points_earned: existing.points_earned + additionalPoints,
          sessions_count: existing.sessions_count + 1,
          focus_score: Math.min(100, existing.focus_score + 5),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return null;
      }
      
      return data;
    } else {
      // Create new test activity
      const activity = await dailyActivityDB.upsertDailyActivity({
        account_id: accountId,
        date: today,
        study_minutes: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        points_earned: Math.floor(Math.random() * 50) + 10, // 10-60 points
        sessions_count: Math.floor(Math.random() * 3) + 1, // 1-3 sessions
        focus_score: Math.floor(Math.random() * 40) + 60 // 60-100 focus score
      });
      
      return activity;
    }
  } catch (error) {
    return null;
  }
};
