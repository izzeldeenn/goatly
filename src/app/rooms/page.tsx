'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { RoomList } from '@/components/rooms/RoomList';
import { StudyRoom } from '@/components/rooms/StudyRoom';
import { useRoom } from '@/contexts/RoomContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';

function RoomsPageContent() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { currentRoom, joinRoom, rooms } = useRoom();
  const { getCurrentUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current user when UserContext is ready
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [getCurrentUser]);

  const handleJoinRoom = async (roomId: string) => {
    if (!currentUser || !currentUser.id) {
      alert('Please log in to join a room');
      return;
    }

    const success = await joinRoom(roomId, currentUser.id);
    if (success && currentRoom && currentRoom.id) {
      setSelectedRoomId(currentRoom.id);
      setSelectedRoomName(currentRoom.name);
    }
  };

  const handleLeaveRoom = () => {
    setSelectedRoomId(null);
    setSelectedRoomName('');
  };

  // Auto-join room from URL parameter
  useEffect(() => {
    const roomIdFromUrl = searchParams.get('roomId');
    if (roomIdFromUrl && !selectedRoomId && rooms.length > 0 && currentUser) {
      const room = rooms.find(r => r.id === roomIdFromUrl);
      if (room) {
        handleJoinRoom(roomIdFromUrl);
      }
    } else if (!roomIdFromUrl && selectedRoomId) {
      // Reset state if URL has no roomId but selectedRoomId is set
      setSelectedRoomId(null);
      setSelectedRoomName('');
    }
  }, [searchParams, rooms, selectedRoomId, currentUser]);

  // If user is in a room, show the room view
  if (selectedRoomId) {
    return (
      <StudyRoom
        roomId={selectedRoomId}
        roomName={selectedRoomName}
      />
    );
  }

  // Otherwise show room list
  return <RoomList onJoinRoom={handleJoinRoom} />;
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <RoomsPageContent />
    </Suspense>
  );
}
