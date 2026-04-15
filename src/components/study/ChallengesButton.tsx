'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { useGamification } from '@/contexts/GamificationContext';

import { Challenges } from './Challenges';
import { Store } from '../store/Store';

export function ChallengesButton() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const { coins } = useGamification();
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadChallengesProgress = () => {
      if (typeof window !== 'undefined') {
        const savedChallenges = localStorage.getItem('userChallenges');
        if (savedChallenges) {
          try {
            const challenges = JSON.parse(savedChallenges);
            const completed = challenges.filter((c: any) => c.completed).length;
            const total = challenges.length;
            setCompletedCount(completed);
            setTotalCount(total);
          } catch (error) {
            console.error('Failed to load challenges progress:', error);
          }
        }
      }
    };

    loadChallengesProgress();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadChallengesProgress();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('challengesUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('challengesUpdated', handleStorageChange);
    };
  }, []);

  const renderStoreButton = () => (
    <button
      onClick={() => setShowStore(true)}
      className="group relative w-12 h-12 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #8b5cf6, #7c3aed)`,
        boxShadow: `0 4px 16px #8b5cf630, 0 0 0 2px #8b5cf615`,
        color: '#ffffff'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 6px 24px #8b5cf640, 0 0 0 2px #8b5cf620`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = `0 4px 16px #8b5cf630, 0 0 0 2px #8b5cf615`;
      }}
      aria-label={language === 'ar' ? 'المتجر' : 'Store'}
      title={mounted ? `${language === 'ar' ? 'المتجر' : 'Store'} - ${coins} ${language === 'ar' ? 'نقطة' : 'coins'}` : language === 'ar' ? 'المتجر' : 'Store'}
    >
      {/* Store Icon with Animation */}
      <div className="relative flex items-center justify-center">
        <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          🛍️
        </span>
        {/* Coins Badge */}
        {mounted && (
          <div className="absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full bg-purple-600 border-2 border-white shadow-lg flex items-center justify-center px-1">
            <span className="text-xs font-bold text-white">{coins}</span>
          </div>
        )}
        {/* Shine Effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)'
          }}
        />
      </div>
    </button>
  );

  const renderChallengesButton = () => (
    <button
      onClick={() => setIsChallengesOpen(!isChallengesOpen)}
      className="group relative w-12 h-12 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center overflow-hidden"
      style={{
        background: isChallengesOpen 
          ? `linear-gradient(135deg, #10b981, #059669)` 
          : `linear-gradient(135deg, #059669, #10b981)`,
        boxShadow: isChallengesOpen 
          ? `0 8px 32px #10b98140, 0 0 0 2px #10b98120` 
          : `0 4px 16px #05966930, 0 0 0 2px #05966915`,
        color: '#ffffff'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
        e.currentTarget.style.boxShadow = isChallengesOpen 
          ? `0 12px 48px #10b98150, 0 0 0 2px #10b98130` 
          : `0 6px 24px #05966940, 0 0 0 2px #05966920`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = isChallengesOpen 
          ? `0 8px 32px #10b98140, 0 0 0 2px #10b98120` 
          : `0 4px 16px #05966930, 0 0 0 2px #05966915`;
      }}
      aria-label={language === 'ar' ? 'التحديات' : 'Challenges'}
      title={`${language === 'ar' ? 'التحديات' : 'Challenges'} - ${completedCount}/${totalCount} ${language === 'ar' ? 'مكتمل' : 'completed'}`}
    >
      {/* Challenge Icon with Animation */}
      <div className="relative flex items-center justify-center">
        <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          🏆
        </span>
        {/* Progress Badge */}
        {totalCount > 0 && (
          <div className="absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full bg-green-600 border-2 border-white shadow-lg flex items-center justify-center px-1">
            <span className="text-xs font-bold text-white">{completedCount}</span>
          </div>
        )}
        {/* Shine Effect */}
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
      {/* Real-time Challenge Icon with Animation */}
      <div className="relative flex items-center justify-center">
        <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          ⚔️
        </span>
        {/* Pulse Effect for Live Indicator */}
        <div className="absolute inset-0 rounded-2xl bg-red-400 opacity-0 group-hover:opacity-30 animate-pulse" />
        {/* Shine Effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)'
          }}
        />
      </div>
    </button>
  );

  const renderChallengesModal = () => (
    <>
      {isChallengesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            onClick={() => {
              setIsChallengesOpen(false);
            }}
          />
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: customTheme.colors.surface,
              border: `2px solid ${customTheme.colors.border}`,
              backdropFilter: 'blur(10px)'
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: customTheme.colors.border }}>
              <h3 className="text-xl font-bold" style={{ color: customTheme.colors.text }}>
                🏆 {language === 'ar' ? 'التحديات' : 'Challenges'}
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChallengesOpen(false);
                }}
                className="p-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 hover:shadow-lg transform hover:scale-110 z-10 relative"
                title={language === 'ar' ? 'إغلاق' : 'Close'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Challenges Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <Challenges />
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-3">
      {renderStoreButton()}
      {renderChallengesButton()}
      {renderRealTimeChallengeButton()}
      {renderChallengesModal()}
      <Store 
        isOpen={showStore} 
        onClose={() => setShowStore(false)} 
      />
    </div>
  );
}
