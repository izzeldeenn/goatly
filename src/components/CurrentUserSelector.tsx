'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

export function CurrentUserSelector() {
  const { theme } = useTheme();
  const { getCurrentDeviceUser } = useUser();
  
  const currentUser = getCurrentDeviceUser();

  return (
    <div className="mb-6">
      <h3 className={`text-lg font-bold mb-3 ${
        theme === 'light' ? 'text-black' : 'text-white'
      }`}>الجهاز الحالي</h3>
      
      {currentUser ? (
        <div className={`p-3 border-2 rounded-lg ${
          theme === 'light'
            ? 'border-gray-300 bg-white'
            : 'border-gray-600 bg-black'
        }`}>
          <div className="flex justify-between items-center">
            <span className={`font-medium ${
              theme === 'light' ? 'text-black' : 'text-white'
            }`}>
              {currentUser.name}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              theme === 'light'
                ? 'bg-green-600 text-white'
                : 'bg-green-500 text-white'
            }`}>
              نشط
            </span>
          </div>
          <div className={`text-xs mt-1 ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            نقاط: {currentUser.score} | وقت الدراسة: {Math.floor(currentUser.studyTime / 60)} دقيقة
          </div>
        </div>
      ) : (
        <p className={`text-sm ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          جهاز غير معروف
        </p>
      )}
    </div>
  );
}
