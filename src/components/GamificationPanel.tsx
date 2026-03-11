'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';

export function GamificationPanel() {
  const { theme } = useTheme();
  const { coins, level, experience, tasks, completeTask, removeCoins } = useGamification();
  const [showShop, setShowShop] = useState(false);

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
  };

  const handlePurchase = (item: { id: string; name: string; cost: number; description: string }) => {
    if (coins >= item.cost) {
      removeCoins(item.cost);
      // Here you would implement the actual purchase logic
      alert(`تم شراء ${item.name} بنجاح!`);
    }
  };

  const shopItems = [
    { id: '1', name: 'إيقاف المؤقت لمدة 5 دقائق', cost: 50, description: 'توقف المؤقت مؤقتاً' },
    { id: '2', name: 'مضاعفة النقاط لجلسة واحدة', cost: 100, description: 'احصل على ضعف النقاط' },
    { id: '3', name: 'تخطي مهمة يومية', cost: 75, description: 'تجاوز مهمة واحدة' },
    { id: '4', name: 'حماية من الخسارة', cost: 150, description: 'لا تخسر نقاط لمدة ساعة' }
  ];

  const getExperienceToNextLevel = () => {
    const nextLevel = level + 1;
    return (nextLevel * 100) - experience;
  };

  return (
    <div className="mb-6">
      <h3 className={`text-lg font-bold mb-4 ${
        theme === 'light' ? 'text-black' : 'text-white'
      }`}>نظام العملات</h3>
      
      {/* Player Stats */}
      <div className={`p-4 border-2 rounded-lg mb-4 ${
        theme === 'light'
          ? 'border-gray-300 bg-white'
          : 'border-gray-600 bg-black'
      }`}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className={`text-2xl font-bold ${
              theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
            }`}>{coins}</div>
            <div className={`text-xs ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>عملات</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${
              theme === 'light' ? 'text-blue-600' : 'text-blue-400'
            }`}>{level}</div>
            <div className={`text-xs ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>مستوى</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${
              theme === 'light' ? 'text-green-600' : 'text-green-400'
            }`}>{getExperienceToNextLevel()}</div>
            <div className={`text-xs ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>للمستوى التالي</div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className={`p-4 border-2 rounded-lg mb-4 ${
        theme === 'light'
          ? 'border-gray-300 bg-white'
          : 'border-gray-600 bg-black'
      }`}>
        <h4 className={`font-bold mb-3 ${
          theme === 'light' ? 'text-black' : 'text-white'
        }`}>المهام اليومية</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {tasks.filter(task => task.type === 'daily').map(task => (
            <div
              key={task.id}
              className={`p-3 border rounded-lg flex justify-between items-center ${
                task.completed
                  ? theme === 'light'
                    ? 'border-green-400 bg-green-50'
                    : 'border-green-600 bg-green-900/30'
                  : theme === 'light'
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-600 bg-gray-900'
              }`}
            >
              <div className="flex-1">
                <div className={`font-medium ${
                  theme === 'light' ? 'text-black' : 'text-white'
                }`}>{task.title}</div>
                <div className={`text-xs ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>{task.description}</div>
                <div className={`text-sm font-bold ${
                  theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
                }`}>+{task.points} عملة</div>
              </div>
              {!task.completed && (
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className={`px-3 py-1 border-2 rounded text-sm font-medium transition-colors ${
                    theme === 'light'
                      ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                      : 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  إتمام
                </button>
              )}
              {task.completed && (
                <div className={`px-3 py-1 border-2 rounded text-sm font-medium ${
                  theme === 'light'
                    ? 'border-gray-400 bg-gray-400 text-white'
                    : 'border-gray-600 bg-gray-600 text-white'
                }`}>
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shop Button */}
      <button
        onClick={() => setShowShop(!showShop)}
        className={`w-full px-4 py-3 border-2 rounded-lg font-semibold transition-colors ${
          theme === 'light'
            ? 'border-purple-600 bg-purple-600 text-white hover:bg-purple-700'
            : 'border-purple-500 bg-purple-500 text-white hover:bg-purple-600'
        }`}
      >
        {showShop ? 'إغلاق المتجر' : 'فتح المتجر'}
      </button>

      {/* Shop */}
      {showShop && (
        <div className={`mt-4 p-4 border-2 rounded-lg ${
          theme === 'light'
            ? 'border-gray-300 bg-white'
            : 'border-gray-600 bg-black'
        }`}>
          <h4 className={`font-bold mb-3 ${
            theme === 'light' ? 'text-black' : 'text-white'
          }`}>المتجر</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {shopItems.map(item => (
              <div
                key={item.id}
                className={`p-3 border rounded-lg flex justify-between items-center ${
                  theme === 'light'
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-gray-700 bg-gray-900'
                }`}
              >
                <div className="flex-1">
                  <div className={`font-medium ${
                    theme === 'light' ? 'text-black' : 'text-white'
                  }`}>{item.name}</div>
                  <div className={`text-xs ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>{item.description}</div>
                </div>
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={coins < item.cost}
                  className={`px-3 py-1 border-2 rounded text-sm font-medium transition-colors ${
                    coins >= item.cost
                      ? theme === 'light'
                        ? 'border-yellow-600 bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600'
                      : theme === 'light'
                        ? 'border-gray-400 bg-gray-400 text-white cursor-not-allowed'
                        : 'border-gray-600 bg-gray-600 text-white cursor-not-allowed'
                  }`}
                >
                  {item.cost} عملة
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
