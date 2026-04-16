'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { socialDB, Notification } from '@/lib/social';

interface NotificationsTabProps {
  activeTab: string;
}

export function NotificationsTab({ activeTab }: NotificationsTabProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const currentUser = useUser().getCurrentUser();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notifications from database
  useEffect(() => {
    const loadNotifications = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Get user UUID from accountId
        const userUuid = await socialDB.getUserUuid(currentUser.accountId);
        if (!userUuid) {
          console.error('Could not get user UUID for notifications');
          return;
        }
        
        const userNotifications = await socialDB.getNotifications(userUuid);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [currentUser]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return language === 'ar' ? 'Just now' : 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} ${language === 'ar' ? 'minutes ago' : 'minutes ago'}`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${language === 'ar' ? 'hours ago' : 'hours ago'}`;
    return `${Math.floor(seconds / 86400)} ${language === 'ar' ? 'days ago' : 'days ago'}`;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'comment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'follow':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'mention':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case 'group_invite':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'post_approved':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return theme === 'light' ? 'text-red-500' : 'text-red-400';
      case 'comment':
        return theme === 'light' ? 'text-blue-500' : 'text-blue-400';
      case 'follow':
        return theme === 'light' ? 'text-green-500' : 'text-green-400';
      case 'mention':
        return theme === 'light' ? 'text-purple-500' : 'text-purple-400';
      case 'group_invite':
        return theme === 'light' ? 'text-orange-500' : 'text-orange-400';
      case 'post_approved':
        return theme === 'light' ? 'text-teal-500' : 'text-teal-400';
      default:
        return theme === 'light' ? 'text-gray-500' : 'text-gray-400';
    }
  };

  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return theme === 'light' ? 'bg-red-50' : 'bg-red-900/30';
      case 'comment':
        return theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/30';
      case 'follow':
        return theme === 'light' ? 'bg-green-50' : 'bg-green-900/30';
      case 'mention':
        return theme === 'light' ? 'bg-purple-50' : 'bg-purple-900/30';
      case 'group_invite':
        return theme === 'light' ? 'bg-orange-50' : 'bg-orange-900/30';
      case 'post_approved':
        return theme === 'light' ? 'bg-teal-50' : 'bg-teal-900/30';
      default:
        return theme === 'light' ? 'bg-gray-50' : 'bg-gray-900/30';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const markAsRead = async (id: string) => {
    try {
      await socialDB.markNotificationAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      // Get user UUID from accountId
      const userUuid = await socialDB.getUserUuid(currentUser.accountId);
      if (!userUuid) {
        console.error('Could not get user UUID for marking notifications as read');
        return;
      }
      
      await socialDB.markAllNotificationsAsRead(userUuid);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (activeTab !== 'notifications') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Elegant background decoration */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden -z-10">
        <div className={`absolute top-10 left-10 w-32 h-32 rounded-full blur-2xl ${
          theme === 'light' ? 'bg-blue-400' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute bottom-20 right-20 w-24 h-24 rounded-full blur-xl ${
          theme === 'light' ? 'bg-purple-400' : 'bg-purple-300'
        }`}></div>
      </div>

      {/* Header */}
      <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
        theme === 'light' 
          ? 'bg-white/95 border-gray-200/60 shadow-sm shadow-gray-500/10' 
          : 'bg-gray-900/95 border-gray-800/60 shadow-xl shadow-black/20'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text transition-all duration-300 ${
              theme === 'light' 
                ? 'from-blue-600 via-purple-600 to-pink-600 text-transparent' 
                : 'from-blue-400 via-purple-400 to-pink-400 text-transparent'
            }`}>
              {language === 'ar' ? 'Notifications' : 'Notifications'}
            </h1>
            <p className={`text-sm font-medium transition-colors duration-300 mt-1 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {unreadCount > 0 && (
                <span>{unreadCount} {language === 'ar' ? 'unread notifications' : 'unread notifications'}</span>
              )}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/60'
                  : 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/40 border border-blue-700/40'
              }`}
            >
              {language === 'ar' ? 'Mark all as read' : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              filter === 'all'
                ? theme === 'light'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-blue-600 text-white shadow-xl shadow-blue-400/25'
                : theme === 'light'
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {language === 'ar' ? 'All' : 'All'} ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              filter === 'unread'
                ? theme === 'light'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-blue-600 text-white shadow-xl shadow-blue-400/25'
                : theme === 'light'
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {language === 'ar' ? 'Unread' : 'Unread'} ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {loading ? (
          <div className={`text-center py-16 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
            theme === 'light' 
              ? 'bg-white/95 border border-gray-200/60 shadow-sm shadow-gray-500/10' 
              : 'bg-gray-900/95 border border-gray-800/60 shadow-xl shadow-black/20'
          }`}>
            <div className="w-12 h-12 rounded-full mx-auto mb-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <p className={`text-lg font-medium transition-colors duration-300 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {language === 'ar' ? 'Loading notifications...' : 'Loading notifications...'}
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
            theme === 'light' 
              ? 'bg-white/95 border border-gray-200/60 shadow-sm shadow-gray-500/10' 
              : 'bg-gray-900/95 border border-gray-800/60 shadow-xl shadow-black/20'
          }`}>
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
              theme === 'light'
                ? 'bg-gradient-to-br from-gray-100 to-gray-200'
                : 'bg-gradient-to-br from-gray-800 to-gray-900'
            }`}>
              <svg className={`w-8 h-8 ${
                theme === 'light' ? 'text-gray-400' : 'text-gray-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className={`text-lg font-medium transition-colors duration-300 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {filter === 'unread' 
                ? (language === 'ar' ? 'No unread notifications' : 'No unread notifications')
                : (language === 'ar' ? 'No notifications yet' : 'No notifications yet')
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg cursor-pointer ${
                !notification.read
                  ? theme === 'light'
                    ? 'bg-white border-blue-200/60 shadow-sm shadow-blue-500/10'
                    : 'bg-gray-900 border-blue-700/40 shadow-lg shadow-blue-400/20'
                  : theme === 'light'
                    ? 'bg-white/95 border-gray-200/60 shadow-sm shadow-gray-500/10 hover:shadow-gray-500/20'
                    : 'bg-gray-900/95 border-gray-800/60 shadow-xl shadow-black/20 hover:shadow-black/30'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Notification icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md ${getNotificationBgColor(notification.type)}`}>
                  <div className={getNotificationColor(notification.type)}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-base leading-relaxed ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        <span className={`font-semibold ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>{notification.username}</span> {notification.message}
                      </p>
                      <p className={`text-sm mt-1 transition-colors duration-300 ${
                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                    
                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'
                      }`}></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
