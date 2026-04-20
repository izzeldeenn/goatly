'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface SocialNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function SocialNavbar({ activeTab, setActiveTab }: SocialNavbarProps) {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = useUser().getCurrentUser();

  
  return (
    <>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        theme === 'light' 
          ? 'bg-white/95 border-gray-200' 
          : 'bg-black/95 border-gray-800'
      }`}>
        <div className="max-w-7xl mx-auto px-0 relative z-10">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-6 pl-6">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 hover:scale-105 ${
                  theme === 'light'
                    ? 'bg-gray-100'
                    : 'bg-gray-800'
                }`}>
                  <img 
                    src="/goat.png" 
                    alt="Goatly" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className={`text-xl font-bold transition-all duration-300 hover:scale-105 ${
                  theme === 'light' 
                    ? 'text-black' 
                    : 'text-white'
                }`} style={{ fontFamily: "'ADLaM Display', sans-serif" }}>
                  Goatly
                </div>
              </div>
            </div>

            {/* Center - Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'search for users or content...' : 'search for users or content...'}
                  className={`w-full px-4 py-2 pl-10 text-sm rounded-lg border focus:outline-none transition-all duration-300 ${
                    theme === 'light'
                      ? 'bg-white border-gray-200 text-black placeholder-gray-400 focus:border-black'
                      : 'bg-black border-gray-800 text-white placeholder-gray-500 focus:border-white'
                  }`}
                />
                <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right side - Profile */}
            <div className="flex items-center gap-3 pr-6">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all duration-300 hover:scale-110 ${
                    theme === 'light'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {/* Notification badge */}
                  <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs font-bold ${
                    theme === 'light'
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                  }`}></span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={`absolute left-0 mt-3 w-80 rounded-lg shadow-lg border py-4 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 z-50 ${
                    theme === 'light'
                      ? 'bg-white border-gray-200'
                      : 'bg-black border-gray-800'
                  }`}>
                    <div className={`px-4 py-3 border-b ${
                      theme === 'light' ? 'border-gray-200' : 'border-gray-800'
                    }`}>
                      <h3 className={`font-semibold text-base ${
                        theme === 'light' ? 'text-black' : 'text-white'
                      }`}>
                        {language === 'ar' ? 'Notifications' : 'Notifications'}
                      </h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {/* Sample notification items */}
                      <div className={`px-4 py-3 border-b transition-colors duration-200 ${
                        theme === 'light' ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-800 hover:bg-gray-900'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            theme === 'light'
                              ? 'bg-gray-200 text-black'
                              : 'bg-gray-700 text-white'
                          }`}>
                            JD
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              <span className={`font-semibold ${
                                theme === 'light' ? 'text-black' : 'text-white'
                              }`}>John Doe</span> {language === 'ar' ? 'liked your post' : 'liked your post'}
                            </p>
                            <p className={`text-xs mt-1 ${
                              theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              2 {language === 'ar' ? 'minutes ago' : 'minutes ago'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`px-4 py-3 border-b transition-colors duration-200 ${
                        theme === 'light' ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-800 hover:bg-gray-900'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            theme === 'light'
                              ? 'bg-gray-200 text-black'
                              : 'bg-gray-700 text-white'
                          }`}>
                            SM
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              <span className={`font-semibold ${
                                theme === 'light' ? 'text-black' : 'text-white'
                              }`}>Sarah Miller</span> {language === 'ar' ? 'commented on your post' : 'commented on your post'}
                            </p>
                            <p className={`text-xs mt-1 ${
                              theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              15 {language === 'ar' ? 'minutes ago' : 'minutes ago'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-3 border-t ${
                      theme === 'light' ? 'border-gray-200' : 'border-gray-800'
                    }`}>
                      <button 
                        onClick={() => {
                          setActiveTab('notifications');
                          setShowNotifications(false);
                        }}
                        className={`w-full text-center py-2 rounded text-sm font-medium transition-colors ${
                          theme === 'light'
                            ? 'text-black hover:bg-gray-100'
                            : 'text-white hover:bg-gray-800'
                        }`}
                      >
                        {language === 'ar' ? 'View all notifications' : 'View all notifications'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all duration-300 hover:scale-110 ${
                    theme === 'light'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {currentUser?.avatar?.startsWith('http') ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.username}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-lg">{currentUser?.avatar || '??'}</span>
                  )}
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className={`absolute left-0 mt-3 w-72 rounded-lg shadow-lg border py-4 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 z-50 ${
                    theme === 'light'
                      ? 'bg-white border-gray-200'
                      : 'bg-black border-gray-800'
                  }`}>
                    <div className={`px-4 py-3 border-b ${
                      theme === 'light' ? 'border-gray-200' : 'border-gray-800'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 ${
                          theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
                        }`}>
                          {currentUser?.avatar?.startsWith('http') ? (
                            <img 
                              src={currentUser.avatar} 
                              alt={currentUser.username}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-2xl">{currentUser?.avatar || '??'}</span>
                          )}
                        </div>
                        <div>
                          <div className={`font-semibold text-base ${
                            theme === 'light' ? 'text-black' : 'text-white'
                          }`}>
                            {currentUser?.username || 'User'}
                          </div>
                          <div className={`text-sm ${
                            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {language === 'ar' ? 'View Profile' : 'View Profile'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-3 border-b ${
                      theme === 'light' ? 'border-gray-200' : 'border-gray-800'
                    }`}>
                      <ThemeToggle />
                    </div>
                    
                    <button
                      onClick={() => {
                        window.location.href = '/focus';
                      }}
                      className={`w-full text-right px-4 py-3 text-sm font-medium transition-all duration-300 ${
                        theme === 'light' 
                          ? 'text-gray-700 hover:bg-gray-100' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {language === 'ar' ? 'Focus Mode' : 'Focus Mode'}
                    </button>
                    
                    <button
                      onClick={() => {
                        window.location.href = '/';
                      }}
                      className={`w-full text-right px-4 py-3 text-sm font-medium transition-all duration-300 ${
                        theme === 'light' 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-red-400 hover:bg-red-900/20'
                      }`}
                    >
                      {language === 'ar' ? 'Logout' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
