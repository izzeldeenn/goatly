import { supabase } from './supabase';

export interface SocialPost {
  id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  content: string;
  likes: number;
  comments: number;
  created_at: string;
  updated_at: string;
}

export interface SocialComment {
  id: string;
  post_id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface GroupPostLike {
  id: string;
  group_post_id: string;
  user_id: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  creator_username: string;
  creator_avatar: string;
  members_count: number;
  posts_count: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface GroupPost {
  id: string;
  group_id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  content: string;
  likes: number;
  comments: number;
  created_at: string;
  updated_at: string;
}

export interface GroupComment {
  id: string;
  group_post_id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'group_invite' | 'post_approved' | 'admin_announcement';
  user_id: string;
  username: string;
  user_avatar: string;
  message: string;
  created_at: string;
  read: boolean;
  related_post_id?: string;
  related_user_id?: string;
}

export interface AdminNotificationRequest {
  message: string;
  type: 'admin_announcement' | 'system_update' | 'maintenance' | 'welcome';
  targetUsers?: string[]; // Array of user accountIds, if empty send to all users
  targetGroups?: string[]; // Array of group IDs
  sendToAll?: boolean; // Send to all users
  priority?: 'low' | 'medium' | 'high';
  scheduledAt?: string; // ISO date string for scheduled sending
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'admin_announcement' | 'system_update' | 'maintenance' | 'welcome';
  message: string;
  variables?: string[]; // Variables that can be substituted in message
  created_at: string;
  updated_at: string;
}

export class SocialDB {
  private supabase = supabase;

  // Create a new post
  async createPost(userId: string, username: string, userAvatar: string, content: string): Promise<SocialPost | null> {
    try {
      console.log('Creating post with data:', { userId, username, userAvatar, content });
      
      // Check current authentication status
      const { data: authData } = await this.supabase.auth.getUser();
      console.log('Current auth data:', authData);
      console.log('Auth uid:', authData?.user?.id);
      console.log('User ID type:', typeof authData?.user?.id);
      console.log('Passed userId:', userId);
      console.log('Passed userId type:', typeof userId);
      
      // Use the authenticated user's ID for the post, not the local accountId
      const postUserId = authData?.user?.id || userId;
      console.log('Using postUserId:', postUserId);
      
      const { data, error } = await this.supabase
        .from('social_posts')
        .insert({
          user_id: postUserId,
          username: username,
          user_avatar: userAvatar,
          content: content,
          likes: 0,
          comments: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        console.error('Error details:', error.message, error.code, error.hint);
        return null;
      }

      console.log('Post created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  // Get all posts with user info
  async getPosts(limit: number = 20, offset: number = 0): Promise<SocialPost[]> {
    try {
      const { data, error } = await this.supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  // Get comments for a post
  async getComments(postId: string): Promise<SocialComment[]> {
    try {
      const { data, error } = await this.supabase
        .from('social_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Create a comment
  async createComment(postId: string, userId: string, username: string, userAvatar: string, content: string): Promise<SocialComment | null> {
    try {
      // Get authenticated user ID
      const { data: authData } = await this.supabase.auth.getUser();
      const commentUserId = authData?.user?.id || userId;

      const { data, error } = await this.supabase
        .from('social_comments')
        .insert({
          post_id: postId,
          user_id: commentUserId,
          username: username,
          user_avatar: userAvatar,
          content: content
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        return null;
      }

      // Update comment count on post
      await this.updatePostCommentCount(postId, 1);

      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  }

  // Like or unlike a post
  async togglePostLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      // Get authenticated user ID
      const { data: authData } = await this.supabase.auth.getUser();
      const likeUserId = authData?.user?.id || userId;

      // Check if user already liked the post
      const { data: existingLike } = await this.supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', likeUserId)
        .single();

      if (existingLike) {
        // Unlike the post
        await this.supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', likeUserId);

        await this.updatePostLikeCount(postId, -1);
        return { liked: false, likesCount: existingLike.post_likes - 1 };
      } else {
        // Like the post
        await this.supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: likeUserId
          });

        await this.updatePostLikeCount(postId, 1);
        
        // Get updated post to return new like count
        const { data: post } = await this.supabase
          .from('social_posts')
          .select('likes')
          .eq('id', postId)
          .single();

        return { liked: true, likesCount: post?.likes || 0 };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return { liked: false, likesCount: 0 };
    }
  }

  // Check if user liked a post
  async didUserLikePost(postId: string, userId: string): Promise<boolean> {
    try {
      // Get authenticated user ID
      const { data: authData } = await this.supabase.auth.getUser();
      const checkUserId = authData?.user?.id || userId;

      const { data, error } = await this.supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', checkUserId)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }

  // Update post like count
  private async updatePostLikeCount(postId: string, increment: number): Promise<void> {
    try {
      await this.supabase.rpc('increment_post_likes', {
        post_id: postId,
        increment_amount: increment
      });
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  }

  // Like or unlike a group post
  async toggleGroupPostLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      // Get authenticated user ID
      const { data: authData } = await this.supabase.auth.getUser();
      const likeUserId = authData?.user?.id || userId;

      // Check if user already liked the group post
      const { data: existingLike } = await this.supabase
        .from('group_post_likes')
        .select('*')
        .eq('group_post_id', postId)
        .eq('user_id', likeUserId)
        .single();

      if (existingLike) {
        // Unlike the group post
        await this.supabase
          .from('group_post_likes')
          .delete()
          .eq('group_post_id', postId)
          .eq('user_id', likeUserId);

        await this.updateGroupPostLikeCount(postId, -1);
        
        // Get updated post to return new like count
        const { data: post } = await this.supabase
          .from('group_posts')
          .select('likes')
          .eq('id', postId)
          .single();

        return { liked: false, likesCount: post?.likes || 0 };
      } else {
        // Like the group post
        await this.supabase
          .from('group_post_likes')
          .insert({
            group_post_id: postId,
            user_id: likeUserId
          });

        await this.updateGroupPostLikeCount(postId, 1);
        
        // Get updated post to return new like count
        const { data: post } = await this.supabase
          .from('group_posts')
          .select('likes')
          .eq('id', postId)
          .single();

        return { liked: true, likesCount: post?.likes || 0 };
      }
    } catch (error) {
      console.error('Error toggling group post like:', error);
      return { liked: false, likesCount: 0 };
    }
  }

  // Check if user liked a group post
  async didUserLikeGroupPost(postId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('group_post_likes')
        .select('*')
        .eq('group_post_id', postId)
        .eq('user_id', userId)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }

  // Update group post like count
  private async updateGroupPostLikeCount(postId: string, increment: number): Promise<void> {
    try {
      // Get current like count
      const { data: post } = await this.supabase
        .from('group_posts')
        .select('likes')
        .eq('id', postId)
        .single();
      
      if (post) {
        const newLikes = Math.max(0, post.likes + increment);
        await this.supabase
          .from('group_posts')
          .update({ likes: newLikes })
          .eq('id', postId);
      }
    } catch (error) {
      console.error('Error updating group post like count:', error);
    }
  }

  // Delete a group post
  async deleteGroupPost(postId: string, userId: string): Promise<boolean> {
    try {
      // Get post to verify ownership
      const { data: post } = await this.supabase
        .from('group_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (!post || post.user_id !== userId) {
        return false;
      }

      // Delete the post
      const { error } = await this.supabase
        .from('group_posts')
        .delete()
        .eq('id', postId);

      return !error;
    } catch (error) {
      console.error('Error deleting group post:', error);
      return false;
    }
  }

  // Delete a group comment
  async deleteGroupComment(commentId: string, userId: string): Promise<boolean> {
    try {
      // Get comment to verify ownership
      const { data: comment } = await this.supabase
        .from('group_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (!comment || comment.user_id !== userId) {
        return false;
      }

      // Delete the comment
      const { error } = await this.supabase
        .from('group_comments')
        .delete()
        .eq('id', commentId);

      return !error;
    } catch (error) {
      console.error('Error deleting group comment:', error);
      return false;
    }
  }

  // Update a group post
  async updateGroupPost(postId: string, userId: string, content: string): Promise<boolean> {
    try {
      // Get post to verify ownership
      const { data: post } = await this.supabase
        .from('group_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (!post || post.user_id !== userId) {
        return false;
      }

      // Update the post
      const { error } = await this.supabase
        .from('group_posts')
        .update({ content })
        .eq('id', postId);

      return !error;
    } catch (error) {
      console.error('Error updating group post:', error);
      return false;
    }
  }

  // Update a group comment
  async updateGroupComment(commentId: string, userId: string, content: string): Promise<boolean> {
    try {
      // Get comment to verify ownership
      const { data: comment } = await this.supabase
        .from('group_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (!comment || comment.user_id !== userId) {
        return false;
      }

      // Update the comment
      const { error } = await this.supabase
        .from('group_comments')
        .update({ content })
        .eq('id', commentId);

      return !error;
    } catch (error) {
      console.error('Error updating group comment:', error);
      return false;
    }
  }

  // Update post comment count
  private async updatePostCommentCount(postId: string, increment: number): Promise<void> {
    try {
      await this.supabase.rpc('increment_post_comments', {
        post_id: postId,
        increment_amount: increment
      });
    } catch (error) {
      console.error('Error updating comment count:', error);
    }
  }

  // Get posts by user
  async getUserPosts(userId: string, limit: number = 10): Promise<SocialPost[]> {
    try {
      // Get authenticated user ID
      const { data: authData } = await this.supabase.auth.getUser();
      const postsUserId = authData?.user?.id || userId;

      const { data, error } = await this.supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', postsUserId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  }

  // Delete a post (only by owner)
  async deletePost(postId: string, userId: string): Promise<boolean> {
    try {
      // Get authenticated user ID
      const { data: authData } = await this.supabase.auth.getUser();
      const deleteUserId = authData?.user?.id || userId;

      const { error } = await this.supabase
        .from('social_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', deleteUserId);

      return !error;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }

  // Delete a comment (only by owner)
  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    try {
      // Get authenticated user ID
      const { data: authData } = await this.supabase.auth.getUser();
      const deleteUserId = authData?.user?.id || userId;

      const { error } = await this.supabase
        .from('social_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', deleteUserId);

      if (!error) {
        // Get post_id to update comment count
        const { data: comment } = await this.supabase
          .from('social_comments')
          .select('post_id')
          .eq('id', commentId)
          .single();

        if (comment) {
          await this.updatePostCommentCount(comment.post_id, -1);
        }
      }

      return !error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  // GROUP METHODS

  // Create a new group
  async createGroup(name: string, description: string, isPrivate: boolean, creatorId: string, creatorUsername: string, creatorAvatar: string): Promise<Group | null> {
    try {
      console.log('Creating group with data:', { name, description, isPrivate, creatorId, creatorUsername, creatorAvatar });
      
      const { data: authData } = await this.supabase.auth.getUser();
      const groupCreatorId = authData?.user?.id || creatorId;
      
      console.log('Using creator ID:', groupCreatorId);

      // First check if groups table exists
      console.log('Checking if groups table exists...');
      const { data: tableCheck, error: tableError } = await this.supabase
        .from('groups')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error('❌ GROUPS TABLE DOES NOT EXIST OR IS NOT ACCESSIBLE!');
        console.error('Table error:', tableError);
        console.error('🔧 SOLUTION: Run this SQL script in Supabase SQL Editor:');
        console.error('📁 File: /database/simple_groups_setup.sql');
        console.error('📋 Copy the entire content and paste it in Supabase SQL Editor, then run it.');
        return null;
      }
      
      console.log('✅ Groups table exists, proceeding with group creation...');

      const insertData = {
        name: name,
        description: description,
        creator_id: groupCreatorId,
        creator_username: creatorUsername,
        creator_avatar: creatorAvatar,
        members_count: 1,
        posts_count: 0,
        is_private: isPrivate
      };

      console.log('Insert data prepared:', insertData);

      const { data, error } = await this.supabase
        .from('groups')
        .insert(insertData)
        .select()
        .single();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Error creating group:', error);
        
        // Simple and direct error display
        alert('GROUP CREATION ERROR: ' + JSON.stringify(error, null, 2));
        console.log('🔍 ERROR MESSAGE:', error.message);
        console.log('🔍 ERROR CODE:', error.code);
        console.log('🔍 ERROR HINT:', error.hint);
        console.log('🔍 ERROR DETAILS:', error.details);
        console.log('🔍 FULL ERROR:', JSON.stringify(error));
        
        return null;
      }

      console.log('Group created successfully:', data);

      // Add creator as admin member
      await this.addGroupMember(data.id, groupCreatorId, creatorUsername, creatorAvatar, 'admin');

      return data;
    } catch (error) {
      console.error('Unexpected error creating group:', error);
      return null;
    }
  }

  // Get all groups
  async getGroups(limit: number = 20, offset: number = 0): Promise<Group[]> {
    try {
      const { data, error } = await this.supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching groups:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  // Get groups user is a member of
  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      const groupsUserId = authData?.user?.id || userId;

      console.log('Fetching groups for user:', groupsUserId);

      // First check if group_members table exists
      const { data: tableCheck, error: tableError } = await this.supabase
        .from('group_members')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error('Group_members table may not exist. Error:', tableError);
        console.error('Please run the SQL script in database/simple_groups_setup.sql');
        return [];
      }

      console.log('Group_members table exists, fetching user groups...');

      // Try a simpler query first to debug
      const { data: memberData, error: memberError } = await this.supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', groupsUserId);

      if (memberError) {
        console.error('Error fetching group memberships:', memberError);
        console.error('Member error details:', {
          message: memberError.message,
          code: memberError.code,
          hint: memberError.hint,
          details: memberError.details
        });
        return [];
      }

      console.log('User memberships found:', memberData);

      if (!memberData || memberData.length === 0) {
        console.log('User is not a member of any groups');
        return [];
      }

      // Now get the actual group details
      const groupIds = memberData.map(m => m.group_id);
      const { data: groupsData, error: groupsError } = await this.supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);

      if (groupsError) {
        console.error('Error fetching group details:', groupsError);
        console.error('Groups error details:', {
          message: groupsError.message,
          code: groupsError.code,
          hint: groupsError.hint,
          details: groupsError.details
        });
        return [];
      }

      console.log('Groups data fetched:', groupsData);

      return (groupsData as Group[]) || [];
    } catch (error) {
      console.error('Unexpected error fetching user groups:', error);
      return [];
    }
  }

  // Join a group
  async joinGroup(groupId: string, userId: string, username: string, userAvatar: string): Promise<boolean> {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      const joinUserId = authData?.user?.id || userId;

      // Check if already a member
      const { data: existingMember } = await this.supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', joinUserId)
        .single();

      if (existingMember) {
        return false; // Already a member
      }

      // Add as member
      const { error: memberError } = await this.supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: joinUserId,
          username: username,
          user_avatar: userAvatar,
          role: 'member'
        });

      if (memberError) {
        console.error('Error joining group:', memberError);
        return false;
      }

      // Update member count
      await this.supabase.rpc('increment_group_members', {
        group_id: groupId,
        increment_amount: 1
      });

      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      return false;
    }
  }

  // Leave a group
  async leaveGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      const leaveUserId = authData?.user?.id || userId;

      const { error } = await this.supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', leaveUserId);

      if (error) {
        console.error('Error leaving group:', error);
        return false;
      }

      // Update member count
      await this.supabase.rpc('increment_group_members', {
        group_id: groupId,
        increment_amount: -1
      });

      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      return false;
    }
  }

  // Add group member (internal use)
  private async addGroupMember(groupId: string, userId: string, username: string, userAvatar: string, role: 'admin' | 'moderator' | 'member'): Promise<boolean> {
    try {
      console.log('Adding group member:', { groupId, userId, username, role });
      
      // Check if group_members table exists
      const { data: tableCheck, error: tableError } = await this.supabase
        .from('group_members')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error('Group_members table may not exist. Error:', tableError);
        return false;
      }

      const { error } = await this.supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          username: username,
          user_avatar: userAvatar,
          role: role
        });

      if (error) {
        console.error('Error adding group member:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details
        });
        return false;
      }

      console.log('Group member added successfully');
      return true;
    } catch (error) {
      console.error('Unexpected error adding group member:', error);
      return false;
    }
  }

  // Get group posts
  async getGroupPosts(groupId: string, limit: number = 20, offset: number = 0): Promise<GroupPost[]> {
    try {
      const { data, error } = await this.supabase
        .from('group_posts')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching group posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching group posts:', error);
      return [];
    }
  }

  // Create a group post
  async createGroupPost(groupId: string, userId: string, username: string, userAvatar: string, content: string): Promise<GroupPost | null> {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      const postUserId = authData?.user?.id || userId;

      // Check if user is a member
      const { data: membership } = await this.supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', postUserId)
        .single();

      if (!membership) {
        console.error('User is not a member of the group');
        return null;
      }

      const { data, error } = await this.supabase
        .from('group_posts')
        .insert({
          group_id: groupId,
          user_id: postUserId,
          username: username,
          user_avatar: userAvatar,
          content: content,
          likes: 0,
          comments: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating group post:', error);
        return null;
      }

      // Update group posts count
      await this.supabase.rpc('increment_group_posts', {
        group_id: groupId,
        increment_amount: 1
      });

      return data;
    } catch (error) {
      console.error('Error creating group post:', error);
      return null;
    }
  }

  // Get group comments
  async getGroupComments(groupPostId: string): Promise<GroupComment[]> {
    try {
      const { data, error } = await this.supabase
        .from('group_comments')
        .select('*')
        .eq('group_post_id', groupPostId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching group comments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching group comments:', error);
      return [];
    }
  }

  // Create a group comment
  async createGroupComment(groupPostId: string, userId: string, username: string, userAvatar: string, content: string): Promise<GroupComment | null> {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      const commentUserId = authData?.user?.id || userId;

      const { data, error } = await this.supabase
        .from('group_comments')
        .insert({
          group_post_id: groupPostId,
          user_id: commentUserId,
          username: username,
          user_avatar: userAvatar,
          content: content
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating group comment:', error);
        return null;
      }

      // Update comment count on group post
      await this.supabase.rpc('increment_group_post_comments', {
        group_post_id: groupPostId,
        increment_amount: 1
      });

      return data;
    } catch (error) {
      console.error('Error creating group comment:', error);
      return null;
    }
  }

  // Check if user is group member
  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      const checkUserId = authData?.user?.id || userId;

      const { data, error } = await this.supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', checkUserId)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }

  // Get user UUID from accountId
  async getUserUuid(accountId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id')
        .eq('account_id', accountId)
        .single();

      if (error) {
        console.error('Error getting user UUID:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error getting user UUID:', error);
      return null;
    }
  }

  // Create a notification
  async createNotification(
    userId: string,
    type: Notification['type'],
    message: string,
    relatedPostId?: string,
    relatedUserId?: string
  ): Promise<Notification | null> {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      if (!authData?.user) return null;

      // Get user info for notification
      const { data: userData } = await this.supabase
        .from('users')
        .select('username, avatar')
        .eq('account_id', authData.user.id)
        .single();

      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          username: userData?.username || 'User',
          user_avatar: userData?.avatar || 'User',
          message,
          related_post_id: relatedPostId,
          related_user_id: relatedUserId,
          read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Create post liked notification
  async createPostLikedNotification(postId: string, userId: string, likerId: string, content: string): Promise<void> {
    try {
      const { data: likerData } = await this.supabase
        .from('users')
        .select('username, avatar')
        .eq('account_id', likerId)
        .single();

      if (!likerData) return;

      // Convert userId (accountId) to UUID
      const userUuid = await this.getUserUuid(userId);
      if (!userUuid) return;

      await this.createNotification(
        userUuid,
        'like',
        `${likerData.username} أعجب بهذا المنشور: "${content.length > 50 ? content.substring(0, 50) + '...' : content}"`,
        postId,
        likerId
      );
    } catch (error) {
      console.error('Error creating post liked notification:', error);
    }
  }

  // Create post commented notification
  async createPostCommentedNotification(postId: string, userId: string, commenterId: string, content: string, comment: string): Promise<void> {
    try {
      const { data: commenterData } = await this.supabase
        .from('users')
        .select('username, avatar')
        .eq('account_id', commenterId)
        .single();

      if (!commenterData) return;

      // Convert userId (accountId) to UUID
      const userUuid = await this.getUserUuid(userId);
      if (!userUuid) return;

      await this.createNotification(
        userUuid,
        'comment',
        `${commenterData.username} تعليق على منشورك: "${content.length > 50 ? content.substring(0, 50) + '...' : content}": "${comment.length > 50 ? comment.substring(0, 50) + '...' : comment}"`,
        postId,
        commenterId
      );
    } catch (error) {
      console.error('Error creating post commented notification:', error);
    }
  }

  // Create post published notification
  async createPostPublishedNotification(postId: string, userId: string, content: string): Promise<void> {
    try {
      const { data: userData } = await this.supabase
        .from('users')
        .select('username, avatar')
        .eq('account_id', userId)
        .single();

      if (!userData) return;

      // Convert userId (accountId) to UUID
      const userUuid = await this.getUserUuid(userId);
      if (!userUuid) return;

      await this.createNotification(
        userUuid,
        'post_approved',
        `تم نشر منشورك: "${content.length > 50 ? content.substring(0, 50) + '...' : content}"`,
        postId
      );
    } catch (error) {
      console.error('Error creating post published notification:', error);
    }
  }

  // Get notifications for a user
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Get unread notification count for a user
  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error getting unread notification count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Check if current user is admin
  async isAdmin(): Promise<boolean> {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      if (!authData?.user) {
        console.log('No authenticated user found');
        return false;
      }

      console.log('Checking admin status for user:', authData.user.id);

      // First try to find user by id (UUID)
      let { data: userData } = await this.supabase
        .from('users')
        .select('role, account_id')
        .eq('id', authData.user.id)
        .single();

      // If not found by id, try by account_id (in case auth.uid returns account_id)
      if (!userData) {
        console.log('User not found by id, trying account_id...');
        const { data: userDataByAccount } = await this.supabase
          .from('users')
          .select('role, account_id')
          .eq('account_id', authData.user.id)
          .single();
        userData = userDataByAccount;
      }

      console.log('User data found:', userData);
      console.log('User role:', userData?.role);

      return userData?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Send admin notification to specific users or all users
  async sendAdminNotification(request: AdminNotificationRequest): Promise<{ success: boolean; sentCount?: number; error?: string }> {
    try {
      // Check admin permissions
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const { data: authData } = await this.supabase.auth.getUser();
      if (!authData?.user) {
        return { success: false, error: 'Authentication required' };
      }

      let targetUuids: string[] = [];

      if (request.sendToAll) {
        // Get all user UUIDs
        const { data: allUsers } = await this.supabase
          .from('users')
          .select('id');
        
        targetUuids = allUsers?.map(user => user.id) || [];
      } else if (request.targetUsers && request.targetUsers.length > 0) {
        // Convert accountIds to UUIDs
        for (const accountId of request.targetUsers) {
          const userUuid = await this.getUserUuid(accountId);
          if (userUuid) {
            targetUuids.push(userUuid);
          }
        }
      }

      if (targetUuids.length === 0) {
        return { success: false, error: 'No valid target users found' };
      }

      // Create notifications for all target users
      const notifications = targetUuids.map(userUuid => ({
        user_id: userUuid,
        type: request.type,
        username: 'Admin',
        user_avatar: 'Admin',
        message: request.message,
        read: false
      }));

      const { data, error } = await this.supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) {
        console.error('Error sending admin notifications:', error);
        return { success: false, error: error.message };
      }

      return { success: true, sentCount: data?.length || 0 };
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Create notification template
  async createNotificationTemplate(template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationTemplate | null> {
    try {
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        return null;
      }

      const { data, error } = await this.supabase
        .from('notification_templates')
        .insert(template)
        .select()
        .single();

      if (error) {
        console.error('Error creating notification template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating notification template:', error);
      return null;
    }
  }

  // Get all notification templates
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    try {
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        return [];
      }

      const { data, error } = await this.supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting notification templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting notification templates:', error);
      return [];
    }
  }

  // Send notification using template
  async sendNotificationFromTemplate(templateId: string, variables?: Record<string, string>, targetUsers?: string[], sendToAll?: boolean): Promise<{ success: boolean; sentCount?: number; error?: string }> {
    try {
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      // Get template
      const { data: template } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      // Substitute variables in message
      let message = template.message;
      if (variables) {
        for (const [key, value] of Object.entries(variables)) {
          message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
      }

      // Send notification with template data
      const notificationRequest: AdminNotificationRequest = {
        message,
        type: template.type,
        targetUsers,
        sendToAll
      };

      return await this.sendAdminNotification(notificationRequest);
    } catch (error) {
      console.error('Error sending notification from template:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Get notification statistics
  async getNotificationStats(): Promise<{ total: number; sent: number; read: number; unread: number }> {
    try {
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        return { total: 0, sent: 0, read: 0, unread: 0 };
      }

      const { data: totalData } = await this.supabase
        .from('notifications')
        .select('id', { count: 'exact' });

      const { data: readData } = await this.supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('read', true);

      const { data: unreadData } = await this.supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('read', false);

      return {
        total: totalData?.length || 0,
        sent: totalData?.length || 0,
        read: readData?.length || 0,
        unread: unreadData?.length || 0
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, sent: 0, read: 0, unread: 0 };
    }
  }
}

export const socialDB = new SocialDB();
