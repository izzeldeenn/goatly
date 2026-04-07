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
    liked: boolean;
    commentsList: GroupComment[];
  }>>([]);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'post' | 'comment'; id: string } | null>(null);

  const loadGroupPosts = async () => {
    if (!group) return;
    
    setLoading(true);
    try {
      const dbPosts = await socialDB.getGroupPosts(group.id);
      
      const postsWithDetails = await Promise.all(
        dbPosts.map(async (post) => {
          const comments = await socialDB.getGroupComments(post.id);
          const liked = currentUser ? await socialDB.didUserLikeGroupPost(post.id, currentUser.accountId) : false;
          
          return {
            ...post,
            liked,
            commentsList: comments
          };
        })
      );
      
      setPosts(postsWithDetails);
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
          liked: false,
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

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    
    try {
      const result = await socialDB.toggleGroupPostLike(postId, currentUser.accountId);
      
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: result.liked,
            likes: result.likesCount
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling group post like:', error);
    }
  };

  const handleReplyInputChange = (commentId: string, value: string) => {
    setReplyInputs({ ...replyInputs, [commentId]: value });
  };

  const handleToggleReplies = (commentId: string) => {
    setShowReplies({ ...showReplies, [commentId]: !showReplies[commentId] });
  };

  const handleReplySubmit = async (postId: string, commentId: string) => {
    if (!currentUser) return;
    
    const replyText = replyInputs[commentId];
    if (!replyText?.trim()) return;
    
    try {
      const newReply = await socialDB.createGroupComment(
        postId,
        currentUser.accountId,
        currentUser.username || 'User',
        currentUser.avatar || 'User',
        `@${commentId.split('-')[0]} ${replyText}`
      );
      
      if (newReply) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments + 1,
              commentsList: [...post.commentsList, newReply]
            };
          }
          return post;
        }));
        
        setReplyInputs({ ...replyInputs, [commentId]: '' });
        setShowReplies({ ...showReplies, [commentId]: false });
      }
    } catch (error) {
      console.error('Error creating group reply:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;
    
    try {
      await socialDB.deleteGroupPost(postId, currentUser.accountId);
      setPosts(posts.filter(post => post.id !== postId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting group post:', error);
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!currentUser) return;
    
    try {
      await socialDB.deleteGroupComment(commentId, currentUser.accountId);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments - 1,
            commentsList: post.commentsList.filter(comment => comment.id !== commentId)
          };
        }
        return post;
      }));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting group comment:', error);
    }
  };

  const handleEditPost = (postId: string, content: string) => {
    setEditingPost(postId);
    setEditingPostContent(content);
  };

  const handleSavePostEdit = async (postId: string) => {
    if (!currentUser || !editingPostContent.trim()) return;
    
    try {
      await socialDB.updateGroupPost(postId, currentUser.accountId, editingPostContent);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, content: editingPostContent };
        }
        return post;
      }));
      setEditingPost(null);
      setEditingPostContent('');
    } catch (error) {
      console.error('Error updating group post:', error);
    }
  };

  const handleEditComment = (commentId: string, content: string) => {
    setEditingComment(commentId);
    setEditingCommentContent(content);
  };

  const handleSaveCommentEdit = async (commentId: string, postId: string) => {
    if (!currentUser || !editingCommentContent.trim()) return;
    
    try {
      await socialDB.updateGroupComment(commentId, currentUser.accountId, editingCommentContent);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            commentsList: post.commentsList.map(comment => 
              comment.id === commentId ? { ...comment, content: editingCommentContent } : comment
            )
          };
        }
        return post;
      }));
      setEditingComment(null);
      setEditingCommentContent('');
    } catch (error) {
      console.error('Error updating group comment:', error);
    }
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
                placeholder={language === 'ar' ? 'Share something with group...' : 'Share something with group...'}
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

      {loading && (
        <div className="text-center py-8">
          <div className={`text-lg ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {language === 'ar' ? 'Loading posts...' : 'Loading posts...'}
          </div>
        </div>
      )}

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
              
              {editingPost === post.id ? (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {currentUser?.username?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={editingPostContent}
                      onChange={(e) => setEditingPostContent(e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب منشوراً...' : 'Write your post...'}
                      className={`w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'light'
                          ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          : 'bg-black border-gray-600 text-white placeholder-gray-400'
                      }`}
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSavePostEdit(post.id)}
                        disabled={!editingPostContent.trim()}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          editingPostContent.trim()
                            ? theme === 'light'
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-green-600 text-white hover:bg-green-700'
                            : theme === 'light'
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {language === 'ar' ? 'حفظ' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingPost(null);
                          setEditingPostContent('');
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          theme === 'light'
                            ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-200'
                }`}>
                  {post.content}
                </p>
              )}
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    post.liked
                      ? 'text-red-500'
                      : theme === 'light'
                        ? 'text-gray-500 hover:text-red-500'
                        : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  <span>{post.liked ? '❤️' : '🤍'}</span> {post.likes}
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    theme === 'light'
                      ? 'text-gray-500 hover:text-blue-500'
                      : 'text-gray-400 hover:text-blue-400'
                  }`}
                >
                  <span>💬</span> {post.comments}
                </button>
                {post.user_id === currentUser?.accountId && (
                  <>
                    <button
                      onClick={() => handleEditPost(post.id, post.content)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        theme === 'light'
                          ? 'text-gray-500 hover:text-green-500'
                          : 'text-gray-400 hover:text-green-400'
                      }`}
                    >
                      <span>✏️</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'post', id: post.id })}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        theme === 'light'
                          ? 'text-gray-500 hover:text-red-500'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <span>🗑️</span>
                    </button>
                  </>
                )}
              </div>

              {showComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {post.commentsList.map((comment) => (
                    <div key={comment.id} className="mb-4">
                      <div className="flex items-start gap-3">
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
                          
                          {editingComment === comment.id ? (
                            <div className="mb-2">
                              <textarea
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                placeholder={language === 'ar' ? 'اكتب تعليقاً...' : 'Write a comment...'}
                                className={`w-full p-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  theme === 'light'
                                    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    : 'bg-black border-gray-600 text-white placeholder-gray-400'
                                }`}
                                rows={2}
                              />
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => handleSaveCommentEdit(comment.id, post.id)}
                                  disabled={!editingCommentContent.trim()}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    editingCommentContent.trim()
                                      ? theme === 'light'
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                      : theme === 'light'
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                  }`}
                                >
                                  {language === 'ar' ? 'حفظ' : 'Save'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingComment(null);
                                    setEditingCommentContent('');
                                  }}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    theme === 'light'
                                      ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                  }`}
                                >
                                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className={`text-sm mb-2 ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              {comment.content}
                            </p>
                          )}
                          
                          <button
                            onClick={() => handleToggleReplies(comment.id)}
                            className={`text-xs transition-colors mb-2 ${
                              theme === 'light'
                                ? 'text-blue-600 hover:text-blue-700'
                                : 'text-blue-400 hover:text-blue-300'
                            }`}
                          >
                            {language === 'ar' ? 'رد' : 'Reply'}
                          </button>
                          
                          {comment.user_id === currentUser?.accountId && (
                            <>
                              <button
                                onClick={() => handleEditComment(comment.id, comment.content)}
                                className={`text-xs transition-colors mb-2 ${
                                  theme === 'light'
                                    ? 'text-gray-500 hover:text-green-500'
                                    : 'text-gray-400 hover:text-green-400'
                                }`}
                              >
                                <span>✏️</span>
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'comment', id: comment.id })}
                                className={`text-xs transition-colors mb-2 ${
                                  theme === 'light'
                                    ? 'text-gray-500 hover:text-red-500'
                                    : 'text-gray-400 hover:text-red-400'
                                }`}
                              >
                                <span>🗑️</span>
                              </button>
                            </>
                          )}

                          {showReplies[comment.id] && (
                            <div className="flex items-start gap-2 mt-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {currentUser?.username?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={replyInputs[comment.id] || ''}
                                  onChange={(e) => handleReplyInputChange(comment.id, e.target.value)}
                                  placeholder={language === 'ar' ? 'اكتب رداً...' : 'Write a reply...'}
                                  className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    theme === 'light'
                                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                      : 'bg-black border-gray-600 text-white placeholder-gray-400'
                                  }`}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleReplySubmit(post.id, comment.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleReplySubmit(post.id, comment.id)}
                                  disabled={!replyInputs[comment.id]?.trim()}
                                  className={`mt-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    replyInputs[comment.id]?.trim()
                                      ? theme === 'light'
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                      : theme === 'light'
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  {language === 'ar' ? 'إرسال' : 'Send'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

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
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {!loading && posts.length === 0 && isMember && (
        <div className="text-center py-12">
          <p className={`${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {language === 'ar' ? 'No posts yet. Be the first to share something!' : 'No posts yet. Be the first to share something!'}
          </p>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-sm mx-4 ${
            theme === 'light' ? 'bg-white text-gray-900' : 'bg-black text-white'
          }`}>
            <h3 className="text-lg font-semibold mb-4">
              {deleteConfirm.type === 'post' 
                ? (language === 'ar' ? 'حذف المنشور' : 'Delete Post')
                : (language === 'ar' ? 'حذف التعليق' : 'Delete Comment')
              }
            </h3>
            <p className={`mb-6 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {deleteConfirm.type === 'post'
                ? (language === 'ar' ? 'هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this post? This action cannot be undone.')
                : (language === 'ar' ? 'هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this comment? This action cannot be undone.')
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'post') {
                    handleDeletePost(deleteConfirm.id);
                  } else {
                    handleDeleteComment(deleteConfirm.id, '');
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {language === 'ar' ? 'حذف' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
