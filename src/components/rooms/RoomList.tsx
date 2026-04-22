'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from '@/contexts/RoomContext';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { landingTexts } from '@/constants/landingTexts';
import { StudyRoom as StudyRoomType, roomDB } from '@/lib/supabase';
import { CreateRoomModal } from './CreateRoomModal';
import { Logo } from '@/components/ui/Logo';

interface RoomListProps {
  onJoinRoom: (roomId: string) => void;
}

interface RoomWithInfo extends StudyRoomType {
  memberCount: number;
  creatorName?: string;
  creatorAvatar?: string;
}

export function RoomList({ onJoinRoom }: RoomListProps) {
  const { language } = useLanguage();
  const texts = landingTexts[language];
  const { rooms, loading, createRoom, loadRooms, joinRoom } = useRoom();
  const { getCurrentUser } = useUser();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [roomsWithInfo, setRoomsWitInfo] = useState<RoomWithInfo[]>([]);

  // Fetch room members count and creator info for each room
  useEffect(() => {
    const fetchRoomsInfo = async () => {
      if (rooms.length === 0) {
        setRoomsWitInfo([]);
        return;
      }

      const roomsWithInfoPromises = rooms.map(async (room) => {
        const members = await roomDB.getRoomMembers(room.id!);
        const memberCount = members.length;

        let creatorName = 'Unknown';
        let creatorAvatar = '';
        if (room.creator_id) {
          try {
            const users = await roomDB.getUsersByIds([room.creator_id]);
            if (users.length > 0) {
              creatorName = users[0].username || 'Unknown';
              creatorAvatar = users[0].avatar || '';
              console.log('Creator data:', { creatorName, creatorAvatar, fullUser: users[0] });
            }
          } catch (err) {
            console.error('Error fetching creator:', err);
          }
        }

        return {
          ...room,
          memberCount,
          creatorName,
          creatorAvatar
        };
      });

      const result = await Promise.all(roomsWithInfoPromises);
      setRoomsWitInfo(result);
    };

    fetchRoomsInfo();
  }, [rooms]);

  const handleCreateRoom = async (name: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      alert('Please log in first');
      return;
    }

    const room = await createRoom(name, currentUser.id);
    if (room) {
      await loadRooms();
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      alert(texts.pleaseLogIn);
      return;
    }

    // Join the room first
    const success = await joinRoom(roomId, currentUser.id);
    if (success) {
      // Then navigate to the room
      router.push(`/rooms?roomId=${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Logo />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🚀 {texts.studyRooms}</h1>
              <p className="text-gray-400">{texts.joinRoomDescription}</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors"
          >
            + Create Room
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl">{texts.loadingRooms}</p>
            </div>
          ) : roomsWithInfo.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl mb-4">{texts.noStudyRooms}</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-white hover:text-gray-300"
              >
                Create the first room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomsWithInfo.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onJoin={() => handleJoinRoom(room.id!)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
}

interface RoomCardProps {
  room: RoomWithInfo;
  onJoin: () => void;
}

function RoomCard({ room, onJoin }: RoomCardProps) {
  const { language } = useLanguage();
  const texts = landingTexts[language];
  
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/rooms?roomId=${room.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 cursor-pointer group">
      {/* Room Header */}
      <div className="p-5 pb-4">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
          {room.name}
        </h3>
        
        {/* Creator Info with Avatar */}
        <div className="flex items-center space-x-3 mb-4">
          {room.creatorAvatar && room.creatorAvatar.length > 0 ? (
            <img
              src={room.creatorAvatar}
              alt={room.creatorName}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/50"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {room.creatorName?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{room.creatorName}</p>
            <p className="text-xs text-gray-400">{texts.roomCreator}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-700/50"></div>

      {/* Room Stats */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                <span className="text-2xl">👥</span>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {room.memberCount}
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{room.memberCount}</p>
              <p className="text-xs text-gray-400">{texts.activeMembers}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{texts.created}</p>
            <p className="text-sm text-gray-300">{new Date(room.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onJoin}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Join Now
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors"
            title="Share room link"
          >
            🔗
          </button>
        </div>
      </div>
    </div>
  );
}
