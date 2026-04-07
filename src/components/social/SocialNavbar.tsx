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
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = useUser().getCurrentUser();

  return (
    <>
      {/* Compact Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
        theme === 'light' 
          ? 'bg-white/90 border-gray-200/50 shadow-sm shadow-gray-500/10' 
          : 'bg-black/95 border-gray-900/50 shadow-sm shadow-black/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Left side - Custom Logo */}
            <div className="flex items-center">
              {/* Custom Logo */}
              <div className={`w-16 h-15 rounded-lg flex items-center justify-center font-bold text-sm transition-transform duration-300 hover:scale-105`}>
                <img 
                  src="/mrfrogo.png" 
                  alt="Frogo" 
                  className="w-16 h-16 object-contain drop-shadow-sm"
                />
              </div>
            </div>

            {/* Center - Search Bar (Desktop only) */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
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
                  className={`relative w-full px-6 py-3 pl-12 text-sm rounded-xl border focus:outline-none transition-all duration-300 backdrop-blur-sm ${
                    theme === 'light'
                      ? 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white/90 focus:border-blue-400/50 focus:shadow-lg focus:shadow-blue-500/20'
                      : 'bg-gray-900/80 border-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-800/90 focus:border-blue-400/50 focus:shadow-lg focus:shadow-blue-500/20'
                  }`}
                />
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  theme === 'light' ? 'text-gray-400 group-focus-within:text-blue-500' : 'text-gray-500 group-focus-within:text-blue-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {/* Search suggestions hint */}
                <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-xs opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {searchQuery ? '' : 'Ctrl+K'}
                </div>
              </div>
            </div>

            {/* Right side - Profile */}
            <div className="flex items-center gap-2">
              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                    theme === 'light'
                      ? 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 shadow-gray-500/20'
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300 shadow-black/20'
                  }`}
                >
                  {currentUser?.avatar?.startsWith('http') ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">{currentUser?.avatar || '??'}</span>
                  )}
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className={`absolute left-0 mt-3 w-64 rounded-2xl shadow-2xl border py-3 backdrop-blur-xl animate-in slide-in-from-left-2 duration-200 z-50 ${
                    theme === 'light'
                      ? 'bg-white/95 border-gray-200/50 shadow-gray-500/20'
                      : 'bg-gray-900/95 border-gray-800/50 shadow-black/30'
                  }`}>
                    <div className={`px-4 py-3 border-b ${
                      theme === 'light' ? 'border-gray-200/50' : 'border-gray-800/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-transform duration-300 hover:scale-110 ${
                          theme === 'light' ? 'bg-gradient-to-br from-gray-100 to-gray-200' : 'bg-gradient-to-br from-gray-800 to-gray-900'
                        }`}>
                          {currentUser?.avatar?.startsWith('http') ? (
                            <img 
                              src={currentUser.avatar} 
                              alt={currentUser.username}
                              className="w-12 h-12 rounded-full object-cover"
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
                        // Navigate to settings
                        window.location.href = '/focus#settings';
                      }}
                      className={`w-full text-right px-4 py-3 text-sm font-medium hover:bg-gray-100/50 transition-all duration-200 rounded-lg mx-2 ${
                        theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-800/50'
                      }`}
                    >
                      {language === 'ar' ? 'Settings' : 'Settings'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div className={`lg:hidden border-b ${
        theme === 'light' ? 'bg-white/95 backdrop-blur-sm border-gray-200/50' : 'bg-black/95 backdrop-blur-sm border-gray-900/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
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
              className={`relative w-full px-6 py-3 pl-12 text-sm rounded-xl border focus:outline-none transition-all duration-300 backdrop-blur-sm ${
                theme === 'light'
                  ? 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white/90 focus:border-blue-400/50 focus:shadow-lg focus:shadow-blue-500/20'
                  : 'bg-gray-900/80 border-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-800/90 focus:border-blue-400/50 focus:shadow-lg focus:shadow-blue-500/20'
              }`}
            />
            <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
              theme === 'light' ? 'text-gray-400 group-focus-within:text-blue-500' : 'text-gray-500 group-focus-within:text-blue-400'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* Search suggestions hint */}
            <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-xs opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 ${
              theme === 'light' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {searchQuery ? '' : 'Ctrl+K'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
