export interface UserPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  settings: {
    background: string;
    theme: string;
    customTheme?: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      border: string;
    };
    timer: {
      color: string;
      font: string;
      design: string;
      size: string;
    };
    countdown: {
      color: string;
      font: string;
      design: string;
      size: string;
    };
    pomodoro: {
      color: string;
      font: string;
      design: string;
      size: string;
      completedIcon: string;
    };
    language: string;
  };
}

export const DEFAULT_PRESETS: UserPreset[] = [
  {
    id: 'productive',
    name: 'الإنتاجية',
    description: 'مثالي للعمل والدراسة بتركيز عالي',
    icon: '🚀',
    settings: {
      background: 'focus3',
      theme: 'dark',
      timer: {
        color: '#10b981',
        font: 'font-mono',
        design: 'minimal',
        size: 'text-6xl'
      },
      countdown: {
        color: '#f59e0b',
        font: 'font-mono',
        design: 'minimal',
        size: 'text-6xl'
      },
      pomodoro: {
        color: '#ef4444',
        font: 'font-mono',
        design: 'minimal',
        size: 'text-6xl',
        completedIcon: '🍅'
      },
      language: 'ar'
    }
  },
  {
    id: 'calm',
    name: 'الهدوء',
    description: 'مريح ومناسب للتأمل والاسترخاء',
    icon: '🌸',
    settings: {
      background: 'focus4',
      theme: 'light',
      customTheme: {
        primary: '#a78bfa',
        secondary: '#c4b5fd',
        accent: '#7c3aed',
        background: '#faf5ff',
        surface: '#f3e8ff',
        text: '#1f2937',
        border: '#d8b4fe'
      },
      timer: {
        color: '#a78bfa',
        font: 'font-sans',
        design: 'rounded',
        size: 'text-6xl'
      },
      countdown: {
        color: '#c084fc',
        font: 'font-sans',
        design: 'rounded',
        size: 'text-6xl'
      },
      pomodoro: {
        color: '#e9d5ff',
        font: 'font-sans',
        design: 'rounded',
        size: 'text-6xl',
        completedIcon: '✨'
      },
      language: 'ar'
    }
  },
  {
    id: 'energetic',
    name: 'النشاط',
    description: 'مثير ومحفز للطاقة والحيوية',
    icon: '⚡',
    settings: {
      background: 'focus5',
      theme: 'dark',
      customTheme: {
        primary: '#f97316',
        secondary: '#fb923c',
        accent: '#ea580c',
        background: '#1c1917',
        surface: '#292524',
        text: '#fafaf9',
        border: '#fdba74'
      },
      timer: {
        color: '#f97316',
        font: 'font-bold',
        design: 'neon',
        size: 'text-6xl'
      },
      countdown: {
        color: '#fb923c',
        font: 'font-bold',
        design: 'neon',
        size: 'text-6xl'
      },
      pomodoro: {
        color: '#fed7aa',
        font: 'font-bold',
        design: 'neon',
        size: 'text-6xl',
        completedIcon: '🔥'
      },
      language: 'ar'
    }
  },
  {
    id: 'minimal',
    name: 'البساطة',
    description: 'بسيط ونظيف بدون تشتيت',
    icon: '🎯',
    settings: {
      background: 'default',
      theme: 'light',
      timer: {
        color: '#374151',
        font: 'font-mono',
        design: 'minimal',
        size: 'text-6xl'
      },
      countdown: {
        color: '#6b7280',
        font: 'font-mono',
        design: 'minimal',
        size: 'text-6xl'
      },
      pomodoro: {
        color: '#9ca3af',
        font: 'font-mono',
        design: 'minimal',
        size: 'text-6xl',
        completedIcon: '⏰'
      },
      language: 'ar'
    }
  },
  {
    id: 'nature',
    name: 'الطبيعة',
    description: 'إلهام من الطبيعة والهدوء',
    icon: '🌿',
    settings: {
      background: 'focus1',
      theme: 'light',
      customTheme: {
        primary: '#16a34a',
        secondary: '#22c55e',
        accent: '#15803d',
        background: '#f0fdf4',
        surface: '#dcfce7',
        text: '#14532d',
        border: '#86efac'
      },
      timer: {
        color: '#16a34a',
        font: 'font-serif',
        design: 'organic',
        size: 'text-6xl'
      },
      countdown: {
        color: '#22c55e',
        font: 'font-serif',
        design: 'organic',
        size: 'text-6xl'
      },
      pomodoro: {
        color: '#4ade80',
        font: 'font-serif',
        design: 'organic',
        size: 'text-6xl',
        completedIcon: '🌱'
      },
      language: 'ar'
    }
  }
];

export const applyPreset = (preset: UserPreset) => {
  const { settings } = preset;
  
  // Apply background
  localStorage.setItem('selectedBackground', settings.background);
  window.dispatchEvent(new CustomEvent('backgroundChange', { detail: settings.background }));
  
  // Apply theme
  if (settings.customTheme) {
    localStorage.setItem('customTheme', JSON.stringify(settings.customTheme));
    window.dispatchEvent(new CustomEvent('customThemeChange', { detail: settings.customTheme }));
  }
  localStorage.setItem('theme', settings.theme);
  window.dispatchEvent(new CustomEvent('themeChange', { detail: settings.theme }));
  
  // Apply timer settings color while preserving user's custom settings
  const currentTimerSettings = localStorage.getItem('timer_settings');
  let timerSettings;
  if (currentTimerSettings) {
    try {
      const parsed = JSON.parse(currentTimerSettings);
      timerSettings = {
        ...parsed,
        color: settings.timer?.color || parsed.color
      };
    } catch (error) {
      console.error('Error parsing timer settings:', error);
      timerSettings = settings.timer || {
        color: '#ffffff',
        font: 'font-mono',
        design: 'minimal',
        size: 'text-4xl',
        completedIcon: 'star'
      };
    }
  } else {
    timerSettings = settings.timer || {
      color: '#ffffff',
      font: 'font-mono',
      design: 'minimal',
      size: 'text-4xl',
      completedIcon: 'star'
    };
  }
  localStorage.setItem('timer_settings', JSON.stringify(timerSettings));
  window.dispatchEvent(new CustomEvent('timerSettingsChanged', { detail: timerSettings }));
  
  // Apply countdown settings
  localStorage.setItem('countdown_timer_settings', JSON.stringify(settings.countdown));
  window.dispatchEvent(new CustomEvent('countdownTimerSettingsChanged', { detail: settings.countdown }));
  
  // Apply pomodoro settings
  localStorage.setItem('pomodoro_timer_settings', JSON.stringify(settings.pomodoro));
  window.dispatchEvent(new CustomEvent('pomodoroTimerSettingsChanged', { detail: settings.pomodoro }));
  
  // Apply language
  localStorage.setItem('language', settings.language);
  window.dispatchEvent(new CustomEvent('languageChange', { detail: settings.language }));
};

export const getDefaultPreset = (): UserPreset => {
  return DEFAULT_PRESETS[0]; // Productive preset as default
};
