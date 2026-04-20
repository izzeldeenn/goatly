'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { socialDB, SocialComment } from '@/lib/social';

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
  onEditCommentContentChange,
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

  
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className={`p-6 rounded-lg border transition-all duration-300 ${
          theme === 'light' 
            ? 'bg-white border-gray-200' 
            : 'bg-black border-gray-800'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 ${
              theme === 'light'
                ? 'bg-black'
                : 'bg-white'
            }`}>
              {currentUser?.avatar?.startsWith('http') ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.username}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <span className={`text-lg ${theme === 'light' ? 'text-white' : 'text-black'}`}>{currentUser?.username?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => onNewPostChange(e.target.value)}
                placeholder={language === 'ar' ? 'Share your study progress...' : 'Share your study progress...'}
                className={`w-full p-4 rounded-lg border resize-none transition-all duration-300 ${
                  theme === 'light'
                    ? 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:border-black'
                    : 'bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-white'
                }`}
                rows={3}
              />
              <div className="flex justify-between items-center mt-4">
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {newPost.length}/280
                </span>
                <button
                  onClick={onPostSubmit}
                  disabled={!newPost.trim() || !currentUser}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    newPost.trim() && currentUser
                      ? theme === 'light'
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-white text-black hover:bg-gray-200'
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
          <div className={`text-center py-12 rounded-lg transition-all duration-300 ${
            theme === 'light' 
              ? 'bg-white border border-gray-200' 
              : 'bg-black border border-gray-800'
          }`}>
            <div className={`text-lg font-medium transition-colors duration-300 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Loading posts...
            </div>
          </div>
        )}

        {!loading && posts.map((post) => (
          <div 
            key={post.id}
            className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${
              theme === 'light' 
                ? 'bg-white border-gray-200 hover:shadow-md' 
                : 'bg-black border-gray-800 hover:shadow-lg'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 ${
                theme === 'light'
                  ? 'bg-gray-300'
                  : 'bg-gray-700'
              }`}>
                {post.user_avatar?.startsWith('http') ? (
                  <img 
                    src={post.user_avatar} 
                    alt={post.username}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <span className={`text-lg ${theme === 'light' ? 'text-black' : 'text-white'}`}>{post.username.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`font-semibold text-base transition-colors duration-300 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {post.username}
                  </span>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {formatTimeAgo(post.created_at)}
                  </span>
                </div>
                {editingPost[post.id] ? (
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 ${
                      theme === 'light'
                        ? 'bg-black'
                        : 'bg-white'
                    }`}>
                      {currentUser?.avatar?.startsWith('http') ? (
                        <img 
                          src={currentUser.avatar} 
                          alt={currentUser.username}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <span className={`text-lg ${theme === 'light' ? 'text-white' : 'text-black'}`}>{currentUser?.username?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={editingPostContent[post.id] || ''}
                        onChange={(e) => onEditPostContentChange(post.id, e.target.value)}
                        placeholder={language === 'ar' ? 'اكتب منشوراً...' : 'Write your post...'}
                        className={`w-full p-4 rounded-lg border text-sm resize-none transition-all duration-300 ${
                          theme === 'light'
                            ? 'bg-white border-gray-200 text-black placeholder-gray-400 focus:border-black'
                            : 'bg-black border-gray-800 text-white placeholder-gray-500 focus:border-white'
                        }`}
                        rows={3}
                      />
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => onSavePostEdit(post.id)}
                          disabled={!editingPostContent[post.id]?.trim()}
                          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                            editingPostContent[post.id]?.trim()
                              ? theme === 'light'
                                ? 'bg-black text-white hover:bg-gray-800'
                                : 'bg-white text-black hover:bg-gray-200'
                              : theme === 'light'
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {language === 'ar' ? 'حفظ' : 'Save'}
                        </button>
                        <button
                          onClick={() => onEditPost(post.id, '')}
                          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
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
                  <p className={`mb-4 text-base leading-relaxed transition-colors duration-300 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-200'
                  }`}>
                    {post.content}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLike(post.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      post.liked
                        ? theme === 'light'
                          ? 'bg-red-100 text-red-600 border border-red-300'
                          : 'bg-red-900/50 text-red-400 border border-red-700'
                        : theme === 'light'
                          ? 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 border border-gray-200 hover:border-red-300'
                          : 'bg-gray-800 text-gray-400 hover:bg-red-900/50 hover:text-red-400 border border-gray-700 hover:border-red-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={post.liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.likes}</span>
                  </button>
                  <button
                    onClick={() => onToggleComments(post.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      theme === 'light'
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black border border-gray-200'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.comments}</span>
                  </button>
                  <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black border border-gray-200'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  {post.user_id === currentUser?.accountId && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditPost(post.id, post.content)}
                        className={`p-1.5 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 ${
                          theme === 'light'
                            ? 'text-gray-500 hover:text-black hover:bg-gray-100'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className={`p-1.5 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 ${
                          theme === 'light'
                            ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {showComments[post.id] && (
                  <div className={`mt-6 pt-6 border-t transition-all duration-300 ${
                    theme === 'light' ? 'border-gray-200' : 'border-gray-800'
                  }`}>
                    {post.commentsList.map((comment) => (
                      <div key={comment.id} className="mb-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 ${
                            theme === 'light'
                              ? 'bg-gray-300'
                              : 'bg-gray-700'
                          }`}>
                            {comment.user_avatar?.startsWith('http') ? (
                              <img 
                                src={comment.user_avatar} 
                                alt={comment.username}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <span className={`text-sm ${theme === 'light' ? 'text-black' : 'text-white'}`}>{comment.username.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`font-semibold text-sm transition-colors duration-300 ${
                                theme === 'light' ? 'text-gray-900' : 'text-white'
                              }`}>
                                {comment.username}
                              </span>
                              <span className={`text-xs font-medium transition-colors duration-300 ${
                                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                {formatTimeAgo(comment.created_at)}
                              </span>
                            </div>
                            {editingComment[comment.id] ? (
                              <div className="mb-3">
                                <textarea
                                  value={editingCommentContent[comment.id] || ''}
                                  onChange={(e) => onEditCommentContentChange(comment.id, e.target.value)}
                                  placeholder={language === 'ar' ? 'اكتب تعليقاً...' : 'Write a comment...'}
                                  className={`w-full p-3 rounded-lg border text-sm resize-none transition-all duration-300 ${
                                    theme === 'light'
                                      ? 'bg-white border-gray-200 text-black placeholder-gray-400 focus:border-black'
                                      : 'bg-black border-gray-800 text-white placeholder-gray-500 focus:border-white'
                                  }`}
                                  rows={2}
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => onSaveCommentEdit(comment.id, post.id)}
                                    disabled={!editingCommentContent[comment.id]?.trim()}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                                      editingCommentContent[comment.id]?.trim()
                                        ? theme === 'light'
                                          ? 'bg-black text-white hover:bg-gray-800'
                                          : 'bg-white text-black hover:bg-gray-200'
                                        : theme === 'light'
                                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    }`}
                                  >
                                    {language === 'ar' ? 'حفظ' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => onEditComment(comment.id, '')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
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
                                <p className={`text-sm leading-relaxed mb-3 transition-colors duration-300 ${
                                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                }`}>
                                  {comment.content}
                                </p>
                                <div className="flex items-center gap-2 mb-3">
                                  <button
                                    onClick={() => onToggleReplies(comment.id)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                                      theme === 'light'
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                                    }`}
                                  >
                                    {language === 'ar' ? 'رد' : 'Reply'}
                                  </button>
                                  {comment.user_id === currentUser?.accountId && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => onEditComment(comment.id, comment.content)}
                                        className={`p-1 rounded-lg text-xs transition-all duration-300 transform hover:scale-105 ${
                                          theme === 'light'
                                            ? 'text-gray-500 hover:text-black hover:bg-gray-100'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => onDeleteComment(comment.id, post.id)}
                                        className={`p-1 rounded-lg text-xs transition-all duration-300 transform hover:scale-105 ${
                                          theme === 'light'
                                            ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                            : 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                                        }`}
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {showReplies[comment.id] && (
                              <div className={`flex items-start gap-2 mt-3 p-3 rounded-lg transition-all duration-300 ${
                                theme === 'light'
                                  ? 'bg-gray-50 border border-gray-200'
                                  : 'bg-gray-900 border border-gray-700'
                              }`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 ${
                                  theme === 'light'
                                    ? 'bg-black'
                                    : 'bg-white'
                                }`}>
                                  {currentUser?.avatar?.startsWith('http') ? (
                                    <img 
                                      src={currentUser.avatar} 
                                      alt={currentUser.username}
                                      className="w-8 h-8 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <span className={`text-xs ${theme === 'light' ? 'text-white' : 'text-black'}`}>{currentUser?.username?.charAt(0) || 'U'}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={replyInputs[comment.id] || ''}
                                    onChange={(e) => onReplyChange(comment.id, e.target.value)}
                                    placeholder={language === 'ar' ? 'اكتب رداً...' : 'Write a reply...'}
                                    className={`w-full p-2 rounded-lg border text-xs transition-all duration-300 ${
                                      theme === 'light'
                                        ? 'bg-white border-gray-200 text-black placeholder-gray-400 focus:border-black'
                                        : 'bg-black border-gray-800 text-white placeholder-gray-500 focus:border-white'
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
                                    className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                                      replyInputs[comment.id]?.trim()
                                        ? theme === 'light'
                                          ? 'bg-black text-white hover:bg-gray-800'
                                          : 'bg-white text-black hover:bg-gray-200'
                                        : theme === 'light'
                                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
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

                    <div className="flex items-start gap-3 mt-6">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 ${
                        theme === 'light'
                          ? 'bg-black'
                          : 'bg-white'
                      }`}>
                        {currentUser?.avatar?.startsWith('http') ? (
                          <img 
                            src={currentUser.avatar} 
                            alt={currentUser.username}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <span className={`text-sm ${theme === 'light' ? 'text-white' : 'text-black'}`}>{currentUser?.username?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => onCommentChange(post.id, e.target.value)}
                          placeholder={language === 'ar' ? 'Add a comment...' : 'Add a comment...'}
                          className={`w-full p-3 rounded-lg border text-sm transition-all duration-300 ${
                            theme === 'light'
                              ? 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:border-black'
                              : 'bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-white'
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
          <div className={`text-center py-16 rounded-lg transition-all duration-300 ${
            theme === 'light' 
              ? 'bg-white border border-gray-200' 
              : 'bg-black border border-gray-800'
          }`}>
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
              theme === 'light'
                ? 'bg-gray-100'
                : 'bg-gray-800'
            }`}>
              <svg className={`w-8 h-8 ${
                theme === 'light' ? 'text-gray-400' : 'text-gray-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className={`text-lg font-medium transition-colors duration-300 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {language === 'ar' ? 'No posts yet. Be the first to share something!' : 'No posts yet. Be the first to share something!'}
            </p>
          </div>
        )}
      </div>

          </div>
  );
}