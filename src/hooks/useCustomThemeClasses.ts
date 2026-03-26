import { useCustomTheme, getThemeClasses } from '@/contexts/CustomThemeContext';
import { useTheme } from '@/contexts/ThemeContext';

export function useCustomThemeClasses() {
  const { theme } = useTheme();
  const { currentTheme } = useCustomTheme();
  const themeClasses = getThemeClasses(currentTheme || null, theme === 'dark');

  // Generate dynamic Tailwind classes based on custom theme
  const getButtonClass = (variant: 'primary' | 'secondary' | 'accent' = 'primary') => {
    const colors = {
      primary: themeClasses.primary,
      secondary: themeClasses.secondary,
      accent: themeClasses.accent
    };
    
    return `transition-all hover:scale-105`;
  };

  const getBackgroundClass = (type: 'background' | 'surface' = 'background') => {
    const colors = {
      background: themeClasses.background,
      surface: themeClasses.surface
    };
    
    return colors[type];
  };

  const getBorderClass = () => {
    return themeClasses.border;
  };

  const getTextClass = (type: 'primary' | 'secondary' | 'accent' = 'primary') => {
    const colors = {
      primary: themeClasses.primary,
      secondary: themeClasses.secondary,
      accent: themeClasses.accent
    };
    
    return colors[type];
  };

  // Helper function to convert hex to Tailwind class
  const hexToTailwind = (hex: string) => {
    // For now, we'll use inline styles for custom colors
    // In a production app, you might want to generate custom Tailwind classes
    return hex;
  };

  return {
    // Direct color values for inline styles
    colors: themeClasses,
    
    // Style objects for inline styling
    buttonPrimary: { 
      backgroundColor: themeClasses.primary,
      color: '#ffffff',
      border: `2px solid ${themeClasses.primary}`
    },
    buttonSecondary: { 
      backgroundColor: themeClasses.secondary,
      color: '#000000',
      border: `2px solid ${themeClasses.secondary}`
    },
    buttonAccent: { 
      backgroundColor: themeClasses.accent,
      color: '#ffffff',
      border: `2px solid ${themeClasses.accent}`
    },
    background: { backgroundColor: themeClasses.background },
    surface: { backgroundColor: themeClasses.surface },
    border: { borderColor: themeClasses.border },
    textPrimary: { color: themeClasses.primary },
    textSecondary: { color: themeClasses.secondary },
    textAccent: { color: themeClasses.accent },
    
    // Helper functions
    getButtonClass,
    getBackgroundClass,
    getBorderClass,
    getTextClass,
    hexToTailwind
  };
}
