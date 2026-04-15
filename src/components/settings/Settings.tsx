'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomTheme, getThemeClasses } from '@/contexts/CustomThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AuthModal } from '@/components/auth/AuthModal';
import { AccountSwitcher } from '@/components/users/AccountSwitcher';
import { dailyActivityDB } from '@/lib/dailyActivity';
import { ActivityContribution } from '@/lib/dailyActivity';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { BACKGROUNDS } from '@/constants/backgrounds';
import { PresetSelector } from '@/components/settings/PresetSelector';
import { LocalBackgroundSelector } from '@/components/backgrounds/LocalBackgroundSelector';

// Generate 250 avatars dynamically
const AVATARS = Array.from({ length: 250 }, (_, i) => 
  `https://api.dicebear.com/7.x/avataaars/svg?seed=avatar${i + 1}`
);

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}


export function SettingsButton() {
  const { theme } = useTheme();
  const { coins, level, experience } = useGamification();
  const { getCurrentUser, updateUserName, updateUserAvatar, isLoggedIn } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const { currentTheme, setTheme, availableThemes, createCustomTheme, updateThemeColors } = useCustomTheme();
  const customTheme = useCustomThemeClasses();

  // Settings sections configuration
  const getSettingsSections = () => [
    { id: 'presets', name: t.presets || 'الإعدادات المسبقة', icon: '🎨' },
    { id: 'profile', name: t.profile || 'الملف الشخصي', icon: '👤' },
    { id: 'appearance', name: t.appearance || 'المظهر', icon: '🎨' },
    { id: 'themes', name: t.themes || 'الثيمات', icon: '🎭' },
    { id: 'backgrounds', name: t.backgrounds || 'الخلفيات', icon: '🖼️' },
    { id: 'rankings', name: t.rankings || 'عرض الترتيب', icon: '🏆' },
    { id: 'timer', name: t.timer || 'التايمر', icon: '⏱️' },
    { id: 'countdown', name: t.countdown || 'العد التنازلي', icon: '⏳' },
    { id: 'pomodoro', name: t.pomodoro || 'بومودورو', icon: '🍅' },
    { id: 'account', name: t.account || 'الحساب', icon: '🔐' },
  ];

  // Ranking display modes
  const getRankingDisplayModes = () => [
    { id: 'bottom', name: t.bottom_popup || 'منبثق من الأسفل', icon: '⬆️', description: t.bottom_popup_desc || 'ينزلق من أسفل الشاشة' },
    { id: 'side', name: t.side_bar || 'شريط جانبي', icon: '➡️', description: t.side_bar_desc || 'شريط ثابت على الجانب' },
    { id: 'floating', name: t.floating || 'عائم', icon: '🎈', description: t.floating_desc || 'نافذة عائمة قابلة للتحريك' },
    { id: 'top', name: t.top_popup || 'منبثق من الأعلى', icon: '⬇️', description: t.top_popup_desc || 'ينزلق من أعلى الشاشة' },
  ];
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customColors, setCustomColors] = useState<ThemeColors>({
    primary: '#1674ccff',
    secondary: '#fbbf24',
    accent: '#0048ffff',
    background: '#fef3c7',
    surface: '#fde68a',
    text: '#000000',
    border: '#fbbf24'
  });
  const [customThemeName, setCustomThemeName] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('default');
  const [customBackgroundValue, setCustomBackgroundValue] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [activityData, setActivityData] = useState<{ contributions: ActivityContribution[] }>({ contributions: [] });
  const [avatarPage, setAvatarPage] = useState(1);
  const [avatarSearch, setAvatarSearch] = useState('');
  const avatarsPerPage = 20;

  // Timer settings
  const [timerColor, setTimerColor] = useState('#ffffff');
  const [timerFont, setTimerFont] = useState('font-mono');
  const [timerDesign, setTimerDesign] = useState('minimal');
  const [timerSize, setTimerSize] = useState('text-4xl');

  // Countdown timer settings
  const [countdownColor, setCountdownColor] = useState('#ffffff');
  const [countdownFont, setCountdownFont] = useState('font-mono');
  const [countdownDesign, setCountdownDesign] = useState('minimal');
  const [countdownSize, setCountdownSize] = useState('text-4xl');

  // Pomodoro timer settings
  const [pomodoroColor, setPomodoroColor] = useState('#ffffff');
  const [pomodoroFont, setPomodoroFont] = useState('font-mono');
  const [pomodoroDesign, setPomodoroDesign] = useState('minimal');
  const [pomodoroSize, setPomodoroSize] = useState('text-4xl');
  const [pomodoroCompletedIcon, setPomodoroCompletedIcon] = useState('star');

  // Ranking display mode
  const [rankingDisplayMode, setRankingDisplayMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rankingDisplayMode') || 'bottom';
    }
    return 'bottom';
  });

  const currentUser = getCurrentUser();

  // Filter and paginate avatars
  const filteredAvatars = avatarSearch 
    ? AVATARS.filter((_, index) => 
        (index + 1).toString().includes(avatarSearch)
      )
    : AVATARS;

  const totalPages = Math.ceil(filteredAvatars.length / avatarsPerPage);
  const startIndex = (avatarPage - 1) * avatarsPerPage;
  const endIndex = startIndex + avatarsPerPage;
  const currentAvatars = filteredAvatars.slice(startIndex, endIndex);

  // Reset page when search changes
  useEffect(() => {
    setAvatarPage(1);
  }, [avatarSearch]);

  // Fetch user activity data
  useEffect(() => {
    const fetchActivityData = async () => {
      if (currentUser?.id) {
        try {
          const contributions = await dailyActivityDB.getUserActivityContributions(currentUser.id);
          setActivityData({ contributions });
        } catch (error) {
          console.error('Failed to fetch activity data:', error);
          setActivityData({ contributions: [] });
        }
      }
    };

    fetchActivityData();
  }, [currentUser?.id]);

  // Theme-related functions
  const handleColorChange = (colorType: keyof ThemeColors, value: string) => {
    setCustomColors(prev => ({ ...prev, [colorType]: value }));
  };

  const handleCreateCustomTheme = () => {
    if (customThemeName.trim()) {
      createCustomTheme(customThemeName.trim(), customColors);
      setShowCustomCreator(false);
      setCustomThemeName('');
      setCustomColors({
        primary: '#0055ffffff',
        secondary: '#fbbf24',
        accent: '#0026ffffff',
        background: '#fef3c7',
        surface: '#fde68a',
        text: '#000000',
        border: '#fbbf24'
      });
    }
  };

  const handleQuickColorUpdate = () => {
    updateThemeColors(customColors);
  };

  const handleBackgroundSelect = (backgroundId: string, backgroundValue?: string) => {
    setSelectedBackground(backgroundId);
    
    // Handle custom backgrounds
    if (backgroundValue) {
      setCustomBackgroundValue(backgroundValue);
      localStorage.setItem('customBackgroundValue', backgroundValue);
    }
    
    // Store in localStorage for global access
    localStorage.setItem('selectedBackground', backgroundId);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('backgroundChange', { 
      detail: { 
        backgroundId, 
        customValue: backgroundValue || (backgroundId.startsWith('custom-') ? customBackgroundValue : undefined)
      } 
    }));
  };

  // Load background from localStorage on mount
  useEffect(() => {
    const savedBackground = localStorage.getItem('selectedBackground');
    const savedCustomValue = localStorage.getItem('customBackgroundValue');
    
    if (savedBackground) {
      setSelectedBackground(savedBackground);
    }
    if (savedCustomValue) {
      setCustomBackgroundValue(savedCustomValue);
    }
  }, []);

  const handleSaveSettings = () => {
    if (username.trim()) {
      updateUserName(username.trim());
    }
    if (customAvatarUrl) {
      updateUserAvatar(customAvatarUrl);
    } else if (selectedAvatar) {
      updateUserAvatar(selectedAvatar);
    }
    
    // Save timer settings to localStorage
    const timerSettings = {
      color: timerColor,
      font: timerFont,
      design: timerDesign,
      size: timerSize
    };
    localStorage.setItem('timer_settings', JSON.stringify(timerSettings));
    
    // Save countdown timer settings to localStorage
    const countdownSettings = {
      color: countdownColor,
      font: countdownFont,
      design: countdownDesign,
      size: countdownSize
    };
    localStorage.setItem('countdown_timer_settings', JSON.stringify(countdownSettings));
    
    // Save pomodoro timer settings to localStorage
    const pomodoroSettings = {
      color: pomodoroColor,
      font: pomodoroFont,
      design: pomodoroDesign,
      size: pomodoroSize,
      completedIcon: pomodoroCompletedIcon
    };
    localStorage.setItem('pomodoro_timer_settings', JSON.stringify(pomodoroSettings));
    
    // Dispatch custom events to notify timer components
    window.dispatchEvent(new CustomEvent('timerSettingsChanged', { detail: timerSettings }));
    window.dispatchEvent(new CustomEvent('countdownTimerSettingsChanged', { detail: countdownSettings }));
    window.dispatchEvent(new CustomEvent('pomodoroTimerSettingsChanged', { detail: pomodoroSettings }));
    
    setShowSettings(false);
  };

  const handleLoadSettings = () => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      // Check if avatar is a URL (starts with http) or from preset avatars
      if (currentUser.avatar?.startsWith('http')) {
        setCustomAvatarUrl(currentUser.avatar);
        setSelectedAvatar('');
      } else {
        setSelectedAvatar(currentUser.avatar || AVATARS[0]);
        setCustomAvatarUrl('');
      }
    }
    
    // Load timer settings from localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('timer_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setTimerColor(settings.color || '#ffffff');
          setTimerFont(settings.font || 'font-mono');
          setTimerDesign(settings.design || 'minimal');
          setTimerSize(settings.size || 'text-4xl');
        } catch (error) {
          console.error('Failed to load timer settings:', error);
        }
      }

      // Load countdown timer settings from localStorage
      const savedCountdownSettings = localStorage.getItem('countdown_timer_settings');
      if (savedCountdownSettings) {
        try {
          const settings = JSON.parse(savedCountdownSettings);
          setCountdownColor(settings.color || '#ffffff');
          setCountdownFont(settings.font || 'font-mono');
          setCountdownDesign(settings.design || 'minimal');
          setCountdownSize(settings.size || 'text-4xl');
        } catch (error) {
          console.error('Failed to load countdown timer settings:', error);
        }
      }

      // Load pomodoro timer settings from localStorage
      const savedPomodoroSettings = localStorage.getItem('pomodoro_timer_settings');
      if (savedPomodoroSettings) {
        try {
          const settings = JSON.parse(savedPomodoroSettings);
          setPomodoroColor(settings.color || '#ffffff');
          setPomodoroFont(settings.font || 'font-mono');
          setPomodoroDesign(settings.design || 'minimal');
          setPomodoroSize(settings.size || 'text-4xl');
          setPomodoroCompletedIcon(settings.completedIcon || 'star');
        } catch (error) {
          console.error('Failed to load pomodoro timer settings:', error);
        }
      }
    }
    
    setShowSettings(true);
  };

  return (
    <>
      <button
        onClick={handleLoadSettings}
        className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor: customTheme.colors.surface,
          color: customTheme.colors.text
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = customTheme.colors.primary;
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = customTheme.colors.surface;
          e.currentTarget.style.color = customTheme.colors.text;
        }}
      >
        ⚙️
      </button>

      {showSettings && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
            onClick={() => setShowSettings(false)}
          />
          <div 
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-6xl max-h-[90vh] shadow-2xl rounded-3xl transition-all duration-300 ease-in-out z-[9999] overflow-hidden ${
              showSettings ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            style={{
              backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
              border: `2px solid ${customTheme.colors.border}`
            }}
          >
            <div className="flex h-[90vh]">
              {/* Sidebar - redesigned compact vertical layout */}
              <div
                className="w-44 relative overflow-hidden flex-shrink-0"
                style={{
                  background: `linear-gradient(180deg, ${customTheme.colors.primary}06 0%, transparent 100%)`,
                }}
              >
                {/* Decorative Elements (kept) */}
                <div
                  className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-30"
                  style={{
                    background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 w-20 h-20 rounded-full blur-2xl opacity-20"
                  style={{
                    background: `radial-gradient(circle, ${customTheme.colors.accent}, transparent)`
                  }}
                />

                <div className="relative p-4 flex flex-col h-full">
                  {/* Profile compact header */}
                  <div className="flex items-center gap-3 px-1 py-2">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                        boxShadow: `0 6px 20px ${customTheme.colors.primary}30`
                      }}
                    >
                      {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.username} className="w-12 h-12 object-cover rounded-xl" />
                      ) : (
                        <span className="text-white text-lg">{currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : '⚙️'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate`} style={{ color: theme === 'light' ? '#0b1220' : '#f8fafc' }}>{currentUser?.username || t.settings}</div>
                      <div className="text-xxs opacity-70" style={{ fontSize: 11, color: theme === 'light' ? '#475569' : '#cbd5e1' }}>{coins} {t.coins || 'عملات'} · Lv {level}</div>
                    </div>
                  </div>

                  <nav className="mt-4 flex-1 overflow-auto">
                    <ul className="flex flex-col gap-2">
                      {getSettingsSections().map((section) => {
                        const active = activeSection === section.id;
                        return (
                          <li key={section.id}>
                            <button
                              onClick={() => setActiveSection(section.id)}
                              className={`w-full flex items-center gap-3 pr-3 pl-2 py-2 rounded-lg transition-colors duration-200 group ${active ? '' : 'hover:bg-white/5'}`}
                              style={{
                                background: active ? `linear-gradient(90deg, ${customTheme.colors.primary}22, ${customTheme.colors.accent}12)` : 'transparent',
                                borderLeft: active ? `4px solid ${customTheme.colors.primary}` : '4px solid transparent'
                              }}
                            >
                              <div
                                className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0"
                                style={{
                                  background: active ? customTheme.colors.primary : 'transparent',
                                  color: active ? '#ffffff' : (theme === 'light' ? customTheme.colors.text : '#e6eef8')
                                }}
                              >
                                <span className="text-lg">{section.icon}</span>
                              </div>
                              <div className="text-right flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate" style={{ color: theme === 'light' ? '#0b1220' : '#f8fafc' }}>{section.name}</div>
                                <div className="text-xxs opacity-70 truncate" style={{ fontSize: 11, color: theme === 'light' ? '#64748b' : '#9aa4b2' }}>
                                  {section.id === 'profile' && 'المعلومات الشخصية'}
                                  {section.id === 'appearance' && 'الشكل والمظهر'}
                                  {section.id === 'themes' && 'تخصيص الثيمات'}
                                  {section.id === 'account' && 'إدارة الحساب'}
                                </div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>


                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                {/* Premium Header */}
                <div 
                  className="px-8 py-6 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${customTheme.colors.background} 0%, ${customTheme.colors.surface}30 100%)`,
                    borderBottom: `1px solid ${customTheme.colors.border}10`
                  }}
                >
                  {/* Header Decorations */}
                  <div 
                    className="absolute top-0 left-0 w-full h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${customTheme.colors.primary}50, transparent)`
                    }}
                  />
                  
                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center space-x-reverse space-x-4">
                      <div 
                        className="w-3 h-3 rounded-full relative"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                          boxShadow: `0 0 20px ${customTheme.colors.primary}60`
                        }}
                      >
                        <div 
                          className="absolute inset-0 rounded-full animate-ping"
                          style={{
                            background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                            opacity: 0.3
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-lg font-black tracking-tight ${
                        theme === 'light' ? 'text-gray-900' : 'text-gray-50'
                      }`}>
                        {getSettingsSections().find(s => s.id === activeSection)?.name}
                      </h3>
                      <div className={`text-xs opacity-70 mt-1 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {activeSection === 'presets' && 'اختر شكلاً جاهزاً مع إعدادات متكاملة'}
                        {activeSection === 'profile' && 'إدارة ملفك الشخصي والصورة الرمزية'}
                        {activeSection === 'appearance' && 'تخصيص المظهر واللغة'}
                        {activeSection === 'themes' && 'اختيار وتخصيص الثيمات'}
                        {activeSection === 'backgrounds' && 'اختيار خلفيات'}
                        {activeSection === 'rankings' && 'اختر طريقة عرض الترتيب التي تناسبك'}
                        {activeSection === 'timer' && 'تخصيص شكل وألوان المؤقت'}
                        {activeSection === 'countdown' && 'إعداد العد التنازلي'}
                        {activeSection === 'pomodoro' && 'تخصيص مؤقت بومودورو'}
                        {activeSection === 'account' && 'إعدادات الحساب والأمان'}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowSettings(false)}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 group relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                        boxShadow: `0 4px 16px ${customTheme.colors.border}30`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`;
                        e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
                        e.currentTarget.style.boxShadow = `0 8px 32px ${customTheme.colors.primary}50`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${customTheme.colors.surface}, ${customTheme.colors.background})`;
                        e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                        e.currentTarget.style.boxShadow = `0 4px 16px ${customTheme.colors.border}30`;
                      }}
                    >
                      <span className="text-lg transition-colors duration-300 group-hover:text-white">✕</span>
                    </button>
                  </div>
                </div>

                <div className="px-8 py-6 overflow-y-auto flex-1">
                  {activeSection === 'profile' && (
                    <div className="space-y-6">
                      {/* Username Section */}
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`
                          }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-center space-x-reverse space-x-3 mb-4">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                boxShadow: `0 4px 16px ${customTheme.colors.primary}40`
                              }}
                            >
                              <span className="text-white text-sm">@</span>
                            </div>
                            <label className={`text-sm font-black uppercase tracking-wider ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              {t.username}
                            </label>
                          </div>
                          
                          <div className="relative">
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder={t.enterUsername}
                              className="w-full px-5 py-4 rounded-2xl focus:outline-none transition-all duration-300 text-sm font-medium peer"
                              style={{
                                backgroundColor: customTheme.colors.surface + '40',
                                color: customTheme.colors.text,
                                border: `2px solid ${customTheme.colors.border}30`
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.backgroundColor = customTheme.colors.surface + '80';
                                e.currentTarget.style.borderColor = customTheme.colors.primary;
                                e.currentTarget.style.boxShadow = `0 0 0 4px ${customTheme.colors.primary}20, 0 8px 32px ${customTheme.colors.primary}30`;
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.backgroundColor = customTheme.colors.surface + '40';
                                e.currentTarget.style.borderColor = customTheme.colors.border + '30';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            />
                            <div 
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-full transition-all duration-300 peer-focus:scale-x-150 peer-focus:scale-y-125"
                              style={{
                                background: `linear-gradient(180deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                boxShadow: `0 0 12px ${customTheme.colors.primary}60`
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Avatar Section */}
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.accent}, transparent)`
                          }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-center space-x-reverse space-x-3 mb-6">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.accent}, ${customTheme.colors.primary})`,
                                boxShadow: `0 4px 16px ${customTheme.colors.accent}40`
                              }}
                            >
                              <span className="text-white text-sm">👤</span>
                            </div>
                            <label className={`text-sm font-black uppercase tracking-wider ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              {t.avatar}
                            </label>
                          </div>
                          
                          {/* Custom Avatar URL */}
                          <div className="mb-6">
                            <div className="relative">
                              <input
                                type="url"
                                value={customAvatarUrl}
                                onChange={(e) => {
                                  setCustomAvatarUrl(e.target.value);
                                  setSelectedAvatar('');
                                }}
                                placeholder="أدخل رابط الصورة المخصص..."
                                className="w-full px-5 py-4 rounded-2xl focus:outline-none transition-all duration-300 text-sm font-medium peer"
                                style={{
                                  backgroundColor: customTheme.colors.surface + '40',
                                  color: customTheme.colors.text,
                                  border: `2px solid ${customTheme.colors.border}30`
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.backgroundColor = customTheme.colors.surface + '80';
                                  e.currentTarget.style.borderColor = customTheme.colors.accent;
                                  e.currentTarget.style.boxShadow = `0 0 0 4px ${customTheme.colors.accent}20, 0 8px 32px ${customTheme.colors.accent}30`;
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.backgroundColor = customTheme.colors.surface + '40';
                                  e.currentTarget.style.borderColor = customTheme.colors.border + '30';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              <div 
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-full transition-all duration-300 peer-focus:scale-x-150 peer-focus:scale-y-125"
                                style={{
                                  background: `linear-gradient(180deg, ${customTheme.colors.accent}, ${customTheme.colors.primary})`,
                                  boxShadow: `0 0 12px ${customTheme.colors.accent}60`
                                }}
                              />
                            </div>
                            
                            {customAvatarUrl && (
                              <div className="flex justify-center mt-4">
                                <div className="relative group">
                                  <div 
                                    className="w-20 h-20 rounded-3xl p-1 relative overflow-hidden"
                                    style={{
                                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                      boxShadow: `0 12px 48px ${customTheme.colors.primary}40`
                                    }}
                                  >
                                    <img 
                                      src={customAvatarUrl} 
                                      alt="Custom avatar preview"
                                      className="w-full h-full rounded-2xl object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                  <div 
                                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg"
                                    style={{
                                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                      color: '#ffffff'
                                    }}
                                  >
                                    ✓
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Preset Avatars */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className={`text-sm font-medium ${
                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                أو اختر من المجموعة
                              </div>
                              <div className={`text-xs ${
                                theme === 'light' ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                                {AVATARS.length} صورة متاحة
                              </div>
                            </div>
                            
                            {/* Search */}
                            <div className="relative">
                              <input
                                type="text"
                                value={avatarSearch}
                                onChange={(e) => setAvatarSearch(e.target.value)}
                                placeholder="بحث بالرقم..."
                                className="w-full px-5 py-3 rounded-2xl focus:outline-none transition-all duration-300 text-sm peer"
                                style={{
                                  backgroundColor: customTheme.colors.surface + '40',
                                  color: customTheme.colors.text,
                                  border: `2px solid ${customTheme.colors.border}30`
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.backgroundColor = customTheme.colors.surface + '80';
                                  e.currentTarget.style.borderColor = customTheme.colors.primary;
                                  e.currentTarget.style.boxShadow = `0 0 0 4px ${customTheme.colors.primary}20`;
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.backgroundColor = customTheme.colors.surface + '40';
                                  e.currentTarget.style.borderColor = customTheme.colors.border + '30';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                            </div>

                            {/* Avatar Grid */}
                            <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto p-4 rounded-2xl"
                                 style={{ 
                                   backgroundColor: customTheme.colors.surface + '30',
                                   border: `1px solid ${customTheme.colors.border}20`
                                 }}>
                              {currentAvatars.map((avatar, index) => {
                                const originalIndex = avatarSearch 
                                  ? AVATARS.indexOf(avatar) + 1
                                  : startIndex + index + 1;
                                return (
                                  <button
                                    key={avatar}
                                    onClick={() => {
                                      setSelectedAvatar(avatar);
                                      setCustomAvatarUrl('');
                                    }}
                                    className="aspect-square rounded-2xl overflow-hidden transition-all duration-300 relative group"
                                    style={{
                                      boxShadow: selectedAvatar === avatar 
                                        ? `0 12px 48px ${customTheme.colors.primary}50` 
                                        : `0 4px 16px ${customTheme.colors.border}20`,
                                      transform: selectedAvatar === avatar ? 'scale(1.1)' : 'scale(1)',
                                      border: selectedAvatar === avatar 
                                        ? `3px solid ${customTheme.colors.primary}` 
                                        : '3px solid transparent'
                                    }}
                                    title={`Avatar ${originalIndex}`}
                                  >
                                    <img 
                                      src={avatar} 
                                      alt={`Avatar ${originalIndex}`}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {originalIndex}
                                    </div>
                                    {selectedAvatar === avatar && (
                                      <div 
                                        className="absolute top-2 right-2 w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold shadow-lg"
                                        style={{
                                          background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                          color: '#ffffff'
                                        }}
                                      >
                                        ✓
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                              <div className="flex items-center justify-center space-x-reverse space-x-4">
                                <button
                                  onClick={() => setAvatarPage(Math.max(1, avatarPage - 1))}
                                  disabled={avatarPage === 1}
                                  className="px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 font-bold text-sm"
                                  style={{
                                    background: avatarPage === 1 
                                      ? customTheme.colors.surface + '60' 
                                      : `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                    color: avatarPage === 1 ? customTheme.colors.text : '#ffffff',
                                    boxShadow: avatarPage === 1 
                                      ? `inset 0 2px 4px ${customTheme.colors.border}40`
                                      : `0 8px 32px ${customTheme.colors.primary}40`
                                  }}
                                >
                                  ←
                                </button>
                                
                                <div 
                                  className="px-4 py-2 rounded-xl font-bold text-sm"
                                  style={{
                                    background: `linear-gradient(135deg, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                                    color: customTheme.colors.text,
                                    boxShadow: `inset 0 2px 4px ${customTheme.colors.border}40`
                                  }}
                                >
                                  {avatarPage} / {totalPages}
                                </div>
                                
                                <button
                                  onClick={() => setAvatarPage(Math.min(totalPages, avatarPage + 1))}
                                  disabled={avatarPage === totalPages}
                                  className="px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 font-bold text-sm"
                                  style={{
                                    background: avatarPage === totalPages 
                                      ? customTheme.colors.surface + '60' 
                                      : `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                    color: avatarPage === totalPages ? customTheme.colors.text : '#ffffff',
                                    boxShadow: avatarPage === totalPages 
                                      ? `inset 0 2px 4px ${customTheme.colors.border}40`
                                      : `0 8px 32px ${customTheme.colors.primary}40`
                                  }}
                                >
                                  →
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'appearance' && (
                    <div className="space-y-6">
                      {/* Theme Section */}
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`
                          }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-center space-x-reverse space-x-3 mb-6">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                boxShadow: `0 4px 16px ${customTheme.colors.primary}40`
                              }}
                            >
                              <span className="text-white text-sm">🎨</span>
                            </div>
                            <label className={`text-sm font-black uppercase tracking-wider ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              {t.appearance}
                            </label>
                          </div>
                          
                          <div 
                            className="p-6 rounded-2xl"
                            style={{
                              background: `linear-gradient(135deg, ${customTheme.colors.surface}40, ${customTheme.colors.background}10)`,
                              border: `1px solid ${customTheme.colors.border}20`
                            }}
                          >
                            <ThemeToggle />
                          </div>
                        </div>
                      </div>

                      {/* Language Section */}
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.accent}, transparent)`
                          }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-center space-x-reverse space-x-3 mb-6">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.accent}, ${customTheme.colors.primary})`,
                                boxShadow: `0 4px 16px ${customTheme.colors.accent}40`
                              }}
                            >
                              <span className="text-white text-sm">🌐</span>
                            </div>
                            <label className={`text-sm font-black uppercase tracking-wider ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              {t.language}
                            </label>
                          </div>
                          
                          <div className="relative">
                            <select
                              value={language}
                              onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                              className="w-full px-5 py-4 rounded-2xl focus:outline-none transition-all duration-300 text-sm font-medium appearance-none peer"
                              style={{
                                backgroundColor: customTheme.colors.surface + '40',
                                color: customTheme.colors.text,
                                border: `2px solid ${customTheme.colors.border}30`
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.backgroundColor = customTheme.colors.surface + '80';
                                e.currentTarget.style.borderColor = customTheme.colors.primary;
                                e.currentTarget.style.boxShadow = `0 0 0 4px ${customTheme.colors.primary}20, 0 8px 32px ${customTheme.colors.primary}30`;
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.backgroundColor = customTheme.colors.surface + '40';
                                e.currentTarget.style.borderColor = customTheme.colors.border + '30';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <option value="en">English</option>
                              <option value="ar">العربية</option>
                            </select>
                            <div 
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none transition-transform duration-300 peer-focus:rotate-180"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                clipPath: 'polygon(0 0%, 100% 0%, 50% 100%)',
                                width: '12px',
                                height: '12px'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'presets' && (
                    <div className="space-y-6">
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`
                          }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-center space-x-reverse space-x-3 mb-6">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                boxShadow: `0 4px 16px ${customTheme.colors.primary}40`
                              }}
                            >
                              <span className="text-white text-sm">🎨</span>
                            </div>
                            <div>
                              <h3 className={`text-lg font-black tracking-tight ${
                                theme === 'light' ? 'text-gray-900' : 'text-gray-50'
                              }`}>
                                الإعدادات المسبقة
                              </h3>
                              <p className={`text-sm opacity-70 ${
                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                اختر شكلاً جاهزاً مع إعدادات متكاملة
                              </p>
                            </div>
                          </div>
                          
                          <PresetSelector />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'themes' && (
                    <div className="space-y-6">
                      {/* Predefined Themes */}
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`
                          }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-center space-x-reverse space-x-3 mb-6">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                boxShadow: `0 4px 16px ${customTheme.colors.primary}40`
                              }}
                            >
                              <span className="text-white text-sm">🎨</span>
                            </div>
                            <label className={`text-sm font-black uppercase tracking-wider ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              الثيمات الجاهزة
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {availableThemes.map((themeOption) => (
                              <button
                                key={themeOption.name}
                                onClick={() => setTheme(themeOption)}
                                className={`p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                                  currentTheme.name === themeOption.name
                                    ? 'ring-2 ring-offset-2'
                                    : ''
                                }`}
                                style={{
                                  background: currentTheme.name === themeOption.name 
                                    ? `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                                    : `linear-gradient(135deg, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                                  boxShadow: currentTheme.name === themeOption.name
                                    ? `0 12px 48px ${customTheme.colors.primary}50, 0 4px 16px ${customTheme.colors.primary}30`
                                    : `0 4px 16px ${customTheme.colors.border}30`
                                }}
                              >
                                <div className="flex items-center space-x-reverse space-x-2 mb-3">
                                  <div 
                                    className={`w-6 h-6 rounded-full border-2 ${
                                      theme === 'light' ? 'border-gray-300' : 'border-gray-600'
                                    }`}
                                    style={{ backgroundColor: themeOption.colors.primary }}
                                  />
                                  <div 
                                    className={`w-6 h-6 rounded-full border-2 ${
                                      theme === 'light' ? 'border-gray-300' : 'border-gray-600'
                                    }`}
                                    style={{ backgroundColor: themeOption.colors.secondary }}
                                  />
                                  <div 
                                    className={`w-6 h-6 rounded-full border-2 ${
                                      theme === 'light' ? 'border-gray-300' : 'border-gray-600'
                                    }`}
                                    style={{ backgroundColor: themeOption.colors.accent }}
                                  />
                                </div>
                                <div className={`text-sm font-bold ${
                                  currentTheme.name === themeOption.name ? 'text-white' : (theme === 'light' ? 'text-gray-900' : 'text-gray-50')
                                }`}>
                                  {themeOption.name}
                                </div>
                                
                                {/* Hover effect */}
                                <div 
                                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                  style={{
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Custom Theme Creator */}
                      <div className="mb-6">
                        <button
                          onClick={() => setShowCustomCreator(!showCustomCreator)}
                          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden group ${
                            showCustomCreator 
                              ? 'ring-2 ring-offset-2'
                              : ''
                          }`}
                          style={{
                            background: showCustomCreator 
                              ? `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                              : `linear-gradient(135deg, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                            color: showCustomCreator ? '#ffffff' : customTheme.colors.text,
                            boxShadow: showCustomCreator
                              ? `0 12px 48px ${customTheme.colors.primary}40`
                              : `0 8px 32px ${customTheme.colors.border}30`
                          }}
                        >
                          <span className="relative z-10">
                            {showCustomCreator 
                              ? 'إغلاق'
                              : 'إنشاء ثيم مخصص'
                            }
                          </span>
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSection === 'backgrounds' && (
                    <div className="space-y-6">
                      {/* Background Selection */}
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.accent}, transparent)`
                          }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-center space-x-reverse space-x-3 mb-6">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.accent}, ${customTheme.colors.primary})`,
                                boxShadow: `0 4px 16px ${customTheme.colors.accent}40`
                              }}
                            >
                              <span className="text-white text-sm"> </span>
                            </div>
                            <label className={`text-sm font-black uppercase tracking-wider ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              
                            </label>
                          </div>
                          
                          <LocalBackgroundSelector
                            selectedBackground={selectedBackground}
                            onBackgroundSelect={handleBackgroundSelect}
                          />
                          
                          {/* Default Backgrounds */}
                          <div className="mt-8">
                            <h4 className={`text-lg font-semibold mb-4 ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {BACKGROUNDS.filter(bg => ['default', 'gradient1', 'gradient2', 'gradient3', 'gradient4', 'gradient5', 'pattern1', 'pattern2', 'focus1', 'focus2', 'focus3', 'focus4', 'focus5', 'focus6', 'focus7'].includes(bg.id)).map((background) => (
                                <button
                                  key={background.id}
                                  onClick={() => handleBackgroundSelect(background.id)}
                                  className={`p-3 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                                    selectedBackground === background.id
                                      ? 'ring-2 ring-offset-2'
                                      : ''
                                  }`}
                                  style={{
                                    background: selectedBackground === background.id
                                      ? `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                                      : `linear-gradient(135deg, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                                    boxShadow: selectedBackground === background.id
                                      ? `0 12px 48px ${customTheme.colors.primary}50, 0 4px 16px ${customTheme.colors.primary}30`
                                      : `0 4px 16px ${customTheme.colors.border}30`
                                  }}
                                >
                                  <div 
                                    className="w-full h-12 rounded mb-2"
                                    style={{ 
                                      background: background.value,
                                      border: background.value === 'transparent' ? `2px dashed ${theme === 'light' ? '#d1d5db' : '#4b5563'}` : 'none',
                                      backgroundImage: background.value.startsWith('url(') ? background.value : 'none',
                                      backgroundSize: background.value.startsWith('url(') ? 'cover' : 'auto',
                                      backgroundPosition: background.value.startsWith('url(') ? 'center' : 'auto'
                                    }}
                                  />
                                  <div className={`text-xs font-medium ${
                                    selectedBackground === background.id ? (theme === 'light' ? 'text-white' : 'text-black') : (theme === 'light' ? 'text-gray-900' : 'text-gray-50')
                                  }`}>
                                    {background.name}
                                  </div>
                                  
                                  {/* Hover effect */}
                                  <div 
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
                                    }}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'rankings' && (
                    <div className="space-y-6">
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`,
                          }}
                        />
                        
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                          🏆 طريقة عرض الترتيب
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getRankingDisplayModes().map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => {
                                setRankingDisplayMode(mode.id);
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('rankingDisplayMode', mode.id);
                                }
                                // Dispatch event to notify ranking display change
                                window.dispatchEvent(new CustomEvent('rankingDisplayModeChange', { detail: mode.id }));
                              }}
                              className={`p-4 rounded-2xl border-2 transition-all duration-300 text-right ${
                                rankingDisplayMode === mode.id 
                                  ? 'ring-2 ring-offset-2' 
                                  : 'hover:scale-[1.02]'
                              }`}
                              style={{
                                background: rankingDisplayMode === mode.id 
                                  ? `linear-gradient(135deg, ${customTheme.colors.primary}20, ${customTheme.colors.accent}10)`
                                  : `${customTheme.colors.surface}40`,
                                borderColor: rankingDisplayMode === mode.id 
                                  ? customTheme.colors.primary 
                                  : `${customTheme.colors.border}40`,
                                '--tw-ring-color': rankingDisplayMode === mode.id ? customTheme.colors.primary : undefined
                              } as React.CSSProperties}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{mode.icon}</span>
                                <span className="font-semibold" style={{ color: customTheme.colors.text }}>
                                  {mode.name}
                                </span>
                              </div>
                              <p className={`text-sm ${
                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {mode.description}
                              </p>
                              {rankingDisplayMode === mode.id && (
                                <div className="mt-2 text-xs font-medium" style={{ color: customTheme.colors.primary }}>
                                  ✓ محدد
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'timer' && (
                    <div className="space-y-6">
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`
                          }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-center space-x-reverse space-x-3 mb-6">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                boxShadow: `0 4px 16px ${customTheme.colors.primary}40`
                              }}
                            >
                              <span className="text-white text-sm">⏱️</span>
                            </div>
                            <label className={`text-sm font-black uppercase tracking-wider ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              إعدادات التايمر
                            </label>
                          </div>

                          <div className="space-y-4">
                            {/* Timer Color */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                لون التايمر
                              </label>
                              <div className="flex items-center space-x-reverse space-x-3">
                                <input
                                  type="color"
                                  value={timerColor}
                                  onChange={(e) => setTimerColor(e.target.value)}
                                  className="w-12 h-12 rounded-xl cursor-pointer"
                                  style={{
                                    border: `2px solid ${customTheme.colors.border}`
                                  }}
                                />
                                <input
                                  type="text"
                                  value={timerColor}
                                  onChange={(e) => setTimerColor(e.target.value)}
                                  className="flex-1 px-4 py-2 rounded-xl"
                                  style={{
                                    backgroundColor: customTheme.colors.surface + '40',
                                    color: customTheme.colors.text,
                                    border: `1px solid ${customTheme.colors.border}`
                                  }}
                                />
                              </div>
                            </div>

                            {/* Timer Font */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                نوع الخط
                              </label>
                              <select
                                value={timerFont}
                                onChange={(e) => setTimerFont(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl"
                                style={{
                                  backgroundColor: customTheme.colors.surface + '40',
                                  color: customTheme.colors.text,
                                  border: `1px solid ${customTheme.colors.border}`
                                }}
                              >
                                <option value="font-mono">Monospace</option>
                                <option value="font-sans">Sans Serif</option>
                                <option value="font-serif">Serif</option>
                                <option value="font-bold">Bold</option>
                                <option value="font-light">Light</option>
                              </select>
                            </div>

                            {/* Timer Design */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                التصميم
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                {['minimal', 'modern', 'classic', 'digital'].map((design) => (
                                  <button
                                    key={design}
                                    onClick={() => setTimerDesign(design)}
                                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                                      timerDesign === design ? 'ring-2' : ''
                                    }`}
                                    style={{
                                      backgroundColor: timerDesign === design 
                                        ? customTheme.colors.primary 
                                        : customTheme.colors.surface + '40',
                                      color: timerDesign === design 
                                        ? '#ffffff' 
                                        : customTheme.colors.text,
                                      borderColor: customTheme.colors.border,
                                      outlineColor: timerDesign === design ? customTheme.colors.primary : 'transparent'
                                    }}
                                  >
                                    {design === 'minimal' && 'بسيط'}
                                    {design === 'modern' && 'حديث'}
                                    {design === 'classic' && 'كلاسيكي'}
                                    {design === 'digital' && 'رقمي'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Timer Size */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                الحجم
                              </label>
                              <div className="grid grid-cols-3 gap-3">
                                {[
                                  { value: 'text-2xl', label: 'صغير' },
                                  { value: 'text-4xl', label: 'متوسط' },
                                  { value: 'text-6xl', label: 'كبير' }
                                ].map((size) => (
                                  <button
                                    key={size.value}
                                    onClick={() => setTimerSize(size.value)}
                                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                                      timerSize === size.value ? 'ring-2' : ''
                                    }`}
                                    style={{
                                      backgroundColor: timerSize === size.value 
                                        ? customTheme.colors.primary 
                                        : customTheme.colors.surface + '40',
                                      color: timerSize === size.value 
                                        ? '#ffffff' 
                                        : customTheme.colors.text,
                                      borderColor: customTheme.colors.border,
                                      outlineColor: timerSize === size.value ? customTheme.colors.primary : 'transparent'
                                    }}
                                  >
                                    {size.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-6 p-4 rounded-xl"
                              style={{
                                backgroundColor: customTheme.colors.surface + '20',
                                border: `1px solid ${customTheme.colors.border}`
                              }}
                            >
                              <div className="text-center">
                                <div className={`text-center ${timerFont} ${timerSize}`}
                                  style={{ color: timerColor }}
                                >
                                  00:00:00
                                </div>
                                <p className={`text-xs mt-2 ${
                                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  معاينة التايمر
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'countdown' && (
                    <div className="space-y-6">
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`
                          }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-center space-x-reverse space-x-3 mb-6">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                boxShadow: `0 4px 16px ${customTheme.colors.primary}40`
                              }}
                            >
                              <span className="text-white text-sm">⏳</span>
                            </div>
                            <label className={`text-sm font-black uppercase tracking-wider ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              إعدادات العد التنازلي
                            </label>
                          </div>

                          <div className="space-y-4">
                            {/* Countdown Timer Color */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                لون العد التنازلي
                              </label>
                              <div className="flex items-center space-x-reverse space-x-3">
                                <input
                                  type="color"
                                  value={countdownColor}
                                  onChange={(e) => setCountdownColor(e.target.value)}
                                  className="w-12 h-12 rounded-xl cursor-pointer"
                                  style={{
                                    border: `2px solid ${customTheme.colors.border}`
                                  }}
                                />
                                <input
                                  type="text"
                                  value={countdownColor}
                                  onChange={(e) => setCountdownColor(e.target.value)}
                                  className="flex-1 px-4 py-2 rounded-xl"
                                  style={{
                                    backgroundColor: customTheme.colors.surface + '40',
                                    color: customTheme.colors.text,
                                    border: `1px solid ${customTheme.colors.border}`
                                  }}
                                />
                              </div>
                            </div>

                            {/* Countdown Timer Font */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                نوع الخط
                              </label>
                              <select
                                value={countdownFont}
                                onChange={(e) => setCountdownFont(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl"
                                style={{
                                  backgroundColor: customTheme.colors.surface + '40',
                                  color: customTheme.colors.text,
                                  border: `1px solid ${customTheme.colors.border}`
                                }}
                              >
                                <option value="font-mono">Monospace</option>
                                <option value="font-sans">Sans Serif</option>
                                <option value="font-serif">Serif</option>
                                <option value="font-bold">Bold</option>
                                <option value="font-light">Light</option>
                              </select>
                            </div>

                            {/* Countdown Timer Design */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                التصميم
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                {['minimal', 'modern', 'classic', 'digital'].map((design) => (
                                  <button
                                    key={design}
                                    onClick={() => setCountdownDesign(design)}
                                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                                      countdownDesign === design ? 'ring-2' : ''
                                    }`}
                                    style={{
                                      backgroundColor: countdownDesign === design 
                                        ? customTheme.colors.primary 
                                        : customTheme.colors.surface + '40',
                                      color: countdownDesign === design 
                                        ? '#ffffff' 
                                        : customTheme.colors.text,
                                      borderColor: customTheme.colors.border,
                                      outlineColor: countdownDesign === design ? customTheme.colors.primary : 'transparent'
                                    }}
                                  >
                                    {design === 'minimal' && 'بسيط'}
                                    {design === 'modern' && 'حديث'}
                                    {design === 'classic' && 'كلاسيكي'}
                                    {design === 'digital' && 'رقمي'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Countdown Timer Size */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                الحجم
                              </label>
                              <div className="grid grid-cols-3 gap-3">
                                {[
                                  { value: 'text-2xl', label: 'صغير' },
                                  { value: 'text-4xl', label: 'متوسط' },
                                  { value: 'text-6xl', label: 'كبير' }
                                ].map((size) => (
                                  <button
                                    key={size.value}
                                    onClick={() => setCountdownSize(size.value)}
                                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                                      countdownSize === size.value ? 'ring-2' : ''
                                    }`}
                                    style={{
                                      backgroundColor: countdownSize === size.value 
                                        ? customTheme.colors.primary 
                                        : customTheme.colors.surface + '40',
                                      color: countdownSize === size.value 
                                        ? '#ffffff' 
                                        : customTheme.colors.text,
                                      borderColor: customTheme.colors.border,
                                      outlineColor: countdownSize === size.value ? customTheme.colors.primary : 'transparent'
                                    }}
                                  >
                                    {size.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-6 p-4 rounded-xl"
                              style={{
                                backgroundColor: customTheme.colors.surface + '20',
                                border: `1px solid ${customTheme.colors.border}`
                              }}
                            >
                              <div className="text-center">
                                <div className={`text-center ${countdownFont} ${countdownSize}`}
                                  style={{ color: countdownColor }}
                                >
                                  00:05:00
                                </div>
                                <p className={`text-xs mt-2 ${
                                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  معاينة العد التنازلي
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'pomodoro' && (
                    <div className="space-y-6">
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`
                          }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-center space-x-reverse space-x-3 mb-6">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                boxShadow: `0 4px 16px ${customTheme.colors.primary}40`
                              }}
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className={`text-lg font-semibold ${
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>
                              إعدادات مؤقت بومودورو
                            </h3>
                          </div>

                          <div className="space-y-4">
                            {/* Pomodoro Timer Color */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                لون المؤقت
                              </label>
                              <div className="flex items-center space-x-reverse space-x-2">
                                <input
                                  type="color"
                                  value={pomodoroColor}
                                  onChange={(e) => setPomodoroColor(e.target.value)}
                                  className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={pomodoroColor}
                                  onChange={(e) => setPomodoroColor(e.target.value)}
                                  className={`flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none ${
                                    theme === 'light'
                                      ? 'border-gray-300 bg-white text-black focus:border-blue-500'
                                      : 'border-gray-600 bg-black text-white focus:border-blue-400'
                                  }`}
                                  placeholder="#ffffff"
                                />
                              </div>
                            </div>

                            {/* Pomodoro Timer Font */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                خط المؤقت
                              </label>
                              <select
                                value={pomodoroFont}
                                onChange={(e) => setPomodoroFont(e.target.value)}
                                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                                  theme === 'light'
                                    ? 'border-gray-300 bg-white text-black focus:border-blue-500'
                                    : 'border-gray-600 bg-black text-white focus:border-blue-400'
                                }`}
                              >
                                <option value="font-mono">Mono</option>
                                <option value="font-sans">Sans Serif</option>
                                <option value="font-serif">Serif</option>
                              </select>
                            </div>

                            {/* Pomodoro Timer Design */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                تصميم المؤقت
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {['minimal', 'modern', 'classic', 'digital'].map((design) => (
                                  <button
                                    key={design}
                                    onClick={() => setPomodoroDesign(design)}
                                    className={`px-3 py-2 rounded-lg border-2 transition-all ${
                                      pomodoroDesign === design
                                        ? theme === 'light'
                                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                                          : 'border-blue-400 bg-blue-900/30 text-blue-300'
                                        : theme === 'light'
                                          ? 'border-gray-400 bg-white text-black hover:border-gray-500 hover:bg-gray-50'
                                          : 'border-gray-600 hover:border-gray-500'
                                    }`}
                                  >
                                    {design === 'minimal' && 'بسيط'}
                                    {design === 'modern' && 'عصري'}
                                    {design === 'classic' && 'كلاسيكي'}
                                    {design === 'digital' && 'رقمي'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Pomodoro Timer Size */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                حجم المؤقت
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {['text-2xl', 'text-4xl', 'text-6xl', 'text-8xl'].map((size) => (
                                  <button
                                    key={size}
                                    onClick={() => setPomodoroSize(size)}
                                    className={`px-3 py-2 rounded-lg border-2 transition-all ${
                                      pomodoroSize === size
                                        ? theme === 'light'
                                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                                          : 'border-blue-400 bg-blue-900/30 text-blue-300'
                                        : theme === 'light'
                                          ? 'border-gray-400 bg-white text-black hover:border-gray-500 hover:bg-gray-50'
                                          : 'border-gray-600 hover:border-gray-500'
                                    }`}
                                  >
                                    {size === 'text-2xl' && 'صغير'}
                                    {size === 'text-4xl' && 'متوسط'}
                                    {size === 'text-6xl' && 'كبير'}
                                    {size === 'text-8xl' && 'كبير جداً'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Completed Sessions Icon */}
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-gray-300'
                              }`}>
                                شكل الجلسات المكتملة
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { id: 'star', name: 'نجمة', icon: '⭐' },
                                  { id: 'dot', name: 'نقطة', icon: '🔵' },
                                  { id: 'heart', name: 'قلب', icon: '❤️' }
                                ].map((icon) => (
                                  <button
                                    key={icon.id}
                                    onClick={() => setPomodoroCompletedIcon(icon.id)}
                                    className={`px-3 py-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                                      pomodoroCompletedIcon === icon.id
                                        ? theme === 'light'
                                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                                          : 'border-blue-400 bg-blue-900/30 text-blue-300'
                                        : theme === 'light'
                                          ? 'border-gray-400 bg-white text-black hover:border-gray-500 hover:bg-gray-50'
                                          : 'border-gray-600 hover:border-gray-500'
                                    }`}
                                  >
                                    <span className="text-xl">{icon.icon}</span>
                                    <span className="text-xs">{icon.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-6 p-4 rounded-xl"
                              style={{
                                backgroundColor: customTheme.colors.surface + '20',
                                border: `1px solid ${customTheme.colors.border}`
                              }}
                            >
                              <div className="text-center">
                                <div className={`text-center ${pomodoroFont} ${pomodoroSize}`}
                                  style={{ color: pomodoroColor }}
                                >
                                  25:00
                                </div>
                                <p className={`text-xs mt-2 ${
                                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  معاينة بومودورو
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'account' && (
                    <div className="space-y-6">
                      <div 
                        className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                          border: `1px solid ${customTheme.colors.border}20`,
                          boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                        }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`
                          }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-center space-x-reverse space-x-3 mb-6">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                boxShadow: `0 4px 16px ${customTheme.colors.primary}40`
                              }}
                            >
                              <span className="text-white text-sm">🔐</span>
                            </div>
                            <label className={`text-sm font-black uppercase tracking-wider ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              الحساب
                            </label>
                          </div>
                          
                          <div className="space-y-4">
                            {isLoggedIn ? (
                              <div 
                                className="p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden"
                                style={{ 
                                  background: `linear-gradient(135deg, ${customTheme.colors.primary}20, ${customTheme.colors.surface}40)`,
                                  border: `1px solid ${customTheme.colors.primary}30`,
                                  boxShadow: `0 8px 32px ${customTheme.colors.primary}20`
                                }}>
                                <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-xl opacity-30"
                                  style={{
                                    background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`
                                  }}
                                />
                                
                                <div className="flex items-center space-x-reverse space-x-4 relative">
                                  <div 
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
                                    style={{
                                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                      boxShadow: `0 8px 32px ${customTheme.colors.primary}40`
                                    }}
                                  >
                                    <span className="text-white text-xl">👤</span>
                                    <div 
                                      className="absolute inset-0 rounded-2xl"
                                      style={{
                                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                                        animation: 'shimmer 3s infinite'
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <div className={`text-base font-black ${
                                      theme === 'light' ? 'text-gray-900' : 'text-gray-50'
                                    }`}>
                                      {currentUser?.username || 'مستخدم'}
                                    </div>
                                    <div className={`text-sm opacity-80 ${
                                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                      {currentUser?.email || 'user@example.com'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="p-5 rounded-2xl backdrop-blur-sm"
                                style={{ 
                                  background: `linear-gradient(135deg, ${customTheme.colors.surface}40, ${customTheme.colors.background}20)`,
                                  border: `1px solid ${customTheme.colors.border}30`,
                                  boxShadow: `0 4px 16px ${customTheme.colors.border}15`
                                }}>
                                <div className="flex items-center space-x-reverse space-x-4">
                                  <div 
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    style={{
                                      background: `linear-gradient(135deg, ${customTheme.colors.border}, ${customTheme.colors.surface})`,
                                      boxShadow: `0 4px 16px ${customTheme.colors.border}30`
                                    }}
                                  >
                                    <span className="text-lg">👤</span>
                                  </div>
                                  <div>
                                    <div className={`text-base font-medium ${
                                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                    }`}>
                                      حساب ضيف
                                    </div>
                                    <div className={`text-sm opacity-70 ${
                                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                      قم بترقية الحساب للحفاظ على بياناتك
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                              {!isLoggedIn ? (
                                <button
                                  onClick={() => setShowAuthModal(true)}
                                  className="px-5 py-4 rounded-2xl font-black transition-all duration-300 text-sm hover:scale-105 relative overflow-hidden group"
                                  style={{
                                    background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                                    color: '#ffffff',
                                    boxShadow: `0 12px 48px ${customTheme.colors.primary}40`
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = `0 16px 64px ${customTheme.colors.primary}50`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = `0 12px 48px ${customTheme.colors.primary}40`;
                                  }}
                                >
                                  <span className="relative z-10">تسجيل الدخول</span>
                                  <div 
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)'
                                    }}
                                  />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setShowAccountSwitcher(true)}
                                  className="px-5 py-4 rounded-2xl font-black transition-all duration-300 text-sm hover:scale-105"
                                  style={{
                                    background: `linear-gradient(135deg, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                                    color: customTheme.colors.text,
                                    boxShadow: `0 8px 32px ${customTheme.colors.border}30`
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = `0 12px 48px ${customTheme.colors.border}40`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = `0 8px 32px ${customTheme.colors.border}30`;
                                  }}
                                >
                                  تبديل الحساب
                                </button>
                              )}
                              
                              {!isLoggedIn && (
                                <button
                                  onClick={() => {
                                    setShowAuthModal(true);
                                  }}
                                  className="px-5 py-4 rounded-2xl font-black transition-all duration-300 text-sm hover:scale-105"
                                  style={{
                                    background: `linear-gradient(135deg, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                                    color: customTheme.colors.text,
                                    boxShadow: `0 8px 32px ${customTheme.colors.border}30`
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = `0 12px 48px ${customTheme.colors.border}40`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = `0 8px 32px ${customTheme.colors.border}30`;
                                  }}
                                >
                                  ترقية الحساب
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Premium Footer */}
                <div 
                  className="px-8 py-6 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${customTheme.colors.background} 0%, ${customTheme.colors.surface}30 100%)`,
                    borderTop: `1px solid ${customTheme.colors.border}10`
                  }}
                >
                  <div 
                    className="absolute bottom-0 left-0 w-full h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${customTheme.colors.primary}30, transparent)`
                    }}
                  />
                  
                  <div className="flex justify-end space-x-reverse space-x-4 relative">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="px-6 py-3 rounded-2xl font-bold transition-all duration-300 text-sm hover:scale-105 relative overflow-hidden group"
                      style={{
                        background: `linear-gradient(135deg, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                        color: customTheme.colors.text,
                        boxShadow: `0 8px 32px ${customTheme.colors.border}30`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = `0 12px 48px ${customTheme.colors.border}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = `0 8px 32px ${customTheme.colors.border}30`;
                      }}
                    >
                      <span className="relative z-10">{t.cancel}</span>
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="px-6 py-3 rounded-2xl font-black transition-all duration-300 text-sm hover:scale-105 relative overflow-hidden group"
                      style={{
                        background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                        color: '#ffffff',
                        boxShadow: `0 12px 48px ${customTheme.colors.primary}40`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = `0 16px 64px ${customTheme.colors.primary}50`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = `0 12px 48px ${customTheme.colors.primary}40`;
                      }}
                    >
                      <span className="relative z-10">{t.saveChanges}</span>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)'
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Authentication Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <AccountSwitcher 
        isOpen={showAccountSwitcher} 
        onClose={() => setShowAccountSwitcher(false)} 
      />
    </>
  );
}
