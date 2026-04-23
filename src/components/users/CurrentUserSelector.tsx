'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCoins } from '@/contexts/CoinsContext';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { dailyActivityDB } from '@/lib/dailyActivity';
import { landingTexts } from '@/constants/landingTexts';

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar8',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar10',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar11',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar12',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar13',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar14',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar15'
];

export function CurrentUserSelector({ studyStreak }: { studyStreak?: number }) {
  const { theme } = useTheme();
  const { coins } = useCoins();
  const { getCurrentUser, updateUserName, updateUserAvatar, isTimerActive } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const texts = landingTexts[language];
  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const currentUser = getCurrentUser();
  const isActive = isTimerActive();
  const level = Math.floor(coins / 100) + 1;

  // Format time to HH:MM:SS
  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutesLeft = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutesLeft.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate study streak (same function as ActivityGraph)
  const calculateCurrentStreak = (contributions: any[]): number => {
    if (contributions.length === 0) return 0;
    
    // Create a Set of dates with study seconds > 0 for faster lookup
    const studyDates = new Set(
      contributions
        .filter(c => c.studySeconds > 0)
        .map(c => c.date)
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
       
    // Check backwards from today
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
            
      if (studyDates.has(dateStr)) {
        streak++;
      } else {
        break; // Break on first day without study
      }
    }

    return streak;
  };

  // Load today's study time and streak
  useEffect(() => {
    const loadData = async () => {
      if (currentUser?.accountId) {
        try {
          // Load today's study time
          const rankings = await dailyActivityDB.getTodayRankings();
          
          const userActivity = rankings.find(r => r.account_id === currentUser.accountId);
          
          const time = userActivity?.study_seconds || 0;
          setTodayStudyTime(time);
          
          // Get user contributions for streak calculation
          try {
            const contributions = await dailyActivityDB.getUserActivityContributions(currentUser.accountId);
            
            // Calculate and set streak using the same function as ActivityGraph
            const streak = calculateCurrentStreak(contributions);
            setCurrentStreak(streak);
          } catch (error: any) {
            console.error('❌ Error getting user contributions:', error);
          }
          
        } catch (error) {
          console.error('❌ Error loading data:', error);
        }
      }
    };

    loadData();
    
    // Update every 30 seconds to keep it fresh
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, [currentUser?.accountId]);

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
                {currentUser?.avatar?.startsWith('http') ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.username}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br ${
                    theme === 'light'
                      ? 'from-green-500 via-yellow-500 to-green-600 text-white shadow-md'
                      : 'from-green-600 via-yellow-600 to-green-700 text-white shadow-lg'
                  } transform transition-transform duration-300 group-hover:scale-110`}>
                    {currentUser?.username?.charAt(0).toUpperCase() || '👤'}
                  </div>
                )}
                
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
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-yellow-50 to-green-50 text-green-700 border border-yellow-200'
                      : 'bg-gradient-to-r from-yellow-900/30 to-green-900/30 text-green-300 border border-yellow-700/50'
                  }`}>
                    <span className="w-1 h-1 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    {formatStudyTime(todayStudyTime)} ⏱️
                  </div>
                  
                  {currentStreak > 0 && (
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      theme === 'light'
                        ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border border-orange-200'
                        : 'bg-gradient-to-r from-orange-900/30 to-red-900/30 text-orange-300 border border-orange-700/50'
                    }`}>
                      <span className="text-sm mr-1">🔥</span>
                      {currentStreak} أيام
                    </div>
                  )}
                </div>
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
                      {t.username}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t.enterUsername}
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
                      <option value="en">{texts.english}</option>
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
                        className={`w-full px-4 py-3 rounded-2xl focus:outline-none transition-all text-lg ${
                          theme === 'light'
                            ? 'bg-gray-50 border-2 border-gray-200 text-gray-800 focus:border-blue-500 focus:bg-white'
                            : 'bg-gray-800 border-2 border-gray-700 text-gray-100 focus:border-blue-400 focus:bg-gray-750'
                        }`}
                      />
                      {customAvatarUrl && (
                        <div className="mt-2 flex justify-center">
                          <img 
                            src={customAvatarUrl} 
                            alt="Custom avatar preview"
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Preset Avatar Grid */}
                    <div className="text-sm text-gray-500 mb-2">أو اختر من الصور الجاهزة:</div>
                    <div className="grid grid-cols-5 gap-3">
                      {AVATARS.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => {
                            setSelectedAvatar(avatar);
                            setCustomAvatarUrl(''); // Clear custom URL when preset is selected
                          }}
                          className="aspect-square rounded-2xl overflow-hidden transition-all duration-200 hover:scale-110"
                          style={{
                            border: `3px solid ${selectedAvatar === avatar ? '#3b82f6' : '#d1d5db'}`
                          }}
                        >
                          <img 
                            src={avatar} 
                            alt={`Avatar ${AVATARS.indexOf(avatar) + 1}`}
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
                    }`}>{coins}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>⚡ {t.experience}</div>
                  </div>
                  <div className={`p-4 rounded-2xl text-center ${
                    theme === 'light' ? 'bg-white/80' : 'bg-gray-800/50'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
                      theme === 'light' ? 'from-purple-600 to-pink-600' : 'from-purple-400 to-pink-400'
                    }`}>{level}</div>
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
 