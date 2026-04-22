'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RoomMember } from './RoomMember';
import { useRoomTimer } from '@/hooks/useRoomTimer';
import { useRoom } from '@/contexts/RoomContext';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { landingTexts } from '@/constants/landingTexts';
import { RoomMember as RoomMemberType, UserAccount, roomDB } from '@/lib/supabase';
import { Logo } from '@/components/ui/Logo';

interface StudyRoomProps {
  roomId: string;
  roomName: string;
}

export function StudyRoom({ roomId, roomName }: StudyRoomProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const texts = landingTexts[language];
  const { currentRoomMembers, leaveRoom, refreshRoomMembers } = useRoom();
  const { getCurrentUser } = useUser();
  const currentUser = getCurrentUser();
  const [memberUsers, setMemberUsers] = useState<UserAccount[]>([]);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const { localSeconds, leaveRoom: leaveRoomTimer, error } = useRoomTimer(
    roomId,
    currentUser?.id || '',
    currentUser?.accountId
  );

  // Don't render if no current user
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">{texts.pleaseLogIn}</p>
      </div>
    );
  }

  // Don't render if no roomId
  if (!roomId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">{texts.invalidRoomId}</p>
      </div>
    );
  }

  // TypeScript: roomId is guaranteed to be a string here
  const safeRoomId: string = roomId;

  // Refresh room members periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshRoomMembers(safeRoomId);
    }, 5000); // Every 5 seconds for real-time updates
    
    return () => clearInterval(interval);
  }, [safeRoomId, refreshRoomMembers]);

  // Calculate dynamic space size based on member count
  const spaceSize = useMemo(() => {
    const memberCount = currentRoomMembers.length;
    const baseSize = 100; // Base size in percentage
    const extraSpacePerMember = 20; // Extra space per member
    const maxSize = 300; // Maximum size in percentage
    
    const calculatedSize = Math.min(baseSize + (memberCount * extraSpacePerMember), maxSize);
    return calculatedSize;
  }, [currentRoomMembers.length]);

  // Generate deterministic random positions based on member IDs with collision detection
  const memberPositions = useMemo(() => {
    const positions: {[key: string]: {x: number, y: number}} = {};
    const cardSize = 15; // Card size in percentage (approx 128px / 800px * 100)
    const availableSpace = spaceSize - 20; // Available space minus margins
    
    // Sort members by ID to ensure consistent positioning
    const sortedMembers = [...currentRoomMembers].sort((a, b) => (a.id || '').localeCompare(b.id || ''));
    
    sortedMembers.forEach((member) => {
      if (member.id) {
        let position: {x: number, y: number};
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
          // Use member ID + attempt number as seed for deterministic random position
          const seed = (member.id + attempts).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
          const random2 = ((seed * 9301 + 49297) % 233280 + 1) / 233281;
          
          // Deterministic position within available space
          position = {
            x: random1 * (availableSpace - cardSize) + 10,
            y: random2 * (availableSpace - cardSize) + 10
          };
          
          // Check for collision with existing positions
          let hasCollision = false;
          Object.values(positions).forEach((existingPos) => {
            const distance = Math.sqrt(
              Math.pow(position.x - existingPos.x, 2) + 
              Math.pow(position.y - existingPos.y, 2)
            );
            if (distance < cardSize) {
              hasCollision = true;
            }
          });
          
          if (!hasCollision) {
            break;
          }
          
          attempts++;
        } while (attempts < maxAttempts);
        
        positions[member.id] = position;
      }
    });
    return positions;
  }, [currentRoomMembers.map(m => m.id).join(','), spaceSize]);

  // Fetch user data for room members
  useEffect(() => {
    const fetchMemberUsers = async () => {
      if (currentRoomMembers.length > 0) {
        const userIds = currentRoomMembers.map(m => m.user_id);
        const users = await roomDB.getUsersByIds(userIds);
        setMemberUsers(users);
      }
    };

    fetchMemberUsers();
  }, [currentRoomMembers]);

  // Auto-center on user when joining the room
  useEffect(() => {
    if (currentUser && currentRoomMembers.length > 0) {
      const currentMember = currentRoomMembers.find(m => m.user_id === currentUser.id);
      if (currentMember && currentMember.id && memberPositions[currentMember.id]) {
        handleResetToCenter();
      }
    }
  }, [currentUser, currentRoomMembers, memberPositions]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  // Handle drag move
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    setPanPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setDragStart({ x: clientX, y: clientY });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newZoom = Math.min(Math.max(zoom + delta, 0.5), 3); // Limit zoom between 0.5x and 3x
    setZoom(newZoom);
  };

  // Calculate distance from user's card
  const distanceFromUserCard = useMemo(() => {
    if (!currentUser) return 0;
    
    const currentMember = currentRoomMembers.find(m => m.user_id === currentUser.id);
    if (!currentMember || !currentMember.id) return 0;
    
    const userPosition = memberPositions[currentMember.id];
    if (!userPosition) return 0;
    
    // Calculate where the user's card should be with current pan
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const spaceWidth = containerWidth * (spaceSize / 100);
    const spaceHeight = containerHeight * (spaceSize / 100);
    
    const userPixelX = (userPosition.x / 100) * spaceWidth;
    const userPixelY = (userPosition.y / 100) * spaceHeight;
    
    const spaceCenterX = (containerWidth - spaceWidth) / 2;
    const spaceCenterY = (containerHeight - spaceHeight) / 2;
    
    const userAbsoluteX = spaceCenterX + userPixelX + panPosition.x;
    const userAbsoluteY = spaceCenterY + userPixelY + panPosition.y;
    
    // Calculate distance from screen center
    const screenCenterX = containerWidth / 2;
    const screenCenterY = containerHeight / 2;
    
    const distance = Math.sqrt(
      Math.pow(userAbsoluteX - screenCenterX, 2) + 
      Math.pow(userAbsoluteY - screenCenterY, 2)
    );
    
    return distance;
  }, [currentUser, currentRoomMembers, memberPositions, spaceSize, panPosition]);
  
  const showLocationButton = distanceFromUserCard > 150;

  // Reset to current user's card
  const handleResetToCenter = () => {
    if (!currentUser) return;
    
    // Find current user's member
    const currentMember = currentRoomMembers.find(m => m.user_id === currentUser.id);
    if (!currentMember || !currentMember.id) return;
    
    // Get current user's position
    const userPosition = memberPositions[currentMember.id];
    if (!userPosition) return;
    
    // Calculate pan position to center on user's card
    // The user's card is at userPosition.x% and userPosition.y% of the space
    // Since transformOrigin is center center, we need to account for that
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const spaceWidth = containerWidth * (spaceSize / 100);
    const spaceHeight = containerHeight * (spaceSize / 100);
    
    // User's position in pixels relative to space
    const userPixelX = (userPosition.x / 100) * spaceWidth;
    const userPixelY = (userPosition.y / 100) * spaceHeight;
    
    // Space center relative to container
    const spaceCenterX = (containerWidth - spaceWidth) / 2;
    const spaceCenterY = (containerHeight - spaceHeight) / 2;
    
    // User's absolute position
    const userAbsoluteX = spaceCenterX + userPixelX;
    const userAbsoluteY = spaceCenterY + userPixelY;
    
    // Calculate pan to center user's card
    const newPanX = (containerWidth / 2) - userAbsoluteX;
    const newPanY = (containerHeight / 2) - userAbsoluteY;
    
    setPanPosition({ x: newPanX, y: newPanY });
    setZoom(1);
  };

  // Handle leave room
  const handleLeave = async () => {
    if (currentUser) {
      const userId = currentUser.id || '';

      await leaveRoomTimer();
      await leaveRoom(safeRoomId, userId);
      // Redirect to room list after leaving
      router.push('/rooms');
    }
  };

  // Calculate study time for each member
  const getMemberStudyTime = (member: RoomMemberType): number => {
    if (currentUser && member.user_id === currentUser.id) {
      return localSeconds;
    }
    // Calculate from joined_at timestamp
    const joinedAt = new Date(member.joined_at).getTime();
    const now = Date.now();
    return Math.floor((now - joinedAt) / 1000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Logo />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🚀 {roomName}</h1>
              <p className="text-gray-400">{texts.studyTogether}</p>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            🚪 Leave Room
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-7xl mx-auto mt-4 px-6">
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Space-like room area with black hole effect */}
      <div 
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-black"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onWheel={handleWheel}
      >
        {/* Location button */}
        {showLocationButton && (
          <button
            onClick={handleResetToCenter}
            className="absolute bottom-8 right-8 z-20 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:scale-105 flex items-center gap-2 backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>موقعي</span>
          </button>
        )}
        {/* Draggable space container */}
        <div 
          className="absolute bg-black"
          style={{
            width: `${spaceSize}%`,
            height: `${spaceSize}%`,
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Black hole accretion disk background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Central black hole glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-3xl animate-pulse" />
            
            {/* Rotating accretion disk */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-purple-500/5 animate-spin" style={{ animationDuration: '60s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-purple-400/5 animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-purple-300/5 animate-spin" style={{ animationDuration: '30s' }} />
            
            {/* Nebula clouds */}
            <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-purple-900/5 blur-2xl" />
            <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-blue-900/5 blur-2xl" />
            <div className="absolute top-[40%] right-[30%] w-[250px] h-[250px] rounded-full bg-pink-900/5 blur-2xl" />
          </div>

          {/* Members grid */}
          {currentRoomMembers.length === 0 ? (
            <div className="text-center py-20 relative z-10">
              <p className="text-gray-500 text-xl">{texts.waitingForMembers}</p>
            </div>
          ) : (
            <div className="relative w-full h-full relative z-10">
              {currentRoomMembers.map((member) => {
                // Get user data for this member
                const memberUser = memberUsers.find(u => u.id === member.user_id);
                const isCurrentUser = currentUser?.id === member.user_id;
                
                // Get random position for this member
                const position = memberPositions[member.id || ''];
                
                if (!position) return null;
                
                return (
                  <div 
                    key={member.id} 
                    className="absolute"
                    style={{ 
                      left: `${position.x}%`,
                      top: `${position.y}%`
                    }}
                  >
                    <RoomMember
                      username={isCurrentUser ? currentUser.username : (memberUser?.username || `User_${member.user_id.slice(0, 4)}`)}
                      avatar={isCurrentUser ? currentUser.avatar : memberUser?.avatar}
                      studySeconds={getMemberStudyTime(member)}
                      isCurrentUser={isCurrentUser}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>⚡ Real-time sync with minimal data usage • 🌍 Connected to {currentRoomMembers.length} members</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        .animate-twinkle {
          animation: twinkle 3s infinite;
        }
      `}</style>
    </div>
  );
}
