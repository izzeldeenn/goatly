'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { socialDB, Group, GroupPost, GroupComment } from '@/lib/social';

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
  const [activeView, setActiveView] = useState<'all' | 'my'>('all');
  
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

  const displayGroups = activeView === 'my' ? userGroups : groups;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${
          theme === 'light' ? 'text-gray-900' : 'text-white'
        }`}>
          {language === 'ar' ? 'Groups' : 'Groups'}
        </h1>
        <button
          onClick={() => setShowCreateGroup(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            theme === 'light'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {language === 'ar' ? 'Create Group' : 'Create Group'}
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
        <button
          onClick={() => setActiveView('all')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeView === 'all'
              ? theme === 'light'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-gray-700 text-white'
              : theme === 'light'
                ? 'text-gray-600 hover:text-gray-900'
                : 'text-gray-400 hover:text-white'
          }`}
        >
          {language === 'ar' ? 'All Groups' : 'All Groups'}
        </button>
        <button
          onClick={() => setActiveView('my')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeView === 'my'
              ? theme === 'light'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-gray-700 text-white'
              : theme === 'light'
                ? 'text-gray-600 hover:text-gray-900'
                : 'text-gray-400 hover:text-white'
          }`}
        >
          {language === 'ar' ? 'My Groups' : 'My Groups'}
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 ${
            theme === 'light' ? 'bg-white' : 'bg-gray-900'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {language === 'ar' ? 'Create New Group' : 'Create New Group'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {language === 'ar' ? 'Group Name' : 'Group Name'}
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-900'
                      : 'bg-gray-800 border-gray-700 text-white'
                  }`}
                  placeholder={language === 'ar' ? 'Enter group name...' : 'Enter group name...'}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {language === 'ar' ? 'Description' : 'Description'}
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-900'
                      : 'bg-gray-800 border-gray-700 text-white'
                  }`}
                  rows={3}
                  placeholder={language === 'ar' ? 'Describe your group...' : 'Describe your group...'}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="private" className={`text-sm ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {language === 'ar' ? 'Private Group' : 'Private Group'}
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateGroup(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {language === 'ar' ? 'Cancel' : 'Cancel'}
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  groupName.trim()
                    ? theme === 'light'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    : theme === 'light'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                {language === 'ar' ? 'Create' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups List */}
      {loading ? (
        <div className="text-center py-8">
          <div className={`text-lg ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {language === 'ar' ? 'Loading groups...' : 'Loading groups...'}
          </div>
        </div>
      ) : displayGroups.length === 0 ? (
        <div className="text-center py-12">
          <p className={`${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {activeView === 'my' 
              ? (language === 'ar' ? 'You haven\'t joined any groups yet.' : 'You haven\'t joined any groups yet.')
              : (language === 'ar' ? 'No groups available.' : 'No groups available.')
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayGroups.map((group) => (
            <div
              key={group.id}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                selectedGroup?.id === group.id
                  ? theme === 'light'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-blue-400 bg-blue-900/20'
                  : theme === 'light'
                    ? 'border-gray-200 bg-white hover:border-gray-300'
                    : 'border-gray-800 bg-black hover:border-gray-700'
              }`}
              onClick={() => onGroupSelect(group)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                {group.is_private && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    theme === 'light'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {language === 'ar' ? 'Private' : 'Private'}
                  </span>
                )}
              </div>
              
              <h3 className={`font-semibold text-lg mb-2 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {group.name}
              </h3>
              
              <p className={`text-sm mb-4 line-clamp-2 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {group.description || (language === 'ar' ? 'No description' : 'No description')}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <div className={`flex items-center gap-4 ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <span>{group.members_count} {language === 'ar' ? 'members' : 'members'}</span>
                  <span>{group.posts_count} {language === 'ar' ? 'posts' : 'posts'}</span>
                </div>
                
                {currentUser && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isUserMember(group.id) 
                        ? handleLeaveGroup(group.id)
                        : handleJoinGroup(group.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isUserMember(group.id)
                        ? theme === 'light'
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : theme === 'light'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isUserMember(group.id) 
                      ? (language === 'ar' ? 'Leave' : 'Leave')
                      : (language === 'ar' ? 'Join' : 'Join')
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
