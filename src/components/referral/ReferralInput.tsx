'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useCoins } from '@/contexts/CoinsContext';
import { referralDB, userDB } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export function ReferralInput() {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const { getCurrentUser } = useUser();
  const { addCoins } = useCoins();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const currentUser = getCurrentUser();
    if (!currentUser?.accountId) {
      setError(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You must log in first');
      return;
    }

    if (!referralCode || referralCode.length !== 8) {
      setError(language === 'ar' ? 'كود الإحالة يجب أن يكون 8 أحرف' : 'Referral code must be 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Check if user has already been referred
      const hasBeenReferred = await referralDB.hasUserBeenReferred(currentUser.accountId);
      if (hasBeenReferred) {
        setError(language === 'ar' ? 'لقد استخدمت بالفعل كود إحالة' : 'You have already used a referral code');
        setLoading(false);
        return;
      }

      // Get referrer user by referral code
      const referrerUser = await referralDB.getUserByReferralCode(referralCode);
      if (!referrerUser) {
        setError(language === 'ar' ? 'كود الإحالة غير صحيح' : 'Invalid referral code');
        setLoading(false);
        return;
      }

      // Check if user is trying to refer themselves
      if (referrerUser.account_id === currentUser.accountId) {
        setError(language === 'ar' ? 'لا يمكنك استخدام كود الإحالة الخاص بك' : 'You cannot use your own referral code');
        setLoading(false);
        return;
      }

      // Create referral record
      const newReferral = await referralDB.createReferral(
        referrerUser.account_id,
        currentUser.accountId,
        referralCode
      );

      if (!newReferral) {
        setError(language === 'ar' ? 'حدث خطأ أثناء إنشاء الإحالة' : 'Error creating referral');
        setLoading(false);
        return;
      }

      // Add 40 coins to referrer using CoinsContext
      // Note: This adds coins to the current user (the person using the referral code)
      await addCoins(40, 'referral', 'Referral bonus', newReferral.id);

      setSuccess(true);
      setReferralCode('');
      setLoading(false);
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl p-6 ${
      theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
    }`}>
      <h3 className={`text-lg font-bold mb-4 ${
        theme === 'light' ? 'text-gray-900' : 'text-white'
      }`}>
        {language === 'ar' ? 'أدخل كود الإحالة' : 'Enter Referral Code'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder={language === 'ar' ? 'كود الإحالة (8 أحرف)' : 'Referral code (8 characters)'}
            maxLength={8}
            className={`flex-1 px-4 py-3 rounded-xl border-2 font-mono tracking-wider uppercase ${
              theme === 'light'
                ? 'border-gray-300 bg-gray-50 text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                : 'border-gray-600 bg-gray-700 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-900'
            }`}
            disabled={loading || success}
          />
          <button
            type="submit"
            disabled={loading || success || !referralCode}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              loading || success
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : theme === 'light'
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {loading ? (
              <span>{language === 'ar' ? 'جاري...' : 'Loading...'}</span>
            ) : success ? (
              <span>{language === 'ar' ? 'تم!' : 'Done!'}</span>
            ) : (
              <span>{language === 'ar' ? 'تأكيد' : 'Confirm'}</span>
            )}
          </button>
        </div>

        {error && (
          <p className={`mt-3 text-sm ${
            theme === 'light' ? 'text-red-600' : 'text-red-400'
          }`}>
            {error}
          </p>
        )}

        {success && (
          <p className={`mt-3 text-sm ${
            theme === 'light' ? 'text-green-600' : 'text-green-400'
          }`}>
            {language === 'ar'
              ? 'تم إضافة 40 نقطة بنجاح!'
              : 'Successfully added 40 points!'}
          </p>
        )}
      </form>

      <p className={`mt-4 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
        {language === 'ar'
          ? 'أدخل كود الإحالة من صديق للحصول على 40 نقطة!'
          : 'Enter a referral code from a friend to get 40 points!'}
      </p>
    </div>
  );
}
