'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { CustomThemeProvider } from '@/contexts/CustomThemeContext';
import { SocialNavbar } from '@/components/social/SocialNavbar';
import { SocialSidebar } from '@/components/social/SocialSidebar';
import { socialDB, SocialPost, SocialComment } from '@/lib/social';
import MessagingSystem from '@/components/chat/MessagingSystem';
import FriendshipManager from '@/components/users/FriendshipManager';

function SocialPageContent() {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const currentUser = useUser().getCurrentUser();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState<Array<{
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
  }>>([]);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Load posts from database
  const loadPosts = async () => {
    setLoading(true);
    try {
      const dbPosts = await socialDB.getPosts();
      
      // Transform posts to include liked status and comments
      const postsWithDetails = await Promise.all(
        dbPosts.map(async (post) => {
          const comments = await socialDB.getComments(post.id);
          const liked = currentUser ? await socialDB.didUserLikePost(post.id, currentUser.accountId) : false;
          
          return {
            ...post,
            liked,
            commentsList: comments
          };
        })
      );
      
      setPosts(postsWithDetails);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePostSubmit = async () => {
    if (!currentUser || !newPost.trim()) return;
    
    try {
      const newPostData = await socialDB.createPost(
        currentUser.accountId,
        currentUser.username || 'User',
        currentUser.avatar || 'User',
        newPost
      );
      
      if (newPostData) {
        // Add the new post to the state
        setPosts([{
          ...newPostData,
          liked: false,
          commentsList: []
        }, ...posts]);
        setNewPost('');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    
    try {
      const result = await socialDB.togglePostLike(postId, currentUser.accountId);
      
      // Update the post in state
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
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!currentUser) return;
    
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;
    
    try {
      const newComment = await socialDB.createComment(
        postId,
        currentUser.accountId,
        currentUser.username || 'User',
        currentUser.avatar || 'User',
        commentText
      );
      
      if (newComment) {
        // Update the post in state
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
        
        // Clear the comment input
        setCommentInputs({ ...commentInputs, [postId]: '' });
      }
    } catch (error) {
      console.error('Error creating comment:', error);
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

  return (
    <CustomThemeProvider>
      <div className={`min-h-screen flex flex-col ${
        theme === 'light' ? 'bg-gray-50' : 'bg-black'
      }`}>
        {/* Top Navigation */}
        <div className={`border-b ${
          theme === 'light' ? 'border-gray-200' : 'border-gray-800'
        }`}>
          <SocialNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-1">
          <SocialSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Content with border */}
          <div className={`flex-1 border-l ${
            theme === 'light' ? 'border-gray-200' : 'border-gray-800'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'feed' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Post Creation */}
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
                          onClick={handlePostSubmit}
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

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-8">
                    <div className={`text-lg ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Loading posts...
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
                            onClick={() => handleLike(post.id)}
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
                            onClick={() => toggleComments(post.id)}
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
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <MessagingSystem />
          )}

          {activeTab === 'friends' && (
            <FriendshipManager />
          )}

          {activeTab === 'challenges' && (
            <div className="text-center py-12">
              <h2 className={`text-2xl font-bold mb-4 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {language === 'ar' ? 'التحديات' : 'Challenges'}
              </h2>
              <p className={`${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {language === 'ar' ? 'قيد التطوير...' : 'Coming soon...'}
              </p>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="text-center py-12">
              <h2 className={`text-2xl font-bold mb-4 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {language === 'ar' ? 'Profile' : 'Profile'}
              </h2>
              <p className={`${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {language === 'ar' ? 'Coming soon...' : 'Coming soon...'}
              </p>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </CustomThemeProvider>
  );
}

export default function SocialPage() {
  return <SocialPageContent />;
}