'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { validatePasswordStrength } from '@/utils/password';
import { landingTexts } from '@/constants/landingTexts';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const texts = landingTexts[language];
  const { theme } = useTheme();
  const customTheme = useCustomThemeClasses();
  
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] } | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('رابط إعادة التعيين غير صالح أو منتهي الصلاحية');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  // Validate password as user types
  useEffect(() => {
    if (password) {
      const validation = validatePasswordStrength(password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('رابط إعادة التعيين غير صالح');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (!passwordValidation?.isValid) {
      setError('كلمة المرور لا تفي بالمتطلبات');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setError(result.error || 'فشل إعادة تعيين كلمة المرور');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" 
           style={{ backgroundColor: customTheme.colors.background }}>
        <div className={`w-full max-w-md rounded-3xl shadow-2xl p-8 text-center ${
          theme === 'light' ? 'bg-white' : 'bg-gray-900'
        }`}
        style={{ border: `2px solid ${customTheme.colors.border}` }}
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-100'
          }`}>
            تم إعادة التعيين بنجاح!
          </h2>
          <p className={`mb-6 ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            سيتم توجيهك إلى صفحة تسجيل الدخول خلال ثوانٍ...
          </p>
          <div className="animate-pulse">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{ backgroundColor: customTheme.colors.background }}>
      <div className={`w-full max-w-md rounded-3xl shadow-2xl ${
        theme === 'light' ? 'bg-white' : 'bg-gray-900'
      }`}
      style={{ border: `2px solid ${customTheme.colors.border}` }}
      >
        <div 
          className="p-6 border-b"
          style={{
            background: `linear-gradient(to right, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
            borderColor: customTheme.colors.border
          }}
        >
          <h2 className={`text-2xl font-bold text-center ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-100'
          }`}>
            إعادة تعيين كلمة المرور
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-red-600 text-sm" 
                 style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <div>
            <label className={`block mb-2 text-sm font-medium ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة"
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all disabled:opacity-50"
              style={{
                backgroundColor: customTheme.colors.surface,
                borderColor: customTheme.colors.border,
                color: customTheme.colors.text
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = customTheme.colors.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = customTheme.colors.border;
              }}
            />
          </div>

          <div>
            <label className={`block mb-2 text-sm font-medium ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور"
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all disabled:opacity-50"
              style={{
                backgroundColor: customTheme.colors.surface,
                borderColor: customTheme.colors.border,
                color: customTheme.colors.text
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = customTheme.colors.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = customTheme.colors.border;
              }}
            />
          </div>

          {passwordValidation && (
            <div className="mb-4 p-3 rounded-xl text-sm"
                 style={{ 
                   backgroundColor: passwordValidation.isValid ? '#dcfce7' : '#fee2e2',
                   border: `1px solid ${passwordValidation.isValid ? '#bbf7d0' : '#fecaca'}`,
                   color: passwordValidation.isValid ? '#166534' : '#dc2626'
                 }}>
              <div className="font-medium mb-1">
                متطلبات كلمة المرور:
              </div>
              <ul className="text-xs space-y-1">
                <li className={password?.length >= 8 ? 'line-through opacity-50' : ''}>
                  • 8 أحرف على الأقل
                </li>
                <li className={/[A-Z]/.test(password) ? 'line-through opacity-50' : ''}>
                  • حرف كبير واحد على الأقل (A-Z)
                </li>
                <li className={/[a-z]/.test(password) ? 'line-through opacity-50' : ''}>
                  • حرف صغير واحد على الأقل (a-z)
                </li>
                <li className={/\d/.test(password) ? 'line-through opacity-50' : ''}>
                  • رقم واحد على الأقل (0-9)
                </li>
                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'line-through opacity-50' : ''}>
                  • رمز خاص واحد على الأقل (!@#$%^&*)
                </li>
              </ul>
              {passwordValidation.errors.length > 0 && (
                <div className="mt-2 pt-2 border-t border-current/20">
                  {passwordValidation.errors.map((error, index) => (
                    <div key={index} className="text-xs">• {error}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword || !passwordValidation?.isValid}
            className="w-full py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading || !password || !confirmPassword || !passwordValidation?.isValid ? '#ccc' : customTheme.colors.primary,
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              if (!loading && password && confirmPassword && passwordValidation?.isValid) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري إعادة التعيين...
              </div>
            ) : (
              'إعادة تعيين كلمة المرور'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className={`text-sm ${
                theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
              } transition-colors`}
            >
              العودة إلى تسجيل الدخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { language } = useLanguage();
  const texts = landingTexts[language];
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{texts.loading}</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
