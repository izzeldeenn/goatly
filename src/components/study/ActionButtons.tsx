'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { Store } from '@/components/store/Store';
import { NotesComponent } from '@/components/chat/NotesComponent';
import { StickyNotes } from '@/components/chat/StickyNotes';

export function ActionButtons() {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const [showStore, setShowStore] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState<string>('');

  // Load slides from localStorage for indicator
  useEffect(() => {
    const loadSlides = () => {
      if (typeof window !== 'undefined') {
        const savedSlides = localStorage.getItem('userSlides');
        if (savedSlides) {
          try {
            const parsedSlides = JSON.parse(savedSlides);
            setNotes(parsedSlides.length > 0 ? 'hasSlides' : '');
          } catch (error) {
            console.error('Failed to load slides:', error);
          }
        }
      }
    };

    loadSlides();

    // Listen for custom events when new notes are published
    const handleStickyNotePublished = (e: CustomEvent) => {
      loadSlides(); // Reload to update indicator
    };

    window.addEventListener('stickyNotePublished', handleStickyNotePublished as EventListener);

    return () => {
      window.removeEventListener('stickyNotePublished', handleStickyNotePublished as EventListener);
    };
  }, []);

  const renderStoreButton = () => (
    <button
      onClick={() => setShowStore(!showStore)}
      className="group relative w-12 h-12 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center overflow-hidden"
      style={{
        background: showStore
          ? `linear-gradient(135deg, #8b5cf6, #7c3aed)`
          : `linear-gradient(135deg, #7c3aed, #8b5cf6)`,
        boxShadow: showStore
          ? `0 8px 32px #8b5cf640, 0 0 0 2px #8b5cf620`
          : `0 4px 16px #7c3aed30, 0 0 0 2px #7c3aed15`,
        color: '#ffffff'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
        e.currentTarget.style.boxShadow = showStore
          ? `0 12px 48px #8b5cf650, 0 0 0 2px #8b5cf630`
          : `0 6px 24px #7c3aed40, 0 0 0 2px #7c3aed20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = showStore
          ? `0 8px 32px #8b5cf640, 0 0 0 2px #8b5cf620`
          : `0 4px 16px #7c3aed30, 0 0 0 2px #7c3aed15`;
      }}
      aria-label={language === 'ar' ? 'المتجر' : 'Store'}
      title={language === 'ar' ? 'المتجر' : 'Store'}
    >
      <div className="relative flex items-center justify-center">
        <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          🛒
        </span>
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)'
          }}
        />
      </div>
    </button>
  );

  const renderRealTimeChallengeButton = () => (
    <button
      onClick={() => window.location.href = '/challenge'}
      className="group relative w-12 h-12 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #ef4444, #dc2626)`,
        boxShadow: `0 4px 16px #ef444430, 0 0 0 2px #ef444415`,
        color: '#ffffff'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 6px 24px #ef444440, 0 0 0 2px #ef444420`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = `0 4px 16px #ef444430, 0 0 0 2px #ef444415`;
      }}
      aria-label={language === 'ar' ? 'تحدي فوري' : 'Real-time Challenge'}
      title={language === 'ar' ? 'تحدي فوري مع لاعبين حقيقيين' : 'Real-time challenge with live players'}
    >
      <div className="relative flex items-center justify-center">
        <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          ⚔️
        </span>
        <div className="absolute inset-0 rounded-2xl bg-red-400 opacity-0 group-hover:opacity-30 animate-pulse" />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)'
          }}
        />
      </div>
    </button>
  );

  const renderNotesButton = () => (
    <button
      onClick={() => setIsNotesOpen(!isNotesOpen)}
      className="group relative w-12 h-12 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center overflow-hidden"
      style={{
        background: isNotesOpen
          ? `linear-gradient(135deg, #10b981, #059669)`
          : `linear-gradient(135deg, #059669, #10b981)`,
        boxShadow: isNotesOpen
          ? `0 8px 32px #10b98140, 0 0 0 2px #10b98120`
          : `0 4px 16px #05966930, 0 0 0 2px #05966915`,
        color: '#ffffff'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
        e.currentTarget.style.boxShadow = isNotesOpen
          ? `0 12px 48px #10b98150, 0 0 0 2px #10b98130`
          : `0 6px 24px #05966940, 0 0 0 2px #05966920`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = isNotesOpen
          ? `0 8px 32px #10b98140, 0 0 0 2px #10b98120`
          : `0 4px 16px #05966930, 0 0 0 2px #05966915`;
      }}
      aria-label={language === 'ar' ? 'ملاحظات' : 'Notes'}
      title={language === 'ar' ? 'الملاحظات' : 'Notes'}
    >
      <div className="relative flex items-center justify-center">
        <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          📝
        </span>
        {notes === 'hasSlides' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        )}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)'
          }}
        />
      </div>
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      {renderStoreButton()}
      {renderRealTimeChallengeButton()}
      {renderNotesButton()}
      <Store
        isOpen={showStore}
        onClose={() => setShowStore(false)}
      />
      <NotesComponent
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
      />
      <StickyNotes />
    </div>
  );
}
