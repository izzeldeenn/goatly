'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { landingTexts } from '@/constants/landingTexts';
import { discordOTPDB, supabase } from '@/lib/supabase';
import { ReferralCard } from '@/components/referral/ReferralCard';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionsModal({ isOpen, onClose }: QuickActionsModalProps) {
  const { theme } = useTheme();
  const { getCurrentUser } = useUser();
  const { language } = useLanguage();
  const texts = landingTexts[language];
  const customTheme = useCustomThemeClasses();

  const currentUser = getCurrentUser();

  // Active tab state - default to referral
  const [activeTab, setActiveTab] = useState<'referral' | 'discord'>('referral');

  // Discord OTP state
  const [discordOTP, setDiscordOTP] = useState('');
  const [discordOTPExpiry, setDiscordOTPExpiry] = useState<number>(0);
  const [discordOTPTimeLeft, setDiscordOTPTimeLeft] = useState(0);
  const [isDiscordLinked, setIsDiscordLinked] = useState(false);

  // Generate OTP valid for 5 minutes
  const generateDiscordOTP = async () => {
    const user = getCurrentUser();
    if (!user?.hashKey) return;

    // Generate OTP using database
    const otpCode = await discordOTPDB.generateOTP(user.hashKey);
    if (otpCode) {
      setDiscordOTP(otpCode);
      setDiscordOTPExpiry(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    }
  };

  // Update OTP countdown
  useEffect(() => {
    const updateCountdown = () => {
      if (discordOTPExpiry > 0) {
        const timeLeft = Math.max(0, Math.floor((discordOTPExpiry - Date.now()) / 1000));
        setDiscordOTPTimeLeft(timeLeft);

        if (timeLeft === 0) {
          setDiscordOTP('');
          setDiscordOTPExpiry(0);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [discordOTPExpiry]);

  // Check if Discord is linked on mount
  useEffect(() => {
    if (currentUser?.hashKey) {
      // Check from database
      discordOTPDB.getOTP(currentUser.hashKey).then(async (otpData) => {
        if (otpData) {
          setDiscordOTP(otpData.otp_code);
          setDiscordOTPExpiry(new Date(otpData.expires_at).getTime());
        }

        // Check if Discord is linked
        const { data } = await supabase
          .from('users')
          .select('discord_linked')
          .eq('hash_key', currentUser.hashKey)
          .maybeSingle();

        if (data) {
          setIsDiscordLinked(data.discord_linked || false);
        }
      });
    }
  }, [currentUser?.hashKey]);

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
        <div className="flex h-[85vh] flex-row overflow-hidden">
          {/* Sidebar */}
          <div
            className="w-20 relative overflow-hidden flex-shrink-0"
            style={{
              background: `linear-gradient(180deg, ${customTheme.colors.primary}06 0%, transparent 100%)`,
              borderLeft: `1px solid ${customTheme.colors.border}20`
            }}
          >
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-30"
              style={{
                background: `radial-gradient(circle, ${customTheme.colors.primary}, transparent)`
              }}
            />

            <div className="relative p-4 flex flex-col h-full gap-4">
              {/* Referral Tab - Default */}
              <button
                onClick={() => setActiveTab('referral')}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                  activeTab === 'referral' ? 'scale-110' : 'scale-100 opacity-60 hover:opacity-100'
                }`}
                style={{
                  background: activeTab === 'referral'
                    ? `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                    : customTheme.colors.surface + '40',
                  boxShadow: activeTab === 'referral'
                    ? `0 8px 32px ${customTheme.colors.primary}50`
                    : `0 4px 16px ${customTheme.colors.border}20`
                }}
                title={language === 'ar' ? 'دعوة الأصدقاء' : 'Invite Friends'}
              >
                <span className="text-2xl">🎁</span>
                {activeTab === 'referral' && (
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                      animation: 'shimmer 3s infinite'
                    }}
                  />
                )}
              </button>

              {/* Discord Tab */}
              <button
                onClick={() => setActiveTab('discord')}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                  activeTab === 'discord' ? 'scale-110' : 'scale-100 opacity-60 hover:opacity-100'
                }`}
                style={{
                  background: activeTab === 'discord'
                    ? `linear-gradient(135deg, #5865F2, #7289DA)`
                    : customTheme.colors.surface + '40',
                  boxShadow: activeTab === 'discord'
                    ? `0 8px 32px #5865F250`
                    : `0 4px 16px ${customTheme.colors.border}20`
                }}
                title={language === 'ar' ? 'ربط Discord' : 'Discord Linking'}
              >
                <span className="text-2xl">🎮</span>
                {activeTab === 'discord' && (
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                      animation: 'shimmer 3s infinite'
                    }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
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
                  <div>
                    <h3 className={`text-lg font-black tracking-tight ${
                      theme === 'light' ? 'text-gray-900' : 'text-gray-50'
                    }`}>
                      {activeTab === 'referral' 
                        ? texts.referral 
                        : (language === 'ar' ? 'ربط Discord' : 'Discord Linking')
                    }
                    </h3>
                    <div className={`text-xs opacity-70 mt-1 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {activeTab === 'referral'
                        ? (language === 'ar' ? 'ادعُ أصدقاءك واكسب مكافآت' : 'Invite friends and earn rewards')
                        : (language === 'ar' ? 'اربط حسابك بديسكورد' : 'Link your account to Discord')
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
              {activeTab === 'referral' && (
                <div 
                  className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl"
                  style={{
                    background: `linear-gradient(135deg, ${customTheme.colors.surface}60, ${customTheme.colors.background}20)`,
                    border: `1px solid ${customTheme.colors.border}20`,
                    boxShadow: `0 8px 32px ${customTheme.colors.border}15`
                  }}
                >
                  <div className="absolute top-0 left-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                    style={{
                      background: `radial-gradient(circle, ${customTheme.colors.accent}, transparent)`
                    }}
                  />
                  
                  <div className="relative">
                    <ReferralCard />
                  </div>
                </div>
              )}

              {activeTab === 'discord' && (
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
                    {/* Link Status */}
                    <div className={`mb-4 p-4 rounded-2xl ${
                      isDiscordLinked 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-gray-500/10 border border-gray-500/30'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isDiscordLinked ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                          {isDiscordLinked 
                            ? (language === 'ar' ? '✓ الحساب مربوط' : '✓ Account Linked') 
                            : (language === 'ar' ? 'الحساب غير مربوط' : 'Account Not Linked')
                          }
                        </span>
                      </div>
                    </div>

                    {/* Hash Key Display */}
                    <div className="mb-4">
                      <label className={`text-xs font-medium mb-2 block ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {language === 'ar' ? 'مفتاح Hash الخاص بك:' : 'Your Hash Key:'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={currentUser?.hashKey || ''}
                          readOnly
                          className="w-full px-4 py-3 rounded-xl font-mono text-sm"
                          style={{
                            backgroundColor: customTheme.colors.surface + '40',
                            color: customTheme.colors.text,
                            border: `2px solid ${customTheme.colors.border}30`
                          }}
                        />
                      </div>
                    </div>

                    {/* OTP Generation */}
                    <button
                      onClick={generateDiscordOTP}
                      disabled={discordOTP !== '' || isDiscordLinked}
                      className={`w-full px-6 py-3 rounded-xl font-medium transition-all ${
                        discordOTP !== '' || isDiscordLinked
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:scale-105 active:scale-95'
                      }`}
                      style={{
                        background: discordOTP !== '' || isDiscordLinked
                          ? 'transparent' 
                          : `linear-gradient(135deg, #5865F2, #7289DA)`,
                        color: discordOTP !== '' || isDiscordLinked ? customTheme.colors.text : '#ffffff',
                        border: discordOTP !== '' || isDiscordLinked ? `2px solid ${customTheme.colors.border}30` : 'none',
                        boxShadow: discordOTP !== '' || isDiscordLinked ? 'none' : `0 8px 32px #5865F240`
                      }}
                    >
                      {isDiscordLinked 
                        ? (language === 'ar' ? 'الحساب مربوط' : 'Account Linked')
                        : (discordOTP !== '' 
                          ? (language === 'ar' ? 'تم توليد الرمز' : 'OTP Generated')
                          : (language === 'ar' ? 'توليد رمز OTP' : 'Generate OTP Code'))
                      }
                    </button>

                    {discordOTP && (
                      <div className="mt-4 space-y-3">
                        <div className={`text-center p-4 rounded-2xl ${
                          discordOTPTimeLeft < 60 
                            ? 'bg-red-500/10 border border-red-500/30' 
                            : 'bg-blue-500/10 border border-blue-500/30'
                        }`}>
                          <div className={`text-3xl font-black font-mono tracking-wider mb-2 ${
                            discordOTPTimeLeft < 60 ? 'text-red-500' : 'text-blue-500'
                          }`}>
                            {discordOTP}
                          </div>
                          <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            {language === 'ar' 
                              ? `ينتهي خلال ${Math.floor(discordOTPTimeLeft / 60)}:${(discordOTPTimeLeft % 60).toString().padStart(2, '0')}`
                              : `Expires in ${Math.floor(discordOTPTimeLeft / 60)}:${(discordOTPTimeLeft % 60).toString().padStart(2, '0')}`
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
