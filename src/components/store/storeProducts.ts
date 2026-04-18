export interface StoreItem {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  category: 'themes' | 'avatars' | 'backgrounds' | 'badges' | 'effects' | 'services';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  purchased: boolean;
  equipped?: boolean;
  data?: any;
}

export const defaultStoreItems: StoreItem[] = [
  // Themes
  {
    id: 'theme-ocean',
    name: 'Ocean Breeze',
    nameAr: 'نسيم المحيط',
    description: 'Cool blue theme inspired by the ocean',
    descriptionAr: 'سمة زرقاء باردة مستوحاة من المحيط',
    price: 150,
    category: 'themes',
    icon: 'ð',
    rarity: 'common',
    purchased: false,
    data: {
      colors: {
        primary: '#0891b2',
        secondary: '#06b6d4',
        accent: '#0e7490',
        background: '#f0f9ff',
        surface: '#e0f2fe',
        text: '#0c4a6e',
        border: '#0ea5e9'
      }
    }
  },
  {
    id: 'theme-sunset',
    name: 'Sunset Glow',
    nameAr: 'وهج الغروب',
    description: 'Warm orange and pink sunset theme',
    descriptionAr: 'سمة دافئة بالبرتقالي والوردي مستوحاة من الغروب',
    price: 200,
    category: 'themes',
    icon: 'ð',
    rarity: 'rare',
    purchased: false,
    data: {
      colors: {
        primary: '#f97316',
        secondary: '#fb923c',
        accent: '#ea580c',
        background: '#fff7ed',
        surface: '#fed7aa',
        text: '#7c2d12',
        border: '#fdba74'
      }
    }
  },
  {
    id: 'theme-galaxy',
    name: 'Galaxy Night',
    nameAr: 'ليل المجرة',
    description: 'Dark purple and blue cosmic theme',
    descriptionAr: 'سمة كونية داكنة بالأرجواني والأزرق',
    price: 300,
    category: 'themes',
    icon: 'ð',
    rarity: 'epic',
    purchased: false,
    data: {
      colors: {
        primary: '#7c3aed',
        secondary: '#8b5cf6',
        accent: '#6d28d9',
        background: '#1e1b4b',
        surface: '#312e81',
        text: '#e9d5ff',
        border: '#8b5cf6'
      }
    }
  },
  {
    id: 'theme-forest',
    name: 'Forest Green',
    nameAr: 'أخضر الغابة',
    description: 'Natural green theme inspired by nature',
    descriptionAr: 'سمة خضراء طبيعية مستوحاة من الطبيعة',
    price: 250,
    category: 'themes',
    icon: 'ð',
    rarity: 'rare',
    purchased: false,
    data: {
      colors: {
        primary: '#16a34a',
        secondary: '#22c55e',
        accent: '#15803d',
        background: '#f0fdf4',
        surface: '#dcfce7',
        text: '#14532d',
        border: '#22c55e'
      }
    }
  },
  // Avatars
  {
    id: 'avatar-wizard',
    name: 'Wizard Hat',
    nameAr: 'قبعة الساحر',
    description: 'Magical wizard avatar',
    descriptionAr: 'صورة ساحر سحرية',
    price: 100,
    category: 'avatars',
    icon: 'ð§',
    rarity: 'common',
    purchased: false,
    data: { avatarUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=wizard' }
  },
  {
    id: 'avatar-ninja',
    name: 'Ninja Warrior',
    nameAr: 'محارب النينجا',
    description: 'Stealthy ninja avatar',
    descriptionAr: 'صورة نينجا خفية',
    price: 250,
    category: 'avatars',
    icon: 'ð¥·',
    rarity: 'rare',
    purchased: false,
    data: { avatarUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=ninja' }
  },
  {
    id: 'avatar-dragon',
    name: 'Dragon Master',
    nameAr: 'سيد التنانين',
    description: 'Legendary dragon avatar',
    descriptionAr: 'صورة تنين أسطورية',
    price: 500,
    category: 'avatars',
    icon: 'ð',
    rarity: 'legendary',
    purchased: false,
    data: { avatarUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=dragon' }
  },
  {
    id: 'avatar-robot',
    name: 'Robot Friend',
    nameAr: 'صديق الروبوت',
    description: 'Friendly robot avatar',
    descriptionAr: 'صورة روبوت ودود',
    price: 180,
    category: 'avatars',
    icon: 'ð¤',
    rarity: 'common',
    purchased: false,
    data: { avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot' }
  },
  // Backgrounds
  {
    id: 'bg-space',
    name: 'Space Station',
    nameAr: 'محطة الفضاء',
    description: 'Futuristic space background',
    descriptionAr: 'خلفية فضائية مستقبلية',
    price: 180,
    category: 'backgrounds',
    icon: 'ðº',
    rarity: 'common',
    purchased: false,
    data: { backgroundUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06' }
  },
  {
    id: 'bg-forest',
    name: 'Enchanted Forest',
    nameAr: 'غابة سحرية',
    description: 'Mystical forest background',
    descriptionAr: 'خلفية غابة غامضة',
    price: 220,
    category: 'backgrounds',
    icon: 'ð',
    rarity: 'rare',
    purchased: false,
    data: { backgroundUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86' }
  },
  {
    id: 'bg-ocean',
    name: 'Ocean Waves',
    nameAr: 'أمواج المحيط',
    description: 'Calming ocean waves background',
    descriptionAr: 'خلفية أمواج محيط هادئة',
    price: 200,
    category: 'backgrounds',
    icon: 'ð',
    rarity: 'common',
    purchased: false,
    data: { backgroundUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0' }
  },
  {
    id: 'bg-mountain',
    name: 'Mountain Peak',
    nameAr: 'قمة الجبل',
    description: 'Majestic mountain background',
    descriptionAr: 'خلفية جبلية مهيبة',
    price: 280,
    category: 'backgrounds',
    icon: 'â°ï¸',
    rarity: 'rare',
    purchased: false,
    data: { backgroundUrl: 'https://images.unsplash.com/photo-1464822759844-d150baec0494' }
  },
  // Badges
  {
    id: 'badge-champion',
    name: 'Champion Badge',
    nameAr: 'شارة البطل',
    description: 'Show off your champion status',
    descriptionAr: 'أظهر مكانتك كبطل',
    price: 300,
    category: 'badges',
    icon: 'ð',
    rarity: 'epic',
    purchased: false
  },
  {
    id: 'badge-legend',
    name: 'Legend Badge',
    nameAr: 'شارة الأسطورة',
    description: 'Prove you are a true legend',
    descriptionAr: 'أثبت أنك أسطورة حقيقية',
    price: 500,
    category: 'badges',
    icon: 'â¤',
    rarity: 'legendary',
    purchased: false
  },
  {
    id: 'badge-star',
    name: 'Star Badge',
    nameAr: 'شارة النجمة',
    description: 'Shine bright like a star',
    descriptionAr: 'ألمع ببروز مثل النجم',
    price: 150,
    category: 'badges',
    icon: 'â¨',
    rarity: 'common',
    purchased: false
  },
  {
    id: 'badge-fire',
    name: 'Fire Badge',
    nameAr: 'شارة النار',
    description: 'Burn with passion and determination',
    descriptionAr: 'احترق بالشغف والعزيمة',
    price: 200,
    category: 'badges',
    icon: 'ð¥',
    rarity: 'rare',
    purchased: false
  },
  // Effects
  {
    id: 'effect-rainbow',
    name: 'Rainbow Trail',
    nameAr: 'أثر قوس قزح',
    description: 'Colorful rainbow effect',
    descriptionAr: 'تأثير قوس قزح ملون',
    price: 350,
    category: 'effects',
    icon: 'ð',
    rarity: 'epic',
    purchased: false,
    data: {
      effect: 'rainbow-trail',
      duration: 5000,
      colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
    }
  },
  {
    id: 'effect-sparkle',
    name: 'Sparkle Dust',
    nameAr: 'غبار اللمعان',
    description: 'Magical sparkle effect',
    descriptionAr: 'تأثير لمعان سحري',
    price: 250,
    category: 'effects',
    icon: 'â¨',
    rarity: 'rare',
    purchased: false,
    data: {
      effect: 'sparkle-dust',
      duration: 3000,
      particleCount: 20
    }
  },
  {
    id: 'effect-glow',
    name: 'Golden Glow',
    nameAr: 'وهج ذهبي',
    description: 'Shimmering golden aura',
    descriptionAr: 'هالة ذهبية متلألئة',
    price: 180,
    category: 'effects',
    icon: 'â¨',
    rarity: 'common',
    purchased: false,
    data: {
      effect: 'golden-glow',
      duration: 4000,
      intensity: 0.8
    }
  },
  // Services
  {
    id: 'service-ai-tutor',
    name: 'AI Tutor',
    nameAr: 'المعلم الذكي',
    description: 'Get AI-powered study assistance',
    descriptionAr: 'احصل على مساعدة دراسية مدعومة بالذكاء الاصطناعي',
    price: 500,
    category: 'services',
    icon: 'ð¤',
    rarity: 'legendary',
    purchased: false,
    data: { serviceId: 'ai-tutor' }
  },
  {
    id: 'service-voice-notes',
    name: 'Voice Notes',
    nameAr: 'ملاحظات صوتية',
    description: 'Record and transcribe voice notes',
    descriptionAr: 'سجل وانسخ الملاحظات الصوتية',
    price: 300,
    category: 'services',
    icon: 'ð',
    rarity: 'epic',
    purchased: false,
    data: { serviceId: 'voice-notes' }
  },
  {
    id: 'service-calendar',
    name: 'Study Calendar',
    nameAr: 'تقويم الدراسة',
    description: 'Plan your study schedule',
    descriptionAr: 'خطط لجدول دراستك',
    price: 200,
    category: 'services',
    icon: 'ð',
    rarity: 'rare',
    purchased: false,
    data: { serviceId: 'calendar' }
  },
  {
    id: 'service-reminders',
    name: 'Smart Reminders',
    nameAr: 'تذكيرات ذكية',
    description: 'Get smart study reminders',
    descriptionAr: 'احصل على تذكيرات دراسية ذكية',
    price: 150,
    category: 'services',
    icon: 'ð',
    rarity: 'common',
    purchased: false,
    data: { serviceId: 'reminders' }
  }
];

export const specialOfferItems = ['badge-legend', 'theme-galaxy', 'effect-rainbow', 'service-ai-tutor'];
