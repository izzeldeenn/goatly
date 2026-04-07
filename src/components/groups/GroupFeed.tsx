'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { socialDB, Group, GroupPost, GroupComment } from '@/lib/social';

interface GroupFeedProps {
  group: Group | null;
  onBack: () => void;
}

export function GroupFeed({ group, onBack }: GroupFeedProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const currentUser = useUser().getCurrentUser();
  
  const [posts, setPosts] = useState<Array<{
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
    commentsList: GroupComment[];
  }>>([]);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const loadGroupPosts = async () => {
    if (!group) return;
    
    setLoading(true);
    try {
      const dbPosts = await socialDB.getGroupPosts(group.id);
      
      // Transform posts to include comments
      const postsWithComments = await Promise.all(
        dbPosts.map(async (post) => {
          const comments = await socialDB.getGroupComments(post.id);
          
          return {
            ...post,
            commentsList: comments
          };
        })
      );
      
      setPosts(postsWithComments);
    } catch (error) {
      console.error('Error loading group posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!group || !currentUser) return;
    
    try {
      const member = await socialDB.isGroupMember(group.id, currentUser.accountId);
      setIsMember(member);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  useEffect(() => {
    if (group) {
      loadGroupPosts();
      checkMembership();
    }
  }, [group]);

  const handlePostSubmit = async () => {
    if (!currentUser || !group || !newPost.trim() || !isMember) return;
    
    try {
      const newPostData = await socialDB.createGroupPost(
        group.id,
        currentUser.accountId,
        currentUser.username || 'User',
        currentUser.avatar || 'User',
        newPost
      );
      
      if (newPostData) {
        setPosts([{
          ...newPostData,
          commentsList: []
        }, ...posts]);
        setNewPost('');
      }
    } catch (error) {
      console.error('Error creating group post:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!currentUser) return;
    
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;
    
    try {
      const newComment = await socialDB.createGroupComment(
        postId,
        currentUser.accountId,
        currentUser.username || 'User',
        currentUser.avatar || 'User',
        commentText
      );
      
      if (newComment) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments + 1,
              commentsList: [...post.commentsList, newComment]
            };
          }
          return post;
        }));
        
        setCommentInputs({ ...commentInputs, [postId]: '' });
      }
    } catch (error) {
      console.error('Error creating group comment:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className={`${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          {language === 'ar' ? 'Select a group to view posts' : 'Select a group to view posts'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={onBack}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'light'
              ? 'text-gray-600 hover:bg-gray-100'
              : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
          {group.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1">
          <h1 className={`text-2xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            {group.name}
          </h1>
          <p className={`text-sm ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {group.members_count} {language === 'ar' ? 'members' : 'members'} • {group.posts_count} {language === 'ar' ? 'posts' : 'posts'}
          </p>
        </div>
        
        {group.is_private && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            theme === 'light'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-gray-800 text-gray-400'
          }`}>
            {language === 'ar' ? 'Private' : 'Private'}
          </span>
        )}
      </div>

      {/* Group Description */}
      {group.description && (
        <div className={`p-4 rounded-lg ${
          theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
        }`}>
          <p className={`${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            {group.description}
          </p>
        </div>
      )}

      {/* Post Creation */}
      {currentUser && isMember && (
        <div className={`p-6 rounded-2xl border-2 ${
          theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-gray-800'
        }`}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {currentUser?.username?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={language === 'ar' ? 'Share something with the group...' : 'Share something with the group...'}
                className={`w-full p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'light'
                    ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    : 'bg-gray-900 border-gray-700 text-white placeholder-gray-400'
                }`}
                rows={3}
              />
              <div className="flex justify-between items-center mt-3">
                <span className={`text-sm ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {newPost.length}/280
                </span>
                <button
                  onClick={handlePostSubmit}
                  disabled={!newPost.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    newPost.trim()
                      ? theme === 'light'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      : theme === 'light'
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {language === 'ar' ? 'Post' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Non-member message */}
      {currentUser && !isMember && (
        <div className={`p-6 rounded-2xl border-2 text-center ${
          theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-gray-900 border-gray-800'
        }`}>
          <p className={`${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {language === 'ar' ? 'Join this group to see posts and interact with members.' : 'Join this group to see posts and interact with members.'}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className={`text-lg ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {language === 'ar' ? 'Loading posts...' : 'Loading posts...'}
          </div>
        </div>
      )}

      {/* Posts */}
      {!loading && posts.map((post) => (
        <div 
          key={post.id}
          className="p-6 rounded-2xl border-2"
          style={{
            backgroundColor: theme === 'light' ? '#ffffff' : '#000000',
            borderColor: theme === 'light' ? '#e5e7eb' : '#333333'
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold">
              {post.username.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-semibold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {post.username}
                </span>
                <span className={`text-sm ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-300'
                }`}>
                  {formatTimeAgo(post.created_at)}
                </span>
              </div>
              <p className={`mb-4 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-200'
              }`}>
                {post.content}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    theme === 'light'
                      ? 'text-gray-500 hover:text-blue-500'
                      : 'text-gray-400 hover:text-blue-400'
                  }`}
                >
                  <span>Message</span> {post.comments}
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Existing Comments */}
                  {post.commentsList.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-bold">
                        {comment.username.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium text-sm ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>
                            {comment.username}
                          </span>
                          <span className={`text-xs ${
                            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment */}
                  {currentUser && isMember && (
                    <div className="flex items-start gap-3 mt-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {currentUser?.username?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          placeholder={language === 'ar' ? 'Add a comment...' : 'Add a comment...'}
                          className={`w-full p-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            theme === 'light'
                              ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                              : 'bg-gray-900 border-gray-700 text-white placeholder-gray-400'
                          }`}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleComment(post.id);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* No posts */}
      {!loading && posts.length === 0 && isMember && (
        <div className="text-center py-12">
          <p className={`${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {language === 'ar' ? 'No posts yet. Be the first to share something!' : 'No posts yet. Be the first to share something!'}
          </p>
        </div>
      )}
    </div>
  );
}
