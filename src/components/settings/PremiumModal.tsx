'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { usePremium } from '@/contexts/PremiumContext';
import { useCoins } from '@/contexts/CoinsContext';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const { subscription, isPremium, subscribeMonthly, subscribeYearly, subscribeMonthlyWithCoins, subscribeYearlyWithCoins, subscribeMonthlyWithPayment, subscribeYearlyWithPayment, checkSubscription } = usePremium();
  const { coins, removeCoins } = useCoins();

  const [isProcessing, setIsProcessing] = useState(false);

  const MONTHLY_COINS = 3000;
  const YEARLY_COINS = 10000;

  const handleSubscribeMonthlyWithCoins = async () => {
    if (coins < MONTHLY_COINS) {
      alert(language === 'ar' ? 'ليس لديك عملات كافية' : 'Not enough coins');
      return;
    }

    setIsProcessing(true);
    const success = await removeCoins(MONTHLY_COINS, 'subscription', 'Monthly premium subscription');
    
    if (success) {
      const subSuccess = await subscribeMonthlyWithCoins(MONTHLY_COINS);
      if (subSuccess) {
        await checkSubscription();
        onClose();
      } else {
        // Refund coins if subscription failed
        await removeCoins(-MONTHLY_COINS, 'subscription_refund', 'Refund for failed monthly subscription');
        alert(language === 'ar' ? 'فشل الاشتراك' : 'Subscription failed');
      }
    } else {
      alert(language === 'ar' ? 'فشل خصم النقاط' : 'Failed to deduct coins');
    }
    
    setIsProcessing(false);
  };

  const handleSubscribeYearlyWithCoins = async () => {
    if (coins < YEARLY_COINS) {
      alert(language === 'ar' ? 'ليس لديك عملات كافية' : 'Not enough coins');
      return;
    }

    setIsProcessing(true);
    const success = await removeCoins(YEARLY_COINS, 'subscription', 'Yearly premium subscription');
    
    if (success) {
      const subSuccess = await subscribeYearlyWithCoins(YEARLY_COINS);
      if (subSuccess) {
        await checkSubscription();
        onClose();
      } else {
        // Refund coins if subscription failed
        await removeCoins(-YEARLY_COINS, 'subscription_refund', 'Refund for failed yearly subscription');
        alert(language === 'ar' ? 'فشل الاشتراك' : 'Subscription failed');
      }
    } else {
      alert(language === 'ar' ? 'فشل خصم النقاط' : 'Failed to deduct coins');
    }
    
    setIsProcessing(false);
  };

  const handleSubscribeMonthlyWithPayment = async () => {
    setIsProcessing(true);
    const subSuccess = await subscribeMonthlyWithPayment();
    if (subSuccess) {
      await checkSubscription();
      onClose();
    }
    setIsProcessing(false);
  };

  const handleSubscribeYearlyWithPayment = async () => {
    setIsProcessing(true);
    const subSuccess = await subscribeYearlyWithPayment();
    if (subSuccess) {
      await checkSubscription();
      onClose();
    }
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 md:w-11/12 lg:w-10/12 xl:w-9/12 max-w-7xl max-h-[95vh] shadow-2xl rounded-3xl transition-all duration-300 ease-in-out z-[9999] overflow-hidden ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          backgroundColor: theme === 'light' ? '#ffffff' : '#000000',
          border: `2px solid ${customTheme.colors.border}`
        }}
      >
        <div className="flex h-[85vh] flex-col overflow-hidden">
          {/* Header */}
          <div 
            className="px-8 py-6 relative overflow-hidden flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${customTheme.colors.background} 0%, ${customTheme.colors.surface}30 100%)`,
              borderBottom: `1px solid ${customTheme.colors.border}10`
            }}
          >
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
                    background: `linear-gradient(135deg, #FFD700, #FFA500)`,
                    boxShadow: `0 0 20px #FFD70060`
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      background: `linear-gradient(135deg, #FFD700, #FFA500)`,
                      opacity: 0.3
                    }}
                  />
                </div>
                <div>
                  <h3 className={`text-lg font-black tracking-tight ${
                    theme === 'light' ? 'text-gray-900' : 'text-gray-50'
                  }`}>
                    {language === 'ar' ? 'الاشتراك البريميوم' : 'Premium Subscription'}
                  </h3>
                  <div className={`text-xs opacity-70 mt-1 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {isPremium 
                      ? (language === 'ar' ? 'أنت مشترك بريميوم' : 'You are a premium member')
                      : (language === 'ar' ? 'ارفع مستوى تجربتك' : 'Upgrade your experience')
                    }
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
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

          {/* Content */}
          <div className="px-8 py-6 overflow-y-auto flex-1">
            {isPremium ? (
              <div 
                className="relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl"
                style={{
                  background: `linear-gradient(135deg, #FFD70020, #FFA50010)`,
                  border: `2px solid #FFD70030`,
                  boxShadow: `0 8px 32px #FFD70015`
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                  style={{
                    background: `radial-gradient(circle, #FFD700, transparent)`
                  }}
                />
                
                <div className="relative text-center">
                  <div className="text-6xl mb-4">👑</div>
                  <h3 className={`text-2xl font-black mb-2 ${
                    theme === 'light' ? 'text-gray-900' : 'text-gray-50'
                  }`}>
                    {language === 'ar' ? 'أنت مشترك بريميوم!' : 'You are Premium!'}
                  </h3>
                  <p className={`text-sm mb-4 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {language === 'ar' 
                      ? `خطة الاشتراك: ${subscription.plan === 'monthly' ? 'شهري' : 'سنوي'}`
                      : `Plan: ${subscription.plan === 'monthly' ? 'Monthly' : 'Yearly'}`
                    }
                  </p>
                  {subscription.endDate && (
                    <p className={`text-sm mb-6 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {language === 'ar' 
                        ? `ينتهي في: ${new Date(subscription.endDate).toLocaleDateString('ar-EG')}`
                        : `Expires on: ${new Date(subscription.endDate).toLocaleDateString('en-US')}`
                      }
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <div 
                  className="relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(145deg, ${customTheme.colors.surface}80, ${customTheme.colors.background}40)`,
                    border: `2px solid ${customTheme.colors.border}30`,
                    boxShadow: `0 12px 40px ${customTheme.colors.border}20`
                  }}
                >
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-30"
                    style={{
                      background: `radial-gradient(circle, ${customTheme.colors.border}60, transparent)`
                    }}
                  />
                  <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full blur-3xl opacity-20"
                    style={{
                      background: `radial-gradient(circle, ${customTheme.colors.primary}40, transparent)`
                    }}
                  />
                  
                  <div className="relative">
                    <div className="flex items-center space-x-reverse space-x-3 mb-6">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.border}, ${customTheme.colors.surface})`,
                          boxShadow: `0 8px 24px ${customTheme.colors.border}50`
                        }}
                      >
                        <span className="text-2xl">🆓</span>
                      </div>
                      <div>
                        <label className={`text-sm font-black uppercase tracking-widest ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>
                          {language === 'ar' ? 'مجاني' : 'Free'}
                        </label>
                        <p className={`text-xs mt-1 ${
                          theme === 'light' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {language === 'ar' ? 'ابدأ مجاناً' : 'Start for free'}
                        </p>
                      </div>
                    </div>

                    <div className={`text-5xl font-black mb-2 ${
                      theme === 'light' ? 'text-gray-900' : 'text-gray-50'
                    }`}>
                      $0
                    </div>
                    <p className={`text-sm mb-6 font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {language === 'ar' ? 'للأبد' : 'Forever'}
                    </p>

                    <div className={`w-full h-px mb-6 ${
                      theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                    }`} />

                    <ul className={`space-y-3 ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      <li className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                        }`}>
                          <span className="text-sm">✓</span>
                        </div>
                        <span className="font-medium">{language === 'ar' ? 'الميزات الأساسية' : 'Basic features'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                        }`}>
                          <span className="text-sm">✓</span>
                        </div>
                        <span className="font-medium">{language === 'ar' ? 'الوصول المحدود' : 'Limited access'}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Monthly Plan */}
                <div 
                  className="relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(145deg, #5865F230, #7289DA15)`,
                    border: `2px solid #5865F240`,
                    boxShadow: `0 12px 40px #5865F225`
                  }}
                >
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-40"
                    style={{
                      background: `radial-gradient(circle, #5865F2, transparent)`
                    }}
                  />
                  <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full blur-3xl opacity-30"
                    style={{
                      background: `radial-gradient(circle, #7289DA, transparent)`
                    }}
                  />
                  
                  <div className="relative">
                    <div className="flex items-center space-x-reverse space-x-3 mb-6">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, #5865F2, #7289DA)`,
                          boxShadow: `0 8px 24px #5865F250`
                        }}
                      >
                        <span className="text-2xl">⚡</span>
                      </div>
                      <div>
                        <label className={`text-sm font-black uppercase tracking-widest ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>
                          {language === 'ar' ? 'شهري' : 'Monthly'}
                        </label>
                        <p className={`text-xs mt-1 ${
                          theme === 'light' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {language === 'ar' ? 'الأكثر شعبية' : 'Most popular'}
                        </p>
                      </div>
                    </div>

                    <div className={`text-5xl font-black mb-2 ${
                      theme === 'light' ? 'text-gray-900' : 'text-gray-50'
                    }`}>
                      $5
                    </div>
                    <p className={`text-sm mb-6 font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {language === 'ar' ? 'شهرياً' : '/month'}
                    </p>

                    <div className={`w-full h-px mb-6 ${
                      theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                    }`} />

                    <div className={`text-sm mb-4 p-3 rounded-xl font-medium ${
                      theme === 'light' ? 'bg-blue-50 text-blue-700' : 'bg-blue-900/30 text-blue-300'
                    }`}>
                      {language === 'ar' ? 'أو' : 'or'} {MONTHLY_COINS} {language === 'ar' ? 'عملة' : 'coins'}
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleSubscribeMonthlyWithCoins}
                        disabled={isProcessing || coins < MONTHLY_COINS}
                        className={`w-full px-6 py-4 rounded-2xl font-bold transition-all ${
                          isProcessing || coins < MONTHLY_COINS
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:scale-105 active:scale-95'
                        }`}
                        style={{
                          background: isProcessing || coins < MONTHLY_COINS
                            ? 'transparent' 
                            : `linear-gradient(135deg, #5865F2, #7289DA)`,
                          color: isProcessing || coins < MONTHLY_COINS ? customTheme.colors.text : '#ffffff',
                          border: isProcessing || coins < MONTHLY_COINS ? `2px solid ${customTheme.colors.border}30` : 'none',
                          boxShadow: isProcessing || coins < MONTHLY_COINS ? 'none' : `0 8px 32px #5865F240`
                        }}
                      >
                        {isProcessing 
                          ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                          : (language === 'ar' ? `اشتراك بالنقاط (${MONTHLY_COINS})` : `Subscribe with Coins (${MONTHLY_COINS})`)
                        }
                      </button>

                      <button
                        onClick={handleSubscribeMonthlyWithPayment}
                        disabled={isProcessing}
                        className={`w-full px-6 py-4 rounded-2xl font-bold transition-all ${
                          isProcessing
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:scale-105 active:scale-95'
                        }`}
                        style={{
                          background: isProcessing
                            ? 'transparent' 
                            : `linear-gradient(135deg, #10B981, #059669)`,
                          color: isProcessing ? customTheme.colors.text : '#ffffff',
                          border: isProcessing ? `2px solid ${customTheme.colors.border}30` : 'none',
                          boxShadow: isProcessing ? 'none' : `0 8px 32px #10B98140`
                        }}
                      >
                        {isProcessing 
                          ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                          : (language === 'ar' ? 'اشتراك بالدفع ($5)' : 'Subscribe with Payment ($5)')
                        }
                      </button>
                    </div>

                    <div className={`w-full h-px my-6 ${
                      theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                    }`} />

                    <ul className={`space-y-3 ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      <li className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'
                        }`}>
                          <span className="text-sm">✓</span>
                        </div>
                        <span className="font-medium">{language === 'ar' ? 'جميع الميزات المجانية' : 'All free features'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'
                        }`}>
                          <span className="text-sm">✓</span>
                        </div>
                        <span className="font-medium">{language === 'ar' ? 'الميزات البريميوم' : 'Premium features'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'
                        }`}>
                          <span className="text-sm">✓</span>
                        </div>
                        <span className="font-medium">{language === 'ar' ? 'دعم أولوية' : 'Priority support'}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Yearly Plan */}
                <div 
                  className="relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl md:col-span-2 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(145deg, #FFD70030, #FFA50015)`,
                    border: `2px solid #FFD70040`,
                    boxShadow: `0 12px 40px #FFD70025`
                  }}
                >
                  <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-40"
                    style={{
                      background: `radial-gradient(circle, #FFD700, transparent)`
                    }}
                  />
                  <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-30"
                    style={{
                      background: `radial-gradient(circle, #FFA500, transparent)`
                    }}
                  />
                  
                  <div className="relative flex items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center space-x-reverse space-x-3 mb-6">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-110"
                          style={{
                            background: `linear-gradient(135deg, #FFD700, #FFA500)`,
                            boxShadow: `0 8px 24px #FFD70050`
                          }}
                        >
                          <span className="text-2xl">👑</span>
                        </div>
                        <div>
                          <label className={`text-sm font-black uppercase tracking-widest ${
                            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                          }`}>
                            {language === 'ar' ? 'سنوي' : 'Yearly'}
                          </label>
                          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                            theme === 'light' ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/30 text-amber-300'
                          }`}>
                            {language === 'ar' ? 'وفر 33%' : 'Save 33%'}
                          </span>
                        </div>
                      </div>

                      <div className={`text-5xl font-black mb-2 ${
                        theme === 'light' ? 'text-gray-900' : 'text-gray-50'
                      }`}>
                        $40
                      </div>
                      <p className={`text-sm mb-6 font-medium ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {language === 'ar' ? 'سنوياً' : '/year'}
                      </p>

                      <div className={`w-full h-px mb-6 ${
                        theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                      }`} />

                      <div className={`text-sm mb-4 p-3 rounded-xl font-medium ${
                        theme === 'light' ? 'bg-amber-50 text-amber-700' : 'bg-amber-900/30 text-amber-300'
                      }`}>
                        {language === 'ar' ? 'أو' : 'or'} {YEARLY_COINS} {language === 'ar' ? 'عملة' : 'coins'}
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={handleSubscribeYearlyWithCoins}
                          disabled={isProcessing || coins < YEARLY_COINS}
                          className={`w-full px-6 py-4 rounded-2xl font-bold transition-all ${
                            isProcessing || coins < YEARLY_COINS
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:scale-105 active:scale-95'
                          }`}
                          style={{
                            background: isProcessing || coins < YEARLY_COINS
                              ? 'transparent' 
                              : `linear-gradient(135deg, #FFD700, #FFA500)`,
                            color: isProcessing || coins < YEARLY_COINS ? customTheme.colors.text : '#ffffff',
                            border: isProcessing || coins < YEARLY_COINS ? `2px solid ${customTheme.colors.border}30` : 'none',
                            boxShadow: isProcessing || coins < YEARLY_COINS ? 'none' : `0 8px 32px #FFD70040`
                          }}
                        >
                          {isProcessing 
                            ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                            : (language === 'ar' ? `اشتراك بالنقاط (${YEARLY_COINS})` : `Subscribe with Coins (${YEARLY_COINS})`)
                          }
                        </button>

                        <button
                          onClick={handleSubscribeYearlyWithPayment}
                          disabled={isProcessing}
                          className={`w-full px-6 py-4 rounded-2xl font-bold transition-all ${
                            isProcessing
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:scale-105 active:scale-95'
                          }`}
                          style={{
                            background: isProcessing
                              ? 'transparent' 
                              : `linear-gradient(135deg, #10B981, #059669)`,
                            color: isProcessing ? customTheme.colors.text : '#ffffff',
                            border: isProcessing ? `2px solid ${customTheme.colors.border}30` : 'none',
                            boxShadow: isProcessing ? 'none' : `0 8px 32px #10B98140`
                          }}
                        >
                          {isProcessing 
                            ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                            : (language === 'ar' ? 'اشتراك بالدفع ($40)' : 'Subscribe with Payment ($40)')
                          }
                        </button>
                      </div>
                    </div>

                    <div className={`w-px ${
                      theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                    }`} />

                    <ul className={`space-y-3 flex-1 ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      <li className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400'
                        }`}>
                          <span className="text-sm">✓</span>
                        </div>
                        <span className="font-medium">{language === 'ar' ? 'جميع ميزات الشهري' : 'All monthly features'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400'
                        }`}>
                          <span className="text-sm">✓</span>
                        </div>
                        <span className="font-medium">{language === 'ar' ? 'توفير 33%' : 'Save 33%'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400'
                        }`}>
                          <span className="text-sm">✓</span>
                        </div>
                        <span className="font-medium">{language === 'ar' ? 'ميزات حصرية' : 'Exclusive features'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400'
                        }`}>
                          <span className="text-sm">✓</span>
                        </div>
                        <span className="font-medium">{language === 'ar' ? 'دعم VIP' : 'VIP support'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
