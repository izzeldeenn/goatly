'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

interface CustomTheme {
  name: string;
  colors: ThemeColors;
}

const lightThemes: CustomTheme[] = [
  {
    name: 'Tea Theme',
    colors: {
      primary: '#84cc16', // lime green
      secondary: '#fbbf24', // yellow
      accent: '#166534', // dark green
      background: '#fef3c7', // light yellow
      surface: '#fde68a', // yellow
      text: '#000000',
      border: '#fbbf24'
    }
  },
  {
    name: 'Ocean Theme',
    colors: {
      primary: '#3b82f6', // blue
      secondary: '#06b6d4', // cyan
      accent: '#1e40af', // dark blue
      background: '#dbeafe', // light blue
      surface: '#bfdbfe', // blue
      text: '#000000',
      border: '#3b82f6'
    }
  },
  {
    name: 'Sunset Theme',
    colors: {
      primary: '#f97316', // orange
      secondary: '#fbbf24', // yellow
      accent: '#dc2626', // red
      background: '#fed7aa', // light orange
      surface: '#fdba74', // orange
      text: '#000000',
      border: '#f97316'
    }
  },
  {
    name: 'Forest Theme',
    colors: {
      primary: '#10b981', // emerald
      secondary: '#84cc16', // lime
      accent: '#047857', // dark emerald
      background: '#d1fae5', // light emerald
      surface: '#a7f3d0', // emerald
      text: '#000000',
      border: '#10b981'
    }
  },
  {
    name: 'Purple Dream',
    colors: {
      primary: '#8b5cf6', // violet
      secondary: '#ec4899', // pink
      accent: '#6d28d9', // dark violet
      background: '#ede9fe', // light violet
      surface: '#ddd6fe', // violet
      text: '#000000',
      border: '#8b5cf6'
    }
  },
  {
    name: 'Rose Garden',
    colors: {
      primary: '#f43f5e', // rose
      secondary: '#fb923c', // orange
      accent: '#be123c', // dark rose
      background: '#ffe4e6', // light rose
      surface: '#fecdd3', // rose
      text: '#000000',
      border: '#f43f5e'
    }
  },
  {
    name: 'Mint Fresh',
    colors: {
      primary: '#14b8a6', // teal
      secondary: '#84cc16', // lime
      accent: '#0f766e', // dark teal
      background: '#ccfbf1', // light teal
      surface: '#99f6e4', // teal
      text: '#000000',
      border: '#14b8a6'
    }
  },
  {
    name: 'Golden Hour',
    colors: {
      primary: '#eab308', // yellow
      secondary: '#f97316', // orange
      accent: '#a16207', // dark yellow
      background: '#fef3c7', // light yellow
      surface: '#fde047', // yellow
      text: '#000000',
      border: '#eab308'
    }
  },
  {
    name: 'Sky Blue',
    colors: {
      primary: '#0ea5e9', // sky
      secondary: '#06b6d4', // cyan
      accent: '#0369a1', // dark sky
      background: '#e0f2fe', // light sky
      surface: '#bae6fd', // sky
      text: '#000000',
      border: '#0ea5e9'
    }
  },
  {
    name: 'Lavender Fields',
    colors: {
      primary: '#a855f7', // purple
      secondary: '#ec4899', // pink
      accent: '#7c3aed', // dark purple
      background: '#f3e8ff', // light purple
      surface: '#e9d5ff', // purple
      text: '#000000',
      border: '#a855f7'
    }
  },
  {
    name: 'Cherry Blossom',
    colors: {
      primary: '#ec4899', // pink
      secondary: '#f472b6', // light pink
      accent: '#be185d', // dark pink
      background: '#fdf2f8', // light pink
      surface: '#fce7f3', // pink
      text: '#000000',
      border: '#ec4899'
    }
  },
  {
    name: 'Emerald Valley',
    colors: {
      primary: '#059669', // emerald
      secondary: '#10b981', // emerald light
      accent: '#064e3b', // dark emerald
      background: '#d1fae5', // light emerald
      surface: '#a7f3d0', // emerald
      text: '#000000',
      border: '#059669'
    }
  },
  {
    name: 'Coral Reef',
    colors: {
      primary: '#f97316', // coral
      secondary: '#fb923c', // light coral
      accent: '#c2410c', // dark coral
      background: '#fed7aa', // light coral
      surface: '#fdba74', // coral
      text: '#000000',
      border: '#f97316'
    }
  },
  {
    name: 'Arctic Ice',
    colors: {
      primary: '#06b6d4', // cyan
      secondary: '#22d3ee', // light cyan
      accent: '#0e7490', // dark cyan
      background: '#cffafe', // light cyan
      surface: '#a5f3fc', // cyan
      text: '#000000',
      border: '#06b6d4'
    }
  },
  {
    name: 'Autumn Leaves',
    colors: {
      primary: '#dc2626', // red
      secondary: '#f97316', // orange
      accent: '#991b1b', // dark red
      background: '#fee2e2', // light red
      surface: '#fecaca', // red
      text: '#000000',
      border: '#dc2626'
    }
  },
  {
    name: 'Spring Meadow',
    colors: {
      primary: '#65a30d', // lime
      secondary: '#84cc16', // lime light
      accent: '#4d7c0f', // dark lime
      background: '#ecfccb', // light lime
      surface: '#d9f99d', // lime
      text: '#000000',
      border: '#65a30d'
    }
  },
  {
    name: 'Deep Space',
    colors: {
      primary: '#6366f1', // indigo
      secondary: '#8b5cf6', // purple
      accent: '#4f46e5', // dark indigo
      background: '#e0e7ff', // light indigo
      surface: '#c7d2fe', // indigo
      text: '#000000',
      border: '#6366f1'
    }
  },
  {
    name: 'Peach Paradise',
    colors: {
      primary: '#fb923c', // orange
      secondary: '#fbbf24', // yellow
      accent: '#ea580c', // dark orange
      background: '#fed7aa', // light orange
      surface: '#fdba74', // orange
      text: '#000000',
      border: '#fb923c'
    }
  },
  {
    name: 'Slate Modern',
    colors: {
      primary: '#64748b', // slate
      secondary: '#94a3b8', // slate light
      accent: '#475569', // dark slate
      background: '#f1f5f9', // light slate
      surface: '#e2e8f0', // slate
      text: '#000000',
      border: '#64748b'
    }
  }
];

