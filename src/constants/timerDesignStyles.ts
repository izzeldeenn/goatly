export interface TimerDesignStyle {
  background: string;
  padding: string;
  border: string;
  borderRadius: string;
  boxShadow: string;
  letterSpacing?: string;
  fontFamily?: string;
  textShadow?: string;
}

export const timerDesignStyles: Record<string, TimerDesignStyle> = {
  minimal: {
    background: 'transparent',
    padding: '0',
    border: 'none',
    borderRadius: '0',
    boxShadow: 'none',
    letterSpacing: '0.05em'
  },
  modern: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    padding: '20px 40px',
    borderRadius: '20px',
    border: '2px solid rgba(255,255,255,0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    letterSpacing: '0.1em'
  },
  classic: {
    background: 'rgba(0,0,0,0.3)',
    padding: '16px 32px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    fontFamily: 'Georgia, serif'
  },
  digital: {
    background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
    padding: '24px 48px',
    borderRadius: '12px',
    border: '2px solid #333',
    boxShadow: '0 0 20px rgba(0,255,255,0.3), inset 0 0 20px rgba(0,255,255,0.1)',
    fontFamily: 'Courier New, monospace',
    textShadow: '0 0 10px currentColor',
    letterSpacing: '0.2em'
  }
};

export const getTimerDesignStyle = (design: string): TimerDesignStyle => {
  return timerDesignStyles[design] || timerDesignStyles.minimal;
};
