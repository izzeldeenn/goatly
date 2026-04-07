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
}

export const socialDB = new SocialDB();