const darkThemes: CustomTheme[] = [
  {
    name: 'Tea Theme',
    colors: {
      primary: '#22c55e', // brighter green for dark
      secondary: '#f59e0b', // amber for dark
      accent: '#16a34a', // green for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#374151'
    }
  },
  {
    name: 'Ocean Theme',
    colors: {
      primary: '#60a5fa', // brighter blue for dark
      secondary: '#22d3ee', // brighter cyan for dark
      accent: '#2563eb', // blue for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#1e3a8a'
    }
  },
  {
    name: 'Sunset Theme',
    colors: {
      primary: '#fb923c', // brighter orange for dark
      secondary: '#fbbf24', // yellow
      accent: '#ef4444', // red for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#7c2d12'
    }
  },
  {
    name: 'Forest Theme',
    colors: {
      primary: '#34d399', // brighter emerald for dark
      secondary: '#22c55e', // green for dark
      accent: '#059669', // dark emerald for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#064e3b'
    }
  },
  {
    name: 'Purple Dream',
    colors: {
      primary: '#a78bfa', // brighter violet for dark
      secondary: '#f472b6', // pink for dark
      accent: '#7c3aed', // violet for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#4c1d95'
    }
  },
  {
    name: 'Rose Garden',
    colors: {
      primary: '#fb7185', // bright rose for dark
      secondary: '#fb923c', // orange for dark
      accent: '#e11d48', // rose for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#881337'
    }
  },
  {
    name: 'Mint Fresh',
    colors: {
      primary: '#2dd4bf', // bright teal for dark
      secondary: '#22c55e', // green for dark
      accent: '#0d9488', // teal for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#134e4a'
    }
  },
  {
    name: 'Golden Hour',
    colors: {
      primary: '#facc15', // bright yellow for dark
      secondary: '#fb923c', // orange for dark
      accent: '#ca8a04', // yellow for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#713f12'
    }
  },
  {
    name: 'Sky Blue',
    colors: {
      primary: '#38bdf8', // bright sky for dark
      secondary: '#22d3ee', // cyan for dark
      accent: '#0284c7', // sky for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#075985'
    }
  },
  {
    name: 'Lavender Fields',
    colors: {
      primary: '#c084fc', // bright purple for dark
      secondary: '#f472b6', // pink for dark
      accent: '#9333ea', // purple for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#581c87'
    }
  },
  {
    name: 'Cherry Blossom',
    colors: {
      primary: '#f472b6', // bright pink for dark
      secondary: '#f9a8d4', // light pink for dark
      accent: '#db2777', // pink for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#9f1239'
    }
  },
  {
    name: 'Emerald Valley',
    colors: {
      primary: '#10b981', // emerald for dark
      secondary: '#34d399', // light emerald for dark
      accent: '#047857', // dark emerald for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#064e3b'
    }
  },
  {
    name: 'Coral Reef',
    colors: {
      primary: '#fb923c', // bright coral for dark
      secondary: '#fdba74', // light coral for dark
      accent: '#ea580c', // coral for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#7c2d12'
    }
  },
  {
    name: 'Arctic Ice',
    colors: {
      primary: '#22d3ee', // bright cyan for dark
      secondary: '#67e8f9', // light cyan for dark
      accent: '#0891b2', // cyan for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#164e63'
    }
  },
  {
    name: 'Autumn Leaves',
    colors: {
      primary: '#ef4444', // bright red for dark
      secondary: '#fb923c', // orange for dark
      accent: '#b91c1c', // red for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#7f1d1d'
    }
  },
  {
    name: 'Spring Meadow',
    colors: {
      primary: '#84cc16', // bright lime for dark
      secondary: '#a3e635', // light lime for dark
      accent: '#65a30d', // lime for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#365314'
    }
  },
  {
    name: 'Deep Space',
    colors: {
      primary: '#818cf8', // bright indigo for dark
      secondary: '#a78bfa', // purple for dark
      accent: '#6366f1', // indigo for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#312e81'
    }
  },
  {
    name: 'Peach Paradise',
    colors: {
      primary: '#fdba74', // bright orange for dark
      secondary: '#fbbf24', // yellow for dark
      accent: '#f97316', // orange for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#7c2d12'
    }
  },
  {
    name: 'Slate Modern',
    colors: {
      primary: '#94a3b8', // bright slate for dark
      secondary: '#cbd5e1', // light slate for dark
      accent: '#64748b', // slate for dark
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      border: '#334155'
    }
  }
];

