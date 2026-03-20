'use client';

import React, { useState, useEffect } from 'react';
import { friendshipDB, FriendshipRequestFrontend, FriendshipFrontend } from '@/lib/friendship';
import { userDB, UserAccount } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { MessageCircle, Trash2, Search, UserPlus, X, User, Check, Clock, AlertTriangle } from 'lucide-react';
import { initializeFriendshipTables, testFriendshipTables } from '@/lib/friendship-init';

interface Friend {
  user: UserAccount;
  friendship: FriendshipFrontend;
}

interface FriendshipManagerProps {
  onSwitchToMessaging?: (friendId: string) => void;
}

export default function FriendshipManager({ onSwitchToMessaging }: FriendshipManagerProps = {}) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendshipRequestFrontend[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendshipRequestFrontend[]>([]);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'find'>('friends');
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

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
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setTablesError(null);
    
    try {
      // First, check if tables exist
      const tablesExist = await initializeFriendshipTables();
      if (!tablesExist) {
        setTablesError('جداول الصداقة غير موجودة. يرجى تشغيل ملف الترحيل SQL في Supabase أولاً.');
        setLoading(false);
        return;
      }
      
      // Test table access
      const tableTest = await testFriendshipTables();
      if (!tableTest.success) {
        setTablesError(`خطأ في الوصول للجداول: ${tableTest.message}`);
        setLoading(false);
        return;
      }
      
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      
      const currentUserId = currentUser.id; // Use UUID instead of accountId
      if (!currentUserId) return;

      const [friendsData, pendingData, sentData, usersData] = await Promise.all([
        friendshipDB.getUserFriends(currentUserId),
        friendshipDB.getPendingRequests(currentUserId),
        friendshipDB.getSentRequests(currentUserId),
        userDB.getAllUsers()
      ]);

      // Get friend details
      const friendsWithDetails: Friend[] = [];
      for (const friendship of friendsData) {
        const friendId = friendship.user1_id === currentUserId ? friendship.user2_id : friendship.user1_id;
        const friendUser = usersData.find(u => u.id === friendId);
        if (friendUser) {
          friendsWithDetails.push({
            user: friendUser,
            friendship: {
              id: friendship.id,
              user1Id: friendship.user1_id,
              user2Id: friendship.user2_id,
              createdAt: friendship.created_at,
              status: friendship.status
            }
          });
        }
      }

      console.log('🔄 Loading friendship data...');
      setFriends(friendsWithDetails);
      console.log('🔄 Friends data updated:', friendsWithDetails.length, 'friends loaded');
      setPendingRequests(pendingData.map(req => ({
        id: req.id,
        senderId: req.sender_id,
        receiverId: req.receiver_id,
        status: req.status,
        createdAt: req.created_at,
        updatedAt: req.updated_at
      })));
      setSentRequests(sentData.map(req => ({
        id: req.id,
        senderId: req.sender_id,
        receiverId: req.receiver_id,
        status: req.status,
        createdAt: req.created_at,
        updatedAt: req.updated_at
      })));
      setAllUsers(usersData.filter(u => u.account_id !== currentUser.accountId));
      console.log('🔄 All friendship data loaded successfully');
    } catch (error) {
      console.error('Error loading friendship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = (): string | null => {
    const currentUser = getCurrentUser();
    // Return the UUID (id) not the accountId for database operations
    return currentUser?.id || currentUser?.accountId || null;
  };

  const openMessaging = (friend: UserAccount) => {
    console.log('🔍 Debug - openMessaging called with:', friend.username, friend.id, friend.account_id);
    const friendId = friend.id || friend.account_id;
    console.log('🔍 Debug - Using friendId:', friendId);
    
    if (onSwitchToMessaging) {
      console.log('🔍 Debug - Calling onSwitchToMessaging with:', friendId);
      onSwitchToMessaging(friendId);
    } else {
      console.log('🔍 Debug - No onSwitchToMessaging function provided');
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    const senderId = getCurrentUserId();
    if (!senderId) return;

    const success = await friendshipDB.sendFriendRequest(senderId, receiverId);
    if (success) {
      loadData();
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    const success = await friendshipDB.acceptFriendRequest(requestId);
    if (success) {
      loadData();
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    const success = await friendshipDB.rejectFriendRequest(requestId);
    if (success) {
      loadData();
    }
  };

  const removeFriend = async (friendshipId: string) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    const friendship = friends.find(f => f.friendship.id === friendshipId);
    if (!friendship) return;

    // Use the UUID from the friendship record, not the custom account_id
    const friendUuid = friendship.friendship.user1Id === currentUserId ? friendship.friendship.user2Id : friendship.friendship.user1Id;
    
    const success = await friendshipDB.removeFriend(currentUserId, friendUuid);
    if (success) {
      console.log('🔄 Friend removed successfully, refreshing data...');
      await loadData();
      console.log('🔄 Data refresh completed');
    } else {
      console.error('❌ Failed to remove friend');
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'الآن';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعات`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم${diffInDays > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (tablesError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">مشكلة في قاعدة البيانات</h3>
          <p className="text-gray-600 mb-4">{tablesError}</p>
          <div className="bg-gray-100 p-4 rounded-lg text-right">
            <p className="text-sm text-gray-700 mb-2">لحل المشكلة:</p>
            <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
              <li>اذهب إلى لوحة تحكم Supabase</li>
              <li>افتح SQL Editor</li>
              <li>شغّل محتويات ملف: <code className="bg-gray-200 px-1 rounded">migrations/create_friendship_system.sql</code></li>
              <li>أعد تحميل الصفحة</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-md p-6 w-full h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex-shrink-0">إدارة الصداقات</h2>
      
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b flex-shrink-0">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'friends'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          الأصدقاء ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'requests'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          طلبات الصداقة ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('find')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'find'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          البحث عن أصدقاء
        </button>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="flex-grow-1 overflow-y-auto">
          {friends.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا يوجد أصدقاء حالياً</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {friends.map((friend) => (
                <div key={friend.user.account_id} className={`${
                  isDark ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700' : 'bg-white/80 backdrop-blur-sm border-white/20'
                } rounded-lg p-4 hover:bg-white/90 transition-colors min-h-[280px] flex flex-col`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      {friend.user.avatar ? (
                        <img src={friend.user.avatar} alt={friend.user.username} className="w-16 h-16 rounded-full" />
                      ) : (
                        <User className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <h3 className={`font-semibold mb-1 ${
                      isDark ? 'text-gray-100' : 'text-gray-800'
                    }`}>{friend.user.username}</h3>
                    <p className={`text-sm mb-3 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>صديق منذ {formatTimeAgo(friend.friendship.createdAt)}</p>
                    <div className="flex items-center space-x-2 space-x-reverse mt-auto">
                      <button
                        onClick={() => {
                          console.log('🔍 Debug - Messaging button clicked for:', friend.user.username);
                          openMessaging(friend.user);
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          isDark ? 'text-blue-400 hover:bg-blue-900' : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title="مراسلة"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFriend(friend.friendship.id!)}
                        className={`p-2 rounded-full transition-colors ${
                          isDark ? 'text-red-400 hover:bg-red-900' : 'text-red-600 hover:bg-red-50'
                        }`}
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="flex-grow-1 overflow-y-auto">
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد طلبات صداقة حالية</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {pendingRequests.map((request) => {
                const sender = allUsers.find(u => u.id === request.senderId);
                if (!sender) return null;
                
                return (
                  <div key={request.id} className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/90 transition-colors min-h-[280px] flex flex-col">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        {sender.avatar ? (
                          <img src={sender.avatar} alt={sender.username} className="w-16 h-16 rounded-full" />
                        ) : (
                          <User className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{sender.username}</h3>
                      <p className="text-sm text-gray-500 mb-3">طلب صداقة {formatTimeAgo(request.createdAt)}</p>
                      <div className="flex items-center space-x-2 space-x-reverse mt-auto">
                        <button
                          onClick={() => acceptFriendRequest(request.id!)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                        >
                          <Check className="w-3 h-3 ml-1" />
                          قبول
                        </button>
                        <button
                          onClick={() => rejectFriendRequest(request.id!)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm"
                        >
                          <X className="w-3 h-3 ml-1" />
                          رفض
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <div className="mt-6 px-4">
              <h3 className="font-semibold text-gray-700 mb-4 text-center">طلباتك المرسلة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sentRequests.map((request) => {
                  const receiver = allUsers.find(u => u.id === request.receiverId);
                  if (!receiver) return null;
                  
                  return (
                    <div key={request.id} className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg p-4 min-h-[280px] flex flex-col">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          {receiver.avatar ? (
                            <img src={receiver.avatar} alt={receiver.username} className="w-16 h-16 rounded-full" />
                          ) : (
                            <User className="w-8 h-8 text-gray-600" />
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-1">{receiver.username}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 ml-1" />
                          {formatTimeAgo(request.createdAt)}
                        </p>
                        <div className="text-sm text-gray-500 mt-2">
                          في انتظار الرد
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Find Friends Tab */}
      {activeTab === 'find' && (
        <div className="flex-grow-1 overflow-y-auto">
          {allUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا يوجد مستخدمون آخرون حالياً</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {allUsers.map((user) => {
                const isFriend = user.id && friends.some(f => f.user.id === user.id);
                const hasPendingRequest = user.id && (pendingRequests.some(r => r.receiverId === user.id) ||
                                         sentRequests.some(r => r.receiverId === user.id));
                
                return (
                  <div key={user.account_id} className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/90 transition-colors min-h-[280px] flex flex-col">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} className="w-16 h-16 rounded-full" />
                        ) : (
                          <User className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{user.username}</h3>
                      <p className="text-sm text-gray-500 mb-3">المستوى {user.rank} • {user.score} نقطة</p>
                      <div className="flex items-center justify-center mt-auto">
                        {isFriend ? (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                            صديق بالفعل
                          </span>
                        ) : hasPendingRequest ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
                            طلب صداقة مُرسل
                          </span>
                        ) : (
                          <button
                            onClick={() => user.id && sendFriendRequest(user.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                          >
                            <UserPlus className="w-3 h-3 ml-1" />
                            إضافة صديق
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
