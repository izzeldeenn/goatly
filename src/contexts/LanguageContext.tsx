'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

const translations = {
  en: {
    // Timer
    timer: 'Timer',
    stopwatch: 'Stopwatch',
    pomodoro: 'Pomodoro',
    countdown: 'Countdown',
    youtube: 'YouTube Timer',
    // Rankings
    rankings: 'Rankings',
    dailyRankings: 'Daily Rankings',
    noDailyActivity: 'No daily activity recorded yet today',
    noDevices: 'No devices yet',
    active: 'Active',
    today: 'Today',
    coins: 'Coins',
    // Settings
    settings: 'Settings',
    presets: 'Presets',
    profile: 'Profile',
    username: 'UserName',
    appearance: 'Appearance',
    themes: 'Themes',
    backgrounds: 'Backgrounds',
    avatar: 'Avatar',
    statistics: 'Statistics',
    level: 'Level',
    experience: 'Experience',
    rank: 'Rank',
    language: 'Language',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    deviceActive: 'Active Device',
    unknownDevice: 'Unknown Device',
    enterUsername: 'Enter username',
    // Authentication
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    loginSuccess: 'Login successful',
    registerSuccess: 'Registration successful',
    loginFailed: 'Login failed',
    registerFailed: 'Registration failed',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    usernameRequired: 'Username is required',
    invalidEmail: 'Invalid email address',
    passwordTooShort: 'Password must be at least 6 characters',
    emailAlreadyExists: 'Email already registered',
    userNotFound: 'User not found',
    switchAccount: 'Switch Account',
    account: 'Account',
    guestAccount: 'Guest Account',
    loggedInAs: 'Logged in as',
    createAccount: 'Create Account',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    // Common
    coinsText: 'Coins',
    levelText: 'Level',
    timeToday: 'Time Today',
    coinsToday: 'Coins Today',
    points: 'Points',
    up: 'Up',
    down: 'Down',
    // Task Board
    taskBoard: 'Task Board',
    todayTasks: 'Today\'s Tasks',
    tasksForDay: 'Tasks for',
    addTask: 'Add Task',
    newTaskPlaceholder: 'Add a new task...',
    noTasks: 'No tasks for this day',
    addTaskToStart: 'Add a task to get started',
    progress: 'Progress',
    completedAt: 'Completed at',
    todayBtn: 'Today',
    tasks: 'Tasks',
    // Ranking display modes
    bottom_popup: 'Bottom Popup',
    bottom_popup_desc: 'Slides up from bottom of screen',
    side_bar: 'Side Bar',
    side_bar_desc: 'Fixed sidebar on the side',
    floating: 'Floating',
    floating_desc: 'Movable floating window',
    top_popup: 'Top Popup',
    top_popup_desc: 'Slides down from top of screen'
  },
  ar: {
    // Timer
    timer: 'مؤقت',
    stopwatch: 'ساعة إيقاف',
    pomodoro: 'بومودورو',
    countdown: 'عد تنازلي',
    youtube: 'مؤقت يوتيوب',
    // Rankings
    rankings: 'الترتيب',
    dailyRankings: 'الترتيب اليومي',
    noDailyActivity: 'لا يوجد نشاط يومي مسجل اليوم',
    noDevices: 'لا يوجد أجهزة بعد',
    active: 'نشط',
    today: 'اليوم',
    coins: 'عملات',
    // Settings
    settings: 'إعدادات',
    presets: 'الإعدادات المسبقة',
    profile: 'الملف الشخصي',
    username: 'اسم المستخدم',
    appearance: 'المظهر',
    themes: 'الثيمات',
    backgrounds: 'الخلفيات',
    avatar: 'الأفاتار',
    statistics: 'الإحصائيات',
    level: 'مستوى',
    experience: 'خبرة',
    rank: 'ترتيب',
    language: 'اللغة',
    saveChanges: 'حفظ التغييرات',
    cancel: 'إلغاء',
    deviceActive: 'جهاز نشط',
    unknownDevice: 'جهاز غير معروف',
    enterUsername: 'أدخل اسم المستخدم',
    // Authentication
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    registerSuccess: 'تم إنشاء الحساب بنجاح',
    loginFailed: 'فشل تسجيل الدخول',
    registerFailed: 'فشل إنشاء الحساب',
    emailRequired: 'البريد الإلكتروني مطلوب',
    passwordRequired: 'كلمة المرور مطلوبة',
    usernameRequired: 'اسم المستخدم مطلوب',
    invalidEmail: 'عنوان بريد إلكتروني غير صالح',
    passwordTooShort: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    emailAlreadyExists: 'البريد الإلكتروني مسجل بالفعل',
    userNotFound: 'المستخدم غير موجود',
    switchAccount: 'تبديل الحساب',
    account: 'الحساب',
    guestAccount: 'حساب ضيف',
    loggedInAs: 'مسجل الدخول كـ',
    createAccount: 'إنشاء حساب',
    signIn: 'دخول',
    signUp: 'إنشاء حساب',
    // Common
    coinsText: 'عملات',
    levelText: 'مستوى',
    timeToday: 'وقت اليوم',
    coinsToday: 'عملات اليوم',
    points: 'نقاط',
    up: 'صاعد',
    down: 'نازل',
    // Task Board
    taskBoard: 'سبورة المهام',
    todayTasks: 'مهام اليوم',
    tasksForDay: 'مهام يوم',
    addTask: 'إضافة مهمة',
    newTaskPlaceholder: 'أضف مهمة جديدة...',
    noTasks: 'لا توجد مهام لهذا اليوم',
    addTaskToStart: 'أضف مهمة جديدة للبدء',
    progress: 'التقدم',
    completedAt: 'تم الإكمال في',
    todayBtn: 'اليوم',
    tasks: 'المهام',
    // Ranking display modes
    bottom_popup: 'منبثق من الأسفل',
    bottom_popup_desc: 'ينزلق من أسفل الشاشة',
    side_bar: 'شريط جانبي',
    side_bar_desc: 'شريط ثابت على الجانب',
    floating: 'عائم',
    floating_desc: 'نافذة عائمة قابلة للتحريك',
    top_popup: 'منبثق من الأعلى',
    top_popup_desc: 'ينزلق من أعلى الشاشة'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fahman_hub_language', lang);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('fahman_hub_language') as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const t = translations[language];
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
