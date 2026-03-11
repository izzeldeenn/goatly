'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { useUser } from '@/contexts/UserContext';

export function UserProfile() {
  const { theme } = useTheme();
  const { coins, level, experience } = useGamification();
  const { getCurrentUser } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const currentUser = getCurrentUser();

  const handleSaveSettings = () => {
    if (username.trim() || email.trim()) {
      localStorage.setItem('fahman_hub_account_settings', JSON.stringify({
        username: username.trim(),
        email: email.trim()
      }));
      alert('تم حفظ الإعدادات بنجاح!');
      setShowSettings(false);
    }
  };

  const handleLoadSettings = () => {
    const saved = localStorage.getItem('fahman_hub_account_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setUsername(settings.username || '');
      setEmail(settings.email || '');
    }
    setShowSettings(true);
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      {/* Profile Button */}
      <button
        onClick={handleLoadSettings}
        className={`flex items-center space-x-2 space-x-reverse p-2 border-2 rounded-lg transition-all duration-200 hover:scale-105 ${
          theme === 'light'
            ? 'border-gray-300 bg-white hover:bg-gray-50'
            : 'border-gray-600 bg-black hover:bg-gray-800'
        }`}
      >
        {/* Profile Picture */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
          theme === 'light'
            ? 'bg-blue-500 text-white'
            : 'bg-blue-600 text-white'
        }`}>
          {currentUser ? currentUser.name.charAt(0).toUpperCase() : '؟'}
        </div>
        
        {/* Username */}
        <div className="text-right">
          <div className={`text-sm font-medium ${
            theme === 'light' ? 'text-black' : 'text-white'
          }`}>
            {currentUser ? currentUser.name : 'ضيف المستخدم'}
          </div>
          <div className={`text-xs ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            مستوى {level} • {coins} عملة
          </div>
        </div>
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 border-2 rounded-lg max-w-md w-full mx-4 ${
            theme === 'light'
              ? 'border-gray-300 bg-white'
              : 'border-gray-600 bg-black'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${
              theme === 'light' ? 'text-black' : 'text-white'
            }`}>إعدادات الحساب</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block mb-2 text-sm font-medium ${
                  theme === 'light' ? 'text-black' : 'text-white'
                }`}>
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className={`w-full px-3 py-2 border-2 rounded focus:outline-none ${
                    theme === 'light'
                      ? 'border-gray-300 bg-white text-black focus:border-black'
                      : 'border-gray-600 bg-black text-white focus:border-white'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block mb-2 text-sm font-medium ${
                  theme === 'light' ? 'text-black' : 'text-white'
                }`}>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className={`w-full px-3 py-2 border-2 rounded focus:outline-none ${
                    theme === 'light'
                      ? 'border-gray-300 bg-white text-black focus:border-black'
                      : 'border-gray-600 bg-black text-white focus:border-white'
                  }`}
                />
              </div>
            </div>

            {/* User Stats */}
            <div className={`p-4 border-2 rounded-lg mb-4 ${
              theme === 'light'
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-700 bg-gray-900'
              }`}>
              <h4 className={`font-bold mb-3 text-center ${
                theme === 'light' ? 'text-black' : 'text-white'
              }`}>إحصائص المستخدم</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${
                    theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
                  }`}>{coins}</div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>عملات</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                  }`}>{level}</div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>مستوى</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    theme === 'light' ? 'text-green-600' : 'text-green-400'
                  }`}>{experience}</div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>نقاط خبرة</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className={`px-4 py-2 border-2 rounded font-medium transition-colors ${
                  theme === 'light'
                    ? 'border-gray-300 bg-white text-black hover:bg-gray-100'
                    : 'border-gray-600 bg-black text-white hover:bg-gray-800'
                }`}
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveSettings}
                className={`px-4 py-2 border-2 rounded font-medium transition-colors ${
                  theme === 'light'
                    ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                    : 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
