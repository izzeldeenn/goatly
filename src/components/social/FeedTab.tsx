'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { socialDB, SocialComment, Group } from '@/lib/social';

interface Post {
  id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  content: string;
  likes: number;
  comments: number;
  created_at: string;
  updated_at: string;
  liked: boolean;
  commentsList: SocialComment[];
}

interface FeedTabProps {
  posts: Post[];
  newPost: string;
  loading: boolean;
  showComments: { [key: string]: boolean };
  commentInputs: { [key: string]: string };
  replyInputs: { [key: string]: string };
  showReplies: { [key: string]: boolean };
  editingPost: { [key: string]: boolean };
  editingComment: { [key: string]: boolean };
  editingPostContent: { [key: string]: string };
  editingCommentContent: { [key: string]: string };
  onNewPostChange: (value: string) => void;
  onPostSubmit: () => void;
  onLike: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onCommentChange: (postId: string, value: string) => void;
  onCommentSubmit: (postId: string) => void;
  onReplyChange: (commentId: string, value: string) => void;
  onReplySubmit: (postId: string, commentId: string) => void;
  onToggleReplies: (commentId: string) => void;
  onEditPost: (postId: string, content: string) => void;
  onSavePostEdit: (postId: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onSaveCommentEdit: (commentId: string, postId: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (commentId: string, postId: string) => void;
  onEditPostContentChange: (postId: string, value: string) => void;
  onEditCommentContentChange: (commentId: string, value: string) => void;
}

export function FeedTab({
  posts,
  newPost,
  loading,
  showComments,
  commentInputs,
  replyInputs,
  showReplies,
  editingPost,
  editingComment,
  editingPostContent,
  editingCommentContent,
  onNewPostChange,
  onPostSubmit,
  onLike,
  onToggleComments,
  onCommentChange,
  onCommentSubmit,
  onReplyChange,
  onReplySubmit,
  onToggleReplies,
  onEditPost,
  onSavePostEdit,
  onEditComment,
  onSaveCommentEdit,
  onDeletePost,
  onDeleteComment,
  onEditPostContentChange,
  onEditCommentContentChange
}: FeedTabProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const currentUser = useUser().getCurrentUser();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // State for suggested groups
  const [suggestedGroups, setSuggestedGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [joiningGroups, setJoiningGroups] = useState<{ [key: string]: boolean }>({});

  // Load groups from database
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const [allGroups, myGroups] = await Promise.all([
          socialDB.getGroups(5, 0), // Get first 5 groups
          currentUser ? socialDB.getUserGroups(currentUser.accountId) : Promise.resolve([])
        ]);
        setSuggestedGroups(allGroups);
        setUserGroups(myGroups);
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };

    loadGroups();
  }, [currentUser?.accountId]);

  // Check if user is member of group
  const isUserMember = (groupId: string) => {
    return userGroups.some(group => group.id === groupId);
  };

