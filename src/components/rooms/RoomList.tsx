'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from '@/contexts/RoomContext';
import { useUser } from '@/contexts/UserContext';
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
  const { rooms, loading, createRoom, loadRooms } = useRoom();
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
        if (room.creator_id) {
          try {
            const users = await roomDB.getUsersByIds([room.creator_id]);
            if (users.length > 0) {
              creatorName = users[0].username || 'Unknown';
            }
          } catch (err) {
            console.error('Error fetching creator:', err);
          }
        }

        return {
          ...room,
          memberCount,
          creatorName
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

  const handleJoinRoom = (roomId: string) => {
    router.push(`/rooms?roomId=${roomId}`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Logo />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🚀 Study Rooms</h1>
              <p className="text-gray-400">Join a room to study together with others</p>
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
              <p className="text-gray-500 text-xl">Loading rooms...</p>
            </div>
          ) : roomsWithInfo.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl mb-4">No study rooms available</p>
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
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-all duration-300 hover:scale-105 cursor-pointer group">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gray-200 transition-colors">
          {room.name}
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span className="flex items-center">
            <span className="mr-1">👤</span>
            {room.creatorName}
          </span>
          <span className="flex items-center">
            <span className="mr-1">📅</span>
            {new Date(room.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">👥</span>
          <span className="text-lg font-semibold text-white">{room.memberCount}</span>
          <span className="text-sm text-gray-400">
            {room.memberCount === 1 ? 'studying' : 'studying'}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onJoin}
          className="flex-1 px-4 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors"
        >
          Join Room
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          title="Share room link"
        >
          🔗
        </button>
      </div>
    </div>
  );
}
