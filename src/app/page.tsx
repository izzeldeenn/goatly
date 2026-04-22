'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageLayout } from '@/components/ui/LanguageLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CustomThemeProvider } from '@/contexts/CustomThemeContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { landingTexts, features, testimonials, stats } from '@/constants/landingTexts';
import { useGitHubStars } from '@/hooks/useGitHubStars';
import { useRealTimeStats } from '@/hooks/useRealTimeStats';
import { GoatlyStructuredData } from '@/components/seo/StructuredData';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <CustomThemeProvider>
      {isLoading && <LoadingSpinner onComplete={() => setIsLoading(false)} />}
      <LandingPageContent />
    </CustomThemeProvider>
  );
}

function LandingPageContent() {
  const { theme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const customTheme = useCustomThemeClasses();
  const { stars, loading: starsLoading } = useGitHubStars();
  const realTimeStats = useRealTimeStats();
  
  const texts = landingTexts[language];
  const currentFeatures = features[language];
  const currentTestimonials = testimonials[language];
  
  // Create dynamic stats based on real data
  const currentStats = [
    { 
      number: realTimeStats.loading ? '...' : realTimeStats.totalUsers.toLocaleString() + '+', 
      labelKey: 'activeStudents' as const 
    },
    { 
      number: realTimeStats.loading ? '...' : realTimeStats.totalFocusHours.toLocaleString() + '+', 
      labelKey: 'focusHours' as const 
    },
    { 
      number: realTimeStats.loading ? '...' : realTimeStats.totalGoalsAchieved.toLocaleString() + '+', 
      labelKey: 'levelsCompleted' as const 
    },
    { 
      number: realTimeStats.loading ? '...' : realTimeStats.communitySuccessRate + '%', 
      labelKey: 'userSatisfaction' as const 
    }
  ];

  return (
    <LanguageLayout>
      <GoatlyStructuredData />
      <div className={`min-h-screen ${
        theme === 'light' ? 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100' : 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900'
      }`}>
        {/* Header */}
        <header className={`fixed top-0 w-full z-50 backdrop-blur-lg border-b ${
          theme === 'light' 
            ? 'bg-white/80 border-gray-200' 
            : 'bg-black border-gray-800'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo - Mobile Optimized */}
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/goat.png" 
                    alt="شعار Goatly - مجتمع مفتوح المصدر للدراسة الجماعية" 
                    className="w-10 h-10 object-contain"
                  />
                  <div className="flex flex-col">
                    <div className="text-xl font-bold tracking-tight">
                      <span className={`inline-block font-black ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        Goatly
                      </span>
                    </div>
                    <div className={`text-xs font-medium tracking-wide ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      great of all time
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                <a href="#features" className={`transition-colors hover:text-blue-600 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {texts.features}
                </a>
                <a href="#testimonials" className={`transition-colors hover:text-blue-600 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {texts.reviews}
                </a>
                <a href="#community" className={`transition-colors hover:text-blue-600 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {texts.community}
                </a>
                <a href="/extension" className={`transition-colors hover:text-blue-600 font-semibold ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {texts.browserExtensionLink}
                </a>
              </nav>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
                <a 
                  href="https://github.com/izzeldeenn/goatly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
                    theme === 'light'
                      ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      : 'bg-slate-800 border-gray-700 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                    {starsLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <>
                        ⭐ {stars.toLocaleString()}
                      </>
                    )}
                  </span>
                </a>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    theme === 'light'
                      ? 'bg-yellow-50 border-lime-300 text-lime-800'
                      : 'bg-slate-800 border-purple-600 text-purple-200'
                  }`}
                >
                  <option value="en">EN</option>
                  <option value="ar">العربية</option>
                </select>
                <ThemeToggle />
                <a
                  href="/focus"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
                    theme === 'light'
                      ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <span>{texts.startFreeStudy}</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </a>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-all ${
                  theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <div className={`w-6 h-0.5 transition-all ${
                  theme === 'light' ? 'bg-gray-700' : 'bg-gray-300'
                } ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <div className={`w-6 h-0.5 mt-1.5 transition-all ${
                  theme === 'light' ? 'bg-gray-700' : 'bg-gray-300'
                } ${isMenuOpen ? 'opacity-0' : ''}`} />
                <div className={`w-6 h-0.5 mt-1.5 transition-all ${
                  theme === 'light' ? 'bg-gray-700' : 'bg-gray-300'
                } ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 ${
            isMenuOpen ? 'max-h-90 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <div className={`px-4 py-4 border-t ${
              theme === 'light' ? 'border-gray-200' : 'border-gray-800'
            }`}>
              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-3 mb-4">
                <a 
                  href="#features" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg transition-colors text-center ${
                    theme === 'light' ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-200 hover:bg-slate-800'
                  }`}
                >
                  {texts.features}
                </a>
                <a 
                  href="#testimonials" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg transition-colors text-center ${
                    theme === 'light' ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-200 hover:bg-slate-800'
                  }`}
                >
                  {texts.reviews}
                </a>
                <a 
                  href="#community" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg transition-colors text-center ${
                    theme === 'light' ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-200 hover:bg-slate-800'
                  }`}
                >
                  {texts.community}
                </a>
              </nav>
              
              {/* Mobile Actions */}
              <div className="flex flex-col gap-3">
                <a 
                  href="https://github.com/izzeldeenn/goatly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    theme === 'light'
                      ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      : 'bg-slate-800 border-gray-700 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                    {starsLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <>
                        ⭐ {stars.toLocaleString()}
                      </>
                    )}
                  </span>
                </a>
                <div className="flex items-center justify-center gap-3">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      theme === 'light'
                        ? 'bg-yellow-50 border-lime-300 text-lime-800'
                        : 'bg-slate-800 border-purple-600 text-purple-200'
                    }`}
                  >
                    <option value="en">EN</option>
                    <option value="ar">العربية</option>
                  </select>
                  <ThemeToggle />
                </div>
                <a
                  href="/focus"
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    theme === 'light'
                      ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <span>{texts.startFreeStudy}</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className={`relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 ${
          theme === 'light' 
            ? 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100' 
            : 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900'
        }`}>
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Grid Pattern */}
            <div className={`absolute inset-0 ${
              theme === 'light' 
                ? 'bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:6rem_6rem]' 
                : 'bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:6rem_6rem]'
            }`}></div>
            
            {/* Gradient Overlays */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gray-400/10 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-right">
                <div className="mb-6">
                  <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${
                    theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {texts.newFeature}
                  </span>
                </div>

                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
                   theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  <span className="block">{texts.heroTitle}</span>
                  <span className="block">{texts.heroSubtitle}</span>
                </h1>

                <p className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto lg:ml-auto ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {texts.heroDescription}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end mb-12">
                  <a
                    href="/focus"
                    className="group px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <span className="flex items-center gap-2">
                      {texts.startFreeStudy}
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </a>
                  <a
                    href="https://www.youtube.com/@goatly-space"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all transform hover:scale-105 flex items-center justify-center ${
                      theme === 'light'
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'border-gray-600 text-white hover:bg-gray-800'
                    }`}
                  >
                    {texts.watchDemo}
                  </a>
                </div>
              </div>
              
              {/* Right Content - Stats Cards */}
              <div className="grid grid-cols-2 gap-6">
                {currentStats.map((stat, index) => (
                  <div key={index} className={`group p-6 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl'
                      : 'bg-white/90 backdrop-blur-sm border border-gray-700 shadow-lg hover:shadow-xl'
                  }`}>
                    <div className={`text-3xl sm:text-4xl font-bold ${
                      theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                    } mb-2`}>
                      {stat.number}
                    </div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {texts[stat.labelKey as keyof typeof texts]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {texts.exceptionalFeatures}
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {texts.featuresDescription}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className={`relative z-10 text-5xl mb-6 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {texts[feature.key as keyof typeof texts]}
                  </h3>
                  <p className={`${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {texts[(feature.key + 'Desc') as keyof typeof texts]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Browser Extension Section */}
        <section id="extension" className={`py-20 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gradient-to-br from-gray-50 to-slate-100' : 'bg-gradient-to-br from-slate-800 to-gray-900'
        }`}>
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-gray-200'
              }`}>
                {texts.browserExtensionTitle}
              </span>
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              <span className={`bg-gradient-to-r bg-clip-text ${
                theme === 'light' ? 'from-blue-600 to-gray-600 text-transparent' : 'from-blue-400 to-gray-400 text-transparent'
              }`}>
                {texts.browserExtensionTitle}
              </span>
            </h2>
            <p className={`text-xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {texts.browserExtensionDescription}
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className={`p-6 rounded-xl ${
                theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-800 shadow-lg'
              }`}>
                <div className="text-4xl mb-4">🚫</div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.smartSiteBlocking}
                </h3>
                <p className={`text-gray-600 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {texts.smartSiteBlockingDesc}
                </p>
              </div>
              <div className={`p-6 rounded-xl ${
                theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-800 shadow-lg'
              }`}>
                <div className="text-4xl mb-4">⏰</div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.focusTimer}
                </h3>
                <p className={`text-gray-600 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {texts.focusTimerDesc}
                </p>
              </div>
              <div className={`p-6 rounded-xl ${
                theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-800 shadow-lg'
              }`}>
                <div className="text-4xl mb-4">📊</div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.analyticsDashboard}
                </h3>
                <p className={`text-gray-600 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {texts.analyticsDashboardDesc}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href="/extension"
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                  theme === 'light'
                    ? 'bg-gradient-to-r from-blue-600 to-gray-700 text-white hover:from-blue-700 hover:to-gray-800'
                    : 'bg-gradient-to-r from-blue-500 to-gray-600 text-white hover:from-blue-600 hover:to-gray-700'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                </svg>
                 {texts.installExtension}
              </a>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-lg">{'⭐'}</span>
                  ))}
                </div>
                <span className={`font-semibold ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {texts.extensionRating}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-900/50'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {texts.whatStudentsSay}
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {texts.testimonialsDescription}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {currentTestimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
                  }`}
                >
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xl">⭐</span>
                    ))}
                  </div>
                  <p className={`mb-6 text-lg ${
                    theme === 'light' ? 'text-gray-800' : 'text-gray-300'
                  }`}>
                    "{texts[testimonial.contentKey as keyof typeof texts]}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold`}>
                      {texts[testimonial.nameKey as keyof typeof texts].charAt(0)}
                    </div>
                    <div>
                      <div className={`font-bold ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        {texts[testimonial.nameKey as keyof typeof texts]}
                      </div>
                      <div className={`text-sm ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {texts[testimonial.roleKey as keyof typeof texts]}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section id="community" className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100' : 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {texts.githubTitle}
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {texts.githubDescription}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* GitHub Card */}
              <div
                className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  theme === 'light'
                    ? 'bg-white border border-gray-200 hover:shadow-xl'
                    : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
                }`}
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-black rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {texts.githubRepository}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {texts.githubSubtitle}
                    </p>
                  </div>
                </div>
                <p className={`mb-6 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {texts.githubDescription}
                </p>
                <div className="flex gap-4">
                  <a 
                    href="https://github.com/izzeldeenn/goatly"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 bg-gradient-to-r from-gray-700 to-black text-white text-center"
                  >
                    {texts.contribute}
                  </a>
                </div>
              </div>
              
              {/* Discord Card */}
              <div 
                className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  theme === 'light' 
                    ? 'bg-lime-50 border border-lime-200 hover:shadow-xl' 
                    : 'bg-slate-800/50 border border-purple-700/50 hover:shadow-2xl'
                }`}
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      theme === 'light' ? 'text-lime-900' : 'text-purple-100'
                    }`}>
                      {texts.discordCommunity}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {texts.discordSubtitle}
                    </p>
                  </div>
                </div>
                <p className={`mb-6 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {texts.discordDescription}
                </p>
                <div className="flex gap-4">
                  <a 
                    href="https://discord.gg/5wBNne8Z3f"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center"
                  >
                    {texts.joinDiscord}
                  </a>
                </div>
              </div>
            </div>
            
            <div className={`text-center p-8 rounded-lg ${
              theme === 'light'
                ? 'bg-gradient-to-r from-gray-100 to-slate-100 border border-gray-200'
                : 'bg-gradient-to-r from-slate-800 to-gray-900 border border-gray-700'
            }`}>
              <h3 className={`text-2xl font-bold mb-4 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {texts.supportCommunity}
              </h3>
              <p className={`mb-6 max-w-2xl mx-auto ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                {texts.contributionText}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://github.com/izzeldeenn/goatly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center"
                >
                  {texts.startContributing}
                </a>
                <a 
                  href="https://discord.gg/5wBNne8Z3f"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-8 py-3 rounded-lg font-semibold border-2 transition-all transform hover:scale-105 text-center ${
                    theme === 'light'
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-600 text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  {texts.joinDiscussion}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-gray-700" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              {texts.readyToStart}
            </h2>
            <p className="text-xl mb-8 text-white/90">
              {texts.ctaDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="/focus"
                className="group px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 bg-white text-blue-600 hover:bg-gray-50"
              >
                <span className="flex items-center gap-2 justify-center">
                  {texts.startStudyingNow}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-16 px-4 sm:px-6 lg:px-8 border-t ${
          theme === 'light'
            ? 'bg-gray-50 border-gray-200'
            : 'bg-slate-900 border-gray-800'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-reverse space-x-2 mb-4">
                 
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-3 space-x-reverse">
        <img 
          src="/goat.png" 
          alt="شعار Goatly - مجتمع مفتوح المصدر للدراسة الجماعية" 
          className="w-10 h-10 object-contain"
        />
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold tracking-tight">
            <span className={`inline-block font-black ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    Goatly
                  </span>
          </div>
          <div className={`text-xs mt-1 font-medium tracking-wider ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            great of all time
          </div>
        </div>
      </div>
    </div>
                </div>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {texts.tagline}
                </p>
              </div>

              <div>
                <h4 className={`font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.product}
                </h4>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  <li className={`cursor-pointer transition-colors ${
                    theme === 'light' ? 'hover:text-blue-600' : 'hover:text-blue-400'
                  }`}>
                    {texts.features}
                  </li>
                  <li className={`cursor-pointer transition-colors ${
                    theme === 'light' ? 'hover:text-blue-600' : 'hover:text-blue-400'
                  }`}>
                    {texts.pricing}
                  </li>
                  <li className={`cursor-pointer transition-colors ${
                    theme === 'light' ? 'hover:text-blue-600' : 'hover:text-blue-400'
                  }`}>
                    {texts.blog}
                  </li>
                  <li className={`cursor-pointer transition-colors ${
                    theme === 'light' ? 'hover:text-blue-600' : 'hover:text-blue-400'
                  }`}>
                    {texts.support}
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className={`font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.company}
                </h4>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  <li className={`cursor-pointer transition-colors ${
                    theme === 'light' ? 'hover:text-blue-600' : 'hover:text-blue-400'
                  }`}>
                    {texts.aboutUs}
                  </li>
                  <li className={`cursor-pointer transition-colors ${
                    theme === 'light' ? 'hover:text-blue-600' : 'hover:text-blue-400'
                  }`}>
                    {texts.team}
                  </li>
                  <li className={`cursor-pointer transition-colors ${
                    theme === 'light' ? 'hover:text-blue-600' : 'hover:text-blue-400'
                  }`}>
                    {texts.careers}
                  </li>
                  <li className={`cursor-pointer transition-colors ${
                    theme === 'light' ? 'hover:text-blue-600' : 'hover:text-blue-400'
                  }`}>
                    {texts.contact}
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className={`font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.follow}
                </h4>
                <div className="flex gap-4 text-2xl">
                  <span className="cursor-pointer hover:scale-110 transition-transform">📱</span>
                  <span className="cursor-pointer hover:scale-110 transition-transform">💬</span>
                  <span className="cursor-pointer hover:scale-110 transition-transform">📧</span>
                  <span className="cursor-pointer hover:scale-110 transition-transform">🐦</span>
                </div>
              </div>
            </div>
            
            {/* Ethical Digital Economy Framework Section */}
            <div className={`mt-8 pt-8 border-t ${
              theme === 'light'
                ? 'border-gray-200'
                : 'border-gray-800'
            }`}>
              <div className={`text-center mb-6 p-6 rounded-lg ${
                theme === 'light'
                  ? 'bg-gray-50/50 border border-gray-200'
                  : 'bg-slate-800/50 border border-gray-700'
              }`}>
                <p className={`text-sm font-medium mb-3 ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                }`}>
                  {texts.ethicalFramework}
                </p>
                <a
                  href="https://github.com/sahwa-foundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-blue-500 to-gray-600 text-white hover:shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-gray-700 text-white hover:shadow-lg'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  {texts.sahwafoundationLink}
                </a>
              </div>
            </div>
            
            <div className={`pt-4 border-t text-center text-sm ${
              theme === 'light'
                ? 'border-gray-200 text-gray-600'
                : 'border-gray-800 text-gray-400'
            }`}>
              {texts.copyright}
            </div>
          </div>
        </footer>
      </div>
    </LanguageLayout>
  );
}
