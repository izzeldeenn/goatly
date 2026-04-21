'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { roomDB, StudyRoom, RoomMember, UserAccount } from '@/lib/supabase';

interface RoomContextType {
  rooms: StudyRoom[];
  currentRoom: StudyRoom | null;
  currentRoomMembers: RoomMember[];
  loading: boolean;
  error: string | null;
  createRoom: (name: string, creatorId: string) => Promise<StudyRoom | null>;
  joinRoom: (roomId: string, userId: string) => Promise<boolean>;
  leaveRoom: (roomId: string, userId: string) => Promise<boolean>;
  loadRooms: () => Promise<void>;
  loadRoomMembers: (roomId: string) => Promise<void>;
  setCurrentRoom: (room: StudyRoom | null) => void;
  refreshRoomMembers: (roomId: string) => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [currentRoomMembers, setCurrentRoomMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const membersIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load all rooms
  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomDB.getAllRooms();
      setRooms(data);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  // Load room members
  const loadRoomMembers = async (roomId: string) => {
    try {
      setError(null);
      const members = await roomDB.getRoomMembers(roomId);
      setCurrentRoomMembers(members);
    } catch (err) {
      console.error('Error loading room members:', err);
      setError('Failed to load room members');
    }
  };

  // Refresh room members (polling every 60 seconds for minimal data usage)
  const refreshRoomMembers = async (roomId: string) => {
    await loadRoomMembers(roomId);
  };

  // Auto-refresh room members every 5 seconds when in a room
  useEffect(() => {
    if (currentRoom) {
      loadRoomMembers(currentRoom.id!);

      // Poll every 5 seconds for real-time updates
      membersIntervalRef.current = setInterval(() => {
        loadRoomMembers(currentRoom.id!);
      }, 5000);

      return () => {
        if (membersIntervalRef.current) {
          clearInterval(membersIntervalRef.current);
        }
      };
    } else {
      setCurrentRoomMembers([]);
    }
  }, [currentRoom]);

  // Create a new room
  const createRoom = async (name: string, creatorId: string): Promise<StudyRoom | null> => {
    try {
      setLoading(true);
      setError(null);
      const room = await roomDB.createRoom(name, creatorId);
      if (room) {
        await loadRooms();
        return room;
      }
      return null;
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Join a room
  const joinRoom = async (roomId: string, userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const member = await roomDB.joinRoom(roomId, userId);
      if (member) {
        const room = await roomDB.getRoomById(roomId);
        if (room) {
          setCurrentRoom(room);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Leave a room
  const leaveRoom = async (roomId: string, userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await roomDB.leaveRoom(roomId, userId);
      if (success) {
        setCurrentRoom(null);
        setCurrentRoomMembers([]);
      }
      return success;
    } catch (err) {
      console.error('Error leaving room:', err);
      setError('Failed to leave room');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load rooms on mount
  useEffect(() => {
    loadRooms();
  }, []);

  // Clean up inactive members periodically (every 30 seconds)
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      await roomDB.cleanupInactiveMembers();
    }, 30000); // 30 seconds

    return () => clearInterval(cleanupInterval);
  }, []);

  const value: RoomContextType = {
    rooms,
    currentRoom,
    currentRoomMembers,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    loadRooms,
    loadRoomMembers,
    setCurrentRoom,
    refreshRoomMembers
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
