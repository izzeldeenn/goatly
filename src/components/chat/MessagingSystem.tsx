'use client';

import React, { useState, useEffect, useRef } from 'react';
import { messageDB, MessageFrontend } from '@/lib/friendship';
import { userDB, UserAccount } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Send, ArrowLeft, Search, MoreVertical, MessageCircle, Phone, Video, Info, Smile, Paperclip, Mic } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import UniversalAvatar from '../users/UniversalAvatar';

interface Conversation {
  id: string;
  user: UserAccount;
  lastMessage?: MessageFrontend;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface MessageProps {
  message: MessageFrontend;
  isOwn: boolean;
  user: UserAccount;
}

const Message: React.FC<MessageProps> = ({ message, isOwn, user }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group animate-fade-in`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'} flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`relative px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-105 ${
          isOwn 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-md shadow-gray-500/10'
        }`}>
          {/* Message bubble tail */}
          <div className={`absolute w-3 h-3 transform rotate-45 ${
            isOwn 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 -right-1.5 bottom-2' 
              : 'bg-gradient-to-r from-gray-100 to-gray-200 -left-1.5 bottom-2'
          }`}></div>
          
          <p className="text-sm leading-relaxed relative z-10">{message.content}</p>
          
          {/* Read status indicator */}
          {isOwn && (
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 px-2 ${
          isOwn ? 'flex-row-reverse' : 'flex-row'
        }`}>
          <p className={`text-xs opacity-70 transition-colors duration-200 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatTime(message.createdAt)}
          </p>
          {message.readAt && isOwn && (
            <span className="flex items-center gap-1 text-xs text-blue-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              تمت القراءة
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface MessagingSystemProps {
  selectedFriendId?: string | null;
}

export default function MessagingSystem({ selectedFriendId }: MessagingSystemProps = {}) {
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedFriendIdState, setSelectedFriendIdState] = useState<string | null>(selectedFriendId || null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [messages, setMessages] = useState<MessageFrontend[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);
  
  const { getCurrentUser } = useUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    loadConversations();
  }, []);

  // Track selectedFriendId changes
  useEffect(() => {
    if (selectedFriendId !== selectedFriendIdState) {
      setSelectedFriendIdState(selectedFriendId || null);
    }
  }, [selectedFriendId]);

  // Real-time subscription for messages
  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) return;


    // Subscribe to all messages (we'll filter in the handler)
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as any;
            
            // Check if this message involves the current user
            const involvesCurrentUser = 
              newMessage.sender_id === userId || newMessage.receiver_id === userId;
            
            if (!involvesCurrentUser) {
              return;
            }
            
            
            // Convert to MessageFrontend format
            const formattedMessage: MessageFrontend = {
              id: newMessage.id,
              senderId: newMessage.sender_id,
              receiverId: newMessage.receiver_id,
              content: newMessage.content,
              messageType: newMessage.message_type || 'text',
              createdAt: newMessage.created_at,
              readAt: newMessage.read_at,
              isDeleted: newMessage.is_deleted || false
            };
            
            // Check if this message is relevant to current conversation
            if (selectedConversation) {
              const friendId = selectedConversation.user.id || selectedConversation.user.account_id;
              const isRelevant = 
                (formattedMessage.senderId === userId && formattedMessage.receiverId === friendId) ||
                (formattedMessage.senderId === friendId && formattedMessage.receiverId === userId);
              
         
              
              if (isRelevant) {
                // Check if message already exists to prevent duplicates
                setMessages(prev => {
                  const messageExists = prev.some(msg => msg.id === formattedMessage.id);
                  if (messageExists) {
                    return prev;
                  }
                  return [...prev, formattedMessage];
                });
                scrollToBottom();
              }
            }
            
            // Update conversations list locally to prevent jumping
            // Only update the specific conversation that received the message
            setConversations(prev => 
              prev.map(conv => {
                const convFriendId = conv.user.id || conv.user.account_id;
                const isRelevantConv = 
                  (formattedMessage.senderId === userId && formattedMessage.receiverId === convFriendId) ||
                  (formattedMessage.senderId === convFriendId && formattedMessage.receiverId === userId);
                
                if (isRelevantConv) {
                  // If this is a message from friend to user, increment unread count
                  // unless this is the currently selected conversation
                  const isSelectedConversation = selectedConversation && (
                    selectedConversation.user.id === convFriendId || 
                    selectedConversation.user.account_id === convFriendId
                  );
                  
                  const newUnreadCount = formattedMessage.senderId !== userId && !isSelectedConversation 
                    ? (conv.unreadCount || 0) + 1 
                    : conv.unreadCount || 0;
                  
                  return { 
                    ...conv, 
                    lastMessage: formattedMessage,
                    lastMessageAt: formattedMessage.createdAt,
                    unreadCount: newUnreadCount
                  };
                }
                return conv;
              })
            );
            
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as any;
            
            // Check if this update involves the current user
            const involvesCurrentUser = 
              updatedMessage.sender_id === userId || updatedMessage.receiver_id === userId;
            
            if (!involvesCurrentUser) return;
            
            // Handle message updates (e.g., read status)
            setMessages(prev => 
              prev.map(msg => 
                msg.id === updatedMessage.id ? { 
                  ...msg, 
                  readAt: updatedMessage.read_at
                } : msg
              )
            );
          }
        }
      )
      .subscribe((status) => {
      });

    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedFriendIdState && conversations.length > 0 && !isCreatingConversation) {
      const currentUserId = getCurrentUserId();
      
      // Prevent selecting conversation with self
      if (selectedFriendIdState === currentUserId) {
        console.error('❌ Cannot select conversation with self');
        return;
      }
      
   
      
      // Find conversation with the selected friend
      const conversation = conversations.find(conv => {
        return conv.user?.id === selectedFriendIdState || conv.user?.account_id === selectedFriendIdState;
      });
      
      
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        // Create a new conversation
        createConversationWithFriend(selectedFriendIdState);
      }
    } else if (selectedFriendIdState && conversations.length === 0 && !isCreatingConversation) {
      const currentUserId = getCurrentUserId();
      
      // Prevent creating conversation with self
      if (selectedFriendIdState === currentUserId) {
        console.error('❌ Cannot create conversation with self');
        return;
      }
      
      createConversationWithFriend(selectedFriendIdState);
    }
  }, [selectedFriendIdState, conversations, isCreatingConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      const friendId = selectedConversation.user.id || selectedConversation.user.account_id;
      const currentUserId = getCurrentUserId();
      
      
      // Prevent loading messages if friend is the same as current user
      if (friendId === currentUserId) {
        console.error('❌ Cannot load messages: friend ID is the same as current user ID');
        return;
      }
      
      loadMessages(friendId);
      
      // Mark messages as read immediately when conversation is opened
      markMessagesAsRead();
      
      // Update conversations list to reset unread count for this conversation
      setConversations(prev => 
        prev.map(conv => {
          const convFriendId = conv.user.id || conv.user.account_id;
          if (convFriendId === friendId) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        })
      );
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createConversationWithFriend = async (friendId: string) => {
  try {
    if (isCreatingConversation) return; // Prevent multiple calls
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;
    
    // Prevent creating conversation with self
    if (friendId === currentUserId) {
      console.error('❌ Cannot create conversation with self');
      return false;
    }
    
    setIsCreatingConversation(true);

    // Don't send automatic welcome message
    // Just create the conversation entry without sending a message
    
    // First check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .or(`(user1_id.eq.${currentUserId},user2_id.eq.${friendId}),(user1_id.eq.${friendId},user2_id.eq.${currentUserId})`)
      .single();
    
    if (existingConv) {
      // Reload conversations and select the existing one
      await loadConversations();
      return true;
    }
    
    // Create conversation entry in the base table (not the view)
    const { data, error } = await supabase
      .from('conversations_base') // Try the base table first
      .insert({
        user1_id: currentUserId,
        user2_id: friendId,
        last_message: null,
        last_message_at: new Date().toISOString(),
        last_message_sender_id: null
      })
      .select();

    if (error) {
      // If table creation fails, just reload conversations
      await loadConversations();
      return true;
    }
    
    
    // Don't send automatic welcome message
    // Just reload conversations to get the new one
    await loadConversations();
    return true;
  } catch (error) {
    return false;
  } finally {
    setIsCreatingConversation(false);
  }
};

  const getCurrentUserId = (): string | null => {
    const currentUser = getCurrentUser();
    // Return the UUID (id) not the accountId for database operations
    return currentUser?.id || currentUser?.accountId || null;
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) return;

      const [conversationsData, usersData] = await Promise.all([
        messageDB.getUserConversations(currentUserId),
        userDB.getAllUsers()
      ]);


      const conversationsWithUsers: Conversation[] = [];
      
      for (const conv of conversationsData) {
        
        // Skip self-conversations where both users are the same
        if (conv.user1_id === conv.user2_id) {
          continue;
        }
        
        // Determine the other user ID based on which field matches current user
        const otherUserId: string = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;
        
        
        // Skip if other user is the same as current user (additional safety check)
        if (!otherUserId || otherUserId === currentUserId) {
          continue;
        }
        
        
        const otherUser = usersData.find(u => u.id === otherUserId || u.account_id === otherUserId);
        
        // Skip if user not found
        if (!otherUser) {
          continue;
        }
        
        // Get unread count for this specific conversation
        const unreadCount = await messageDB.getUnreadCountForConversation(currentUserId, otherUserId);
        
        conversationsWithUsers.push({
          id: conv.id || `conv_${conv.idx || Math.random()}`, // Use idx or random as fallback
          user: otherUser,
          lastMessage: {
            id: `msg_${conv.id || conv.idx || Math.random()}`, // Prefix to avoid ID conflicts
            senderId: conv.last_message_sender_id,
            receiverId: currentUserId,
            content: conv.last_message,
            messageType: 'text',
            createdAt: conv.last_message_at,
            isDeleted: false
          },
          unreadCount: unreadCount
        });
      }

      setConversations(conversationsWithUsers);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    try {
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        return;
      }
      
      if (!otherUserId) {
        return;
      }

      const messagesData = await messageDB.getConversation(currentUserId, otherUserId);
      
      const formattedMessages: MessageFrontend[] = messagesData.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        content: msg.content,
        messageType: msg.message_type,
        createdAt: msg.created_at,
        readAt: msg.read_at,
        isDeleted: msg.is_deleted
      }));

      setMessages(formattedMessages.reverse()); // Show oldest first
    } catch (error) {
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation) return;
    
    const currentUserId = getCurrentUserId();
    const friendId = selectedConversation.user.id || selectedConversation.user.account_id;
    
    if (!currentUserId || !friendId) return;
    
    try {
      
      // First, let's check what messages exist that need to be marked as read
      const { data: unreadMessages, error: checkError } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, read_at, is_deleted')
        .eq('sender_id', friendId)
        .eq('receiver_id', currentUserId)
        .is('read_at', null)
        .eq('is_deleted', false);
        
      if (checkError) {
        console.error('❌ Error checking unread messages:', checkError);
        console.error('❌ Check error details:', JSON.stringify(checkError, null, 2));
        throw checkError;
      }
      
      
      if (!unreadMessages || unreadMessages.length === 0) {
        return;
      }
      
      // Try to mark messages as read using individual message IDs
      const messageIds = unreadMessages.map(msg => msg.id);
      
      const { data, error } = await supabase
        .from('messages')
        .update({ 
          read_at: new Date().toISOString()
        })
        .in('id', messageIds)
        .select();
        
      if (error) {
        console.error('❌ Error marking messages as read:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        
        // Fallback: try individual updates
        let successCount = 0;
        
        for (const message of unreadMessages) {
          try {
            const { error: singleError } = await supabase
              .from('messages')
              .update({ 
                read_at: new Date().toISOString()
              })
              .eq('id', message.id);
              
            if (singleError) {
              console.error(`❌ Error updating message ${message.id}:`, singleError);
            } else {
              successCount++;
            }
          } catch (err) {
            console.error(`❌ Exception updating message ${message.id}:`, err);
          }
        }
        
        
        if (successCount === 0) {
          throw error; // Re-throw original error if fallback failed completely
        }
      }
      
      
      // Also update local messages state
      setMessages(prev => 
        prev.map(msg => 
          msg.senderId === friendId && !msg.readAt 
            ? { ...msg, readAt: new Date().toISOString() }
            : msg
        )
      );
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => {
          const convFriendId = conv.user.id || conv.user.account_id;
          if (convFriendId === friendId) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        })
      );
      
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error string:', String(error));
      if (error && typeof error === 'object') {
        console.error('❌ Error keys:', Object.keys(error));
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) return;

      const receiverId = selectedConversation.user.id || selectedConversation.user.account_id;

      const message = await messageDB.sendMessage(
        currentUserId,
        receiverId,
        newMessage.trim()
      );

      if (message) {
        const newMsg: MessageFrontend = {
          id: message.id,
          senderId: message.sender_id,
          receiverId: message.receiver_id,
          content: message.content,
          messageType: message.message_type,
          createdAt: message.created_at,
          isDeleted: message.is_deleted
        };

        // Check if message already exists before adding to prevent duplicates
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === newMsg.id);
          if (messageExists) {
            return prev;
          }
          return [...prev, newMsg];
        });
        
        setNewMessage('');
        
        // Don't reload conversations immediately to prevent jumping to top
        // The conversation will update naturally with the new message
        // loadConversations();
        
        // Update the current conversation's last message locally
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation?.id
              ? { 
                  ...conv, 
                  lastMessage: newMsg,
                  lastMessageAt: newMsg.createdAt
                }
              : conv
          )
        );
        
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatLastMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'الآن';
    if (diffInHours < 24) return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-black' : 'bg-gray-50'
      }`}>
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-purple-500/20 border-b-purple-500 animate-spin animation-delay-150"></div>
          <div className="absolute inset-2 w-12 h-12 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin animation-delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Elegant background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-blue-500' : 'bg-blue-400'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-purple-500' : 'bg-purple-400'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-pink-500' : 'bg-pink-400'
        }`}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 transition-all duration-300`}>
          <div className={`p-6 backdrop-blur-xl border-b ${
            isDark ? 'bg-gray-900/40 border-gray-800/30' : 'bg-white/60 border-gray-200/50'
          }`}>
            <div className="mb-6">
              <h1 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text mb-2 ${
                isDark 
                  ? 'from-blue-400 via-purple-400 to-pink-400 text-transparent' 
                  : 'from-blue-600 via-purple-600 to-pink-600 text-transparent'
              }`}>
                الرسائل
              </h1>
              <p className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                تواصل مع أصدقائك
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative group">
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
                isDark 
                  ? 'from-blue-500/30 to-purple-500/30' 
                  : 'from-blue-500/20 to-purple-500/20'
              } blur-lg group-hover:blur-xl transition-all duration-300`}></div>
              <input
                type="text"
                placeholder="البحث عن محادثة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`relative w-full px-6 py-4 text-lg rounded-2xl border focus:outline-none transition-all duration-300 backdrop-blur-xl ${
                  isDark
                    ? 'bg-gray-900/80 border-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-800/90 focus:border-blue-400/50 focus:shadow-2xl focus:shadow-blue-500/20'
                    : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white/90 focus:border-blue-400/50 focus:shadow-2xl focus:shadow-blue-500/20'
                }`}
              />
              <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                isDark ? 'text-gray-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-500'
              }`}>
                <Search className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {filteredConversations.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-20 px-8 rounded-3xl backdrop-blur-xl border ${
                isDark 
                  ? 'bg-gray-900/40 border-gray-800/30' 
                  : 'bg-white/60 border-gray-200/50'
              }`}>
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 ${
                  isDark ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200/50'
                }`}>
                  <MessageCircle className={`w-12 h-12 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد محادثات حالية'}
                </h3>
                <p className={`text-sm text-center ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {searchTerm ? 'جرب كلمات بحث مختلفة' : 'ابدأ محادثة جديدة مع صديق'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conversation, index) => (
                  <div
                    key={`conv_${conversation.id || `index_${index}`}_user_${conversation.user.id}`}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`group relative p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl ${
                      (selectedConversation?.id && selectedConversation.id === conversation.id) || 
                      (selectedConversation?.user.id === conversation.user.id) 
                        ? isDark
                          ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/20 border-blue-800/50 shadow-xl shadow-blue-500/10'
                          : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/60 shadow-lg shadow-blue-500/10'
                        : isDark
                          ? 'bg-gray-900/40 border-gray-800/30 hover:border-blue-800/50 shadow-lg shadow-black/20'
                          : 'bg-white/60 border-gray-200/50 hover:border-blue-200/60 shadow-lg shadow-gray-500/10'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Glow effect for active conversation */}
                    {((selectedConversation?.id && selectedConversation.id === conversation.id) || 
                      (selectedConversation?.user.id === conversation.user.id)) && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                    )}
                    
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="relative">
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                          isDark
                            ? 'from-blue-500 to-purple-500'
                            : 'from-blue-400 to-purple-400'
                        } opacity-20 blur-xl animate-pulse`}></div>
                        <UniversalAvatar 
                          src={conversation.user.avatar} 
                          username={conversation.user.username}
                          size="large"
                          className="relative"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-bold text-lg truncate bg-gradient-to-r bg-clip-text ${
                            isDark 
                              ? 'from-gray-200 to-gray-300 text-transparent' 
                              : 'from-gray-700 to-gray-900 text-transparent'
                          }`}>
                            {conversation.user.username}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            isDark
                              ? 'bg-gray-800/50 text-gray-400'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {conversation.lastMessage?.createdAt && formatLastMessageTime(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className={`text-sm truncate transition-colors duration-200 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {conversation.lastMessage?.content || 'بدء محادثة...'}
                        </p>
                      </div>
                      
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <div className={`relative flex-shrink-0`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold animate-pulse ${
                            isDark
                              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/25'
                              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25'
                          }`}>
                            {conversation.unreadCount}
                          </div>
                          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className={`p-6 backdrop-blur-xl border-b flex items-center justify-between ${
              isDark ? 'bg-gray-900/40 border-gray-800/30' : 'bg-white/60 border-gray-200/50'
            }`}>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className={`md:hidden p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    isDark
                      ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="relative">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                    isDark
                      ? 'from-green-500 to-emerald-500'
                      : 'from-green-400 to-emerald-400'
                  } opacity-20 blur-xl animate-pulse`}></div>
                  <UniversalAvatar 
                    src={selectedConversation.user.avatar} 
                    username={selectedConversation.user.username}
                    size="large"
                    className="relative"
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white animate-pulse"></div>
                </div>
                
                <div>
                  <h3 className={`font-bold text-lg bg-gradient-to-r bg-clip-text ${
                    isDark 
                      ? 'from-gray-200 to-gray-300 text-transparent' 
                      : 'from-gray-700 to-gray-900 text-transparent'
                  }`}>
                    {selectedConversation.user.username}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`}>
                      متصل الآن
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-blue-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600'
                }`}>
                  <Phone className="w-5 h-5" />
                </button>
                <button className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-purple-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-purple-600'
                }`}>
                  <Video className="w-5 h-5" />
                </button>
                <button className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-4 backdrop-blur-sm ${
              isDark ? 'bg-gray-900/20' : 'bg-gray-50/50'
            }`}>
              {messages.map((message, index) => {
                const currentUserId = getCurrentUserId();
                const isOwn = message.senderId === currentUserId;
                return (
                  <Message
                    key={`${message.id}_${index}`}
                    message={message}
                    isOwn={isOwn}
                    user={selectedConversation.user}
                  />
                );
              })}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 shadow-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className={`p-6 backdrop-blur-xl border-t ${
              isDark ? 'bg-gray-900/40 border-gray-800/30' : 'bg-white/60 border-gray-200/50'
            }`}>
              <div className="flex items-end gap-3">
                <button className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-purple-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-purple-600'
                }`}>
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
                    isDark 
                      ? 'from-blue-500/20 to-purple-500/20' 
                      : 'from-blue-500/10 to-purple-500/10'
                  } blur-lg`}></div>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالتك..."
                    className={`relative w-full px-6 py-4 rounded-2xl border resize-none focus:outline-none transition-all duration-300 backdrop-blur-xl ${
                      isDark
                        ? 'bg-gray-900/80 border-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-800/90 focus:border-blue-400/50'
                        : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white/90 focus:border-blue-400/50'
                    }`}
                    rows={1}
                  />
                </div>
                
                <button className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-yellow-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-yellow-600'
                }`}>
                  <Smile className="w-5 h-5" />
                </button>
                
                <button className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-green-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-green-600'
                }`}>
                  <Mic className="w-5 h-5" />
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4 ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 disabled:from-gray-600 disabled:to-gray-700'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25 disabled:from-gray-400 disabled:to-gray-500'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`hidden md:flex flex-1 items-center justify-center p-8`}>
            <div className={`text-center max-w-md p-8 rounded-3xl backdrop-blur-xl border ${
              isDark 
                ? 'bg-gray-900/40 border-gray-800/30' 
                : 'bg-white/60 border-gray-200/50'
            }`}>
              <div className={`w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-6 relative ${
                isDark ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200/50'
              }`}>
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${
                  isDark
                    ? 'from-blue-500 to-purple-500'
                    : 'from-blue-400 to-purple-400'
                } opacity-20 blur-xl animate-pulse`}></div>
                <MessageCircle className={`w-16 h-16 relative z-10 ${
                  isDark ? 'text-gray-600' : 'text-gray-400'
                }`} />
              </div>
              <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r bg-clip-text ${
                isDark 
                  ? 'from-blue-400 to-purple-400 text-transparent' 
                  : 'from-blue-600 to-purple-600 text-transparent'
              }`}>
                مرحباً!
              </h3>
              <p className={`text-sm leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                اختر محادثة من القائمة لبدء الدردشة مع أصدقائك
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
