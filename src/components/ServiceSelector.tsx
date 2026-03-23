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
    <div className="w-full h-full md:h-screen flex flex-col overflow-hidden">
      {/* Active Timer - Scrollable Container */}
      <div className="flex-1 overflow-hidden pt-4">
        <div className="h-full overflow-y-auto">
          <div className="h-full flex items-center justify-center py-2">
            {renderTimer()}
          </div>
        </div>
      </div>

      {/* Bottom Icons - All Screens with Horizontal Scroll */}
      <div className="relative flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
        {/* Left Arrow */}
        {canScrollMobile.left && (
          <button
            onClick={scrollMobileLeft}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 border-2 ${
              theme === 'light'
                ? 'bg-white text-gray-700 border-gray-400 hover:bg-gray-100 hover:border-gray-600'
                : 'bg-gray-900 text-gray-300 border-gray-500 hover:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <span className="text-sm">←</span>
          </button>
        )}
        
        {/* Scrollable Container */}
        <div
          ref={mobileScrollRef}
          className="flex justify-center items-center gap-4 p-4 overflow-x-auto"
        >
          {timerButtons.map((button) => (
            <button
              key={button.id}
              onClick={() => setActiveTimer(button.type)}
              className={`group relative w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200 flex-shrink-0 border-2 ${
                activeTimer === button.type
                  ? theme === 'light'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                    : 'bg-white text-gray-900 border-white shadow-lg'
                  : theme === 'light'
                    ? 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100 hover:border-gray-600 hover:shadow-md'
                    : 'bg-gray-900 text-gray-100 border-gray-500 hover:bg-gray-800 hover:border-gray-300 hover:shadow-md'
              }`}
              title={button.label}
            >
              <span className={`transition-transform duration-200 group-hover:scale-110 ${
                activeTimer === button.type
                  ? theme === 'light' ? 'text-white' : 'text-gray-900'
                  : theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                {button.icon}
              </span>
              {/* Active Indicator - More visible */}
              {activeTimer === button.type && (
                <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${
                  theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'
                } border-2 border-white shadow-sm`}></div>
              )}
              {/* Unread Count Badge - More visible */}
              {button.type === 'messages' && unreadCount > 0 && (
                <div className={`absolute -top-1 -right-1 min-w-[18px] h-5 text-xs rounded-full flex items-center justify-center px-1.5 font-bold border-2 shadow-sm ${
                  theme === 'light' 
                    ? 'bg-red-500 text-white border-white' 
                    : 'bg-red-600 text-white border-gray-900'
                }`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Right Arrow */}
        {canScrollMobile.right && (
          <button
            onClick={scrollMobileRight}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 border-2 ${
              theme === 'light'
                ? 'bg-white text-gray-700 border-gray-400 hover:bg-gray-100 hover:border-gray-600'
                : 'bg-gray-900 text-gray-300 border-gray-500 hover:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <span className="text-sm">→</span>
          </button>
        )}
      </div>
    </div>
  );
}
