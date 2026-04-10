'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface SocialSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function SocialSidebar({ activeTab, setActiveTab }: SocialSidebarProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { 
      id: 'feed', 
      label: language === 'ar' ? 'Home' : 'Home', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'friends', 
      label: language === 'ar' ? 'Friends' : 'Friends', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      id: 'messages', 
      label: language === 'ar' ? 'Messages' : 'Messages', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    { 
      id: 'groups', 
      label: language === 'ar' ? 'Groups' : 'Groups', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      id: 'profile', 
      label: language === 'ar' ? 'Profile' : 'Profile', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} transition-all duration-500 ease-in-out relative ${
      theme === 'light' 
        ? 'bg-white/95 backdrop-blur-sm border-r border-gray-200/60 shadow-sm' 
        : 'bg-gray-900/95 backdrop-blur-sm border-r border-gray-800/60 shadow-xl'
    }`}>
      {/* Elegant background decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-0 w-40 h-40 rounded-full blur-3xl ${
          theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-32 h-32 rounded-full blur-2xl ${
          theme === 'light' ? 'bg-purple-500' : 'bg-purple-400'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-xl ${
          theme === 'light' ? 'bg-pink-400' : 'bg-pink-300'
        }`}></div>
      </div>

      <div className={`${isCollapsed ? 'px-3 py-4' : 'p-6'} relative z-10 h-full flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <div className="space-y-1">
              <h1 className={`text-xl font-bold bg-gradient-to-r bg-clip-text transition-all duration-300 ${
                theme === 'light' 
                  ? 'from-blue-600 via-purple-600 to-pink-600 text-transparent' 
                  : 'from-blue-400 via-purple-400 to-pink-400 text-transparent'
              }`}>
                {language === 'ar' ? 'Social Hub' : 'Social Hub'}
              </h1>
              <p className={`text-xs font-medium transition-colors duration-300 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {language === 'ar' ? 'Connect & Learn' : 'Connect & Learn'}
              </p>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              theme === 'light'
                ? 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 shadow-sm hover:shadow-md backdrop-blur-sm'
                : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 shadow-md hover:shadow-lg backdrop-blur-sm border border-gray-700/30'
            }`}
          >
            <svg className={`w-4 h-4 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navigationItems.map((item, index) => (
            <div key={item.id} className="relative group">
              {/* Active indicator */}
              {activeTab === item.id && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-lg transition-all duration-300 ${
                  theme === 'light'
                    ? 'bg-gradient-to-b from-blue-500 to-blue-600 shadow-sm' 
                    : 'bg-gradient-to-b from-blue-400 to-blue-500 shadow-lg'
                }`}></div>
              )}
              
              <button
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                } group overflow-hidden`}
              >
                {/* Background effects */}
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                  activeTab === item.id
                    ? theme === 'light'
                      ? 'bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/60 shadow-sm'
                      : 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-700/40 shadow-lg'
                    : theme === 'light'
                      ? 'bg-gray-50/60 border border-transparent group-hover:bg-gray-100/80 group-hover:shadow-sm'
                      : 'bg-gray-800/40 border border-transparent group-hover:bg-gray-700/60 group-hover:shadow-md'
                }`}></div>

                {/* Subtle shine effect */}
                {activeTab === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse"></div>
                )}
                
                {/* Icon container */}
                <div className={`relative flex-shrink-0 transition-all duration-300 z-10 ${
                  activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                    activeTab === item.id
                      ? theme === 'light'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-xl shadow-blue-400/25'
                      : theme === 'light'
                        ? 'text-gray-600 group-hover:text-blue-500 group-hover:bg-blue-50'
                        : 'text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-900/30'
                  }`}>
                    {item.icon}
                  </div>
                  
                  {/* Pulse effect for active item */}
                  {activeTab === item.id && (
                    <div className={`absolute inset-0 rounded-xl animate-ping ${
                      theme === 'light' ? 'bg-blue-400' : 'bg-blue-300'
                    } opacity-20`}></div>
                  )}
                </div>
                
                {/* Label */}
                {!isCollapsed && (
                  <div className="ml-3 flex-1 text-left z-10">
                    <span className={`font-semibold transition-all duration-300 ${
                      activeTab === item.id
                        ? theme === 'light'
                          ? 'text-blue-600'
                          : 'text-blue-300'
                        : theme === 'light'
                          ? 'text-gray-700 group-hover:text-gray-900'
                          : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                    {activeTab === item.id && (
                      <div className={`h-0.5 w-10 mt-2 rounded-full transition-all duration-300 ${
                        theme === 'light'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                          : 'bg-gradient-to-r from-blue-400 to-purple-400'
                      }`}></div>
                    )}
                  </div>
                )}

                {/* Enhanced tooltip for collapsed state */}
                {isCollapsed && (
                  <div className={`absolute left-full ml-3 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-lg backdrop-blur-sm ${
                    theme === 'light'
                      ? 'bg-gray-800 text-white border border-gray-700'
                      : 'bg-white text-black border border-gray-200'
                  }`}>
                    {item.label}
                  </div>
                )}
              </button>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        {!isCollapsed && (
          <div className="mt-6 pt-4 border-t border-gray-200/50 space-y-3">
            <div className={`px-4 py-3 rounded-xl text-center text-xs font-medium transition-all duration-300 ${
              theme === 'light' 
                ? 'bg-gradient-to-r from-blue-50/80 to-purple-50/80 text-blue-600 border border-blue-200/40' 
                : 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-blue-300 border border-blue-700/30'
            }`}>
              {language === 'ar' ? 'Stay Connected' : 'Stay Connected'}
            </div>
            <div className={`text-center text-xs transition-colors duration-300 ${
              theme === 'light' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {language === 'ar' ? 'Version 1.0' : 'Version 1.0'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
