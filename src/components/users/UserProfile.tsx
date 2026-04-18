'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { usePoints } from '@/contexts/PointsContext';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { useCustomTheme } from '@/contexts/CustomThemeContext';

// Generate 250 avatars dynamically
const AVATARS = Array.from({ length: 250 }, (_, i) => 
  `https://api.dicebear.com/7.x/avataaars/svg?seed=avatar${i + 1}`
);

export function UserProfile() {
  const { theme } = useTheme();
  const { coins, level, experience } = usePoints();
  const { getCurrentUser, updateUserName, updateUserAvatar } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [avatarPage, setAvatarPage] = useState(1);
  const [avatarSearch, setAvatarSearch] = useState('');
  const avatarsPerPage = 20;

  const currentUser = getCurrentUser();

  // Filter and paginate avatars
  const filteredAvatars = avatarSearch 
    ? AVATARS.filter((_, index) => 
        (index + 1).toString().includes(avatarSearch)
      )
    : AVATARS;

  const totalPages = Math.ceil(filteredAvatars.length / avatarsPerPage);
  const startIndex = (avatarPage - 1) * avatarsPerPage;
  const endIndex = startIndex + avatarsPerPage;
  const currentAvatars = filteredAvatars.slice(startIndex, endIndex);

  // Reset page when search changes
  useEffect(() => {
    setAvatarPage(1);
  }, [avatarSearch]);

  const handleSaveSettings = () => {
    if (username.trim()) {
      updateUserName(username.trim());
    }
    if (customAvatarUrl) {
      updateUserAvatar(customAvatarUrl);
    } else if (selectedAvatar) {
      updateUserAvatar(selectedAvatar);
    }
    setShowSettings(false);
  };

  const handleLoadSettings = () => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      // Check if avatar is a URL (starts with http) or from preset avatars
      if (currentUser.avatar?.startsWith('http')) {
        setCustomAvatarUrl(currentUser.avatar);
        setSelectedAvatar('');
      } else {
        setSelectedAvatar(currentUser.avatar || AVATARS[0]);
        setCustomAvatarUrl('');
      }
    }
    setShowSettings(true);
  };

  return (
    <div>
      <button
        onClick={handleLoadSettings}
        className="flex items-center space-x-3 space-x-reverse p-3 border-2 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-lg"
        style={{
          borderColor: customTheme.colors.border,
          backgroundColor: theme === 'light' ? '#ffffff' : '#000000',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = customTheme.colors.surface;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme === 'light' ? '#ffffff' : '#000000';
        }}
      >
        {currentUser?.avatar?.startsWith('http') ? (
          <img 
            src={currentUser.avatar} 
            alt={currentUser.username}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
            style={{
              background: `linear-gradient(to bottom right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`,
              color: '#ffffff'
            }}
          >
            {currentUser?.username?.charAt(0).toUpperCase() || '👤'}
          </div>
        )}
        
        <div className="text-right flex-1" style={{ marginLeft: '2px' }}>
          <div className={`text-base font-semibold ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-200'
          }`}>
            {currentUser ? currentUser.username : t.unknownDevice}
          </div>
        </div>

        <div className={`p-2 rounded-lg transition-colors ${
          theme === 'light'
            ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
            : 'bg-yellow-900 hover:bg-yellow-800 text-yellow-300'
        }`}>
          ⚙️
        </div>
      </button>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className={`p-8 rounded-3xl max-w-2xl w-full mx-4 shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto ${
            theme === 'light'
              ? 'bg-white border border-yellow-200'
              : 'bg-black border border-yellow-800'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-200'
              }`}>
                {t.settings}
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'light'
                    ? 'hover:bg-yellow-100 text-yellow-700'
                    : 'hover:bg-yellow-900 text-yellow-300'
                }`}
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-col gap-8">
              <div className="space-y-6">
                <div>
                  <label className={`block mb-3 text-lg font-medium ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {t.username}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.enterUsername}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-lg ${
                      theme === 'light'
                        ? 'border-yellow-300 bg-white text-black focus:border-green-500'
                        : 'border-yellow-600 bg-black text-white focus:border-green-400'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block mb-3 text-lg font-medium ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {t.appearance}
                  </label>
                  <div className="flex items-center justify-center p-4 border-2 rounded-xl ${
                    theme === 'light' ? 'border-yellow-200' : 'border-yellow-800'
                  }">
                    <ThemeToggle />
                  </div>
                </div>

                <div>
                  <label className={`block mb-3 text-lg font-medium ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {t.language}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-lg ${
                      theme === 'light'
                        ? 'border-yellow-300 bg-white text-black focus:border-green-500'
                        : 'border-yellow-600 bg-black text-white focus:border-green-400'
                    }`}
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={`block mb-3 text-lg font-medium ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {t.avatar}
                  </label>
                  
                  {/* Custom Avatar URL Input */}
                  <div className="mb-4">
                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={(e) => {
                        setCustomAvatarUrl(e.target.value);
                        setSelectedAvatar(''); // Clear preset selection when custom URL is entered
                      }}
                      placeholder="أدخل رابط الصورة..."
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-lg ${
                        theme === 'light'
                          ? 'border-yellow-300 bg-white text-black focus:border-green-500'
                          : 'border-yellow-600 bg-black text-white focus:border-green-400'
                      }`}
                    />
                    {customAvatarUrl && (
                      <div className="mt-2 flex justify-center">
                        <img 
                          src={customAvatarUrl} 
                          alt="Custom avatar preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Avatar Search and Pagination */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={avatarSearch}
                      onChange={(e) => setAvatarSearch(e.target.value)}
                      placeholder="ابحث عن رقم الصورة..."
                      className={`w-full px-4 py-2 border-2 rounded-xl focus:outline-none transition-colors text-lg ${
                        theme === 'light'
                          ? 'border-yellow-300 bg-white text-black focus:border-green-500'
                          : 'border-yellow-600 bg-black text-white focus:border-green-400'
                      }`}
                    />
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mb-4">
                      <button
                        onClick={() => setAvatarPage(Math.max(1, avatarPage - 1))}
                        disabled={avatarPage === 1}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          theme === 'light'
                            ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 disabled:opacity-50'
                            : 'bg-yellow-900 hover:bg-yellow-800 text-yellow-300 disabled:opacity-50'
                        }`}
                      >
                        السابق
                      </button>
                      <span className={`px-3 py-1 ${
                        theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        {avatarPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setAvatarPage(Math.min(totalPages, avatarPage + 1))}
                        disabled={avatarPage === totalPages}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          theme === 'light'
                            ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 disabled:opacity-50'
                            : 'bg-yellow-900 hover:bg-yellow-800 text-yellow-300 disabled:opacity-50'
                        }`}
                      >
                        التالي
                      </button>
                    </div>
                  )}

                  {/* Preset Avatar Grid */}
                  <div className="text-sm text-gray-500 mb-2">
                    {avatarSearch ? `نتائج البحث (${filteredAvatars.length} صورة):` : `اختر من الصور الجاهزة (إظهار ${startIndex + 1}-${Math.min(endIndex, filteredAvatars.length)} من ${filteredAvatars.length}):`}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {currentAvatars.map((avatar, index) => (
                      <button
                        key={avatar}
                        onClick={() => {
                          setSelectedAvatar(avatar);
                          setCustomAvatarUrl(''); // Clear custom URL when preset is selected
                        }}
                        className="p-3 rounded-xl overflow-hidden transition-all duration-200 hover:scale-110"
                        style={{
                          border: `3px solid ${selectedAvatar === avatar ? '#10b981' : (theme === 'light' ? '#fbbf24' : '#ca8a04')}`
                        }}
                      >
                        <img 
                          src={avatar} 
                          alt={`Avatar ${startIndex + index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 border-2 rounded-xl mt-8 ${
              theme === 'light'
                ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-green-50'
                : 'border-yellow-800 bg-gradient-to-br from-yellow-950 to-green-950/30'
            }`}>
              <h4 className={`font-bold text-xl mb-6 text-center ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-200'
              }`}>{t.statistics}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className={`p-4 rounded-xl ${
                  theme === 'light' ? 'bg-white/80' : 'bg-gray-800/50'
                }`}>
                  <div className={`text-2xl font-bold mb-1 ${
                    theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
                  }`}>{coins}</div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>🪙 {t.coins}</div>
                </div>
                <div className={`p-4 rounded-xl ${
                  theme === 'light' ? 'bg-white/80' : 'bg-gray-800/50'
                }`}>
                  <div className={`text-2xl font-bold mb-1 ${
                    theme === 'light' ? 'text-green-600' : 'text-green-400'
                  }`}>{level}</div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>🎯 {t.level}</div>
                </div>
                <div className={`p-4 rounded-xl ${
                  theme === 'light' ? 'bg-white/80' : 'bg-gray-800/50'
                }`}>
                  <div className={`text-2xl font-bold mb-1 ${
                    theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
                  }`}>{experience}</div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>⚡ {t.experience}</div>
                </div>
                <div className={`p-4 rounded-xl ${
                  theme === 'light' ? 'bg-white/80' : 'bg-gray-800/50'
                }`}>
                  <div className={`text-2xl font-bold mb-1 ${
                    theme === 'light' ? 'text-green-600' : 'text-green-400'
                  }`}>{Math.floor((currentUser?.score || 0) / 100) + 1}</div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>🏆 {t.rank}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse mt-8 sticky bottom-0 bg-inherit py-4">
              <button
                onClick={() => setShowSettings(false)}
                className={`px-6 py-3 border-2 rounded-xl font-medium transition-all duration-200 text-lg ${
                  theme === 'light'
                    ? 'border-yellow-300 bg-white text-yellow-700 hover:bg-yellow-50'
                    : 'border-yellow-600 bg-black text-yellow-300 hover:bg-yellow-950'
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveSettings}
                className={`px-6 py-3 border-2 rounded-xl font-medium transition-all duration-200 text-lg ${
                  theme === 'light'
                    ? 'border-green-500 bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200/50'
                    : 'border-green-600 bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/30'
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