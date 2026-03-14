'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';

const AVATARS = ['😀', '😎', '🤓', '🦄', '🚀', '⭐', '🌟', '💫', '🔥', '⚡', '🎯', '🏆', '🎨', '🎭', '🎪'];

export function CurrentUserSelector() {
  const { theme } = useTheme();
  const { coins, level, experience } = useGamification();
  const { getCurrentUser, updateUserName, updateUserAvatar, isTimerActive } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  const currentUser = getCurrentUser();
  const isActive = isTimerActive();

  const handleSaveSettings = () => {
    if (username.trim()) {
      updateUserName(username.trim());
    }
    if (selectedAvatar) {
      updateUserAvatar(selectedAvatar);
    }
    setShowSettings(false);
  };

  const handleLoadSettings = () => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setSelectedAvatar(currentUser.avatar || '👤');
    }
    setShowSettings(true);
  };

  return (
    <div className="mb-3">
      {currentUser ? (
        <div className={`relative overflow-hidden group ${
          theme === 'light' ? 'bg-white' : 'bg-gray-900'
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${
            theme === 'light'
              ? 'from-green-500/5 via-yellow-500/5 to-green-500/5'
              : 'from-green-500/10 via-yellow-500/10 to-green-500/10'
          }`} />
          
          <div className="relative p-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br ${
                  theme === 'light'
                    ? 'from-green-500 via-yellow-500 to-green-600 text-white shadow-md'
                    : 'from-green-600 via-yellow-600 to-green-700 text-white shadow-lg'
                } transform transition-transform duration-300 group-hover:scale-110`}>
                  {currentUser?.avatar || currentUser?.username?.charAt(0).toUpperCase() || '👤'}
                </div>
                
                {isActive && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse shadow-md">
                    ✓
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className={`text-base font-bold ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                }`}>
                  {currentUser.username}
                </h2>
              </div>
              
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-yellow-50 to-green-50 text-green-700 border border-yellow-200'
                  : 'bg-gradient-to-r from-yellow-900/30 to-green-900/30 text-green-300 border border-yellow-700/50'
              }`}>
                <span className="w-1 h-1 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                {Math.floor((currentUser?.studyTime || 0) / 60)}m ⏱️
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`text-center p-4 rounded-xl border-2 border-dashed ${
          theme === 'light'
            ? 'border-yellow-300 bg-yellow-50'
            : 'border-yellow-700 bg-yellow-950/50'
        }`}>
          <div className="text-3xl mb-1.5 opacity-50">👤</div>
          <p className={`text-xs font-medium ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {language === 'ar' ? 'حساب غير معروف' : 'Unknown Account'}
          </p>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl ${
            theme === 'light' ? 'bg-white border border-yellow-200' : 'bg-black border border-yellow-800'
          }`}>
            <div className={`p-6 border-b ${
              theme === 'light' ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50' : 'border-yellow-800 bg-gradient-to-r from-yellow-950/20 to-green-950/20'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-2xl font-bold ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                }`}>
                  {t.settings}
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    theme === 'light'
                      ? 'hover:bg-yellow-100 text-yellow-700'
                      : 'hover:bg-yellow-900 text-yellow-300'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className={`block mb-3 text-lg font-semibold ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.deviceName}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t.enterDeviceName}
                      className={`w-full px-4 py-3 rounded-2xl focus:outline-none transition-all text-lg ${
                        theme === 'light'
                          ? 'bg-yellow-50 border-2 border-yellow-200 text-gray-800 focus:border-green-500 focus:bg-white'
                          : 'bg-yellow-950 border-2 border-yellow-800 text-gray-100 focus:border-green-400 focus:bg-black'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block mb-3 text-lg font-semibold ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.appearance}
                    </label>
                    <div className={`p-4 rounded-2xl ${
                      theme === 'light' ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-yellow-950 border-2 border-yellow-800'
                    }`}>
                      <ThemeToggle />
                    </div>
                  </div>

                  <div>
                    <label className={`block mb-3 text-lg font-semibold ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.language}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                      className={`w-full px-4 py-3 rounded-2xl focus:outline-none transition-all text-lg ${
                        theme === 'light'
                          ? 'bg-gray-50 border-2 border-gray-200 text-gray-800 focus:border-blue-500 focus:bg-white'
                          : 'bg-gray-800 border-2 border-gray-700 text-gray-100 focus:border-blue-400 focus:bg-gray-750'
                      }`}
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={`block mb-3 text-lg font-semibold ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.avatar}
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {AVATARS.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                            selectedAvatar === avatar
                              ? theme === 'light'
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-xl'
                              : theme === 'light'
                                ? 'bg-gray-100 hover:bg-gray-200 border-2 border-gray-300'
                                : 'bg-gray-800 hover:bg-gray-700 border-2 border-gray-600'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`mt-8 p-6 rounded-3xl ${
                theme === 'light'
                  ? 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-blue-200'
                  : 'bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 border border-blue-700/50'
              }`}>
                <h4 className={`font-bold text-xl mb-6 text-center ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                }`}>{t.statistics}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-2xl text-center ${
                    theme === 'light' ? 'bg-white/80' : 'bg-gray-800/50'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
                      theme === 'light' ? 'from-yellow-600 to-orange-600' : 'from-yellow-400 to-orange-400'
                    }`}>{coins}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>🪙 {t.coins}</div>
                  </div>
                  <div className={`p-4 rounded-2xl text-center ${
                    theme === 'light' ? 'bg-white/80' : 'bg-gray-800/50'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
                      theme === 'light' ? 'from-blue-600 to-indigo-600' : 'from-blue-400 to-indigo-400'
                    }`}>{level}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>🎯 {t.level}</div>
                  </div>
                  <div className={`p-4 rounded-2xl text-center ${
                    theme === 'light' ? 'bg-white/80' : 'bg-gray-800/50'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
                      theme === 'light' ? 'from-green-600 to-emerald-600' : 'from-green-400 to-emerald-400'
                    }`}>{experience}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>⚡ {t.experience}</div>
                  </div>
                  <div className={`p-4 rounded-2xl text-center ${
                    theme === 'light' ? 'bg-white/80' : 'bg-gray-800/50'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
                      theme === 'light' ? 'from-purple-600 to-pink-600' : 'from-purple-400 to-pink-400'
                    }`}>{currentUser?.rank || 1}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>🏆 {t.rank}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 border-t flex justify-end space-x-3 space-x-reverse ${
              theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-800'
            }`}>
              <button
                onClick={() => setShowSettings(false)}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 text-lg ${
                  theme === 'light'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveSettings}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 text-lg bg-gradient-to-r ${
                  theme === 'light'
                    ? 'from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                    : 'from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 shadow-xl'
                }`}
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 