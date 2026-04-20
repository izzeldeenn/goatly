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
      id: 'notifications', 
      label: language === 'ar' ? 'Notifications' : 'Notifications', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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
        ? 'bg-white border-r border-gray-200' 
        : 'bg-black border-r border-gray-800'
    }`}>
      <div className={`${isCollapsed ? 'px-3 py-4' : 'p-6'} h-full flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <div className="space-y-1">
              <h1 className={`text-xl font-bold transition-all duration-300 ${
                theme === 'light' 
                  ? 'text-black' 
                  : 'text-white'
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
            className={`p-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              theme === 'light'
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r transition-all duration-300 ${
                  theme === 'light'
                    ? 'bg-black' 
                    : 'bg-white'
                }`}></div>
              )}
              
              <button
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full px-4 py-3 rounded-lg transition-all duration-300 flex items-center ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                } group`}
              >
                {/* Background */}
                <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                  activeTab === item.id
                    ? theme === 'light'
                      ? 'bg-gray-100'
                      : 'bg-gray-800'
                    : theme === 'light'
                      ? 'bg-transparent group-hover:bg-gray-50'
                      : 'bg-transparent group-hover:bg-gray-900'
                }`}></div>
                
                {/* Icon container */}
                <div className={`relative flex-shrink-0 transition-all duration-300 z-10 ${
                  activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  <div className={`p-2.5 rounded-lg transition-all duration-300 ${
                    activeTab === item.id
                      ? theme === 'light'
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                      : theme === 'light'
                        ? 'text-gray-600 group-hover:text-black'
                        : 'text-gray-400 group-hover:text-white'
                  }`}>
                    {item.icon}
                  </div>
                </div>
                
                {/* Label */}
                {!isCollapsed && (
                  <div className="ml-3 flex-1 text-left z-10">
                    <span className={`font-semibold transition-all duration-300 ${
                      activeTab === item.id
                        ? theme === 'light'
                          ? 'text-black'
                          : 'text-white'
                        : theme === 'light'
                          ? 'text-gray-700 group-hover:text-black'
                          : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className={`absolute left-full ml-3 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 ${
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
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
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
