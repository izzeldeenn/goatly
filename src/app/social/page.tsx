'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { CustomThemeProvider } from '@/contexts/CustomThemeContext';
import { SocialNavbar } from '@/components/social/SocialNavbar';
import { SocialSidebar } from '@/components/social/SocialSidebar';
import { socialDB, SocialPost, SocialComment, Group } from '@/lib/social';
import MessagingSystem from '@/components/chat/MessagingSystem';
import FriendshipManager from '@/components/users/FriendshipManager';
import { GroupsManager } from '@/components/groups/GroupsManager';
import { GroupFeed } from '@/components/groups/GroupFeed';
import { FeedTab } from '@/components/social/FeedTab';
import { ProfileTab } from '@/components/social/ProfileTab';

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
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  // Edit and delete state
  const [editingPost, setEditingPost] = useState<{ [key: string]: boolean }>({});
  const [editingComment, setEditingComment] = useState<{ [key: string]: boolean }>({});
  const [editingPostContent, setEditingPostContent] = useState<{ [key: string]: string }>({});
  const [editingCommentContent, setEditingCommentContent] = useState<{ [key: string]: string }>({});

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

  // FeedTab handlers
  const handleNewPostChange = (value: string) => {
    setNewPost(value);
  };

  const handleCommentInputChange = (postId: string, value: string) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  // Reply system handlers
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
      // For now, we'll add the reply as a regular comment
      // In a real implementation, you'd have a separate replies table or parent_comment_id field
      const newReply = await socialDB.createComment(
        postId,
        currentUser.accountId,
        currentUser.username || 'User',
        currentUser.avatar || 'User',
        `@${commentId.split('-')[0]} ${replyText}` // Prefix with comment ID to indicate it's a reply
      );
      
      if (newReply) {
        // Update the post in state
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
        
        // Clear the reply input
        setReplyInputs({ ...replyInputs, [commentId]: '' });
        setShowReplies({ ...showReplies, [commentId]: false });
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  // Edit and delete handlers
  const handleEditPost = (postId: string, content: string) => {
    setEditingPost({ ...editingPost, [postId]: true });
    setEditingPostContent({ ...editingPostContent, [postId]: content });
  };

  const handleSavePostEdit = async (postId: string) => {
    if (!currentUser || !editingPostContent[postId]?.trim()) return;
    
    try {
      await socialDB.updateGroupPost(postId, currentUser.accountId, editingPostContent[postId]);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, content: editingPostContent[postId] };
        }
        return post;
      }));
      setEditingPost({ ...editingPost, [postId]: false });
      setEditingPostContent({ ...editingPostContent, [postId]: '' });
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleEditComment = (commentId: string, content: string) => {
    setEditingComment({ ...editingComment, [commentId]: true });
    setEditingCommentContent({ ...editingCommentContent, [commentId]: content });
  };

  const handleSaveCommentEdit = async (commentId: string, postId: string) => {
    if (!currentUser || !editingCommentContent[commentId]?.trim()) return;
    
    try {
      await socialDB.updateGroupComment(commentId, currentUser.accountId, editingCommentContent[commentId]);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            commentsList: post.commentsList.map(comment => 
              comment.id === commentId ? { ...comment, content: editingCommentContent[commentId] } : comment
            )
          };
        }
        return post;
      }));
      setEditingComment({ ...editingComment, [commentId]: false });
      setEditingCommentContent({ ...editingCommentContent, [commentId]: '' });
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;
    
    try {
      await socialDB.deletePost(postId, currentUser.accountId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!currentUser) return;
    
    try {
      await socialDB.deleteComment(commentId, currentUser.accountId);
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
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditPostContentChange = (postId: string, value: string) => {
    setEditingPostContent({ ...editingPostContent, [postId]: value });
  };

  const handleEditCommentContentChange = (commentId: string, value: string) => {
    setEditingCommentContent({ ...editingCommentContent, [commentId]: value });
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
            <FeedTab
              posts={posts}
              newPost={newPost}
              loading={loading}
              showComments={showComments}
              commentInputs={commentInputs}
              replyInputs={replyInputs}
              showReplies={showReplies}
              editingPost={editingPost}
              editingComment={editingComment}
              editingPostContent={editingPostContent}
              editingCommentContent={editingCommentContent}
              onNewPostChange={handleNewPostChange}
              onPostSubmit={handlePostSubmit}
              onLike={handleLike}
              onToggleComments={toggleComments}
              onCommentChange={handleCommentInputChange}
              onCommentSubmit={handleComment}
              onReplyChange={handleReplyInputChange}
              onReplySubmit={handleReplySubmit}
              onToggleReplies={handleToggleReplies}
              onEditPost={handleEditPost}
              onSavePostEdit={handleSavePostEdit}
              onEditComment={handleEditComment}
              onSaveCommentEdit={handleSaveCommentEdit}
              onDeletePost={handleDeletePost}
              onDeleteComment={handleDeleteComment}
              onEditPostContentChange={handleEditPostContentChange}
              onEditCommentContentChange={handleEditCommentContentChange}
            />
          )}

          {activeTab === 'messages' && (
            <MessagingSystem />
          )}

          {activeTab === 'friends' && (
            <FriendshipManager />
          )}

          {activeTab === 'groups' && (
            <div>
              {selectedGroup ? (
                <GroupFeed 
                  group={selectedGroup} 
                  onBack={() => setSelectedGroup(null)} 
                />
              ) : (
                <GroupsManager 
                  onGroupSelect={setSelectedGroup}
                  selectedGroup={selectedGroup}
                />
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileTab posts={posts} />
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