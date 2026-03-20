'use client';

import React, { useState, useEffect, useRef } from 'react';
import { messageDB, MessageFrontend } from '@/lib/friendship';
import { userDB, UserAccount } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { Send, ArrowLeft, Search, MoreVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
    <div className={`flex ${isOwn ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className={`px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-800'
        }`}>
          <p className="text-sm">{message.content}</p>
        </div>
        <p className={`text-xs text-gray-500 mt-1 ${
          isOwn ? 'text-right' : 'text-left'
        }`}>
          {formatTime(message.createdAt)}
          {message.readAt && isOwn && ' • تمت القراءة'}
        </p>
      </div>
    </div>
  );
};

interface MessagingSystemProps {
  selectedFriendId?: string | null;
}

export default function MessagingSystem({ selectedFriendId }: MessagingSystemProps = {}) {
  console.log('🔍 MessagingSystem - Component initialized with selectedFriendId:', selectedFriendId);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedFriendIdState, setSelectedFriendIdState] = useState<string | null>(selectedFriendId || null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [messages, setMessages] = useState<MessageFrontend[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDark, setIsDark] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);
  
  const { getCurrentUser } = useUser();

  // Check for system dark mode preference
  useEffect(() => {
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(darkModePreference);
    
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);
    
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    loadConversations();
  }, []);

  // Track selectedFriendId changes
  useEffect(() => {
    console.log('🔍 MessagingSystem - selectedFriendId changed to:', selectedFriendId);
    if (selectedFriendId !== selectedFriendIdState) {
      console.log('🔍 MessagingSystem - Updating selectedFriendIdState to:', selectedFriendId);
      setSelectedFriendIdState(selectedFriendId || null);
    }
  }, [selectedFriendId]);

  // Real-time subscription for messages
  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) return;

    console.log('🔍 Setting up realtime subscription for user:', userId);

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
          console.log('🔍 Real-time message update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as any;
            
            // Check if this message involves the current user
            const involvesCurrentUser = 
              newMessage.sender_id === userId || newMessage.receiver_id === userId;
            
            if (!involvesCurrentUser) {
              console.log('🔍 Message does not involve current user, skipping');
              return;
            }
            
            console.log('🔍 New message involves current user, processing...');
            
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
              
              console.log('🔍 Message relevance check:', {
                senderId: formattedMessage.senderId,
                receiverId: formattedMessage.receiverId,
                currentUserId: userId,
                friendId,
                isRelevant
              });
              
              if (isRelevant) {
                // Check if message already exists to prevent duplicates
                setMessages(prev => {
                  const messageExists = prev.some(msg => msg.id === formattedMessage.id);
                  if (messageExists) {
                    console.log('🔍 Message already exists, skipping to prevent duplicate');
                    return prev;
                  }
                  return [...prev, formattedMessage];
                });
                scrollToBottom();
                console.log('🔍 Message added to current conversation');
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
                
                return isRelevantConv
                  ? { 
                      ...conv, 
                      lastMessage: formattedMessage,
                      lastMessageAt: formattedMessage.createdAt
                    }
                  : conv;
              })
            );
            
            console.log('🔍 Message added to current conversation');
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
        console.log('🔍 Realtime subscription status:', status);
      });

    subscriptionRef.current = subscription;

    return () => {
      console.log('🔍 Unsubscribing from realtime');
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
      
      console.log('🔍 Debug - Looking for conversation with friend ID:', selectedFriendIdState);
      console.log('🔍 Debug - Available conversations:', conversations.map(c => ({ 
        id: c.id, 
        userId: c.user?.id, 
        username: c.user?.username,
        accountId: c.user?.account_id
      })));
      
      // Find conversation with the selected friend
      const conversation = conversations.find(conv => {
        console.log('🔍 Debug - Checking conversation:', {
          convId: conv.id,
          convUserId: conv.user?.id,
          convAccountId: conv.user?.account_id,
          targetId: selectedFriendIdState,
          match: conv.user?.id === selectedFriendIdState || conv.user?.account_id === selectedFriendIdState
        });
        return conv.user?.id === selectedFriendIdState || conv.user?.account_id === selectedFriendIdState;
      });
      
      console.log('🔍 Debug - Found conversation:', conversation?.user?.username);
      
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        console.log('🔍 Debug - No conversation found, creating new one...');
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
      
      console.log('🔍 Debug - No conversations at all, creating new one...');
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
      
      console.log('🔍 Debug - Loading messages for friend:', friendId);
      console.log('🔍 Debug - Current user ID:', currentUserId);
      
      // Prevent loading messages if friend is the same as current user
      if (friendId === currentUserId) {
        console.error('❌ Cannot load messages: friend ID is the same as current user ID');
        return;
      }
      
      loadMessages(friendId);
      // Mark messages as read
      markMessagesAsRead();
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
    console.log('🔍 Debug - Creating conversation without automatic message');
    
    // First check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .or(`(user1_id.eq.${currentUserId},user2_id.eq.${friendId}),(user1_id.eq.${friendId},user2_id.eq.${currentUserId})`)
      .single();
    
    if (existingConv) {
      console.log('🔍 Debug - Conversation already exists, loading it instead');
      // Reload conversations and select the existing one
      await loadConversations();
      return true;
    }
    
    // Create conversation entry in the base table (not the view)
    console.log('🔍 Debug - Attempting to create conversation with:', {
      user1_id: currentUserId,
      user2_id: friendId,
      last_message: null,
      last_message_at: new Date().toISOString(),
      last_message_sender_id: null
    });
    
    // Use the base table instead of the view
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
      console.error('❌ Error creating conversation:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      
      // If table creation fails, just reload conversations
      console.log('🔍 Debug - Table creation failed, reloading conversations...');
      await loadConversations();
      return true;
    }
    
    console.log('✅ Conversation created successfully:', data);
    
    // Don't send automatic welcome message
    // Just reload conversations to get the new one
    await loadConversations();
    return true;
  } catch (error) {
    console.error('Error creating conversation:', error);
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
      console.log('🔍 Debug - Loading conversations for user:', currentUserId);
      if (!currentUserId) return;

      const [conversationsData, usersData] = await Promise.all([
        messageDB.getUserConversations(currentUserId),
        userDB.getAllUsers()
      ]);

      console.log('🔍 Debug - Raw conversations data:', conversationsData);
      console.log('🔍 Debug - Sample conversation structure:', conversationsData[0]);
      console.log('🔍 Debug - Users data length:', usersData.length);

      const conversationsWithUsers: Conversation[] = [];
      
      for (const conv of conversationsData) {
        console.log('🔍 Debug - Processing conversation:', {
          id: conv.id,
          user1_id: conv.user1_id,
          user2_id: conv.user2_id,
          currentUserId: currentUserId
        });
        
        // Skip self-conversations where both users are the same
        if (conv.user1_id === conv.user2_id) {
          console.log('🔍 Debug - Skipping self-conversation where user1_id === user2_id');
          continue;
        }
        
        // Determine the other user ID based on which field matches current user
        const otherUserId: string = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;
        
        console.log('🔍 Debug - Determined otherUserId:', otherUserId);
        
        // Skip if other user is the same as current user (additional safety check)
        if (!otherUserId || otherUserId === currentUserId) {
          console.log('🔍 Debug - Skipping conversation - other user is same as current user or invalid');
          continue;
        }
        
        console.log('🔍 Debug - Looking for user with ID:', otherUserId);
        const otherUser = usersData.find(u => u.id === otherUserId || u.account_id === otherUserId);
        console.log('🔍 Debug - Found user:', otherUser?.username, 'with id:', otherUser?.id, 'account_id:', otherUser?.account_id);
        
        // Skip if user not found
        if (!otherUser) {
          console.log('🔍 Debug - Skipping conversation - user not found');
          continue;
        }
        
        const unreadCount = await messageDB.getUnreadCount(currentUserId);
        
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
          unreadCount: conv.last_message_sender_id !== currentUserId ? 1 : 0
        });
      }

      setConversations(conversationsWithUsers);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    try {
      const currentUserId = getCurrentUserId();
      console.log('🔍 Debug - loadMessages called with:', { currentUserId, otherUserId });
      
      if (!currentUserId) {
        console.error('❌ No current user ID found');
        return;
      }
      
      if (!otherUserId) {
        console.error('❌ No other user ID provided');
        return;
      }

      const messagesData = await messageDB.getConversation(currentUserId, otherUserId);
      console.log('🔍 Debug - Messages loaded:', messagesData.length);
      
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
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation) return;
    
    const currentUserId = getCurrentUserId();
    const friendId = selectedConversation.user.id || selectedConversation.user.account_id;
    
    if (!currentUserId || !friendId) return;
    
    try {
      // Mark unread messages from friend as read
      await supabase
        .from('messages')
        .update({ 
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('sender_id', friendId)
        .eq('receiver_id', currentUserId)
        .is('read_at', null);
        
      console.log('🔍 Messages marked as read');
      
      // Also update local messages state
      setMessages(prev => 
        prev.map(msg => 
          msg.senderId === friendId && !msg.readAt 
            ? { ...msg, readAt: new Date().toISOString() }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) return;

      const receiverId = selectedConversation.user.id || selectedConversation.user.account_id;
      console.log('🔍 Debug - Sending message to:', receiverId);
      console.log('🔍 Debug - From user:', currentUserId);

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
            console.log('🔍 Message already exists locally, skipping');
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
        
        console.log('🔍 Message sent and added to local state:', newMsg);
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
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-l'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-b'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>الرسائل</h2>
          <div className="relative">
            <Search className={`absolute right-3 top-3 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="البحث عن محادثة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-800'
              }`}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد محادثات حالية'}
            </div>
          ) : (
            filteredConversations.map((conversation, index) => (
              <div
                key={`conv_${conversation.id || `index_${index}`}_user_${conversation.user.id}`}
                onClick={() => setSelectedConversation(conversation)}
                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b ${
                  (selectedConversation?.id && selectedConversation.id === conversation.id) || 
                  (selectedConversation?.user.id === conversation.user.id) ? 
                    (isDark ? 'bg-blue-900' : 'bg-blue-50') : ''
                } ${isDark ? 'border-gray-700' : 'border-b'}`}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                  {conversation.user.avatar ? (
                    <img src={conversation.user.avatar} alt={conversation.user.username} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {conversation.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                      {conversation.user.username}
                    </h3>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {conversation.lastMessage?.createdAt && formatLastMessageTime(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {conversation.lastMessage?.content}
                  </p>
                </div>
                {conversation.unreadCount && conversation.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center mr-2">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-b'
          }`}>
            <div className="flex items-center">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                {selectedConversation.user.avatar ? (
                  <img src={selectedConversation.user.avatar} alt={selectedConversation.user.username} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedConversation.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                  {selectedConversation.user.username}
                </h3>
                <p className="text-sm text-green-600">متصل الآن</p>
              </div>
            </div>
            <button className={`p-2 hover:bg-gray-100 rounded-full ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
            isDark ? 'bg-gray-900' : 'bg-gray-50'
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
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className={`p-4 border-t ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-t'
          }`}>
            <div className="flex items-end space-x-2 space-x-reverse">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك..."
                  className={`w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-800'
                  }`}
                  rows={1}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className={`p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`hidden md:flex flex-1 items-center justify-center ${
          isDark ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <div className="text-center">
            <div className={`w-24 h-24 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            } rounded-full flex items-center justify-center mx-auto mb-4`}>
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 7.5-9 7.5s4.032 7.5-9 7.5-9z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? 'text-gray-100' : 'text-gray-700'
            }`}>مرحباً!</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              اختر محادثة لبدء الدردشة
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