const defaultThemes = lightThemes;

interface CustomThemeContextType {
  currentTheme: CustomTheme;
  setTheme: (theme: CustomTheme) => void;
  availableThemes: CustomTheme[];
  createCustomTheme: (name: string, colors: ThemeColors) => void;
  updateThemeColors: (colors: Partial<ThemeColors>) => void;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

export function CustomThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(defaultThemes[0]);
  const [availableThemes, setAvailableThemes] = useState<CustomTheme[]>(defaultThemes);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Update available themes based on dark/light mode
  useEffect(() => {
    const checkDarkMode = () => {
      const darkMode = document.documentElement.classList.contains('dark');
      setIsDarkMode(darkMode);
      setAvailableThemes(darkMode ? darkThemes : lightThemes);
    };

    // Initial check
    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('customTheme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        const theme = availableThemes.find(t => t.name === parsed.name) || parsed;
        if (theme && theme.colors) {
          setCurrentTheme(theme);
        }
      } catch (error) {
        console.error('Error loading saved theme:', error);
      }
    }
  }, [availableThemes]);

  const setTheme = (theme: CustomTheme) => {
    if (theme && theme.colors) {
      setCurrentTheme(theme);
      localStorage.setItem('customTheme', JSON.stringify(theme));
    }
  };

  const createCustomTheme = (name: string, colors: ThemeColors) => {
    const newTheme: CustomTheme = { name, colors };
    const updatedThemes = [...availableThemes, newTheme];
    setAvailableThemes(updatedThemes);
    setTheme(newTheme);
    
    // Update timer settings color while preserving user's custom settings
    const currentTimerSettings = localStorage.getItem('timer_settings');
    if (currentTimerSettings) {
      try {
        const timerSettings = JSON.parse(currentTimerSettings);
        const updatedTimerSettings = {
          ...timerSettings,
          color: colors.primary || timerSettings.color
        };
        localStorage.setItem('timer_settings', JSON.stringify(updatedTimerSettings));
        window.dispatchEvent(new CustomEvent('timerSettingsChanged', { detail: updatedTimerSettings }));
      } catch (error) {
        console.error('Error updating timer settings:', error);
      }
    }
    
    // Update countdown timer settings color while preserving user's custom settings
    const currentCountdownSettings = localStorage.getItem('countdown_timer_settings');
    if (currentCountdownSettings) {
      try {
        const countdownSettings = JSON.parse(currentCountdownSettings);
        const updatedCountdownSettings = {
          ...countdownSettings,
          color: colors.secondary || countdownSettings.color
        };
        localStorage.setItem('countdown_timer_settings', JSON.stringify(updatedCountdownSettings));
        window.dispatchEvent(new CustomEvent('countdownTimerSettingsChanged', { detail: updatedCountdownSettings }));
      } catch (error) {
        console.error('Error updating countdown timer settings:', error);
      }
    }
    
    // Update pomodoro timer settings color while preserving user's custom settings
    const currentPomodoroSettings = localStorage.getItem('pomodoro_timer_settings');
    if (currentPomodoroSettings) {
      try {
        const pomodoroSettings = JSON.parse(currentPomodoroSettings);
        const updatedPomodoroSettings = {
          ...pomodoroSettings,
          color: colors.accent || pomodoroSettings.color
        };
        localStorage.setItem('pomodoro_timer_settings', JSON.stringify(updatedPomodoroSettings));
        window.dispatchEvent(new CustomEvent('pomodoroTimerSettingsChanged', { detail: updatedPomodoroSettings }));
      } catch (error) {
        console.error('Error updating pomodoro timer settings:', error);
      }
    }
  };

  const updateThemeColors = (colors: Partial<ThemeColors>) => {
    if (currentTheme && currentTheme.colors) {
      const updatedTheme: CustomTheme = {
        ...currentTheme,
        colors: { ...currentTheme.colors, ...colors }
      };
      setTheme(updatedTheme);
      
      // Update timer settings color while preserving user's custom settings
      const currentTimerSettings = localStorage.getItem('timer_settings');
      if (currentTimerSettings) {
        try {
          const timerSettings = JSON.parse(currentTimerSettings);
          const updatedTimerSettings = {
            ...timerSettings,
            color: colors.primary || timerSettings.color
          };
          localStorage.setItem('timer_settings', JSON.stringify(updatedTimerSettings));
          window.dispatchEvent(new CustomEvent('timerSettingsChanged', { detail: updatedTimerSettings }));
        } catch (error) {
          console.error('Error updating timer settings:', error);
        }
      }
    }
  };

  return (
    <CustomThemeContext.Provider value={{
      currentTheme,
      setTheme,
      availableThemes,
      createCustomTheme,
      updateThemeColors
    }}>
      {children}
    </CustomThemeContext.Provider>
  );
}

