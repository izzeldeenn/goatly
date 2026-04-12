import { supabase } from './supabase';

// Friendship request interface for database (snake_case)
export interface FriendshipRequest {
  id?: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Friendship request interface for frontend (camelCase)
export interface FriendshipRequestFrontend {
  id?: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Friendship interface for database (snake_case)
export interface Friendship {
  id?: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  status: 'active' | 'blocked';
}

// Friendship interface for frontend (camelCase)
export interface FriendshipFrontend {
  id?: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  status: 'active' | 'blocked';
}

// Message interface for database (snake_case)
export interface Message {
  id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  read_at?: string;
  is_deleted: boolean;
}

// Message interface for frontend (camelCase)
export interface MessageFrontend {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  createdAt: string;
  readAt?: string;
  isDeleted: boolean;
}

// Database operations for friendship system
export class FriendshipDB {
  private static instance: FriendshipDB;

  static getInstance(): FriendshipDB {
    if (!FriendshipDB.instance) {
      FriendshipDB.instance = new FriendshipDB();
    }
    return FriendshipDB.instance;
  }

  // Send a friendship request
  async sendFriendRequest(senderId: string, receiverId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('friendship_requests')
        .insert([
          {
            sender_id: senderId,
            receiver_id: receiverId,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get pending friendship requests for a user
  async getPendingRequests(userId: string): Promise<FriendshipRequest[]> {
    try {
      const { data, error } = await supabase
        .from('friendship_requests')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Get sent friendship requests for a user
  async getSentRequests(userId: string): Promise<FriendshipRequest[]> {
    try {
      const { data, error } = await supabase
        .from('friendship_requests')
        .select('*')
        .eq('sender_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Accept friendship request
  async acceptFriendRequest(requestId: string): Promise<boolean> {
    try {
      // Get the request details
      const { data: request, error: fetchError } = await supabase
        .from('friendship_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;
      if (!request) return false;

      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`(user1_id.eq.${request.sender_id},user2_id.eq.${request.receiver_id}), (user1_id.eq.${request.receiver_id},user2_id.eq.${request.sender_id})`)
        .eq('status', 'active')
        .single();

      if (existingFriendship) {
        // Friendship already exists, just delete the request
        const { error: deleteError } = await supabase
          .from('friendship_requests')
          .delete()
          .eq('id', requestId);

        if (deleteError) throw deleteError;
        return true;
      }

      // Create friendship record
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert({
          user1_id: request.sender_id,
          user2_id: request.receiver_id,
          status: 'active'
        });

      if (friendshipError) throw friendshipError;

      // Create conversation record for the new friendship
      const { error: conversationError } = await supabase
        .from('conversations')
        .insert({
          user1_id: request.sender_id,
          user2_id: request.receiver_id,
          last_message: null,
          last_message_at: new Date().toISOString(),
          last_message_sender_id: null,
          other_user_id: request.receiver_id
        });

      if (conversationError) {
        console.error('❌ Error creating conversation:', conversationError);
      }

      // Delete the request after accepting
      const { error: deleteError } = await supabase
        .from('friendship_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  }

  // Reject friendship request
  async rejectFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendship_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      return false;
    }
  }

  // Get user's friends
  async getUserFriends(userId: string): Promise<Friendship[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Check if users are friends
  async areFriends(user1Id: string, user2Id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`(user1_id.eq.${user1Id},user2_id.eq.${user2Id}), (user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      return false;
    }
  }

  // Remove friend
  async removeFriend(user1Id: string, user2Id: string): Promise<boolean> {
    try {
      // Validate input parameters
      if (!user1Id || !user2Id) {
        return false;
      }
      
      if (user1Id === user2Id) {
        return false;
      }
      
      // Try direct delete approach (most reliable)
      try {
        const { data: deleteResult1, error: deleteError1 } = await supabase
          .from('friendships')
          .delete()
          .eq('user1_id', user1Id)
          .eq('user2_id', user2Id)
          .select();
        
        if (deleteError1) {
          // Try reverse order
          const { data: deleteResult2, error: deleteError2 } = await supabase
            .from('friendships')
            .delete()
            .eq('user1_id', user2Id)
            .eq('user2_id', user1Id)
            .select();
          
          if (deleteError2) {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      } catch (deleteError) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // Block user
  async blockUser(user1Id: string, user2Id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'blocked' })
        .or(`(user1_id.eq.${user1Id},user2_id.eq.${user2Id}), (user1_id.eq.${user2Id},user2_id.eq.${user1Id})`);

      if (error) throw error;
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Database operations for messaging system
export class MessageDB {
  private static instance: MessageDB;

  static getInstance(): MessageDB {
    if (!MessageDB.instance) {
      MessageDB.instance = new MessageDB();
    }
    return MessageDB.instance;
  }

  // Send message
  async sendMessage(senderId: string, receiverId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text'): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          message_type: messageType
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return null;
    }
  }

  // Get conversation between two users
  async getConversation(user1Id: string, user2Id: string, limit: number = 50): Promise<Message[]> {
    try {
      if (!user1Id || !user2Id) {
        return [];
      }
      
      // Use two separate queries to avoid complex .or() parsing issues
      const { data: data1, error: error1 } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user1Id)
        .eq('receiver_id', user2Id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data: data2, error: error2 } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user2Id)
        .eq('receiver_id', user1Id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Combine and deduplicate results
      const allData = [...(data1 || []), ...(data2 || [])];
      const uniqueData = allData.filter((msg, index, self) => 
        index === self.findIndex(m => m.id === msg.id)
      );
      
      // Sort by created_at descending
      uniqueData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const error = error1 || error2;
      const data = uniqueData.slice(0, limit);
      
      if (error) {
        // Try a simpler fallback query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('messages')
          .select('*')
          .eq('sender_id', user1Id)
          .eq('receiver_id', user2Id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (fallbackError) {
          throw fallbackError;
        }
        
        return fallbackData || [];
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Get all conversations for a user
  async getUserConversations(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('conversations_base') // Use base table for consistency
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Mark messages as read
  async markAsRead(messageIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds);

      if (error) throw error;
      return true;
    } catch (error) {
      return false;
    }
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get unread messages count for a specific conversation between two users
  async getUnreadCountForConversation(userId: string, otherUserId: string): Promise<number> {
    try {
      if (!userId || !otherUserId) {
        return 0;
      }
      
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_id', otherUserId)
        .eq('receiver_id', userId)
        .is('read_at', null)
        .eq('is_deleted', false);

      if (error) {
        throw error;
      }
      
      const count = data?.length || 0;
      return count;
    } catch (error) {
      return 0;
    }
  }

  // Get unread messages count for a user
  async getUnreadCount(userId: string): Promise<number> {
    try {
      // Validate UUID format
      if (!userId) {
        return 0;
      }
      
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', userId)
        .is('read_at', null)
        .eq('is_deleted', false);

      if (error) {
        throw error;
      }
      
      const count = data?.length || 0;
      return count;
    } catch (error) {
      return 0;
    }
  }
}

// Export singleton instances
export const friendshipDB = FriendshipDB.getInstance();
export const messageDB = MessageDB.getInstance();
