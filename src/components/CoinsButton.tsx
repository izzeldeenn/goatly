'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';

interface Task {
  id: string;
  name: string;
  reward: number;
  completed: boolean;
}

export function CoinsButton() {
  const { theme } = useTheme();
  const { coins, tasks } = useGamification();
  const [showGamification, setShowGamification] = useState(false);

  const handleOpenGamification = () => {
    setShowGamification(true);
  };

  return (
    <div>
      {/* Coins Button */}
      <button
        onClick={handleOpenGamification}
        className={`flex items-center space-x-2 space-x-reverse p-2 border-2 rounded-lg transition-all duration-200 hover:scale-105 ${
          theme === 'light'
            ? 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100'
            : 'border-yellow-600 bg-yellow-900/30 hover:bg-yellow-900/50'
        }`}
      >
        {/* Coin Icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
          theme === 'light'
            ? 'bg-yellow-500 text-white'
            : 'bg-yellow-600 text-white'
        }`}>
          💰
        </div>
        
        {/* Coins Count */}
        <div className="text-right">
          <div className={`text-sm font-medium ${
            theme === 'light' ? 'text-yellow-700' : 'text-yellow-300'
          }`}>
            العملات
          </div>
          <div className={`text-xl font-bold ${
            theme === 'light' ? 'text-yellow-800' : 'text-yellow-200'
          }`}>
            {coins}
          </div>
        </div>
      </button>

      {/* Gamification Modal */}
      {showGamification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 border-2 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto ${
            theme === 'light'
              ? 'border-gray-300 bg-white'
              : 'border-gray-600 bg-black'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${
                theme === 'light' ? 'text-black' : 'text-white'
              }`}>نظام العملات</h3>
              <button
                onClick={() => setShowGamification(false)}
                className={`p-2 border-2 rounded-lg transition-colors ${
                  theme === 'light'
                    ? 'border-gray-300 bg-white text-black hover:bg-gray-100'
                    : 'border-gray-600 bg-black text-white hover:bg-gray-800'
                }`}
              >
                ✕
              </button>
            </div>
            
            {/* This would contain the full gamification panel content */}
            <div className={`p-4 border-2 rounded-lg ${
              theme === 'light'
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-700 bg-gray-900'
            }`}>
              <h4 className={`font-bold mb-3 text-center ${
                theme === 'light' ? 'text-black' : 'text-white'
              }`}>المهام اليومية</h4>
              <p className={`text-center mb-4 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                أكمل المهام اليومية لكسب المزيد من العملات!
              </p>
              
              {/* Daily Tasks */}
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div key={index} className={`p-3 border rounded-lg ${
                    theme === 'light'
                      ? 'border-gray-300 bg-white'
                      : 'border-gray-600 bg-black'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className={`font-medium ${
                          theme === 'light' ? 'text-black' : 'text-white'
                        }`}>{task.name}</div>
                        <div className={`text-sm ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>+{task.reward} عملة</div>
                      </div>
                      <button className={`px-3 py-1 border-2 rounded text-sm font-medium transition-colors ${
                        theme === 'light'
                          ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                          : 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                      }`}>
                        إتمام
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shop Section */}
              <div className={`mt-6 p-4 border-2 rounded-lg ${
                theme === 'light'
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-700 bg-gray-900'
              }`}>
                <h4 className={`font-bold mb-3 text-center ${
                  theme === 'light' ? 'text-black' : 'text-white'
                }`}>المتجر</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={`p-3 border rounded-lg ${
                    theme === 'light'
                      ? 'border-gray-300 bg-white'
                      : 'border-gray-600 bg-black'
                  }`}>
                    <div className={`font-medium ${
                      theme === 'light' ? 'text-black' : 'text-white'
                    }`}>إيقاف المؤقت</div>
                    <div className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>5 دقائق</div>
                    <div className={`text-lg font-bold text-yellow-600`}>50 عملة</div>
                    <button className={`w-full mt-2 px-3 py-1 border-2 rounded text-sm font-medium transition-colors ${
                      theme === 'light'
                        ? 'border-yellow-600 bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}>
                      شراء
                    </button>
                  </div>
                  
                  <div className={`p-3 border rounded-lg ${
                    theme === 'light'
                      ? 'border-gray-300 bg-white'
                      : 'border-gray-600 bg-black'
                  }`}>
                    <div className={`font-medium ${
                      theme === 'light' ? 'text-black' : 'text-white'
                    }`}>مضاعفة النقاط</div>
                    <div className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>لجلسة</div>
                    <div className={`text-lg font-bold text-yellow-600`}>100 عملة</div>
                    <button className={`w-full mt-2 px-3 py-1 border-2 rounded text-sm font-medium transition-colors ${
                      theme === 'light'
                        ? 'border-yellow-600 bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}>
                      شراء
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
