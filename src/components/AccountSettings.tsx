'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { useUser } from '@/contexts/UserContext';

export function AccountSettings() {
  const { theme } = useTheme();
  const { coins, level, experience } = useGamification();
  const { getCurrentDeviceUser } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const currentUser = getCurrentDeviceUser();

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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className={`text-sm ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            الجهاز:
          </div>
          <div className={`font-medium ${
            theme === 'light' ? 'text-black' : 'text-white'
          }`}>
            {currentUser ? currentUser.name : 'غير محدد'}
          </div>
        </div>
        <button
          onClick={handleLoadSettings}
          className={`px-3 py-1 border-2 rounded text-sm font-medium transition-colors ${
            theme === 'light'
              ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
              : 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          ⚙️ إعدادات
        </button>
      </div>

      {/* Quick Stats */}
      <div className={`p-3 border-2 rounded-lg mb-4 ${
        theme === 'light'
          ? 'border-gray-300 bg-white'
          : 'border-gray-600 bg-black'
      }`}>
        <h4 className={`font-bold mb-2 text-center ${
          theme === 'light' ? 'text-black' : 'text-white'
        }`}>إحصائص سريعة</h4>
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div>
            <div className={`font-bold ${
              theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
            }`}>{coins}</div>
            <div className={
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }>عملات</div>
          </div>
          <div>
            <div className={`font-bold ${
              theme === 'light' ? 'text-blue-600' : 'text-blue-400'
            }`}>{level}</div>
            <div className={
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }>مستوى</div>
          </div>
        </div>
      </div>

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
            }`}>إعدادات الجهاز</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block mb-2 text-sm font-medium ${
                  theme === 'light' ? 'text-black' : 'text-white'
                }`}>
                  اسم الجهاز
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم الجهاز"
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
