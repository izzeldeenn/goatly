import { supabase } from './supabase';

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

export class ActivitySessionDB {
  private supabase = supabase;

  // Convert database format to frontend format
  private convertToFrontend(session: ActivitySession): ActivitySessionFrontend {
    return {
      id: session.id,
      accountId: session.account_id,
      date: session.date,
      startTime: session.start_time,
      endTime: session.end_time,
      durationMinutes: session.duration_minutes,
      pointsEarned: session.points_earned,
      createdAt: session.created_at
    };
  }

  // Convert frontend format to database format
  private convertToDB(session: Partial<ActivitySessionFrontend>): Partial<ActivitySession> {
    const dbSession: Partial<ActivitySession> = {};
    
    if (session.id) dbSession.id = session.id;
    if (session.accountId) dbSession.account_id = session.accountId;
    if (session.date) dbSession.date = session.date;
    if (session.startTime) dbSession.start_time = session.startTime;
    if (session.endTime) dbSession.end_time = session.endTime;
    if (session.durationMinutes !== undefined) dbSession.duration_minutes = session.durationMinutes;
    if (session.pointsEarned !== undefined) dbSession.points_earned = session.pointsEarned;
    if (session.createdAt) dbSession.created_at = session.createdAt;
    
    return dbSession;
  }

  // Start a new session
  async startSession(accountId: string): Promise<ActivitySessionFrontend> {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const newSession: Partial<ActivitySession> = {
      account_id: accountId,
      date: date,
      start_time: now.toISOString(),
      duration_minutes: 0,
      points_earned: 0
    };

    const { data, error } = await this.supabase
      .from('activity_sessions')
      .insert(newSession)
      .select()
      .single();

    if (error) {
      console.error('Error starting session:', error);
      throw error;
    }

    return this.convertToFrontend(data);
  }

  // End a session
  async endSession(sessionId: string, durationMinutes: number, pointsEarned: number): Promise<ActivitySessionFrontend> {
    const now = new Date();
    
    const { data, error } = await this.supabase
      .from('activity_sessions')
      .update({
        end_time: now.toISOString(),
        duration_minutes: durationMinutes,
        points_earned: pointsEarned
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error ending session:', error);
      throw error;
    }

    return this.convertToFrontend(data);
  }

  // Get today's sessions for a user
  async getTodaySessions(accountId: string): Promise<ActivitySessionFrontend[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from('activity_sessions')
      .select('*')
      .eq('account_id', accountId)
      .eq('date', today)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error getting today sessions:', error);
      return [];
    }

    return data.map(session => this.convertToFrontend(session));
  }

  // Get total study time for today (in minutes)
  async getTodayStudyTime(accountId: string): Promise<number> {
    const sessions = await this.getTodaySessions(accountId);
    return sessions.reduce((total, session) => total + session.durationMinutes, 0);
  }

  // Get total points for today
  async getTodayPoints(accountId: string): Promise<number> {
    const sessions = await this.getTodaySessions(accountId);
    return sessions.reduce((total, session) => total + session.pointsEarned, 0);
  }

  // Get session history for a user
  async getSessionHistory(accountId: string, limit: number = 50): Promise<ActivitySessionFrontend[]> {
    const { data, error } = await this.supabase
      .from('activity_sessions')
      .select('*')
      .eq('account_id', accountId)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting session history:', error);
      return [];
    }

    return data.map(session => this.convertToFrontend(session));
  }

  // Get active session for a user (session without end_time)
  async getActiveSession(accountId: string): Promise<ActivitySessionFrontend | null> {
    const { data, error } = await this.supabase
      .from('activity_sessions')
      .select('*')
      .eq('account_id', accountId)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error('Error getting active session:', error);
      return null;
    }

    return this.convertToFrontend(data);
  }

  // Update daily activity when session ends
  async updateDailyActivityFromSession(accountId: string, durationMinutes: number, pointsEarned: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // First check if daily activity exists for today
    const { data: existingActivity, error: fetchError } = await this.supabase
      .from('daily_activities')
      .select('*')
      .eq('account_id', accountId)
      .eq('date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking daily activity:', fetchError);
      return;
    }

    if (existingActivity) {
      // Update existing daily activity
      const { error: updateError } = await this.supabase
        .from('daily_activities')
        .update({
          study_minutes: existingActivity.study_minutes + durationMinutes,
          study_seconds: existingActivity.study_seconds + (durationMinutes * 60),
          points_earned: existingActivity.points_earned + pointsEarned,
          sessions_count: existingActivity.sessions_count + 1,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingActivity.id);

      if (updateError) {
        console.error('Error updating daily activity:', updateError);
      }
    } else {
      // Create new daily activity record
      const { error: insertError } = await this.supabase
        .from('daily_activities')
        .insert({
          account_id: accountId,
          date: today,
          study_minutes: durationMinutes,
          study_seconds: durationMinutes * 60,
          points_earned: pointsEarned,
          sessions_count: 1,
          last_updated: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating daily activity:', insertError);
      }
    }
  }
}

export const activitySessionDB = new ActivitySessionDB();
