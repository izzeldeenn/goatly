'use client';

import React, { useState, useEffect } from 'react';
import { friendshipDB, FriendshipRequestFrontend, FriendshipFrontend } from '@/lib/friendship';
import { userDB, UserAccount } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MessageCircle, Trash2, Search, UserPlus, X, User, Check, Clock, AlertTriangle, Users, UserCheck, Send, Heart, Sparkles } from 'lucide-react';
import { initializeFriendshipTables, testFriendshipTables } from '@/lib/friendship-init';
import UniversalAvatar from './UniversalAvatar';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const { getCurrentUser } = useUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

      setFriends(friendsWithDetails);
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
      const filteredUsers = usersData.filter(u => u.account_id !== currentUser.accountId);
      setAllUsers(filteredUsers);
      
      // Debug information
      setDebugInfo(`Total users: ${usersData.length}, Filtered users: ${filteredUsers.length}, Current user: ${currentUser.accountId}`);
      console.log('FriendshipManager Debug:', {
        totalUsers: usersData.length,
        filteredUsers: filteredUsers.length,
        currentUserAccountId: currentUser.accountId,
        currentUserId: currentUser.id,
        sampleUsers: usersData.slice(0, 3).map(u => ({ id: u.id, accountId: u.account_id, username: u.username }))
      });
    } catch (error) {
      console.error('Error in loadData:', error);
      setDebugInfo(`Error: ${error}`);
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
    const friendId = friend.id; // Use the UUID for messaging
    
    console.log('🔘 Messaging button clicked:', { 
      friendId, 
      friendName: friend.username,
      hasOnSwitchToMessaging: !!onSwitchToMessaging 
    });
    
    if (onSwitchToMessaging && friendId) {
      console.log('📞 Calling onSwitchToMessaging with friendId:', friendId);
      onSwitchToMessaging(friendId);
    } else {
      console.error('❌ Cannot open messaging:', { 
        hasFriendId: !!friendId, 
        hasCallback: !!onSwitchToMessaging 
      });
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
      await loadData();
    } else {
      // Failed to remove friend
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
      <div className={`min-h-screen flex items-center justify-center p-8 ${
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

  if (tablesError) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-8 ${
        isDark ? 'bg-black' : 'bg-gray-50'
      }`}>
        <div className={`text-center max-w-md p-8 rounded-3xl backdrop-blur-xl border ${
          isDark 
            ? 'bg-red-900/10 border-red-800/30 shadow-2xl shadow-red-500/10' 
            : 'bg-red-50/80 border-red-200/50 shadow-xl shadow-red-500/10'
        }`}>
          <div className="relative mb-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto ${
              isDark ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-100 border border-red-200/50'
            }`}>
              <AlertTriangle className={`w-10 h-10 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 animate-pulse"></div>
          </div>
          <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r bg-clip-text ${
            isDark 
              ? 'from-red-400 to-pink-400 text-transparent' 
              : 'from-red-600 to-pink-600 text-transparent'
          }`}>
            مشكلة في قاعدة البيانات
          </h3>
          <p className={`mb-6 text-sm leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {tablesError}
          </p>
          <div className={`p-6 rounded-2xl text-right space-y-3 ${
            isDark ? 'bg-gray-900/50 border border-gray-800/30' : 'bg-white/60 border border-gray-200/50'
          }`}>
            <p className={`text-sm font-semibold mb-4 ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            }`}>
              لحل المشكلة:
            </p>
            <ol className={`text-sm space-y-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                اذهب إلى لوحة تحكم Supabase
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                افتح SQL Editor
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                شغّل محتويات ملف: <code className={`px-2 py-1 rounded-lg text-xs font-mono ${
                  isDark ? 'bg-gray-800 text-blue-400' : 'bg-gray-100 text-blue-600'
                }`}>migrations/create_friendship_system.sql</code>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                أعد تحميل الصفحة
              </li>
            </ol>
          </div>
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

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text ${
                isDark 
                  ? 'from-blue-400 via-purple-400 to-pink-400 text-transparent' 
                  : 'from-blue-600 via-purple-600 to-pink-600 text-transparent'
              }`}>
                إدارة الصداقات
              </h1>
              <p className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                تواصل مع الأصدقاء ووسع شبكتك الاجتماعية
              </p>
            </div>
            <div className={`p-4 rounded-2xl backdrop-blur-xl border ${
              isDark 
                ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-800/30 shadow-xl shadow-blue-500/10' 
                : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/50 shadow-lg shadow-blue-500/10'
            }`}>
              <div className="flex items-center gap-3">
                <Users className={`w-6 h-6 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div>
                  <div className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {friends.length}
                  </div>
                  <div className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    أصدقاء
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Tabs */}
          <div className={`flex gap-2 p-2 rounded-2xl backdrop-blur-xl border ${
            isDark 
              ? 'bg-gray-900/40 border-gray-800/30' 
              : 'bg-white/60 border-gray-200/50'
          }`}>
            {[
              { id: 'friends', label: 'الأصدقاء', count: friends.length, icon: Users },
              { id: 'requests', label: 'الطلبات', count: pendingRequests.length, icon: UserCheck },
              { id: 'find', label: 'البحث', count: null, icon: Search }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsAnimating(true);
                  setTimeout(() => setIsAnimating(false), 300);
                }}
                className={`relative flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group overflow-hidden ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                {/* Shine effect */}
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
                )}
                
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold relative z-10 ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : isDark
                        ? 'bg-gray-800 text-gray-400'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className={`transition-all duration-500 ${
            isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
          }`}>
            {friends.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-20 px-8 rounded-3xl backdrop-blur-xl border ${
                isDark 
                  ? 'bg-gray-900/40 border-gray-800/30' 
                  : 'bg-white/60 border-gray-200/50'
              }`}>
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 ${
                  isDark ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200/50'
                }`}>
                  <Users className={`w-12 h-12 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  لا يوجد أصدقاء حالياً
                </h3>
                <p className={`text-sm text-center ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  ابدأ بالبحث عن أصدقاء جدد لتوسيع شبكتك الاجتماعية
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {friends.map((friend, index) => (
                  <div
                    key={friend.user.account_id}
                    className={`group relative p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      isDark
                        ? 'bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-800/30 hover:border-blue-800/50 shadow-xl shadow-black/20'
                        : 'bg-gradient-to-br from-white/80 to-gray-50/60 border-gray-200/50 hover:border-blue-200/60 shadow-lg shadow-gray-500/10'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${
                      isDark
                        ? 'from-blue-500/10 to-purple-500/10'
                        : 'from-blue-500/5 to-purple-500/5'
                    }`}></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                          isDark
                            ? 'from-blue-500 to-purple-500'
                            : 'from-blue-400 to-purple-400'
                        } opacity-20 blur-xl animate-pulse`}></div>
                        <UniversalAvatar 
                          src={friend.user.avatar} 
                          username={friend.user.username}
                          size="xlarge"
                          className="relative"
                        />
                      </div>
                      
                      <h3 className={`font-bold text-lg mb-2 bg-gradient-to-r bg-clip-text ${
                        isDark 
                          ? 'from-blue-300 to-purple-300 text-transparent' 
                          : 'from-blue-600 to-purple-600 text-transparent'
                      }`}>
                        {friend.user.username}
                      </h3>
                      
                      <div className={`flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-medium ${
                        isDark
                          ? 'bg-blue-900/30 text-blue-300 border border-blue-800/30'
                          : 'bg-blue-50 text-blue-600 border border-blue-200/50'
                      }`}>
                        <Heart className="w-3 h-3" />
                        صديق منذ {formatTimeAgo(friend.friendship.createdAt)}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-auto">
                        <button
                          onClick={() => openMessaging(friend.user)}
                          className={`group/btn p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                            isDark
                              ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50 border border-blue-800/30 hover:border-blue-700/50'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/50 hover:border-blue-300/50'
                          }`}
                          title="مراسلة"
                        >
                          <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => removeFriend(friend.friendship.id!)}
                          className={`group/btn p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                            isDark
                              ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50 border border-red-800/30 hover:border-red-700/50'
                              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 hover:border-red-300/50'
                          }`}
                          title="حذف الصداقة"
                        >
                          <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
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
          <div className={`transition-all duration-500 ${
            isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
          }`}>
            {pendingRequests.length === 0 && sentRequests.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-20 px-8 rounded-3xl backdrop-blur-xl border ${
                isDark 
                  ? 'bg-gray-900/40 border-gray-800/30' 
                  : 'bg-white/60 border-gray-200/50'
              }`}>
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 ${
                  isDark ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200/50'
                }`}>
                  <UserCheck className={`w-12 h-12 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  لا توجد طلبات صداقة حالية
                </h3>
                <p className={`text-sm text-center ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  ستظهر هنا طلبات الصداقة الواردة والمرسلة
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <div>
                    <h2 className={`text-2xl font-bold mb-6 bg-gradient-to-r bg-clip-text ${
                      isDark 
                        ? 'from-green-400 to-emerald-400 text-transparent' 
                        : 'from-green-600 to-emerald-600 text-transparent'
                    }`}>
                      طلبات الصداقة الواردة
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {pendingRequests.map((request, index) => {
                        const sender = allUsers.find(u => u.id === request.senderId);
                        if (!sender) return null;
                        
                        return (
                          <div
                            key={request.id}
                            className={`group relative p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                              isDark
                                ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/10 border-green-800/30 hover:border-green-700/50 shadow-xl shadow-black/20'
                                : 'bg-gradient-to-br from-green-50/80 to-emerald-50/60 border-green-200/50 hover:border-green-300/60 shadow-lg shadow-green-500/10'
                            }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="relative z-10 flex flex-col items-center text-center">
                              <div className="relative mb-4">
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                                  isDark
                                    ? 'from-green-500 to-emerald-500'
                                    : 'from-green-400 to-emerald-400'
                                } opacity-20 blur-xl animate-pulse`}></div>
                                <UniversalAvatar 
                                  src={sender.avatar} 
                                  username={sender.username}
                                  size="xlarge"
                                  className="relative"
                                />
                              </div>
                              
                              <h3 className={`font-bold text-lg mb-2 ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {sender.username}
                              </h3>
                              
                              <div className={`flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-medium ${
                                isDark
                                  ? 'bg-green-900/30 text-green-300 border border-green-800/30'
                                  : 'bg-green-50 text-green-600 border border-green-200/50'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(request.createdAt)}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-auto">
                                <button
                                  onClick={() => acceptFriendRequest(request.id!)}
                                  className={`group/btn px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm font-semibold ${
                                    isDark
                                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/25'
                                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25'
                                  }`}
                                >
                                  <Check className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                  قبول
                                </button>
                                <button
                                  onClick={() => rejectFriendRequest(request.id!)}
                                  className={`group/btn px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm font-semibold ${
                                    isDark
                                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500 shadow-lg shadow-red-500/25'
                                      : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/25'
                                  }`}
                                >
                                  <X className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                  رفض
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Sent Requests */}
                {sentRequests.length > 0 && (
                  <div>
                    <h2 className={`text-2xl font-bold mb-6 bg-gradient-to-r bg-clip-text ${
                      isDark 
                        ? 'from-blue-400 to-cyan-400 text-transparent' 
                        : 'from-blue-600 to-cyan-600 text-transparent'
                    }`}>
                      طلباتك المرسلة
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {sentRequests.map((request, index) => {
                        const receiver = allUsers.find(u => u.id === request.receiverId);
                        if (!receiver) return null;
                        
                        return (
                          <div
                            key={request.id}
                            className={`group relative p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${
                              isDark
                                ? 'bg-gradient-to-br from-blue-900/20 to-cyan-900/10 border-blue-800/30 hover:border-blue-700/50 shadow-xl shadow-black/20'
                                : 'bg-gradient-to-br from-blue-50/80 to-cyan-50/60 border-blue-200/50 hover:border-blue-300/60 shadow-lg shadow-blue-500/10'
                            }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="relative z-10 flex flex-col items-center text-center">
                              <div className="relative mb-4">
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                                  isDark
                                    ? 'from-blue-500 to-cyan-500'
                                    : 'from-blue-400 to-cyan-400'
                                } opacity-20 blur-xl animate-pulse`}></div>
                                <UniversalAvatar 
                                  src={receiver.avatar} 
                                  username={receiver.username}
                                  size="xlarge"
                                  className="relative"
                                />
                              </div>
                              
                              <h3 className={`font-bold text-lg mb-2 ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {receiver.username}
                              </h3>
                              
                              <div className={`flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-medium ${
                                isDark
                                  ? 'bg-blue-900/30 text-blue-300 border border-blue-800/30'
                                  : 'bg-blue-50 text-blue-600 border border-blue-200/50'
                              }`}>
                                <Send className="w-3 h-3" />
                                {formatTimeAgo(request.createdAt)}
                              </div>
                              
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                                isDark
                                  ? 'bg-gray-800/50 text-gray-300 border border-gray-700/30'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200/50'
                              }`}>
                                <Clock className="w-4 h-4 animate-pulse" />
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
          </div>
        )}

        {/* Find Friends Tab */}
        {activeTab === 'find' && (
          <div className={`transition-all duration-500 ${
            isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
          }`}>
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-2xl mx-auto group">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
                  isDark 
                    ? 'from-blue-500/30 to-purple-500/30' 
                    : 'from-blue-500/20 to-purple-500/20'
                } blur-lg group-hover:blur-xl transition-all duration-300`}></div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث عن مستخدمين..."
                  className={`relative w-full px-6 py-4 text-lg rounded-2xl border focus:outline-none transition-all duration-300 backdrop-blur-xl ${
                    isDark
                      ? 'bg-gray-900/80 border-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-800/90 focus:border-blue-400/50 focus:shadow-2xl focus:shadow-blue-500/20'
                      : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white/90 focus:border-blue-400/50 focus:shadow-2xl focus:shadow-blue-500/20'
                  }`}
                />
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  isDark ? 'text-gray-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-500'
                }`}>
                  <Search className="w-6 h-6" />
                </div>
                <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {searchQuery ? '' : 'Ctrl+K'}
                </div>
              </div>
            </div>

            {allUsers.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-20 px-8 rounded-3xl backdrop-blur-xl border ${
                isDark 
                  ? 'bg-gray-900/40 border-gray-800/30' 
                  : 'bg-white/60 border-gray-200/50'
              }`}>
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 ${
                  isDark ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200/50'
                }`}>
                  <Search className={`w-12 h-12 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  لا يوجد مستخدمون آخرون حالياً
                </h3>
                <p className={`text-sm text-center mb-4 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  جرب البحث لاحقاً عندما ينضم المزيد من المستخدمين
                </p>
                {debugInfo && (
                  <div className={`text-xs p-3 rounded-lg font-mono ${
                    isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Debug: {debugInfo}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allUsers
                  .filter(user => 
                    searchQuery === '' || 
                    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((user, index) => {
                    const isFriend = user.id && friends.some(f => f.user.id === user.id);
                    const hasPendingRequest = user.id && (pendingRequests.some(r => r.receiverId === user.id) ||
                                             sentRequests.some(r => r.receiverId === user.id));
                    
                    return (
                      <div
                        key={user.account_id}
                        className={`group relative p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                          isDark
                            ? 'bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-800/30 hover:border-purple-800/50 shadow-xl shadow-black/20'
                            : 'bg-gradient-to-br from-white/80 to-gray-50/60 border-gray-200/50 hover:border-purple-200/60 shadow-lg shadow-gray-500/10'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Glow effect */}
                        <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${
                          isDark
                            ? 'from-purple-500/10 to-pink-500/10'
                            : 'from-purple-500/5 to-pink-500/5'
                        }`}></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="relative mb-4">
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                              isDark
                                ? 'from-purple-500 to-pink-500'
                                : 'from-purple-400 to-pink-400'
                            } opacity-20 blur-xl animate-pulse`}></div>
                            <UniversalAvatar 
                              src={user.avatar} 
                              username={user.username}
                              size="xlarge"
                              className="relative"
                            />
                          </div>
                          
                          <h3 className={`font-bold text-lg mb-2 bg-gradient-to-r bg-clip-text ${
                            isDark 
                              ? 'from-purple-300 to-pink-300 text-transparent' 
                              : 'from-purple-600 to-pink-600 text-transparent'
                          }`}>
                            {user.username}
                          </h3>
                          
                          <div className={`flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-medium ${
                            isDark
                              ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 text-purple-300 border border-purple-800/30'
                              : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border border-purple-200/50'
                          }`}>
                            <Sparkles className="w-3 h-3" />
                            مستخدم
                          </div>
                          
                          <div className="flex items-center justify-center mt-auto">
                            {isFriend ? (
                              <div className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
                                isDark
                                  ? 'bg-gray-800/50 text-gray-300 border border-gray-700/30'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200/50'
                              }`}>
                                <UserCheck className="w-4 h-4" />
                                صديق بالفعل
                              </div>
                            ) : hasPendingRequest ? (
                              <div className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
                                isDark
                                  ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800/30'
                                  : 'bg-yellow-50 text-yellow-600 border border-yellow-200/50'
                              }`}>
                                <Clock className="w-4 h-4 animate-pulse" />
                                طلب صداقة مُرسل
                              </div>
                            ) : (
                              <button
                                onClick={() => user.id && sendFriendRequest(user.id)}
                                className={`group/btn px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm font-semibold ${
                                  isDark
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25'
                                }`}
                              >
                                <UserPlus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
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
    </div>
  );
}
