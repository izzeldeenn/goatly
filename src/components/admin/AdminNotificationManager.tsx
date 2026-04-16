'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { socialDB, AdminNotificationRequest, NotificationTemplate } from '@/lib/social';

export function AdminNotificationManager() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { getCurrentUser } = useUser();
  const currentUser = getCurrentUser();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'admin_announcement' | 'system_update' | 'maintenance' | 'welcome'>('admin_announcement');
  const [targetUsers, setTargetUsers] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; sentCount?: number } | null>(null);
  const [stats, setStats] = useState<{ total: number; sent: number; read: number; unread: number } | null>(null);

  // Check admin status and load templates
  useEffect(() => {
    const initializeAdmin = async () => {
      if (!currentUser) {
        console.log('No current user found');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('Current user:', currentUser);
      console.log('User account ID:', currentUser.accountId);

      try {
        const adminStatus = await socialDB.isAdmin();
        console.log('Admin status result:', adminStatus);
        setIsAdmin(adminStatus);

        if (adminStatus) {
          console.log('User is admin, loading templates and stats...');
          const [templatesData, statsData] = await Promise.all([
            socialDB.getNotificationTemplates(),
            socialDB.getNotificationStats()
          ]);
          
          console.log('Templates loaded:', templatesData);
          console.log('Stats loaded:', statsData);
          
          setTemplates(templatesData);
          setStats(statsData);
        } else {
          console.log('User is NOT admin');
        }
      } catch (error) {
        console.error('Error initializing admin panel:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAdmin();
  }, [currentUser?.accountId]);

  const handleSendNotification = async () => {
    if (!message.trim()) {
      setResult({ success: false, message: language === 'ar' ? 'الرجاء إدخال رسالة الإشعار' : 'Please enter notification message' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const request: AdminNotificationRequest = {
        message: message.trim(),
        type: notificationType,
        sendToAll,
        targetUsers: sendToAll ? undefined : targetUsers.split(',').map(u => u.trim()).filter(u => u)
      };

      const response = await socialDB.sendAdminNotification(request);
      
      if (response.success) {
        setResult({ 
          success: true, 
          message: language === 'ar' 
            ? `تم إرسال الإشعار بنجاح إلى ${response.sentCount} مستخدم` 
            : `Notification sent successfully to ${response.sentCount} users`,
          sentCount: response.sentCount 
        });
        setMessage('');
        setTargetUsers('');
        
        // Refresh stats
        const newStats = await socialDB.getNotificationStats();
        setStats(newStats);
      } else {
        setResult({ success: false, message: response.error || 'Unknown error occurred' });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setResult({ success: false, message: 'Failed to send notification' });
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) {
      setSelectedTemplate('');
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.message);
      setNotificationType(template.type);
      setSelectedTemplate(templateId);
    }
  };

  const handleCreateTemplate = async () => {
    const templateName = prompt(language === 'ar' ? 'أدخل اسم القالب' : 'Enter template name');
    if (!templateName || !message.trim()) return;

    try {
      const newTemplate = await socialDB.createNotificationTemplate({
        name: templateName,
        message: message.trim(),
        type: notificationType
      });

      if (newTemplate) {
        setTemplates([newTemplate, ...templates]);
        setResult({ 
          success: true, 
          message: language === 'ar' ? 'تم إنشاء القالب بنجاح' : 'Template created successfully' 
        });
      }
    } catch (error) {
      console.error('Error creating template:', error);
      setResult({ success: false, message: 'Failed to create template' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-12 h-12 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <span className={`ml-3 text-lg font-medium ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`text-center py-16 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
        theme === 'light' 
          ? 'bg-white/95 border border-gray-200/60 shadow-sm shadow-gray-500/10' 
          : 'bg-gray-900/95 border border-gray-800/60 shadow-xl shadow-black/20'
      }`}>
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
          theme === 'light' ? 'bg-red-100' : 'bg-red-900/30'
        }`}>
          <svg className={`w-8 h-8 ${theme === 'light' ? 'text-red-500' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.148V8.148c0-1.481-1.962-3.148-3.502-3.148H5.502C3.962 5 2 6.667 2 8.148v10.704c0 1.481 1.962 3.148 3.502 3.148h13.856z" />
          </svg>
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
          {language === 'ar' ? 'وصول غير مصرح به' : 'Access Denied'}
        </h2>
        <p className={`text-lg ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          {language === 'ar' ? 'هذه الصفحة متاحة فقط للمسؤولين' : 'This page is only available to administrators'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden -z-10">
        <div className={`absolute top-10 left-10 w-32 h-32 rounded-full blur-2xl ${
          theme === 'light' ? 'bg-red-400' : 'bg-red-300'
        }`}></div>
        <div className={`absolute bottom-20 right-20 w-24 h-24 rounded-full blur-xl ${
          theme === 'light' ? 'bg-orange-400' : 'bg-orange-300'
        }`}></div>
      </div>

      {/* Header */}
      <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
        theme === 'light' 
          ? 'bg-white/95 border-gray-200/60 shadow-sm shadow-gray-500/10' 
          : 'bg-gray-900/95 border-gray-800/60 shadow-xl shadow-black/20'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text transition-all duration-300 ${
              theme === 'light' 
                ? 'from-red-600 via-orange-600 to-yellow-600 text-transparent' 
                : 'from-red-400 via-orange-400 to-yellow-400 text-transparent'
            }`}>
              {language === 'ar' ? 'مدير الإشعارات' : 'Notification Manager'}
            </h1>
            <p className={`text-sm font-medium transition-colors duration-300 mt-1 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {language === 'ar' ? 'إرسال إشعارات للمستخدمين' : 'Send notifications to users'}
            </p>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/30 border-blue-700'
            }`}>
              <div className={`text-2xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                {stats.total}
              </div>
              <div className={`text-sm mt-1 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                {language === 'ar' ? 'الإجمالي' : 'Total'}
              </div>
            </div>
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              theme === 'light' ? 'bg-green-50 border-green-200' : 'bg-green-900/30 border-green-700'
            }`}>
              <div className={`text-2xl font-bold ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}>
                {stats.read}
              </div>
              <div className={`text-sm mt-1 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}>
                {language === 'ar' ? 'مقروء' : 'Read'}
              </div>
            </div>
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              theme === 'light' ? 'bg-orange-50 border-orange-200' : 'bg-orange-900/30 border-orange-700'
            }`}>
              <div className={`text-2xl font-bold ${theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`}>
                {stats.unread}
              </div>
              <div className={`text-sm mt-1 ${theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`}>
                {language === 'ar' ? 'غير مقروء' : 'Unread'}
              </div>
            </div>
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              theme === 'light' ? 'bg-purple-50 border-purple-200' : 'bg-purple-900/30 border-purple-700'
            }`}>
              <div className={`text-2xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                {Math.round((stats.read / stats.total) * 100) || 0}%
              </div>
              <div className={`text-sm mt-1 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                {language === 'ar' ? 'معدل القراءة' : 'Read Rate'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Form */}
      <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
        theme === 'light' 
          ? 'bg-white/95 border-gray-200/60 shadow-sm shadow-gray-500/10' 
          : 'bg-gray-900/95 border-gray-800/60 shadow-xl shadow-black/20'
      }`}>
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {language === 'ar' ? 'قالب الإشعار' : 'Notification Template'}
            </label>
            <div className="flex gap-2">
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    : 'bg-gray-800 border-gray-600 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800'
                }`}
              >
                <option value="">{language === 'ar' ? 'اختر قالب' : 'Select template'}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateTemplate}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  theme === 'light'
                    ? 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
                    : 'bg-purple-900/30 text-purple-400 hover:bg-purple-800/40 border border-purple-700'
                }`}
              >
                {language === 'ar' ? 'حفظ كقالب' : 'Save as Template'}
              </button>
            </div>
          </div>

          {/* Notification Type */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {language === 'ar' ? 'نوع الإشعار' : 'Notification Type'}
            </label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value as any)}
              className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  : 'bg-gray-800 border-gray-600 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800'
              }`}
            >
              <option value="admin_announcement">{language === 'ar' ? 'إعلان إداري' : 'Admin Announcement'}</option>
              <option value="system_update">{language === 'ar' ? 'تحديث النظام' : 'System Update'}</option>
              <option value="maintenance">{language === 'ar' ? 'صيانة' : 'Maintenance'}</option>
              <option value="welcome">{language === 'ar' ? 'ترحيب' : 'Welcome'}</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {language === 'ar' ? 'رسالة الإشعار' : 'Notification Message'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={language === 'ar' ? 'أدخل رسالة الإشعار...' : 'Enter notification message...'}
              className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  : 'bg-gray-800 border-gray-600 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800'
              }`}
            />
          </div>

          {/* Target Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {language === 'ar' ? 'المستهدفون' : 'Target Users'}
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={sendToAll}
                  onChange={() => setSendToAll(true)}
                  className="mr-2"
                />
                <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>
                  {language === 'ar' ? 'جميع المستخدمين' : 'All Users'}
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!sendToAll}
                  onChange={() => setSendToAll(false)}
                  className="mr-2"
                />
                <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>
                  {language === 'ar' ? 'مستخدمين محددين' : 'Specific Users'}
                </span>
              </label>
            </div>
            {!sendToAll && (
              <input
                type="text"
                value={targetUsers}
                onChange={(e) => setTargetUsers(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل معرفات المستخدمين مفصولة بفواصل' : 'Enter user IDs separated by commas'}
                className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                  theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    : 'bg-gray-800 border-gray-600 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800'
                }`}
              />
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendNotification}
            disabled={sending || !message.trim()}
            className={`w-full py-3 rounded-lg text-base font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'light'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-400/25'
            }`}
          >
            {sending ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin mr-2"></div>
                {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
              </div>
            ) : (
              language === 'ar' ? 'إرسال الإشعار' : 'Send Notification'
            )}
          </button>
        </div>

        {/* Result Message */}
        {result && (
          <div className={`mt-4 p-4 rounded-lg border transition-all duration-300 ${
            result.success
              ? theme === 'light'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-green-900/30 border-green-700 text-green-300'
              : theme === 'light'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>
            <div className="flex items-center">
              {result.success ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 00016zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 0l-2 2a1 1 0 001.414 1.414L8 10.414l2.293 2.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 00016zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{result.message}</span>
              {result.sentCount && (
                <span className="ml-2 text-sm opacity-75">
                  ({result.sentCount} {language === 'ar' ? 'مستخدم' : 'users'})
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
