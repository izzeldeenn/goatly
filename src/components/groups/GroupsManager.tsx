'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { socialDB, Group, GroupPost, GroupComment } from '@/lib/social';
import { Search, Users, Plus, Lock, Eye, EyeOff, UserPlus, Settings, Crown, Shield, Zap, TrendingUp } from 'lucide-react';

interface GroupsManagerProps {
  onGroupSelect: (group: Group) => void;
  selectedGroup: Group | null;
}

export function GroupsManager({ onGroupSelect, selectedGroup }: GroupsManagerProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const currentUser = useUser().getCurrentUser();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create group form state
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const [allGroups, myGroups] = await Promise.all([
        socialDB.getGroups(),
        currentUser ? socialDB.getUserGroups(currentUser.accountId) : []
      ]);
      
      setGroups(allGroups);
      setUserGroups(myGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!currentUser || !groupName.trim()) return;
    
    try {
      const newGroup = await socialDB.createGroup(
        groupName,
        groupDescription,
        isPrivate,
        currentUser.accountId,
        currentUser.username || 'User',
        currentUser.avatar || 'User'
      );
      
      if (newGroup) {
        setGroupName('');
        setGroupDescription('');
        setIsPrivate(false);
        setShowCreateGroup(false);
        loadGroups();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser) return;
    
    try {
      const success = await socialDB.joinGroup(
        groupId,
        currentUser.accountId,
        currentUser.username || 'User',
        currentUser.avatar || 'User'
      );
      
      if (success) {
        loadGroups();
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) return;
    
    try {
      const success = await socialDB.leaveGroup(groupId, currentUser.accountId);
      
      if (success) {
        loadGroups();
        if (selectedGroup?.id === groupId) {
          onGroupSelect(null as any);
        }
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const isUserMember = (groupId: string) => {
    return userGroups.some(group => group.id === groupId);
  };

  // Filter groups based on search term
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserGroups = userGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isDark = theme === 'dark';

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

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text ${
                isDark 
                  ? 'from-blue-400 via-purple-400 to-pink-400 text-transparent' 
                  : 'from-blue-600 via-purple-600 to-pink-600 text-transparent'
              }`}>
                {language === 'ar' ? 'المجموعات' : 'Groups'}
              </h1>
              <p className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                انضم إلى المجتمعات وتواصل مع الأعضاء
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative group">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
                  isDark 
                    ? 'from-blue-500/30 to-purple-500/30' 
                    : 'from-blue-500/20 to-purple-500/20'
                } blur-lg group-hover:blur-xl transition-all duration-300`}></div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث عن مجموعات...' : 'Search groups...'}
                  className={`relative w-64 px-6 py-3 text-lg rounded-2xl border focus:outline-none transition-all duration-300 backdrop-blur-xl ${
                    isDark
                      ? 'bg-gray-900/80 border-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-800/90 focus:border-blue-400/50 focus:shadow-2xl focus:shadow-blue-500/20'
                      : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white/90 focus:border-blue-400/50 focus:shadow-2xl focus:shadow-blue-500/20'
                  }`}
                />
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  isDark ? 'text-gray-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-500'
                }`}>
                  <Search className="w-5 h-5" />
                </div>
              </div>
              
              {/* Create Group Button */}
              <button
                onClick={() => setShowCreateGroup(true)}
                className={`group px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25'
                }`}
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                {language === 'ar' ? 'إنشاء مجموعة' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg rounded-3xl p-8 backdrop-blur-xl border ${
              isDark 
                ? 'bg-gray-900/95 border-gray-800/50 shadow-2xl shadow-black/30' 
                : 'bg-white/95 border-gray-200/50 shadow-2xl shadow-gray-500/20'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text ${
                  isDark 
                    ? 'from-blue-400 to-purple-400 text-transparent' 
                    : 'from-blue-600 to-purple-600 text-transparent'
                }`}>
                  {language === 'ar' ? 'إنشاء مجموعة جديدة' : 'Create New Group'}
                </h2>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    isDark
                      ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <EyeOff className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {language === 'ar' ? 'اسم المجموعة' : 'Group Name'}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
                      isDark 
                        ? 'from-blue-500/20 to-purple-500/20' 
                        : 'from-blue-500/10 to-purple-500/10'
                    } blur-lg`}></div>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className={`relative w-full px-6 py-4 rounded-2xl border focus:outline-none transition-all duration-300 backdrop-blur-xl ${
                        isDark
                          ? 'bg-gray-900/80 border-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-800/90 focus:border-blue-400/50'
                          : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white/90 focus:border-blue-400/50'
                      }`}
                      placeholder={language === 'ar' ? 'أدخل اسم المجموعة...' : 'Enter group name...'}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {language === 'ar' ? 'الوصف' : 'Description'}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
                      isDark 
                        ? 'from-blue-500/20 to-purple-500/20' 
                        : 'from-blue-500/10 to-purple-500/10'
                    } blur-lg`}></div>
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      className={`relative w-full px-6 py-4 rounded-2xl border resize-none focus:outline-none transition-all duration-300 backdrop-blur-xl ${
                        isDark
                          ? 'bg-gray-900/80 border-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-800/90 focus:border-blue-400/50'
                          : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white/90 focus:border-blue-400/50'
                      }`}
                      rows={4}
                      placeholder={language === 'ar' ? 'صف مجموعتك...' : 'Describe your group...'}
                    />
                  </div>
                </div>
                
                <div className={`p-4 rounded-2xl border ${
                  isDark
                    ? 'bg-gray-800/50 border-gray-700/30'
                    : 'bg-gray-50 border-gray-200/50'
                }`}>
                  <label className={`flex items-center cursor-pointer group`}>
                    <div className={`relative w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      isPrivate
                        ? isDark
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-blue-500 border-blue-500'
                        : isDark
                          ? 'border-gray-600 hover:border-blue-500'
                          : 'border-gray-300 hover:border-blue-500'
                    }`}>
                      {isPrivate && (
                        <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                          <Lock className="w-3 h-3 text-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="mr-3">
                      <div className={`font-semibold ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {language === 'ar' ? 'مجموعة خاصة' : 'Private Group'}
                      </div>
                      <div className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {language === 'ar' ? 'يتطلب موافقة للانضمام' : 'Requires approval to join'}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className={`flex-1 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isDark
                      ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/50'
                  }`}
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim()}
                  className={`flex-1 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    groupName.trim()
                      ? isDark
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25'
                      : isDark
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  {language === 'ar' ? 'إنشاء' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Groups Display */}
        {loading ? (
          <div className={`flex flex-col items-center justify-center py-20 px-8 rounded-3xl backdrop-blur-xl border ${
            isDark 
              ? 'bg-gray-900/40 border-gray-800/30' 
              : 'bg-white/60 border-gray-200/50'
          }`}>
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-purple-500/20 border-b-purple-500 animate-spin animation-delay-150"></div>
              <div className="absolute inset-2 w-12 h-12 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin animation-delay-300"></div>
            </div>
            <p className={`mt-6 text-lg font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {language === 'ar' ? 'جاري تحميل المجموعات...' : 'Loading groups...'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* All Groups Section */}
            {filteredGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-2xl backdrop-blur-xl border ${
                    isDark 
                      ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/10 border-blue-800/30' 
                      : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/50'
                  }`}>
                    <Users className={`w-6 h-6 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <h2 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text ${
                    isDark 
                      ? 'from-blue-400 to-purple-400 text-transparent' 
                      : 'from-blue-600 to-purple-600 text-transparent'
                  }`}>
                    {language === 'ar' ? 'جميع المجموعات' : 'All Groups'}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGroups.map((group, index) => (
                    <div
                      key={group.id}
                      className={`group relative p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                        isDark
                          ? 'bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-800/30 hover:border-blue-800/50 shadow-xl shadow-black/20'
                          : 'bg-gradient-to-br from-white/80 to-gray-50/60 border-gray-200/50 hover:border-blue-200/60 shadow-lg shadow-gray-500/10'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Glow effect */}
                      <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${
                        isDark
                          ? 'from-blue-500/10 to-purple-500/10'
                          : 'from-blue-500/5 to-purple-500/5'
                      }`}></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                              isDark
                                ? 'from-blue-500 to-purple-500'
                                : 'from-blue-400 to-purple-400'
                            } opacity-20 blur-xl animate-pulse`}></div>
                            <img
                              src={group.creator_avatar}
                              alt={group.creator_username}
                              className="w-16 h-16 rounded-full object-cover relative border-2 border-white/20"
                            />
                            {group.is_private && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center">
                                <Lock className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 
                              className={`font-bold text-lg mb-2 cursor-pointer transition-all duration-200 hover:scale-105 bg-gradient-to-r bg-clip-text ${
                                isDark 
                                  ? 'from-gray-200 to-gray-300 text-transparent' 
                                  : 'from-gray-700 to-gray-900 text-transparent'
                              }`}
                              onClick={() => onGroupSelect(group)}
                            >
                              {group.name}
                            </h3>
                            <p className={`text-sm line-clamp-2 leading-relaxed ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {group.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                              isDark
                                ? 'bg-blue-900/30 text-blue-300 border border-blue-800/30'
                                : 'bg-blue-50 text-blue-600 border border-blue-200/50'
                            }`}>
                              <Users className="w-3 h-3" />
                              {group.members_count} {language === 'ar' ? 'أعضاء' : 'members'}
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                              isDark
                                ? 'bg-purple-900/30 text-purple-300 border border-purple-800/30'
                                : 'bg-purple-50 text-purple-600 border border-purple-200/50'
                            }`}>
                              <TrendingUp className="w-3 h-3" />
                              {group.posts_count} {language === 'ar' ? 'منشور' : 'posts'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-2 text-xs ${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            <Crown className="w-3 h-3" />
                            {group.creator_username}
                          </div>
                          
                          {!isUserMember(group.id) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinGroup(group.id);
                              }}
                              className={`group/btn px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                                group.is_private
                                  ? isDark
                                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500 shadow-lg shadow-yellow-500/25'
                                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-500/25'
                                  : isDark
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25'
                              }`}
                            >
                              {group.is_private ? (
                                <>
                                  <UserPlus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                  {language === 'ar' ? 'طلب الانضمام' : 'Request to Join'}
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                  {language === 'ar' ? 'انضمام' : 'Join'}
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => onGroupSelect(group)}
                              className={`group/btn px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                                isDark
                                  ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/30'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/50'
                              }`}
                            >
                              <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              {language === 'ar' ? 'عرض' : 'View'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Groups Section */}
            {filteredUserGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-2xl backdrop-blur-xl border ${
                    isDark 
                      ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/10 border-green-800/30' 
                      : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50'
                  }`}>
                    <Shield className={`w-6 h-6 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <h2 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text ${
                    isDark 
                      ? 'from-green-400 to-emerald-400 text-transparent' 
                      : 'from-green-600 to-emerald-600 text-transparent'
                  }`}>
                    {language === 'ar' ? 'مجموعاتي' : 'My Groups'}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUserGroups.map((group, index) => (
                    <div
                      key={group.id}
                      className={`group relative p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                        isDark
                          ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/10 border-green-800/30 hover:border-green-700/50 shadow-xl shadow-black/20'
                          : 'bg-gradient-to-br from-green-50/80 to-emerald-50/60 border-green-200/50 hover:border-green-300/60 shadow-lg shadow-green-500/10'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Glow effect */}
                      <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${
                        isDark
                          ? 'from-green-500/10 to-emerald-500/10'
                          : 'from-green-500/5 to-emerald-500/5'
                      }`}></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                              isDark
                                ? 'from-green-500 to-emerald-500'
                                : 'from-green-400 to-emerald-400'
                            } opacity-20 blur-xl animate-pulse`}></div>
                            <img
                              src={group.creator_avatar}
                              alt={group.creator_username}
                              className="w-16 h-16 rounded-full object-cover relative border-2 border-white/20"
                            />
                            {group.is_private && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center">
                                <Lock className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                              <Shield className="w-2.5 h-2.5 text-white" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 
                              className={`font-bold text-lg mb-2 cursor-pointer transition-all duration-200 hover:scale-105 bg-gradient-to-r bg-clip-text ${
                                isDark 
                                  ? 'from-gray-200 to-gray-300 text-transparent' 
                                  : 'from-gray-700 to-gray-900 text-transparent'
                              }`}
                              onClick={() => onGroupSelect(group)}
                            >
                              {group.name}
                            </h3>
                            <p className={`text-sm line-clamp-2 leading-relaxed ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {group.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                              isDark
                                ? 'bg-green-900/30 text-green-300 border border-green-800/30'
                                : 'bg-green-50 text-green-600 border border-green-200/50'
                            }`}>
                              <Users className="w-3 h-3" />
                              {group.members_count} {language === 'ar' ? 'أعضاء' : 'members'}
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                              isDark
                                ? 'bg-purple-900/30 text-purple-300 border border-purple-800/30'
                                : 'bg-purple-50 text-purple-600 border border-purple-200/50'
                            }`}>
                              <TrendingUp className="w-3 h-3" />
                              {group.posts_count} {language === 'ar' ? 'منشور' : 'posts'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-2 text-xs ${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            <Crown className="w-3 h-3" />
                            {group.creator_username}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => onGroupSelect(group)}
                              className={`group/btn px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                                isDark
                                  ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/30'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/50'
                              }`}
                            >
                              <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              {language === 'ar' ? 'عرض' : 'View'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLeaveGroup(group.id);
                              }}
                              className={`group/btn px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                                isDark
                                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500 shadow-lg shadow-red-500/25'
                                  : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/25'
                              }`}
                            >
                              <Settings className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              {language === 'ar' ? 'مغادرة' : 'Leave'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredGroups.length === 0 && filteredUserGroups.length === 0 && (
              <div className={`flex flex-col items-center justify-center py-20 px-8 rounded-3xl backdrop-blur-xl border ${
                isDark 
                  ? 'bg-gray-900/40 border-gray-800/30' 
                  : 'bg-white/60 border-gray-200/50'
              }`}>
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 ${
                  isDark ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200/50'
                }`}>
                  <Users className={`w-12 h-12 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {searchTerm 
                    ? (language === 'ar' ? 'لا توجد مجموعات مطابقة' : 'No groups found matching your search')
                    : (language === 'ar' ? 'لا توجد مجموعات حالية' : 'No groups available')
                  }
                </h3>
                <p className={`text-sm text-center ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {searchTerm 
                    ? (language === 'ar' ? 'جرب كلمات بحث مختلفة' : 'Try different search terms')
                    : (language === 'ar' ? 'كن أول من ينشئ مجموعة!' : 'Be the first to create a group!')
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