  // Handle joining a group - using GroupsManager logic
  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser) return;
    
    setJoiningGroups(prev => ({ ...prev, [groupId]: true }));
    
    try {
      const success = await socialDB.joinGroup(
        groupId,
        currentUser.accountId,
        currentUser.username || 'User',
        currentUser.avatar || 'User'
      );
      
      if (success) {
        // Reload groups to update the UI
        const [allGroups, myGroups] = await Promise.all([
          socialDB.getGroups(5, 0),
          socialDB.getUserGroups(currentUser.accountId)
        ]);
        setSuggestedGroups(allGroups);
        setUserGroups(myGroups);
      }
    } catch (error) {
      console.error('Error joining group:', error);
    } finally {
      setJoiningGroups(prev => ({ ...prev, [groupId]: false }));
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
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
                onChange={(e) => onNewPostChange(e.target.value)}
                placeholder={language === 'ar' ? 'Share your study progress...' : 'Share your study progress...'}
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
                  onClick={onPostSubmit}
                  disabled={!newPost.trim() || !currentUser}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    newPost.trim() && currentUser
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

        {loading && (
          <div className="text-center py-8">
            <div className={`text-lg ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Loading posts...
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
                {editingPost[post.id] ? (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {currentUser?.username?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={editingPostContent[post.id] || ''}
                        onChange={(e) => onEditPostContentChange(post.id, e.target.value)}
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
                          onClick={() => onSavePostEdit(post.id)}
                          disabled={!editingPostContent[post.id]?.trim()}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            editingPostContent[post.id]?.trim()
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
                          onClick={() => onEditPost(post.id, '')}
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
                    onClick={() => onLike(post.id)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      post.liked
                        ? 'text-red-500'
                        : theme === 'light'
                          ? 'text-gray-500 hover:text-red-500'
                          : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <span>{post.liked ? 'Heart' : 'Heart'}</span> {post.likes}
                  </button>
                  <button
                    onClick={() => onToggleComments(post.id)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      theme === 'light'
                        ? 'text-gray-500 hover:text-blue-500'
                        : 'text-gray-400 hover:text-blue-400'
                    }`}
                  >
                    <span>Message</span> {post.comments}
                  </button>
                  <button className={`text-sm transition-colors ${
                    theme === 'light'
                      ? 'text-gray-500 hover:text-green-500'
                      : 'text-gray-400 hover:text-green-400'
                  }`}>
                    <span>Refresh</span>
                  </button>
                  {post.user_id === currentUser?.accountId && (
                    <div>
                      <button
                        onClick={() => onEditPost(post.id, post.content)}
                        className={`text-sm transition-colors ${
                          theme === 'light'
                            ? 'text-gray-500 hover:text-green-500'
                            : 'text-gray-400 hover:text-green-400'
                        }`}
                      >
                        <span>✏️</span>
                      </button>
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className={`text-sm transition-colors ${
                          theme === 'light'
                            ? 'text-gray-500 hover:text-red-500'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <span>🗑️</span>
                      </button>
                    </div>
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
                            {editingComment[comment.id] ? (
                              <div className="mb-2">
                                <textarea
                                  value={editingCommentContent[comment.id] || ''}
                                  onChange={(e) => onEditCommentContentChange(comment.id, e.target.value)}
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
                                    onClick={() => onSaveCommentEdit(comment.id, post.id)}
                                    disabled={!editingCommentContent[comment.id]?.trim()}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                      editingCommentContent[comment.id]?.trim()
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
                                    onClick={() => onEditComment(comment.id, '')}
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
                              <div>
                                <p className={`text-sm mb-2 ${
                                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                }`}>
                                  {comment.content}
                                </p>
                                <button
                                  onClick={() => onToggleReplies(comment.id)}
                                  className={`text-xs transition-colors mb-2 ${
                                    theme === 'light'
                                      ? 'text-blue-600 hover:text-blue-700'
                                      : 'text-blue-400 hover:text-blue-300'
                                  }`}
                                >
                                  {language === 'ar' ? 'رد' : 'Reply'}
                                </button>
                                {comment.user_id === currentUser?.accountId && (
                                  <div>
                                    <button
                                      onClick={() => onEditComment(comment.id, comment.content)}
                                      className={`text-xs transition-colors mb-2 ${
                                        theme === 'light'
                                          ? 'text-gray-500 hover:text-green-500'
                                          : 'text-gray-400 hover:text-green-400'
                                      }`}
                                    >
                                      <span>✏️</span>
                                    </button>
                                    <button
                                      onClick={() => onDeleteComment(comment.id, post.id)}
                                      className={`text-xs transition-colors mb-2 ${
                                        theme === 'light'
                                          ? 'text-gray-500 hover:text-red-500'
                                          : 'text-gray-400 hover:text-red-400'
                                      }`}
                                    >
                                      <span>🗑️</span>
                                    </button>
                                  </div>
                                )}
                              </div>
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
                                    onChange={(e) => onReplyChange(comment.id, e.target.value)}
                                    placeholder={language === 'ar' ? 'اكتب رداً...' : 'Write a reply...'}
                                    className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                      theme === 'light'
                                        ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        : 'bg-black border-gray-600 text-white placeholder-gray-400'
                                    }`}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        onReplySubmit(post.id, comment.id);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => onReplySubmit(post.id, comment.id)}
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
                          onChange={(e) => onCommentChange(post.id, e.target.value)}
                          placeholder={language === 'ar' ? 'Add a comment...' : 'Add a comment...'}
                          className={`w-full p-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            theme === 'light'
                              ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                              : 'bg-gray-900 border-gray-700 text-white placeholder-gray-400'
                          }`}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              onCommentSubmit(post.id);
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

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className={`${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {language === 'ar' ? 'No posts yet. Be the first to share something!' : 'No posts yet. Be the first to share something!'}
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar - Suggested Groups */}
      <div className="space-y-6">
        <div className={`p-4 rounded-2xl border backdrop-blur-xl ${
          theme === 'light' 
            ? 'bg-white/90 border-gray-200/50 shadow-lg shadow-gray-500/10' 
            : 'bg-black/90 border-gray-800/50 shadow-xl shadow-black/20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {language === 'ar' ? 'Discover Groups' : 'Discover Groups'}
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              theme === 'light' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-blue-900/50 text-blue-300'
            }`}>
              {suggestedGroups.length} {language === 'ar' ? 'groups' : 'groups'}
            </div>
          </div>
          
          <div className="space-y-3">
            {suggestedGroups.map((group) => (
              <div 
                key={group.id} 
                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  theme === 'light' 
                    ? 'bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-blue-300 hover:shadow-blue-500/10' 
                    : 'bg-gradient-to-br from-gray-900 to-black border-gray-700 hover:border-blue-500/50 hover:shadow-blue-500/20'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className={`h-full w-full ${
                    theme === 'light' 
                      ? 'bg-gradient-to-r from-blue-500/5 to-purple-500/5' 
                      : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                  }`}></div>
                </div>
                
                <div className="relative p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <img 
                        src={group.creator_avatar} 
                        alt={group.creator_username}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-offset-2 transition-all duration-300 group-hover:scale-110 ${
                          theme === 'light' 
                            ? 'ring-gray-200 ring-offset-white' 
                            : 'ring-gray-700 ring-offset-black'
                        }"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm mb-1 truncate transition-colors group-hover:text-blue-500 ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        {group.name}
                      </h4>
                      <p className={`text-xs mb-3 line-clamp-2 leading-relaxed ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {group.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1 text-xs ${
                            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                            </svg>
                            <span>{group.members_count}</span>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${
                            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                            </svg>
                            <span>{group.posts_count}</span>
                          </div>
                        </div>
                        {group.is_private && (
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            theme === 'light' 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-amber-900/50 text-amber-300'
                          }`}>
                            {language === 'ar' ? 'private' : 'Private'}
                          </div>
                        )}
                      </div>
                      
                      {isUserMember(group.id) ? (
                        <button
                          disabled
                          className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                            theme === 'light'
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-600 to-green-700 text-white cursor-not-allowed'
                          }`}
                        >
                          {language === 'ar' ? 'Joined' : 'Joined'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={joiningGroups[group.id] || !currentUser}
                          className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                            joiningGroups[group.id] || !currentUser
                              ? theme === 'light'
                                ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'
                                : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white cursor-not-allowed'
                              : theme === 'light'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          {joiningGroups[group.id] 
                            ? (language === 'ar' ? 'Joining...' : 'Joining...')
                            : (language === 'ar' ? 'Join Group' : 'Join Group')
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className={`mt-4 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
            theme === 'light'
              ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
              : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 hover:from-gray-700 hover:to-gray-600'
          }`}>
            {language === 'ar' ? 'Explore All Groups' : 'Explore All Groups'}
          </button>
        </div>
      </div>
    </div>
  );
}