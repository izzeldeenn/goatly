'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { useUser } from '@/contexts/UserContext';
import { useCoins } from '@/contexts/CoinsContext';
import { dailyActivityDB } from '@/lib/dailyActivity';
import { SettingsButton } from '@/components/settings/Settings';

interface UserAccount {
  accountId: string;
  username: string;
  email: string;
  hashKey: string;
  avatar?: string;
  score: number;
  dailyRank?: number;
  dailyStudyTime?: number;
  studyTime?: number;
  createdAt: string;
  lastActive: string;
  rank?: number;
}

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserAccount | null;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, user, onClose }: UserProfileModalProps) {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const { coins } = useCoins();
  const { getCurrentUser } = useUser();
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [loadingTotalTime, setLoadingTotalTime] = useState(true);

  const formatStudyTime = (seconds: number) => {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
      return '00:00:00';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayStudyTime = (user: UserAccount) => {
    const dailyStudyTime = user.dailyStudyTime || 0;
    return typeof dailyStudyTime === 'number' && !isNaN(dailyStudyTime) ? dailyStudyTime : 0;
  };

  const getCoinsFromStudyTime = (studySeconds: number) => {
    return Math.floor(studySeconds / 600);
  };

  const isCurrentUser = (user: UserAccount) => {
    const currentUser = getCurrentUser();
    return currentUser?.accountId === user.accountId;
  };

  const openSettings = () => {
    // Close the profile modal first
    onClose();
    // Trigger the settings modal by simulating a click on the settings button
    setTimeout(() => {
      const settingsButton = document.querySelector('[data-settings-button="true"]') as HTMLButtonElement;
      if (settingsButton) {
        settingsButton.click();
      }
    }, 100);
  };

  // Calculate total study time since user registration
  const getTotalStudyTime = async (accountId: string) => {
    try {
      setLoadingTotalTime(true);
      // Get all user activities since registration
      const userActivities = await dailyActivityDB.getUserDailyActivities(accountId, 365 * 5); // Get up to 5 years of data
      
      // Calculate total study time in seconds
      const totalSeconds = userActivities.reduce((total, activity) => {
        return total + (activity.study_seconds || 0);
      }, 0);
      
      setTotalStudyTime(totalSeconds);
    } catch (error) {
      console.error('Error fetching total study time:', error);
      setTotalStudyTime(0);
    } finally {
      setLoadingTotalTime(false);
    }
  };

  // Load total study time when user changes
  useEffect(() => {
    if (user && user.accountId) {
      getTotalStudyTime(user.accountId);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-md rounded-2xl p-6 relative transform transition-all duration-300 ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            theme === 'light' 
              ? 'hover:bg-gray-100 text-gray-500' 
              : 'hover:bg-gray-700 text-gray-400'
          }`}
        >
          ×
        </button>

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-4 shadow-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: `${customTheme.colors.primary}20`,
                borderColor: customTheme.colors.primary
              }}
            >
              {user.avatar?.startsWith('http') ? (
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-4xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`,
                    color: '#ffffff'
                  }}
                >
                  {user.username?.charAt(0).toUpperCase() || '??'}
                </div>
              )}
            </div>
          </div>
          
          <h3 className={`text-2xl font-bold mb-1 bg-gradient-to-r ${
            theme === 'light' 
              ? 'from-blue-600 to-purple-600' 
              : 'from-blue-400 to-purple-400'
          } bg-clip-text text-transparent`}>
            {user.username}
          </h3>
          
          <p className={`text-sm ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {user.email ? `${user.email.substring(0, 3)}***@${user.email.split('@')[1]}` : ''}
          </p>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 transition-all duration-300 hover:scale-105 ${
            theme === 'light'
              ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200'
              : 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-blue-300 border border-blue-700/50'
          }`}>
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            {language === 'ar' ? 'المرتبة' : 'Rank'} #{user.dailyRank}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
            theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
          }`}
            style={{ backgroundColor: `${customTheme.colors.primary}10` }}
          >
            <div className={`text-2xl font-bold mb-1 transition-all duration-300`} style={{ color: customTheme.colors.primary }}>
              {loadingTotalTime ? '...' : formatStudyTime(totalStudyTime)}
            </div>
            <div className={`text-xs ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {language === 'ar' ? 'إجمالي وقت الدراسة' : 'Total Study Time'}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
            theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
          }`}
            style={{ backgroundColor: `${customTheme.colors.secondary}10` }}
          >
            <div className={`text-2xl font-bold mb-1 transition-all duration-300`} style={{ color: customTheme.colors.secondary }}>
              {formatStudyTime(getTodayStudyTime(user))}
            </div>
            <div className={`text-xs ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {language === 'ar' ? 'وقت الدراسة اليوم' : 'Today\'s Study Time'}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
            theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
          }`}>
            <div className={`text-2xl font-bold mb-1 bg-gradient-to-r ${
              theme === 'light' ? 'from-yellow-600 to-orange-500' : 'from-yellow-400 to-orange-300'
            } bg-clip-text text-transparent`}>
              {isCurrentUser(user) ? coins : user.score}
            </div>
            <div className={`text-xs ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {language === 'ar' ? 'العملات' : 'Points'}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
            theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
          }`}>
            <div className={`text-2xl font-bold mb-1 bg-gradient-to-r ${
              theme === 'light' ? 'from-green-600 to-blue-500' : 'from-green-400 to-blue-300'
            } bg-clip-text text-transparent`}>
              #{user.dailyRank || 999}
            </div>
            <div className={`text-xs ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {language === 'ar' ? 'المرتبة اليومية' : 'Daily Rank'}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className={`space-y-2 text-sm p-4 rounded-xl ${
          theme === 'light' ? 'bg-gray-50' : 'bg-gray-700/50'
        }`}>
          <div className="flex justify-between items-center">
            <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
              {language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}
            </span>
            <span className={`font-medium ${
              theme === 'light' ? 'text-gray-800' : 'text-gray-200'
            }`}>
              {new Date(user.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
              {language === 'ar' ? 'آخر نشاط:' : 'Last Active:'}
            </span>
            <span className={`font-medium ${
              theme === 'light' ? 'text-gray-800' : 'text-gray-200'
            }`}>
              {new Date(user.lastActive).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
              {language === 'ar' ? 'عملات اليوم:' : 'Today\'s Coins:'}
            </span>
            <span className={`font-medium bg-gradient-to-r ${
              theme === 'light' ? 'from-yellow-600 to-yellow-500' : 'from-yellow-400 to-yellow-300'
            } bg-clip-text text-transparent`}>
              {getCoinsFromStudyTime(getTodayStudyTime(user))} {language === 'ar' ? 'عملة' : 'coins'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {isCurrentUser(user) && (
            <button
              onClick={openSettings}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-white`}
              style={{ 
                background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.secondary})` 
              }}
            >
              {language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
            </button>
          )}
          <button
            onClick={onClose}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
              theme === 'light'
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
            }`}
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
