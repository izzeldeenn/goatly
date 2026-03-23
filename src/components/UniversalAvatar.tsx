'use client';

import React from 'react';

interface UniversalAvatarProps {
  src?: string | null;
  username: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

const UniversalAvatar: React.FC<UniversalAvatarProps> = ({ 
  src, 
  username, 
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };

  const isEmoji = (str: string) => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(str);
  };

  const isUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const renderAvatar = () => {
    // If no src, show initial
    if (!src) {
      return (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold ${textSizeClasses[size]} ${className}`}>
          {username.charAt(0).toUpperCase()}
        </div>
      );
    }

    // If src is an emoji, render it directly
    if (isEmoji(src)) {
      return (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center ${size === 'xlarge' ? 'text-4xl' : 'text-2xl'} ${className}`}>
          {src}
        </div>
      );
    }

    // If src is a URL, try to render as image
    if (isUrl(src)) {
      return (
        <img 
          src={src} 
          alt={username} 
          className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
          onError={(e) => {
            // If image fails to load, show initial
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.nextSibling) {
              (target.nextSibling as HTMLElement).style.display = 'flex';
            }
          }}
          onLoad={(e) => {
            // Hide fallback if image loads successfully
            const target = e.target as HTMLImageElement;
            if (target.nextSibling) {
              (target.nextSibling as HTMLElement).style.display = 'none';
            }
          }}
        />
      );
    }

    // If src is neither emoji nor URL, treat as text/character
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center ${size === 'xlarge' ? 'text-2xl' : 'text-lg'} ${className}`}>
        {src}
      </div>
    );
  };

  return (
    <div className="relative">
      {renderAvatar()}
      {/* Fallback for failed images */}
      {!src || !isUrl(src) ? null : (
        <div 
          className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold ${textSizeClasses[size]} ${className}`}
          style={{ display: 'none' }}
        >
          {username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default UniversalAvatar;
