'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { Timer } from './Timer';
import { PomodoroTimer } from './PomodoroTimer';
import { CountdownTimer } from './CountdownTimer';
import { YouTubeTimer } from './YouTubeTimer';
import { UserActivityDashboard } from './UserActivityDashboard';
import FriendshipManager from './FriendshipManager';
import MessagingSystem from './MessagingSystem';
import { messageDB } from '@/lib/friendship';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';

type TimerType = 'stopwatch' | 'pomodoro' | 'countdown' | 'youtube' | 'dashboard' | 'friends' | 'messages';

export function ServiceSelector() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const { getCurrentUser } = useUser();
  const [activeTimer, setActiveTimer] = useState<TimerType>('stopwatch');
  const [selectedFriendForMessaging, setSelectedFriendForMessaging] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Refs for scroll containers
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  
  // State for scroll visibility
  const [canScrollMobile, setCanScrollMobile] = useState({ left: false, right: false });
  const [canScrollDesktop, setCanScrollDesktop] = useState({ up: false, down: false });

  const handleSwitchToMessaging = (friendId: string) => {
    console.log('🔍 ServiceSelector - handleSwitchToMessaging called with friendId:', friendId);
    setSelectedFriendForMessaging(friendId);
    setActiveTimer('messages');
    console.log('🔍 ServiceSelector - Set activeTimer to messages, friendId:', friendId);
    
    // Reset unread count when opening messages
    setUnreadCount(0);
  };

  const renderTimer = () => {
    switch (activeTimer) {
      case 'stopwatch':
        return <Timer />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'countdown':
        return <CountdownTimer />;
      case 'youtube':
        return <YouTubeTimer />;
      case 'dashboard':
        return <UserActivityDashboard />;
      case 'friends':
        return <FriendshipManager onSwitchToMessaging={handleSwitchToMessaging} />;
      case 'messages':
        return <MessagingSystem selectedFriendId={selectedFriendForMessaging} />;
      default:
        return <Timer />;
    }
  };

  // Timer buttons array - main timers only
  const timerButtons = [
    { id: 'stopwatch', type: 'stopwatch' as TimerType, label: t.stopwatch, icon: '⏱️' },
    { id: 'pomodoro', type: 'pomodoro' as TimerType, label: t.pomodoro, icon: '🍅' },
    { id: 'countdown', type: 'countdown' as TimerType, label: t.countdown, icon: '⏳' },
    { id: 'youtube', type: 'youtube' as TimerType, label: t.youtube, icon: '🎬' },
    { id: 'dashboard', type: 'dashboard' as TimerType, label: t.rank === 'ترتيب' ? 'لوحة التحكم' : 'Dashboard', icon: '📈' },
    { id: 'friends', type: 'friends' as TimerType, label: t.rank === 'ترتيب' ? 'الأصدقاء' : 'Friends', icon: '👥' },
    { id: 'messages', type: 'messages' as TimerType, label: t.rank === 'ترتيب' ? 'الرسائل' : 'Messages', icon: '💬' }
  ];

  // Check scroll position for mobile
  const checkMobileScroll = () => {
    if (mobileScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = mobileScrollRef.current;
      setCanScrollMobile({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 1
      });
    }
  };

  // Check scroll position for desktop
  const checkDesktopScroll = () => {
    if (desktopScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = desktopScrollRef.current;
      setCanScrollDesktop({
        up: scrollTop > 0,
        down: scrollTop < scrollHeight - clientHeight - 1
      });
    }
  };

  // Scroll functions for mobile (horizontal)
  const scrollMobileLeft = () => {
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollMobileRight = () => {
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Scroll functions for desktop (vertical)
  const scrollDesktopUp = () => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollBy({ top: -200, behavior: 'smooth' });
    }
  };

  const scrollDesktopDown = () => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollBy({ top: 200, behavior: 'smooth' });
    }
  };

  // Setup scroll listeners and unread count
  useEffect(() => {
    const mobileRef = mobileScrollRef.current;
    const desktopRef = desktopScrollRef.current;
    
    if (mobileRef) {
      mobileRef.addEventListener('scroll', checkMobileScroll);
      checkMobileScroll(); // Initial check
    }
    
    if (desktopRef) {
      desktopRef.addEventListener('scroll', checkDesktopScroll);
      checkDesktopScroll(); // Initial check
    }
    
    // Check if scrolling is needed
    setTimeout(() => {
      checkMobileScroll();
      checkDesktopScroll();
    }, 100);
    
    return () => {
      if (mobileRef) {
        mobileRef.removeEventListener('scroll', checkMobileScroll);
      }
      if (desktopRef) {
        desktopRef.removeEventListener('scroll', checkDesktopScroll);
      }
    };
  }, []);

  // Fetch unread message count with realtime updates
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.log('🔍 fetchUnreadCount - No current user');
        return;
      }
      
      try {
        console.log('🔍 fetchUnreadCount - Current user:', currentUser);
        
        // Use UUID (id) for database operations, fallback to accountId only if id is not available
        // But prefer UUID since database expects UUID format for foreign keys
        const userId = currentUser.id || currentUser.accountId;
        console.log('🔍 fetchUnreadCount - Extracted user ID:', userId, '(type:', userId === currentUser.id ? 'UUID' : 'accountId', ')');
        
        if (!userId) {
          console.error('❌ No valid user ID found');
          setUnreadCount(0);
          return;
        }
        
        console.log('🔍 fetchUnreadCount - messageDB:', messageDB);
        console.log('🔍 fetchUnreadCount - messageDB.getUnreadCount:', messageDB.getUnreadCount);
        
        if (typeof messageDB.getUnreadCount === 'function') {
          const count = await messageDB.getUnreadCount(userId);
          console.log('🔍 fetchUnreadCount - Received count:', count);
          setUnreadCount(count);
        } else {
          console.error('❌ getUnreadCount is not a function on messageDB');
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('❌ Error in fetchUnreadCount:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    
    // Update count every 30 seconds as fallback
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [getCurrentUser]);

  // Realtime subscription for new messages
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const userId = currentUser.id || currentUser.accountId;
    if (!userId) return;

    console.log('🔍 Setting up realtime subscription for unread count...');

    const subscription = supabase
      .channel('unread-count')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔍 New message received:', payload);
          
          const newMessage = payload.new as any;
          
          // Check if this message is for the current user
          if (newMessage.receiver_id === userId && !newMessage.read_at) {
            console.log('🔍 New unread message for current user');
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔍 Message updated:', payload);
          
          const updatedMessage = payload.new as any;
          
          // Check if this message was read and was for the current user
          if (updatedMessage.receiver_id === userId && 
              updatedMessage.read_at && 
              !payload.old.read_at) {
            console.log('🔍 Message marked as read, updating count');
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        console.log('🔍 Unread count subscription status:', status);
      });

    return () => {
      console.log('🔍 Unsubscribing from unread count changes');
      subscription.unsubscribe();
    };
  }, [getCurrentUser]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row">
      {/* Active Timer */}
      <div className="flex-1 flex items-center justify-center">
        {renderTimer()}
      </div>

      {/* Side Icons - Desktop Only with Vertical Scroll */}
      <div className="hidden md:flex items-center relative">
        {/* Scrollable Container with Enhanced Navigation */}
        <div className="relative">
          {/* Enhanced Scroll Buttons */}
          <div className="flex flex-col items-center gap-2">
            {/* Up Button */}
            {canScrollDesktop.up && (
              <button
                onClick={scrollDesktopUp}
                className={`group w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-white to-gray-100 border border-gray-300 shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-br from-gray-800 to-black border border-gray-600 shadow-lg hover:shadow-xl'
                }`}
              >
                <span className={`text-lg transition-transform duration-300 group-hover:-translate-y-0.5 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>▲</span>
              </button>
            )}
            
            {/* Timer Buttons Container */}
            <div
              ref={desktopScrollRef}
              className="flex flex-col items-center gap-4 py-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            >
              {timerButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => setActiveTimer(button.type)}
                  className={`group relative w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 backdrop-blur-sm ${
                    activeTimer === button.type
                      ? theme === 'light'
                        ? 'bg-black/20 border-2 border-black'
                        : 'bg-white/20 border-2 border-white'
                      : theme === 'light'
                        ? 'bg-white/80 border-2 border-gray-300 hover:bg-white hover:border-gray-400'
                        : 'bg-black/80 border-2 border-gray-600 hover:bg-black hover:border-gray-500'
                  }`}
                  title={button.label}
                >
                  {button.icon}
                  {/* Active Indicator */}
                  {activeTimer === button.type && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
                  )}
                  {/* Unread Count Badge */}
                  {button.type === 'messages' && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1.5 border-2 border-white animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Down Button */}
            {canScrollDesktop.down && (
              <button
                onClick={scrollDesktopDown}
                className={`group w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-white to-gray-100 border border-gray-300 shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-br from-gray-800 to-black border border-gray-600 shadow-lg hover:shadow-xl'
                }`}
              >
                <span className={`text-lg transition-transform duration-300 group-hover:translate-y-0.5 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>▼</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Icons - Mobile Only with Horizontal Scroll */}
      <div className="md:hidden relative">
        {/* Left Arrow */}
        {canScrollMobile.left && (
          <button
            onClick={scrollMobileLeft}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              theme === 'light'
                ? 'bg-white/80 border border-gray-300 hover:bg-white'
                : 'bg-black/80 border border-gray-600 hover:bg-black'
            }`}
          >
            <span className="text-lg">←</span>
          </button>
        )}
        
        {/* Scrollable Container */}
        <div
          ref={mobileScrollRef}
          className="flex justify-center items-center gap-4 p-4 border-t border-gray-200 dark:border-gray-700 overflow-x-auto"
        >
          {timerButtons.map((button) => (
            <button
              key={button.id}
              onClick={() => setActiveTimer(button.type)}
              className={`group relative w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 backdrop-blur-sm flex-shrink-0 ${
                activeTimer === button.type
                  ? theme === 'light'
                    ? 'bg-black/20 border-2 border-black'
                    : 'bg-white/20 border-2 border-white'
                  : theme === 'light'
                    ? 'bg-white/80 border-2 border-gray-300 hover:bg-white hover:border-gray-400'
                    : 'bg-black/80 border-2 border-gray-600 hover:bg-black hover:border-gray-500'
              }`}
              title={button.label}
            >
              {button.icon}
              {/* Active Indicator */}
              {activeTimer === button.type && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
              )}
            </button>
          ))}
        </div>
        
        {/* Right Arrow */}
        {canScrollMobile.right && (
          <button
            onClick={scrollMobileRight}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              theme === 'light'
                ? 'bg-white/80 border border-gray-300 hover:bg-white'
                : 'bg-black/80 border border-gray-600 hover:bg-black'
            }`}
          >
            <span className="text-lg">→</span>
          </button>
        )}
      </div>
    </div>
  );
}
