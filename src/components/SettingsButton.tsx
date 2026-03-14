'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';

const AVATARS = ['😀', '😎', '🤓', '🦄', '🚀', '⭐', '🌟', '💫', '🔥', '⚡', '🎯', '🏆', '🎨', '🎭', '🎪'];

export function SettingsButton() {
  const { theme } = useTheme();
  const { coins, level, experience } = useGamification();
  const { getCurrentUser, updateUserName, updateUserAvatar } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  const currentUser = getCurrentUser();

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
    <>
      <button
        onClick={handleLoadSettings}
        className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor: customTheme.colors.surface,
          color: customTheme.colors.text
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = customTheme.colors.primary;
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = customTheme.colors.surface;
          e.currentTarget.style.color = customTheme.colors.text;
        }}
      >
        ⚙️
      </button>

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl ${
            theme === 'light' ? 'bg-white' : 'bg-gray-900'
          }`}
          style={{ border: `2px solid ${customTheme.colors.border}` }}
        >
            <div 
              className="p-6 border-b"
              style={{
                background: `linear-gradient(to right, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                borderColor: customTheme.colors.border
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-2xl font-bold ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                }`}>
                  {t.settings}
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: customTheme.colors.text
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = customTheme.colors.primary;
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = customTheme.colors.text;
                  }}
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
                      className="w-full px-4 py-3 rounded-2xl focus:outline-none transition-all text-lg"
                      style={{
                        backgroundColor: customTheme.colors.surface,
                        borderColor: customTheme.colors.border,
                        color: customTheme.colors.text
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = customTheme.colors.primary;
                        e.currentTarget.style.backgroundColor = theme === 'light' ? '#ffffff' : '#000000';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = customTheme.colors.border;
                        e.currentTarget.style.backgroundColor = customTheme.colors.surface;
                      }}
                    />
                  </div>

                  <div>
                    <label className={`block mb-3 text-lg font-semibold ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.appearance}
                    </label>
                    <div 
                      className="p-4 rounded-2xl"
                      style={{
                        backgroundColor: customTheme.colors.surface,
                        borderColor: customTheme.colors.border,
                        border: `2px solid ${customTheme.colors.border}`
                      }}
                    >
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
                      className="w-full px-4 py-3 rounded-2xl focus:outline-none transition-all text-lg"
                      style={{
                        backgroundColor: customTheme.colors.surface,
                        borderColor: customTheme.colors.border,
                        color: customTheme.colors.text
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = customTheme.colors.primary;
                        e.currentTarget.style.backgroundColor = theme === 'light' ? '#ffffff' : '#000000';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = customTheme.colors.border;
                        e.currentTarget.style.backgroundColor = customTheme.colors.surface;
                      }}
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
                          className="aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                          style={{
                            background: selectedAvatar === avatar
                              ? `linear-gradient(to bottom right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`
                              : customTheme.colors.surface,
                            color: selectedAvatar === avatar ? '#ffffff' : customTheme.colors.text,
                            border: `2px solid ${selectedAvatar === avatar ? customTheme.colors.primary : customTheme.colors.border}`,
                            boxShadow: selectedAvatar === avatar ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                          }}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className="mt-8 p-6 rounded-3xl"
                style={{
                  background: `linear-gradient(to bottom right, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                  border: `2px solid ${customTheme.colors.border}`
                }}
              >
                <h4 className={`font-bold text-xl mb-6 text-center ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                }`}>{t.statistics}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div 
                    className="p-4 rounded-2xl text-center"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)'
                    }}
                  >
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{
                        background: `linear-gradient(to right, ${customTheme.colors.secondary}, ${customTheme.colors.primary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >{coins}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>🪙 {t.coins}</div>
                  </div>
                  <div 
                    className="p-4 rounded-2xl text-center"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)'
                    }}
                  >
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{
                        background: `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >{level}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>🎯 {t.level}</div>
                  </div>
                  <div 
                    className="p-4 rounded-2xl text-center"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)'
                    }}
                  >
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{
                        background: `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >{experience}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>⚡ {t.experience}</div>
                  </div>
                  <div 
                    className="p-4 rounded-2xl text-center"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)'
                    }}
                  >
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{
                        background: `linear-gradient(to right, ${customTheme.colors.secondary}, ${customTheme.colors.accent})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >{currentUser?.rank || 1}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>🏆 {t.rank}</div>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="p-6 border-t flex justify-end space-x-3 space-x-reverse"
              style={{
                borderColor: customTheme.colors.border,
                backgroundColor: customTheme.colors.surface
              }}
            >
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-3 rounded-2xl font-medium transition-all duration-200 text-lg"
                style={{
                  backgroundColor: customTheme.colors.surface,
                  color: customTheme.colors.text,
                  border: `2px solid ${customTheme.colors.border}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = customTheme.colors.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = customTheme.colors.surface;
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-3 rounded-2xl font-medium transition-all duration-200 text-lg"
                style={{
                  background: `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`,
                  color: '#ffffff',
                  border: `2px solid ${customTheme.colors.primary}`,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, ${customTheme.colors.accent}, ${customTheme.colors.primary})`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`;
                }}
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
