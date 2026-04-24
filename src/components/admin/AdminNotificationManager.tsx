'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { socialDB, AdminNotificationRequest, NotificationTemplate } from '@/lib/social';

export function AdminNotificationManager() {
  const { language } = useLanguage();
  const { currentAdmin } = useAdmin();

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

  // Load templates and stats
  useEffect(() => {
    const initializeData = async () => {
      try {
        const [templatesData, statsData] = await Promise.all([
          socialDB.getNotificationTemplates(),
          socialDB.getNotificationStats()
        ]);
        
        setTemplates(templatesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error initializing notification manager:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

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
        <div className="w-12 h-12 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <span className="ml-3 text-lg font-medium text-gray-400">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {language === 'ar' ? 'مدير الإشعارات' : 'Notification Manager'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {language === 'ar' ? 'إرسال إشعارات للمستخدمين' : 'Send notifications to users'}
            </p>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-black p-4 rounded-lg border border-gray-800">
              <div className="text-2xl font-bold text-blue-400">
                {stats.total}
              </div>
              <div className="text-sm mt-1 text-blue-400">
                {language === 'ar' ? 'الإجمالي' : 'Total'}
              </div>
            </div>
            <div className="bg-black p-4 rounded-lg border border-gray-800">
              <div className="text-2xl font-bold text-green-400">
                {stats.read}
              </div>
              <div className="text-sm mt-1 text-green-400">
                {language === 'ar' ? 'مقروء' : 'Read'}
              </div>
            </div>
            <div className="bg-black p-4 rounded-lg border border-gray-800">
              <div className="text-2xl font-bold text-orange-400">
                {stats.unread}
              </div>
              <div className="text-sm mt-1 text-orange-400">
                {language === 'ar' ? 'غير مقروء' : 'Unread'}
              </div>
            </div>
            <div className="bg-black p-4 rounded-lg border border-gray-800">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round((stats.read / stats.total) * 100) || 0}%
              </div>
              <div className="text-sm mt-1 text-purple-400">
                {language === 'ar' ? 'معدل القراءة' : 'Read Rate'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Form */}
      <div className="bg-black rounded-lg p-6 border border-gray-800">
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              {language === 'ar' ? 'قالب الإشعار' : 'Notification Template'}
            </label>
            <div className="flex gap-2">
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="flex-1 px-4 py-2 rounded-md border bg-gray-800 border-gray-700 text-white focus:border-gray-600 focus:ring-2 focus:ring-gray-600"
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
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
              >
                {language === 'ar' ? 'حفظ كقالب' : 'Save as Template'}
              </button>
            </div>
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              {language === 'ar' ? 'نوع الإشعار' : 'Notification Type'}
            </label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value as any)}
              className="w-full px-4 py-2 rounded-md border bg-gray-800 border-gray-700 text-white focus:border-gray-600 focus:ring-2 focus:ring-gray-600"
            >
              <option value="admin_announcement">{language === 'ar' ? 'إعلان إداري' : 'Admin Announcement'}</option>
              <option value="system_update">{language === 'ar' ? 'تحديث النظام' : 'System Update'}</option>
              <option value="maintenance">{language === 'ar' ? 'صيانة' : 'Maintenance'}</option>
              <option value="welcome">{language === 'ar' ? 'ترحيب' : 'Welcome'}</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              {language === 'ar' ? 'رسالة الإشعار' : 'Notification Message'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={language === 'ar' ? 'أدخل رسالة الإشعار...' : 'Enter notification message...'}
              className="w-full px-4 py-2 rounded-md border bg-gray-800 border-gray-700 text-white focus:border-gray-600 focus:ring-2 focus:ring-gray-600"
            />
          </div>

          {/* Target Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
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
                <span className="text-gray-300">
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
                <span className="text-gray-300">
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
                className="w-full px-4 py-2 rounded-md border bg-gray-800 border-gray-700 text-white focus:border-gray-600 focus:ring-2 focus:ring-gray-600"
              />
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendNotification}
            disabled={sending || !message.trim()}
            className="w-full py-3 rounded-md text-base font-medium bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className={`mt-4 p-4 rounded-md border ${
            result.success
              ? 'bg-gray-800 border-green-700 text-green-400'
              : 'bg-gray-800 border-red-700 text-red-400'
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
