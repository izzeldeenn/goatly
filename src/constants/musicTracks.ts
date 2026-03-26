// Free music tracks for focus timer - all royalty-free
export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  category: 'lofi' | 'ambient' | 'nature' | 'classical' | 'piano';
  duration: string; // in seconds
  url: string;
  thumbnail: string;
  mood: 'focus' | 'relax' | 'energetic' | 'calm';
}

export const MUSIC_TRACKS: MusicTrack[] = [
  // HoliznaCC0 Lo-fi Tracks - CC0 Licensed
  {
    id: 'holizna-bubbles',
    name: 'Bubbles',
    artist: 'HoliznaCC0',
    category: 'lofi',
    duration: '120', // 2 minutes
    url: '/music/HoliznaCC0 - Bubbles ( Lofi , Bright , Relaxed ).mp3',
    thumbnail: '/music/thumbnails/lofi-study.jpg',
    mood: 'focus'
  },
  {
    id: 'holizna-canon',
    name: 'Canon Event',
    artist: 'HoliznaCC0',
    category: 'lofi',
    duration: '180', // 3 minutes
    url: '/music/HoliznaCC0 - Canon Event ( Lofi , Sad , Reflection ).mp3',
    thumbnail: '/music/thumbnails/lofi-chill.jpg',
    mood: 'relax'
  },
  {
    id: 'holizna-france',
    name: 'One Night In France',
    artist: 'HoliznaCC0',
    category: 'lofi',
    duration: '240', // 4 minutes
    url: '/music/HoliznaCC0 - One Night In France ( Lofi, Nostalgic, Chill ).mp3',
    thumbnail: '/music/thumbnails/lofi-study.jpg',
    mood: 'focus'
  },
  {
    id: 'holizna-still-life',
    name: 'Still Life',
    artist: 'HoliznaCC0',
    category: 'lofi',
    duration: '200', // 3.3 minutes
    url: '/music/HoliznaCC0 - Still Life ( Lofi , Chill , Nostalgic ).mp3',
    thumbnail: '/music/thumbnails/lofi-chill.jpg',
    mood: 'calm'
  },
  {
    id: 'holizna-theta',
    name: 'Theta Frequency',
    artist: 'HoliznaCC0',
    category: 'ambient',
    duration: '160', // 2.7 minutes
    url: '/music/HoliznaCC0 - Theta Frequency ( Lofi , Chill , Calm ).mp3',
    thumbnail: '/music/thumbnails/ambient-focus.jpg',
    mood: 'focus'
  },
  {
    id: 'holizna-tokyo',
    name: 'Tokyo Sunset',
    artist: 'HoliznaCC0',
    category: 'ambient',
    duration: '190', // 3.2 minutes
    url: '/music/HoliznaCC0 - Tokyo Sunset ( Lofi , Peaceful , Soft ).mp3',
    thumbnail: '/music/thumbnails/ambient-space.jpg',
    mood: 'relax'
  },
  {
    id: 'holizna-tranquil',
    name: 'Tranquil Mindscape',
    artist: 'HoliznaCC0',
    category: 'ambient',
    duration: '220', // 3.7 minutes
    url: '/music/HoliznaCC0 - Tranquil Mindscape ( Lofi , Happy , Reflection ).mp3',
    thumbnail: '/music/thumbnails/ambient-focus.jpg',
    mood: 'calm'
  },
  {
    id: 'holizna-darling',
    name: 'When Time Called Me Darling',
    artist: 'HoliznaCC0',
    category: 'piano',
    duration: '320', // 5.3 minutes
    url: '/music/HoliznaCC0 - When Time Called Me Darling ( Lofi, Relaxing, Chill).mp3',
    thumbnail: '/music/thumbnails/piano-meditation.jpg',
    mood: 'relax'
  }
];

// Music categories with icons
export const MUSIC_CATEGORIES = [
  { id: 'lofi', name: 'Lo-fi', icon: '🎧', description: 'هادئ ومناسب للدراسة' },
  { id: 'ambient', name: 'Ambient', icon: '🌌', description: 'موسيقى بيئية للتركيز' },
  { id: 'nature', name: 'Nature', icon: '🌿', description: 'أصوات الطبيعة المريحة' },
  { id: 'classical', name: 'Classical', icon: '🎼', description: 'موسيقى كلاسيكية هادئة' },
  { id: 'piano', name: 'Piano', icon: '🎹', description: 'بيانو منفرد للتركيز' }
];

// Mood filters
export const MUSIC_MOODS = [
  { id: 'focus', name: 'تركيز', icon: '🎯' },
  { id: 'relax', name: 'استرخاء', icon: '😌' },
  { id: 'energetic', name: 'نشاط', icon: '⚡' },
  { id: 'calm', name: 'هدوء', icon: '🕊️' }
];

// Default music settings
export const DEFAULT_MUSIC_SETTINGS = {
  volume: 0.5, // 50% volume
  autoPlay: false,
  loop: true,
  fadeIn: true,
  fadeOut: true
};