export function useCustomTheme() {
  const context = useContext(CustomThemeContext);
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
}

// Export theme arrays for use in other components
export { lightThemes, darkThemes };

// Helper function to get Tailwind class from color
export function getThemeClasses(theme: CustomTheme | null, isDark: boolean = false) {
  // If we have a theme, find its dark/light variant
  if (theme) {
    const themes = isDark ? darkThemes : lightThemes;
    const themeVariant = themes.find(t => t.name === theme.name);
    
    if (themeVariant) {
      return themeVariant.colors;
    }
    
    // Fallback to theme colors if no variant found
    return theme.colors;
  }
  
  // Fallback colors if no theme is provided
  const fallbackColors = {
    primary: '#84cc16',
    secondary: '#fbbf24',
    accent: '#166534',
    background: '#fef3c7',
    surface: '#fde68a',
    text: '#000000',
    border: '#fbbf24'
  };
  
  // Dark mode fallback colors
  const darkFallbackColors = {
    primary: '#22c55e', // brighter green for dark mode
    secondary: '#f59e0b', // amber for dark mode
    accent: '#16a34a', // green for dark mode
    background: '#000000',
    surface: '#111111',
    text: '#ffffff',
    border: '#374151'
  };
  
  return isDark ? darkFallbackColors : fallbackColors;
}
