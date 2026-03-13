import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Missing required Supabase environment variables. Please check your .env.local file.');
}

// Validate URL format
if (!supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('localhost:8090')) {
  throw new Error('❌ Invalid Supabase URL format. Please check your environment variables.');
}

// Validate key format
if (supabaseAnonKey.length < 20) {
  throw new Error('❌ Invalid Supabase key format. Please check your environment variables.');
}

console.log('✅ Supabase environment variables validated successfully');

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// User account interface for database (snake_case - matches Supabase)
export interface UserAccount {
  id: string;
  account_id: string;
  username: string;
  email: string;
  hash_key: string;
  avatar?: string;
  score: number;
  rank: number;
  study_time: number;
  created_at: string;
  last_active: string;
}

// User account interface for frontend (camelCase)
export interface UserAccountFrontend {
  id: string;
  accountId: string;
  username: string;
  email: string;
  hashKey: string;
  avatar?: string;
  score: number;
  rank: number;
  studyTime: number;
  studyTimeFormatted: string;
  createdAt: string;
  lastActive: string;
}

// Database operations for user accounts
export class UserAccountDB {
  private static instance: UserAccountDB;

  static getInstance(): UserAccountDB {
    if (!UserAccountDB.instance) {
      UserAccountDB.instance = new UserAccountDB();
    }
    return UserAccountDB.instance;
  }

  // Get all users sorted by score (for leaderboard)
  async getAllUsers(): Promise<UserAccount[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  // Get user by account ID
  async getUserByAccountId(accountId: string): Promise<UserAccount | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('account_id', accountId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by accountId:', error);
      return null;
    }
  }

  // Create or update user (upsert)
  async upsertUser(userData: Partial<UserAccount>): Promise<UserAccount | null> {
    try {
      console.log('🔄 Upserting user with data:', userData);
      
      const { data, error } = await supabase
        .from('users')
        .upsert(userData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase upsert error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('✅ User upserted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error upserting user:', error);
      return null;
    }
  }

  // Update user study time and score
  async updateUserStudyTime(accountId: string, studyTime: number, score: number): Promise<UserAccount | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          study_time: studyTime,
          score: score,
          last_active: new Date().toISOString()
        })
        .eq('account_id', accountId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user study time:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(accountId: string, username: string, avatar?: string): Promise<UserAccount | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          username: username,
          avatar: avatar,
          last_active: new Date().toISOString()
        })
        .eq('account_id', accountId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  // Subscribe to real-time changes
  subscribeToUsers(callback: (records: UserAccount[]) => void) {
    try {
      console.log('🔄 Setting up Supabase real-time subscription...');
      
      // Subscribe to the users table for real-time updates
      const subscription = supabase
        .channel('users_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'users' },
          async (payload) => {
            console.log('🔄 Real-time update received:', payload);
            // Refetch all users when any change occurs
            const users = await this.getAllUsers();
            callback(users);
          }
        )
        .subscribe();

      // Initial load
      this.getAllUsers().then(callback);
      console.log('✅ Supabase real-time subscription established');
      
      return subscription;
    } catch (error) {
      console.error('❌ Error subscribing to users:', error);
    }
  }

  // Unsubscribe from real-time changes
  unsubscribeFromUsers() {
    try {
      supabase.channel('users_changes').unsubscribe();
    } catch (error) {
      console.error('Error unsubscribing from users:', error);
    }
  }

  // Initialize Supabase connection
  async initialize(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      return !error;
    } catch (error) {
      console.error('Supabase initialization failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userDB = UserAccountDB.getInstance();

// Check if Supabase is available
export const isSupabaseAvailable = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};
