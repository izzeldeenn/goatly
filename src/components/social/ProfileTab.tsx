'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';

interface Post {
  id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  content: string;
  likes: number;
  comments: number;
  created_at: string;
  updated_at: string;
  liked: boolean;
  commentsList: any[];
}

interface ProfileTabProps {
  posts: Post[];
}

export function ProfileTab({ posts }: ProfileTabProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const currentUser = useUser().getCurrentUser();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className={`p-8 rounded-2xl border-2 mb-6 ${
        theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-gray-800'
      }`}>
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            {currentUser?.avatar?.startsWith('http') ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-500">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className={`text-3xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {currentUser?.username || 'Anonymous User'}
            </h1>
            <p className={`text-lg mb-3 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {currentUser?.email || 'No email set'}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className={`px-3 py-1 rounded-full ${
                theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-900 text-blue-300'
              }`}>
                Level {Math.floor((currentUser?.score || 0) / 100) + 1}
              </span>
              <span className={`px-3 py-1 rounded-full ${
                theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-900 text-green-300'
              }`}>
                Rank #{Math.floor((currentUser?.score || 0) / 100) + 1}
              </span>
              <span className={`px-3 py-1 rounded-full ${
                theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-900 text-purple-300'
              }`}>
                {currentUser?.score || 0} Points
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              theme === 'light'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}>
              Edit Profile
            </button>
            <button className={`px-6 py-2 rounded-lg font-medium transition-colors border-2 ${
              theme === 'light'
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'border-gray-600 text-gray-300 hover:bg-gray-800'
            }`}>
              Share Profile
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className={`p-6 rounded-xl border-2 ${
          theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-gray-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {language === 'ar' ? 'الإحصائيات' : 'Statistics'}
            </h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                {language === 'ar' ? 'النقاط' : 'Score'}
              </span>
              <span className={`font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {currentUser?.score || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                {language === 'ar' ? 'المستوى' : 'Level'}
              </span>
              <span className={`font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {Math.floor((currentUser?.score || 0) / 100) + 1}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                {language === 'ar' ? 'المرتبة' : 'Rank'}
              </span>
              <span className={`font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                #{Math.floor((currentUser?.score || 0) / 100) + 1}
              </span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border-2 ${
          theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-gray-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {language === 'ar' ? 'النشاط' : 'Activity'}
            </h3>
            <span className="text-2xl">🔥</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                {language === 'ar' ? 'المنشورات' : 'Posts'}
              </span>
              <span className={`font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {posts.filter(p => p.user_id === currentUser?.accountId).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                {language === 'ar' ? 'الإعجابات' : 'Likes'}
              </span>
              <span className={`font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {posts.filter(p => p.user_id === currentUser?.accountId).reduce((sum, p) => sum + p.likes, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                {language === 'ar' ? 'التعليقات' : 'Comments'}
              </span>
              <span className={`font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {posts.filter(p => p.user_id === currentUser?.accountId).reduce((sum, p) => sum + p.comments, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border-2 ${
          theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-gray-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {language === 'ar' ? 'الإنجازات' : 'Achievements'}
            </h3>
            <span className="text-2xl">🏆</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                {language === 'ar' ? 'الأوسمة' : 'Badges'}
              </span>
              <span className={`font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                3
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                {language === 'ar' ? 'الإنجازات' : 'Achievements'}
              </span>
              <span className={`font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                7
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                {language === 'ar' ? 'السلسلة' : 'Streak'}
              </span>
              <span className={`font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                5 {language === 'ar' ? 'أيام' : 'days'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className={`p-6 rounded-xl border-2 ${
        theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-gray-800'
      }`}>
        <h3 className={`text-xl font-semibold mb-4 ${
          theme === 'light' ? 'text-gray-900' : 'text-white'
        }`}>
          {language === 'ar' ? 'المنشورات الأخيرة' : 'Recent Posts'}
        </h3>
        {posts.filter(p => p.user_id === currentUser?.accountId).length > 0 ? (
          <div className="space-y-4">
            {posts.filter(p => p.user_id === currentUser?.accountId).slice(0, 3).map((post) => (
              <div key={post.id} className={`p-4 rounded-lg border ${
                theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-900'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {formatTimeAgo(post.created_at)}
                  </span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <span>❤️</span> {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>💬</span> {post.comments}
                    </span>
                  </div>
                </div>
                <p className={`${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className={`${
              theme === 'light' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {language === 'ar' ? 'لا توجد منشورات بعد' : 'No posts yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
