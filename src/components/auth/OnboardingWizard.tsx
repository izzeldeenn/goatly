'use client';

import { useState } from 'react';
import { DEFAULT_PRESETS, UserPreset, applyPreset, getDefaultPreset } from '@/constants/defaultPresets';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { useUser } from '@/contexts/UserContext';

interface OnboardingWizardProps {
  onComplete?: () => void;
  isOpen: boolean;
}

export function OnboardingWizard({ onComplete, isOpen }: OnboardingWizardProps) {
  const { theme } = useTheme();
  const customTheme = useCustomThemeClasses();
  const { updateUserName } = useUser();
  const [step, setStep] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<UserPreset>(getDefaultPreset());
  const [username, setUsername] = useState('');

  const steps = [
    { title: 'مرحباً!', description: 'دعنا نعد شكل التطبيق لك' },
    { title: 'اختر شكلك', description: 'اختر الإعدادات المسبقة التي تناسبك' },
    { title: 'اسمك', description: 'كيف نناديك؟' },
    { title: 'نظام العملات', description: 'اكتشف كيف تكسب عملات ومستويات' },
    { title: 'الترتيب والإحصائيات', description: 'تتبع تقدمك وتنافس مع الآخرين' },
    { title: 'المؤقت الذكي', description: 'استخدم أدوات الدراسة الفعالة' },
    { title: 'جاهز!', description: 'تم إعداد كل شيء بنجاح' }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    // Apply selected preset
    applyPreset(selectedPreset);
    
    // Save username if provided
    if (username.trim()) {
      updateUserName(username.trim());
    }
    
    // Mark onboarding as complete
    localStorage.setItem('onboardingComplete', 'true');
    
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingComplete', 'true');
    onComplete?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
          border: `2px solid ${customTheme.colors.border}20`
        }}
      >
        {/* Header */}
        <div 
          className="p-6 border-b"
          style={{ borderColor: customTheme.colors.border + '20' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
              >
                {steps[step].title}
              </h2>
              <p 
                className="text-sm opacity-75"
                style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
              >
                {steps[step].description}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-sm opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: customTheme.colors.text }}
            >
              تخطي
            </button>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: index <= step ? customTheme.colors.primary : customTheme.colors.border + '30'
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 0 && (
            <div className="text-center py-8">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
                style={{
                  background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                  boxShadow: `0 8px 32px ${customTheme.colors.primary}40`
                }}
              >
                🎉
              </div>
              <h3 
                className="text-xl font-bold mb-4"
                style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
              >
                أهلاً بك في تطبيقك!
              </h3>
              <p 
                className="text-base opacity-75 mb-8 max-w-md mx-auto"
                style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
              >
                سأقوم بإعداد التطبيق بشكل مثالي لك. لنستغرق فقط دقيقة واحدة لتخصيص تجربتك.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="py-4">
              <h3 
                className="text-lg font-bold mb-6 text-center"
                style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
              >
                اختر الشكل الذي يناسبك
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEFAULT_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedPreset.id === preset.id ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{
                      borderColor: selectedPreset.id === preset.id ? customTheme.colors.primary : customTheme.colors.border + '30',
                      backgroundColor: theme === 'light' ? '#f9fafb' : '#374151'
                    }}
                    onClick={() => setSelectedPreset(preset)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{
                          background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                        }}
                      >
                        {preset.icon}
                      </div>
                      <div>
                        <h4 
                          className="font-bold"
                          style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                        >
                          {preset.name}
                        </h4>
                        <p 
                          className="text-xs opacity-75"
                          style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                        >
                          {preset.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 text-xs">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.settings.timer.color }}
                        title="لون المؤقت"
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ 
                          borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                          backgroundColor: preset.settings.theme === 'light' ? '#ffffff' : '#1f2937'
                        }}
                        title="الوضع"
                      />
                      <span 
                        className="px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: customTheme.colors.primary + '20',
                          color: customTheme.colors.primary
                        }}
                      >
                        {preset.settings.background === 'default' ? 'بسيط' : 'صورة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-8">
              <h3 
                className="text-lg font-bold mb-6 text-center"
                style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
              >
                ما اسمك؟
              </h3>
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسمك (اختياري)"
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-300 text-center"
                  style={{
                    backgroundColor: customTheme.colors.surface + '40',
                    color: customTheme.colors.text,
                    border: `2px solid ${customTheme.colors.border}30`
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.backgroundColor = customTheme.colors.surface + '80';
                    e.currentTarget.style.borderColor = customTheme.colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.backgroundColor = customTheme.colors.surface + '40';
                    e.currentTarget.style.borderColor = customTheme.colors.border + '30';
                  }}
                />
                <p 
                  className="text-sm opacity-60 text-center mt-4"
                  style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                >
                  يمكنك ترك هذا الحقل فارغاً وإكماله لاحقاً
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-8">
              <h3 
                className="text-lg font-bold mb-6 text-center"
                style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
              >
                نظام العملات والمكافآت
              </h3>
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                    }}
                  >
                    🪙
                  </div>
                  <div>
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                    >
                      العملات الذهبية
                    </h4>
                    <p 
                      className="text-sm opacity-75"
                      style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                    >
                      تكسب عملات ذهبية مع كل دقيقة دراسة. كل 10 دقائق = 1 عملة ذهبية!
                      استخدمها لفتح ميزات جديدة وشراء مكافآت من المتجر.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                    }}
                  >
                    🎯
                  </div>
                  <div>
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                    >
                      المستويات والخبرة
                    </h4>
                    <p 
                      className="text-sm opacity-75"
                      style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                    >
                      مع كل عملة تكسبها، تزداد خبرتك. كل 100 نقطة خبرة = مستوى جديد!
                      المستويات العالية تفتح ميزات حصرية وتظهر ترتيبك في المتصدرين.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                    }}
                  >
                    ⚡
                  </div>
                  <div>
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                    >
                      التحديات اليومية
                    </h4>
                    <p 
                      className="text-sm opacity-75"
                      style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                    >
                      أكمل تحديات يومية في السلوكيات والعادات والمشاعر لكسب عملات إضافية.
                      سلسلة الأيام المتتالية تضاعف مكافآتك!
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl text-center ${
                  theme === 'light' ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-900/20 border-yellow-700'
                }`} style={{ border: '2px solid' }}>
                  <p 
                    className="text-sm font-bold"
                    style={{ color: theme === 'light' ? '#d97706' : '#fbbf24' }}
                  >
                    💡 نصيحة: الدراسة المنتظمة تكسب عملات أكثر من الجلسات الطويلة المتقطعة!
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-8">
              <h3 
                className="text-lg font-bold mb-6 text-center"
                style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
              >
                الترتيب والإحصائيات
              </h3>
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                    }}
                  >
                    🏆
                  </div>
                  <div>
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                    >
                      لوحة المتصدرين
                    </h4>
                    <p 
                      className="text-sm opacity-75"
                      style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                    >
                      تنافس مع جميع المستخدمين واحتل المراكز الأولى!
                      الترتيب يعتمد على مجموع عملاتك ومستواك وسلسلة أيام الدراسة.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                    }}
                  >
                    📊
                  </div>
                  <div>
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                    >
                      إحصائيات مفصلة
                    </h4>
                    <p 
                      className="text-sm opacity-75"
                      style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                    >
                      تتبع وقت الدراسة اليومي، الأسبوعي، والشهري.
                      راقب أدائك عبر رسوم بيانية تفاعلية واكتشف أنماط دراستك.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                    }}
                  >
                    🔥
                  </div>
                  <div>
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                    >
                      سلسلة الأيام
                    </h4>
                    <p 
                      className="text-sm opacity-75"
                      style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                    >
                      حافظ على سلسلة أيام الدراسة المتتالية!
                      كل يوم دراسة يزيد من سلسلتك ويكسبك مكافآت إضافية.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className={`p-3 rounded-lg text-center ${
                    theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'
                  }`}>
                    <div className="text-2xl mb-1">🥇</div>
                    <div 
                      className="text-xs font-bold"
                      style={{ color: theme === 'light' ? '#1e40af' : '#60a5fa' }}
                    >
                      المركز الأول
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${
                    theme === 'light' ? 'bg-purple-50' : 'bg-purple-900/20'
                  }`}>
                    <div className="text-2xl mb-1">📈</div>
                    <div 
                      className="text-xs font-bold"
                      style={{ color: theme === 'light' ? '#7c3aed' : '#a78bfa' }}
                    >
                      نمو الأداء
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${
                    theme === 'light' ? 'bg-green-50' : 'bg-green-900/20'
                  }`}>
                    <div className="text-2xl mb-1">🎯</div>
                    <div 
                      className="text-xs font-bold"
                      style={{ color: theme === 'light' ? '#059669' : '#34d399' }}
                    >
                      الأهداف اليومية
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="py-8">
              <h3 
                className="text-lg font-bold mb-6 text-center"
                style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
              >
                المؤقت الذكي وأدوات الدراسة
              </h3>
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                    }}
                  >
                    ⏱️
                  </div>
                  <div>
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                    >
                      تقنية بومودورو
                    </h4>
                    <p 
                      className="text-sm opacity-75"
                      style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                    >
                      25 دقيقة دراسة + 5 دقائق راحة. الطريقة المثبتة لزيادة التركيز والإنتاجية.
                      مؤقتنا يتتبع تلقائياً جلساتك ويحفظ وقتك.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                    }}
                  >
                    🎵
                  </div>
                  <div>
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                    >
                      موسيقى للتركيز
                    </h4>
                    <p 
                      className="text-sm opacity-75"
                      style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                    >
                      مشغل موسيقى مدمج مع قوائم تشغيل مخصصة للدراسة.
                      موسيقى خلفية هادئة تساعد على التركيز العميق.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                    }}
                  >
                    📝
                  </div>
                  <div>
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                    >
                      ملاحظات سريعة
                    </h4>
                    <p 
                      className="text-sm opacity-75"
                      style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                    >
                      سجل ملاحظاتك وأفكارك أثناء الدراسة.
                      ملاحظات لاصقة تفاعلية يمكنك سحبها وتنظيمها.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`
                    }}
                  >
                    🌙
                  </div>
                  <div>
                    <h4 
                      className="font-bold mb-2"
                      style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                    >
                      وضع ملء الشاشة
                    </h4>
                    <p 
                      className="text-sm opacity-75"
                      style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                    >
                      دراسة بدون تشتيت مع وضع ملء الشاشة.
                      يمنع الإشعارات ويحافظ على الشاشة نشطة.
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl text-center ${
                  theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/20 border-blue-700'
                }`} style={{ border: '2px solid' }}>
                  <p 
                    className="text-sm font-bold"
                    style={{ color: theme === 'light' ? '#1e40af' : '#60a5fa' }}
                  >
                    ⚡ سر النجاح: استخدم تقنية بومودورو مع موسيقى التركيز لأفضل النتائج!
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="text-center py-8">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
                style={{
                  background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                  boxShadow: `0 8px 32px ${customTheme.colors.primary}40`
                }}
              >
                🚀
              </div>
              <h3 
                className="text-xl font-bold mb-4"
                style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
              >
                أنت جاهز للبدء!
              </h3>
              
              <div className="space-y-3 mb-6 max-w-md mx-auto">
                <p 
                  className="text-base opacity-75"
                  style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                >
                  ✅ تم تطبيق إعدادات: <span className="font-bold">{selectedPreset.name}</span>
                </p>
                {username && (
                  <p 
                    className="text-base opacity-75"
                    style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                  >
                    ✅ أهلاً بك: <span className="font-bold">{username}</span>
                </p>
                )}
                <p 
                  className="text-base opacity-75"
                  style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                >
                  ✅ نظام العملات والمكافآت مفعل
                </p>
                <p 
                  className="text-base opacity-75"
                  style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                >
                  ✅ الترتيب والإحصائيات جاهزة
                </p>
                <p 
                  className="text-base opacity-75"
                  style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}
                >
                  ✅ أدوات الدراسة الذكية متاحة
                </p>
              </div>

              <div className={`p-4 rounded-xl mb-6 ${
                theme === 'light' ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gradient-to-r from-blue-900/20 to-purple-900/20'
              }`}>
                <h4 
                  className="font-bold mb-2"
                  style={{ color: theme === 'light' ? '#1f2937' : '#f9fafb' }}
                >
                  🎯 نصائح للبدء القوي:
                </h4>
                <div className="text-sm space-y-1 text-right" style={{ color: theme === 'light' ? '#6b7280' : '#d1d5db' }}>
                  <p>• ابدأ بجلسة بومودورو 25 دقيقة</p>
                  <p>• حافظ على سلسلة أيام الدراسة</p>
                  <p>• أكمل التحديات اليومية للحصول على عملات إضافية</p>
                  <p>• تابع تقدمك في لوحة الترتيب</p>
                </div>
              </div>

              <p 
                className="text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})` 
                }}
              >
                هيا بنا نحقق أهدافك! 🌟
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-6 border-t flex justify-between"
          style={{ borderColor: customTheme.colors.border + '20' }}
        >
          <button
            onClick={handlePrevious}
            disabled={step === 0}
            className="px-6 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
            style={{
              backgroundColor: customTheme.colors.surface + '40',
              color: customTheme.colors.text,
              border: `1px solid ${customTheme.colors.border}30`
            }}
          >
            السابق
          </button>
          
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-xl font-medium transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
              color: '#ffffff',
              boxShadow: `0 4px 16px ${customTheme.colors.primary}40`
            }}
          >
            {step === steps.length - 1 ? 'بدء الاستخدام' : 'التالي'}
          </button>
        </div>
      </div>
    </div>
  );
}
