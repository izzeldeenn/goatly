'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Edit, Share2, TrendingUp, Award, BarChart3, Heart, MessageCircle, Users, Zap, Crown, Shield, Star } from 'lucide-react';

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
    
    if (seconds < 60) return 'الآن';
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
    return `منذ ${Math.floor(seconds / 86400)} يوم`;
  };

  const isDark = theme === 'dark';
  const userPosts = posts.filter(p => p.user_id === currentUser?.accountId);
  const totalLikes = userPosts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = userPosts.reduce((sum, p) => sum + p.comments, 0);

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Elegant background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-blue-500' : 'bg-blue-400'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-purple-500' : 'bg-purple-400'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-pink-500' : 'bg-pink-400'
        }`}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        {/* Profile Header */}
        <div className={`p-8 rounded-3xl backdrop-blur-xl border mb-8 ${
          isDark 
            ? 'bg-gray-900/40 border-gray-800/30' 
            : 'bg-white/60 border-gray-200/50'
        }`}>
          <div className="flex items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                isDark
                  ? 'from-blue-500 to-purple-500'
                  : 'from-blue-400 to-purple-400'
              } opacity-20 blur-xl animate-pulse`}></div>
              {currentUser?.avatar?.startsWith('http') ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.username}
                  className={`w-32 h-32 rounded-full object-cover relative border-4 ${
                    isDark ? 'border-blue-600/50' : 'border-blue-500/50'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold relative border-4 ${
                  isDark ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-600/50' : 'bg-gradient-to-br from-blue-500 to-purple-500 border-blue-500/50'
                }`}>
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              {/* Crown badge for high-level users */}
              {Math.floor((currentUser?.score || 0) / 100) + 1 >= 10 && (
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-white flex items-center justify-center animate-pulse">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className={`text-4xl font-bold mb-3 bg-gradient-to-r bg-clip-text ${
                isDark 
                  ? 'from-blue-400 to-purple-400 text-transparent' 
                  : 'from-blue-600 to-purple-600 text-transparent'
              }`}>
                {currentUser?.username || 'Anonymous User'}
              </h1>
              <p className={`text-lg mb-4 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {currentUser?.email ? `${currentUser.email.substring(0, 3)}***@${currentUser.email.split('@')[1]}` : 'لا يوجد بريد إلكتروني'}
              </p>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  isDark
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-800/30'
                    : 'bg-blue-50 text-blue-600 border border-blue-200/50'
                }`}>
                  <Shield className="w-4 h-4" />
                  المستوى {Math.floor((currentUser?.score || 0) / 100) + 1}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  isDark
                    ? 'bg-green-900/30 text-green-300 border border-green-800/30'
                    : 'bg-green-50 text-green-600 border border-green-200/50'
                }`}>
                  <Crown className="w-4 h-4" />
                  المرتبة #{Math.floor((currentUser?.score || 0) / 100) + 1}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  isDark
                    ? 'bg-purple-900/30 text-purple-300 border border-purple-800/30'
                    : 'bg-purple-50 text-purple-600 border border-purple-200/50'
                }`}>
                  <Star className="w-4 h-4" />
                  {currentUser?.score || 0} نقطة
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button className={`group px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                isDark
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25'
              }`}>
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                تعديل الملف الشخصي
              </button>
              <button className={`group px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                isDark
                  ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/50'
              }`}>
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                مشاركة الملف الشخصي
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Statistics Card */}
          <div className={`group p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            isDark
              ? 'bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-800/30 hover:border-blue-800/50 shadow-xl shadow-black/20'
              : 'bg-gradient-to-br from-white/80 to-gray-50/60 border-gray-200/50 hover:border-blue-200/60 shadow-lg shadow-gray-500/10'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold bg-gradient-to-r bg-clip-text ${
                isDark 
                  ? 'from-blue-400 to-purple-400 text-transparent' 
                  : 'from-blue-600 to-purple-600 text-transparent'
              }`}>
                {language === 'ar' ? 'الإحصائيات' : 'Statistics'}
              </h3>
              <div className={`p-3 rounded-2xl ${
                isDark ? 'bg-blue-900/30 border border-blue-800/30' : 'bg-blue-50 border border-blue-200/50'
              }`}>
                <BarChart3 className={`w-6 h-6 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'ar' ? 'العملات' : 'Score'}
                </span>
                <span className={`font-bold text-lg bg-gradient-to-r bg-clip-text ${
                  isDark 
                    ? 'from-blue-400 to-purple-400 text-transparent' 
                    : 'from-blue-600 to-purple-600 text-transparent'
                }`}>
                  {currentUser?.score || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'ar' ? 'المستوى' : 'Level'}
                </span>
                <span className={`font-bold text-lg bg-gradient-to-r bg-clip-text ${
                  isDark 
                    ? 'from-green-400 to-emerald-400 text-transparent' 
                    : 'from-green-600 to-emerald-600 text-transparent'
                }`}>
                  {Math.floor((currentUser?.score || 0) / 100) + 1}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'ar' ? 'المرتبة' : 'Rank'}
                </span>
                <span className={`font-bold text-lg bg-gradient-to-r bg-clip-text ${
                  isDark 
                    ? 'from-yellow-400 to-orange-400 text-transparent' 
                    : 'from-yellow-600 to-orange-600 text-transparent'
                }`}>
                  #{Math.floor((currentUser?.score || 0) / 100) + 1}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Card */}
          <div className={`group p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            isDark
              ? 'bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-800/30 hover:border-orange-800/50 shadow-xl shadow-black/20'
              : 'bg-gradient-to-br from-white/80 to-gray-50/60 border-gray-200/50 hover:border-orange-200/60 shadow-lg shadow-gray-500/10'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold bg-gradient-to-r bg-clip-text ${
                isDark 
                  ? 'from-orange-400 to-red-400 text-transparent' 
                  : 'from-orange-600 to-red-600 text-transparent'
              }`}>
                {language === 'ar' ? 'النشاط' : 'Activity'}
              </h3>
              <div className={`p-3 rounded-2xl ${
                isDark ? 'bg-orange-900/30 border border-orange-800/30' : 'bg-orange-50 border border-orange-200/50'
              }`}>
                <Zap className={`w-6 h-6 ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'ar' ? 'المنشورات' : 'Posts'}
                </span>
                <span className={`font-bold text-lg bg-gradient-to-r bg-clip-text ${
                  isDark 
                    ? 'from-blue-400 to-purple-400 text-transparent' 
                    : 'from-blue-600 to-purple-600 text-transparent'
                }`}>
                  {userPosts.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'ar' ? 'الإعجابات' : 'Likes'}
                </span>
                <span className={`font-bold text-lg bg-gradient-to-r bg-clip-text ${
                  isDark 
                    ? 'from-red-400 to-pink-400 text-transparent' 
                    : 'from-red-600 to-pink-600 text-transparent'
                }`}>
                  {totalLikes}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'ar' ? 'التعليقات' : 'Comments'}
                </span>
                <span className={`font-bold text-lg bg-gradient-to-r bg-clip-text ${
                  isDark 
                    ? 'from-green-400 to-emerald-400 text-transparent' 
                    : 'from-green-600 to-emerald-600 text-transparent'
                }`}>
                  {totalComments}
                </span>
              </div>
            </div>
          </div>

          {/* Achievements Card */}
          <div className={`group p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            isDark
              ? 'bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-800/30 hover:border-yellow-800/50 shadow-xl shadow-black/20'
              : 'bg-gradient-to-br from-white/80 to-gray-50/60 border-gray-200/50 hover:border-yellow-200/60 shadow-lg shadow-gray-500/10'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold bg-gradient-to-r bg-clip-text ${
                isDark 
                  ? 'from-yellow-400 to-orange-400 text-transparent' 
                  : 'from-yellow-600 to-orange-600 text-transparent'
              }`}>
                {language === 'ar' ? 'الإنجازات' : 'Achievements'}
              </h3>
              <div className={`p-3 rounded-2xl ${
                isDark ? 'bg-yellow-900/30 border border-yellow-800/30' : 'bg-yellow-50 border border-yellow-200/50'
              }`}>
                <Award className={`w-6 h-6 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'ar' ? 'الأوسمة' : 'Badges'}
                </span>
                <span className={`font-bold text-lg bg-gradient-to-r bg-clip-text ${
                  isDark 
                    ? 'from-yellow-400 to-orange-400 text-transparent' 
                    : 'from-yellow-600 to-orange-600 text-transparent'
                }`}>
                  3
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'ar' ? 'الإنجازات' : 'Achievements'}
                </span>
                <span className={`font-bold text-lg bg-gradient-to-r bg-clip-text ${
                  isDark 
                    ? 'from-purple-400 to-pink-400 text-transparent' 
                    : 'from-purple-600 to-pink-600 text-transparent'
                }`}>
                  7
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'ar' ? 'السلسلة' : 'Streak'}
                </span>
                <span className={`font-bold text-lg bg-gradient-to-r bg-clip-text ${
                  isDark 
                    ? 'from-red-400 to-orange-400 text-transparent' 
                    : 'from-red-600 to-orange-600 text-transparent'
                }`}>
                  5 {language === 'ar' ? 'أيام' : 'days'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className={`p-8 rounded-3xl backdrop-blur-xl border ${
          isDark 
            ? 'bg-gray-900/40 border-gray-800/30' 
            : 'bg-white/60 border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text ${
              isDark 
                ? 'from-blue-400 to-purple-400 text-transparent' 
                : 'from-blue-600 to-purple-600 text-transparent'
            }`}>
              {language === 'ar' ? 'المنشورات الأخيرة' : 'Recent Posts'}
            </h3>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isDark
                ? 'bg-blue-900/30 text-blue-300 border border-blue-800/30'
                : 'bg-blue-50 text-blue-600 border border-blue-200/50'
            }`}>
              {userPosts.length} {language === 'ar' ? 'منشور' : 'posts'}
            </div>
          </div>
          {userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.slice(0, 3).map((post, index) => (
                <div 
                  key={post.id} 
                  className={`group p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${
                    isDark
                      ? 'bg-gradient-to-br from-gray-800/40 to-gray-700/30 border-gray-700/30 hover:border-blue-700/50'
                      : 'bg-gradient-to-br from-gray-50/60 to-white/40 border-gray-200/30 hover:border-blue-200/50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      isDark
                        ? 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                        : 'bg-gray-100 text-gray-600 border border-gray-200/50'
                    }`}>
                      {formatTimeAgo(post.created_at)}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        post.liked
                          ? isDark
                            ? 'bg-red-900/30 text-red-300 border border-red-800/30'
                            : 'bg-red-50 text-red-600 border border-red-200/50'
                          : isDark
                            ? 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                            : 'bg-gray-100 text-gray-600 border border-gray-200/50'
                      }`}>
                        <Heart className={`w-3 h-3 ${post.liked ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        {post.likes}
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        isDark
                          ? 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                          : 'bg-gray-100 text-gray-600 border border-gray-200/50'
                      }`}>
                        <MessageCircle className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        {post.comments}
                      </div>
                    </div>
                  </div>
                  <p className={`leading-relaxed ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-16 px-8 rounded-2xl ${
              isDark ? 'bg-gray-800/30 border border-gray-700/20' : 'bg-gray-50 border border-gray-200/30'
            }`}>
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 ${
                isDark ? 'bg-gray-700/50 border border-gray-600/30' : 'bg-gray-100 border border-gray-200/50'
              }`}>
                <MessageCircle className={`w-10 h-10 ${
                  isDark ? 'text-gray-600' : 'text-gray-400'
                }`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {language === 'ar' ? 'لا توجد منشورات بعد' : 'No posts yet'}
              </h3>
              <p className={`text-sm text-center ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {language === 'ar' ? 'ابدأ بنشر المحتوى لرؤيته هنا' : 'Start posting content to see it here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
