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
}

export const socialDB = new SocialDB();
