'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { validatePasswordStrength } from '@/utils/password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, isLoggedIn, getCurrentUser } = useUser();
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const customTheme = useCustomThemeClasses();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] } | null>(null);

  // Validate password as user types (only for registration)
  useEffect(() => {
    if (!isLogin && password) {
      const validation = validatePasswordStrength(password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [password, isLogin]);

  // If user is already logged in, don't show the modal
  if (isLoggedIn || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        // For account upgrade, use current username and only ask for email and password
        const currentUser = getCurrentUser();
        const currentUsername = currentUser?.username || 'مستخدم';
        result = await register(email, password, currentUsername);
      }

      if (result.success) {
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
        setUsername('');
      } else {
        setError(result.error || (isLogin ? 'Login failed' : 'Account upgrade failed'));
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
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
          <div className="flex items-center justify-between">
            <h3 className={`text-2xl font-bold ${
              theme === 'light' ? 'text-gray-800' : 'text-gray-100'
            }`}>
              {isLogin ? 'تسجيل الدخول' : 'ترقية الحساب'}
            </h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: customTheme.colors.text
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = customTheme.colors.primary;
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = customTheme.colors.text;
              }}
            >
              ✕
            </button>
          </div>
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
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
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

          {!isLogin && (
            <div className="mb-4 p-3 rounded-xl"
                 style={{ backgroundColor: customTheme.colors.surface + '20' }}>
              <div className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                سيتم الحفاظ على اسم المستخدم الحالي: 
              </div>
              <div className={`font-medium mt-1 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                {getCurrentUser()?.username || 'مستخدم'}
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="mb-4 p-3 rounded-xl text-sm"
                 style={{ 
                   backgroundColor: passwordValidation?.isValid ? '#dcfce7' : '#fee2e2',
                   border: `1px solid ${passwordValidation?.isValid ? '#bbf7d0' : '#fecaca'}`,
                   color: passwordValidation?.isValid ? '#166534' : '#dc2626'
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
              {passwordValidation && passwordValidation.errors.length > 0 && (
                <div className="mt-2 pt-2 border-t border-current/20">
                  {passwordValidation.errors.map((error, index) => (
                    <div key={index} className="text-xs">• {error}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className={`block mb-2 text-sm font-medium ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              required
              minLength={8}
              maxLength={128}
              className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
              style={{
                backgroundColor: customTheme.colors.surface,
                borderColor: passwordValidation && !passwordValidation.isValid ? '#dc2626' : customTheme.colors.border,
                color: customTheme.colors.text
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = customTheme.colors.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = passwordValidation && !passwordValidation.isValid ? '#dc2626' : customTheme.colors.border;
              }}
            />
          </div>

          <div className="flex space-x-3 space-x-reverse pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-all"
              style={{
                backgroundColor: customTheme.colors.surface,
                color: customTheme.colors.text,
                border: `2px solid ${customTheme.colors.border}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = customTheme.colors.border;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = customTheme.colors.surface;
              }}
            >
              إلغاء
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{
                background: `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`,
                color: '#ffffff',
                border: `2px solid ${customTheme.colors.primary}`
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = `linear-gradient(to right, ${customTheme.colors.accent}, ${customTheme.colors.primary})`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`;
              }}
            >
              {loading ? 'جاري المعالجة...' : (isLogin ? 'دخول' : 'ترقية الحساب')}
            </button>
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm font-medium transition-colors"
              style={{ color: customTheme.colors.primary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {isLogin ? 'ترقية حسابك الحالي؟' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
