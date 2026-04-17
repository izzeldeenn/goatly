'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { useUserRankings } from '@/hooks/useUserRankings';

interface UserAccount {
  accountId: string;
  username: string;
  email: string;
  hashKey: string;
  avatar?: string;
  score: number;
  dailyRank?: number;
  dailyStudyTime?: number;
  createdAt: string;
  lastActive: string;
}

interface UserRankingsProps {
  onUserClick?: (user: UserAccount) => void;
}

export function UserRankings({ onUserClick }: UserRankingsProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const [sessionLoading, setSessionLoading] = useState(false);
  
  const {
    displayUsers,
    loading,
    isSessionActive,
    getSessionDuration,
    formatStudyTime,
    formatSessionTime,
    getTodayStudyTime,
    getCoinsFromStudyTime,
    isRecentlyActive,
    isCurrentUserActive,
    isCurrentUser
  } = useUserRankings();

  // Show loading message for 2 seconds when session ends
  useEffect(() => {
    if (!isSessionActive) {
      setSessionLoading(true);
      const timer = setTimeout(() => {
        setSessionLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setSessionLoading(false);
    }
  }, [isSessionActive]);

  return (
    <div className="flex-1">
      <div className="flex justify-center items-center mb-6">
        <h2 className={`text-2xl font-bold text-center ${
          theme === 'light' ? 'text-black' : 'text-white'
        }`}>{t.dailyRankings}</h2>
      </div>
      <div className="h-[calc(100vh-180px)] overflow-y-auto">
        {sessionLoading ? (
          // Loading message after session ends
          <div className="flex flex-col items-center justify-center h-full py-16">
            <div className="text-center max-w-sm mx-auto px-8">
              <div className="space-y-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
                <div>
                  <h2 className={`text-2xl font-semibold mb-2 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    جاري تجهيز ترتيبك
                  </h2>
                  <p className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    يرجى الانتظار...
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : isSessionActive ? (
          // Session active message
          <div className="flex flex-col items-center justify-center h-full py-16">
            <div className="text-center max-w-sm mx-auto px-8">
              {/* Minimal timer display */}
              <div className="mb-12">
                <div className={`inline-block px-8 py-4 rounded-2xl ${
                  theme === 'light' 
                    ? 'bg-gray-50 border border-gray-200' 
                    : 'bg-gray-800/50 border border-gray-700'
                }`}>
                  <span className={`text-4xl font-light tracking-wider ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {formatSessionTime(getSessionDuration())}
                  </span>
                </div>
              </div>

              {/* Clean typography section */}
              <div className="space-y-8">
                <div>
                  <p className={`text-xs font-medium tracking-widest uppercase mb-2 ${
                    theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Focus Mode
                  </p>
                  <h2 className={`text-2xl font-semibold ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    جلسة دراسية قيد التشغيل
                  </h2>
                </div>

                {/* Minimal info */}
                <div className={`py-6 border-t border-b ${
                  theme === 'light' ? 'border-gray-200' : 'border-gray-700'
                }`}>
                  <p className={`text-sm leading-relaxed ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    الترتيب مخفي مؤقتاً لمساعدتك على التركيز
                  </p>
                  <p className={`text-xs mt-2 ${
                    theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    ستظهر النتائج بعد انتهاء الجلسة
                  </p>
                </div>

                {/* Subtle progress indicator */}
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    theme === 'light' ? 'bg-gray-400' : 'bg-gray-500'
                  }`}></div>
                  <div className={`w-2 h-2 rounded-full animate-pulse delay-75 ${
                    theme === 'light' ? 'bg-gray-400' : 'bg-gray-500'
                  }`}></div>
                  <div className={`w-2 h-2 rounded-full animate-pulse delay-150 ${
                    theme === 'light' ? 'bg-gray-400' : 'bg-gray-500'
                  }`}></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : displayUsers.length === 0 ? (
              <p className={`text-center py-12 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {t.noDailyActivity}
              </p>
            ) : (
              displayUsers.map((user) => {
                const todaySeconds = getTodayStudyTime(user);
                const todayTimeFormatted = formatStudyTime(todaySeconds);
                const todayCoins = getCoinsFromStudyTime(todaySeconds);
                const userIsActive = isCurrentUserActive(user);
                const isCurrent = isCurrentUser(user);
                
                return (
                  <div
                    key={user.accountId}
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer w-full ${
                      isCurrent ? 'ring-4 ring-blue-400 ring-offset-2' : ''
                    }`}
                    onClick={() => onUserClick && onUserClick(user)}
                    style={{
                      backgroundColor: isCurrent
                        ? 'rgba(59, 130, 246, 0.4)'
                        : (user.dailyRank || 0) === 1 
                        ? `${customTheme.colors.secondary}20`
                        : (user.dailyRank || 0) % 2 === 0 
                        ? `${customTheme.colors.primary}10`
                        : `${customTheme.colors.secondary}10`,
                      boxShadow: isCurrent 
                        ? '0 10px 15px -3px rgba(59, 130, 246, 0.5), 0 4px 6px -2px rgba(59, 130, 246, 0.3)' 
                        : (user.dailyRank || 0) <= 3 
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                        : 'none'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span 
                          className="text-sm font-bold flex-shrink-0"
                          style={{
                            color: (user.dailyRank || 0) === 1 
                              ? customTheme.colors.secondary
                              : (user.dailyRank || 0) % 2 === 0 
                              ? customTheme.colors.primary 
                              : customTheme.colors.secondary
                          }}
                        >
                          #{user.dailyRank || 999}
                        </span>
                        
                        <div className="text-xl flex-shrink-0">
                          {user.avatar?.startsWith('http') ? (
                            <img 
                              src={user.avatar} 
                              alt={user.username}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            user.avatar || '👤'
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <span className={`text-sm font-semibold block ${
                              theme === 'light' ? 'text-black' : 'text-white'
                            } truncate`} title={user.username}>{user.username}</span>
                            
                            {isRecentlyActive(user) && (
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" title="نشط الآن"></span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          theme === 'light'
                            ? 'bg-gradient-to-r from-yellow-50 to-green-50 text-green-700 border border-yellow-200'
                            : 'bg-gradient-to-r from-yellow-900/30 to-green-900/30 text-green-300 border border-yellow-700/50'
                        }`}>
                          <span className="w-1 h-1 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                          {formatStudyTime(getTodayStudyTime(user))}
                        </div>

                       </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
