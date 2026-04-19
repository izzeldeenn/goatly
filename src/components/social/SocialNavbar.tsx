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
      {/* Elegant Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        theme === 'light' 
          ? 'bg-white/95 border-gray-200/60 shadow-sm shadow-gray-500/10' 
          : 'bg-gray-900/95 border-gray-800/60 shadow-xl shadow-black/20'
      }`}>
        {/* Elegant background decoration */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden">
          <div className={`absolute top-0 left-0 w-40 h-40 rounded-full blur-3xl ${
            theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'
          }`}></div>
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl ${
            theme === 'light' ? 'bg-purple-500' : 'bg-purple-400'
          }`}></div>
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full blur-xl ${
            theme === 'light' ? 'bg-pink-400' : 'bg-pink-300'
          }`}></div>
        </div>

        <div className="max-w-7xl mx-auto px-0 relative z-10">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-6 pl-6">
              {/* Custom Logo */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 hover:scale-105 ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm shadow-blue-500/10'
                    : 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 shadow-lg shadow-blue-400/10'
                }`}>
                  <img 
                    src="/goat.png" 
                    alt="Goatly" 
                    className="w-9 h-9 object-contain drop-shadow-sm"
                  />
                </div>
                <div className={`text-xl font-bold transition-all duration-300 hover:scale-105 bg-gradient-to-r bg-clip-text ${
                  theme === 'light' 
                    ? 'from-blue-600 via-purple-600 to-pink-600 text-transparent' 
                    : 'from-blue-400 via-purple-400 to-pink-400 text-transparent'
                }`} style={{ fontFamily: "'ADLaM Display', sans-serif" }}>
                  Goatly
                </div>
              </div>
            </div>

            {/* Center - Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full group">
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${
                  theme === 'light' 
                    ? 'from-blue-500/20 to-purple-500/20' 
                    : 'from-blue-500/30 to-purple-500/30'
                } blur-sm group-hover:blur-md transition-all duration-300`}></div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'search for users or content...' : 'search for users or content...'}
                  className={`relative w-full px-4 py-2.5 pl-11 text-sm rounded-xl border focus:outline-none transition-all duration-300 backdrop-blur-sm ${
                    theme === 'light'
                      ? 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white/90 focus:border-blue-400/50 focus:shadow-lg focus:shadow-blue-500/20'
                      : 'bg-gray-900/80 border-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-800/90 focus:border-blue-400/50 focus:shadow-lg focus:shadow-blue-500/20'
                  }`}
                />
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  theme === 'light' ? 'text-gray-400 group-focus-within:text-blue-500' : 'text-gray-500 group-focus-within:text-blue-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {/* Search suggestions hint */}
                <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {searchQuery ? '' : 'Ctrl+K'}
                </div>
              </div>
            </div>

            {/* Right side - Profile */}
            <div className="flex items-center gap-3 pr-6">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                    theme === 'light'
                      ? 'bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 shadow-blue-500/20'
                      : 'bg-gradient-to-br from-blue-800 to-blue-900 hover:from-blue-700 hover:to-blue-800 text-blue-300 shadow-blue-400/20'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {/* Notification badge */}
                  <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs font-bold ${
                    theme === 'light'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-400 text-white'
                  }`}></span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={`absolute left-0 mt-3 w-80 rounded-2xl shadow-2xl border py-4 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 z-50 ${
                    theme === 'light'
                      ? 'bg-white/95 border-gray-200/50 shadow-gray-500/20'
                      : 'bg-gray-900/95 border-gray-800/50 shadow-black/30'
                  }`}>
                    <div className={`px-4 py-3 border-b ${
                      theme === 'light' ? 'border-gray-200/50' : 'border-gray-800/50'
                    }`}>
                      <h3 className={`font-semibold text-base ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        {language === 'ar' ? 'Notifications' : 'Notifications'}
                      </h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {/* Sample notification items */}
                      <div className={`px-4 py-3 border-b transition-colors duration-200 hover:bg-gray-50 ${
                        theme === 'light' ? 'border-gray-200/50 hover:bg-gray-50' : 'border-gray-800/50 hover:bg-gray-800'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            theme === 'light'
                              ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
                              : 'bg-gradient-to-br from-blue-800 to-blue-900 text-blue-300'
                          }`}>
                            JD
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              <span className={`font-semibold ${
                                theme === 'light' ? 'text-gray-900' : 'text-white'
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
                      
                      <div className={`px-4 py-3 border-b transition-colors duration-200 hover:bg-gray-50 ${
                        theme === 'light' ? 'border-gray-200/50 hover:bg-gray-50' : 'border-gray-800/50 hover:bg-gray-800'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            theme === 'light'
                              ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-600'
                              : 'bg-gradient-to-br from-green-800 to-green-900 text-green-300'
                          }`}>
                            SM
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              <span className={`font-semibold ${
                                theme === 'light' ? 'text-gray-900' : 'text-white'
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
                      theme === 'light' ? 'border-gray-200/50' : 'border-gray-800/50'
                    }`}>
                      <button 
                        onClick={() => {
                          setActiveTab('notifications');
                          setShowNotifications(false);
                        }}
                        className={`w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                          theme === 'light'
                            ? 'text-blue-600 hover:bg-blue-50'
                            : 'text-blue-400 hover:bg-blue-900/30'
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
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                    theme === 'light'
                      ? 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 shadow-gray-500/20'
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300 shadow-black/20'
                  }`}
                >
                  {currentUser?.avatar?.startsWith('http') ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.username}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-lg">{currentUser?.avatar || '??'}</span>
                  )}
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className={`absolute left-0 mt-3 w-72 rounded-2xl shadow-2xl border py-4 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 z-50 ${
                    theme === 'light'
                      ? 'bg-white/95 border-gray-200/50 shadow-gray-500/20'
                      : 'bg-gray-900/95 border-gray-800/50 shadow-black/30'
                  }`}>
                    <div className={`px-4 py-3 border-b ${
                      theme === 'light' ? 'border-gray-200/50' : 'border-gray-800/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 ${
                          theme === 'light' ? 'bg-gradient-to-br from-gray-100 to-gray-200' : 'bg-gradient-to-br from-gray-800 to-gray-900'
                        }`}>
                          {currentUser?.avatar?.startsWith('http') ? (
                            <img 
                              src={currentUser.avatar} 
                              alt={currentUser.username}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <span className="text-2xl">{currentUser?.avatar || '??'}</span>
                          )}
                        </div>
                        <div>
                          <div className={`font-semibold text-base ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
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
                      theme === 'light' ? 'border-gray-200/50' : 'border-gray-800/50'
                    }`}>
                      <ThemeToggle />
                    </div>
                    
                    <button
                      onClick={() => {
                        // Navigate to focus mode
                        window.location.href = '/focus';
                      }}
                      className={`w-full text-right px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-gray-50 ${
                        theme === 'light' 
                          ? 'text-gray-700 hover:bg-gray-100' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}>
                      {language === 'ar' ? 'Focus Mode' : 'Focus Mode'}
                    </button>
                    
                    <button
                      onClick={() => {
                        // Logout functionality
                        window.location.href = '/';
                      }}
                      className={`w-full text-right px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-red-50 ${
                        theme === 'light' 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-red-400 hover:bg-red-900/20'
                      }`}>
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
