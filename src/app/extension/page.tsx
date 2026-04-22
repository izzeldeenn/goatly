'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageLayout } from '@/components/ui/LanguageLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CustomThemeProvider } from '@/contexts/CustomThemeContext';
import { extensionTexts, extensionFeatures, extensionTestimonials, browserStats } from '@/constants/extensionTexts';
import { landingTexts } from '@/constants/landingTexts';

export default function ExtensionLandingPage() {
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
      <ExtensionLandingPageContent />
    </CustomThemeProvider>
  );
}

function ExtensionLandingPageContent() {
  const { theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const texts = extensionTexts[language];
  const landingTextsObj = landingTexts[language];
  const currentFeatures = extensionFeatures[language];
  const currentTestimonials = extensionTestimonials[language];
  const currentStats = browserStats[language];

  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Chrome') > -1) return 'chrome';
    if (userAgent.indexOf('Firefox') > -1) return 'firefox';
    if (userAgent.indexOf('Edg') > -1) return 'edge';
    if (userAgent.indexOf('Safari') > -1) return 'safari';
    return 'chrome';
  };

  const currentBrowser = detectBrowser();

  const getExtensionLink = (browser: string) => {
    const links = {
      chrome: 'https://chrome.google.com/webstore',
      firefox: 'https://addons.mozilla.org/firefox',
      edge: 'https://microsoftedge.microsoft.com/addons',
      safari: 'https://apps.apple.com'
    };
    return links[browser as keyof typeof links] || links.chrome;
  };

  const getBrowserIcon = (browser: string) => {
    const icons = {
      chrome: 'Chrome',
      firefox: 'Firefox',
      edge: 'Edge',
      safari: 'Safari'
    };
    return icons[browser as keyof typeof icons] || 'Chrome';
  };

  return (
    <LanguageLayout>
      <div className={`min-h-screen ${
        theme === 'light' ? 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100' : 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900'
      }`}>
        {/* Header */}
        <header className={`fixed top-0 w-full z-50 backdrop-blur-lg border-b ${
          theme === 'light'
            ? 'bg-white/80 border-gray-200'
            : 'bg-slate-900/90 border-gray-800'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo - Mobile Optimized */}
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/goat.png" 
                    alt="Mr Goatly" 
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
                      Focus Extension
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
                <a href="#browsers" className={`transition-colors hover:text-blue-600 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {texts.browsers}
                </a>
                <a href="#testimonials" className={`transition-colors hover:text-blue-600 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {texts.reviews}
                </a>
              </nav>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    theme === 'light'
                      ? 'bg-gray-100 border-gray-300 text-gray-800'
                      : 'bg-slate-800 border-gray-700 text-gray-300'
                  }`}
                >
                  <option value="en">EN</option>
                  <option value="ar">{landingTextsObj.arabic}</option>
                </select>
                <ThemeToggle />
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
            isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
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
                  href="#browsers"
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg transition-colors text-center ${
                    theme === 'light' ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-200 hover:bg-slate-800'
                  }`}
                >
                  {texts.browsers}
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
              </nav>
              
              {/* Mobile Actions */}
              <div className="flex items-center justify-center gap-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    theme === 'light'
                      ? 'bg-gray-200 border-gray-400 text-gray-700'
                      : 'bg-gray-700 border-gray-600 text-gray-300'
                  }`}
                >
                  <option value="en">EN</option>
                  <option value="ar">{landingTextsObj.arabic}</option>
                </select>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section - Enhanced Extension Store Style */}
        <section className={`relative py-20 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100' : 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Extension Info */}
              <div className="order-2 lg:order-1">
                {/* Trust Badges */}
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                    theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-blue-900 text-blue-200'
                  }`}>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    {texts.featured}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-gray-200'
                  }`}>
                    {texts.categoryProductivity}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-gray-200'
                  }`}>
                    {texts.categoryFocus}
                  </span>
                </div>

                {/* Extension Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                    theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                  }`}>
                    <img src="/goat.png" alt="Goatly" className="w-14 h-14 object-contain" />
                  </div>
                  <div className="flex-1">
                    <h1 className={`text-4xl font-bold mb-3 ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      Goatly Focus
                    </h1>
                    <div className="flex items-center gap-6 mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-500 text-xl">{'⭐'}</span>
                        ))}
                        <span className={`ml-2 font-semibold ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>
                          4.8
                        </span>
                      </div>
                      <span className={`font-semibold ${
                        theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        {texts.usersCount}
                      </span>
                    </div>
                    <div className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {texts.ratingText}
                    </div>
                  </div>
                </div>

                {/* Extension Description */}
                <div className={`mb-8 space-y-4 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  <p className="text-lg leading-relaxed">
                    {texts.heroDescription1}
                  </p>
                  <p className="text-lg leading-relaxed">
                    {texts.heroDescription2}
                  </p>
                </div>

                {/* Enhanced Installation Button */}
                <div className="mb-8">
                  <a 
                    href={getExtensionLink(currentBrowser)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                      theme === 'light'
                        ? 'bg-gradient-to-r from-blue-600 to-gray-700 text-white hover:from-blue-700 hover:to-gray-800'
                        : 'bg-gradient-to-r from-blue-500 to-gray-600 text-white hover:from-blue-600 hover:to-gray-700'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                    </svg>
                    {texts.addToBrowserFree} {getBrowserIcon(currentBrowser)} {texts.itsFree}
                  </a>
                  <div className="flex items-center gap-6 mt-3">
                    <p className={`text-sm flex items-center gap-1 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      {texts.freeNoAds}
                    </p>
                    <span className={`text-sm ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      •
                    </span>
                    <p className={`text-sm flex items-center gap-1 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      {texts.privacySecurity}
                    </p>
                  </div>
                </div>

                {/* Enhanced Developer Info */}
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                  theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-gray-800 border-gray-700'
                }`}>
                  <span className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {texts.offeredBy}
                  </span>
                  <a href="#" className={`text-sm font-semibold hover:underline flex items-center gap-1 ${
                    theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
                  }`}>
                    {texts.GoatlyTeam}
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Right Column - Enhanced Extension Preview */}
              <div className="order-1 lg:order-2">
                <div className={`relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 ${
                  theme === 'light' ? 'bg-white' : 'bg-gray-800'
                }`}>
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 opacity-10 ${
                    theme === 'light' 
                      ? 'bg-gradient-to-br from-blue-400 to-purple-400' 
                      : 'bg-gradient-to-br from-blue-600 to-purple-600'
                  }`}></div>
                  
                  <div className={`relative aspect-video flex items-center justify-center ${
                    theme === 'light' ? 'bg-gradient-to-br from-blue-50 via-white to-purple-50' : 'bg-gradient-to-br from-gray-800 via-gray-700 to-blue-800'
                  }`}>
                    <div className="text-center p-8">
                      <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg animate-bounce ${
                        theme === 'light' 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                          : 'bg-gradient-to-br from-blue-600 to-purple-700'
                      }`}>
                        <img src="/goat.png" alt="Goatly Extension" className="w-16 h-16 object-contain filter brightness-0 invert" />
                      </div>
                      <h3 className={`text-2xl font-bold mb-3 ${
                        theme === 'light' ? 'text-gray-800' : 'text-white'
                      }`}>
                        {texts.extensionTitle}
                      </h3>
                      <p className={`text-base mb-4 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {texts.screenshotsDesc}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${
                            theme === 'light' ? 'bg-blue-400' : 'bg-blue-500'
                          } animate-pulse`} style={{animationDelay: `${i * 0.2}s`}}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className={`text-center p-6 rounded-xl border-2 transform hover:scale-105 transition-all ${
                    theme === 'light' 
                      ? 'bg-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-lg' 
                      : 'bg-gray-800 border-blue-700 hover:border-blue-600 hover:shadow-lg'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 ${
                      theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                    }`}>
                      50K+
                    </div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.users}
                    </div>
                  </div>
                  <div className={`text-center p-6 rounded-xl border-2 transform hover:scale-105 transition-all ${
                    theme === 'light'
                      ? 'bg-green-50 border-green-200 hover:border-green-300 hover:shadow-lg'
                      : 'bg-gray-800 border-green-700 hover:border-green-600 hover:shadow-lg'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 ${
                      theme === 'light' ? 'text-green-600' : 'text-green-400'
                    }`}>
                      4.8
                    </div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.rating}
                    </div>
                  </div>
                  <div className={`text-center p-6 rounded-xl border-2 transform hover:scale-105 transition-all ${
                    theme === 'light'
                      ? 'bg-purple-50 border-purple-200 hover:border-purple-300 hover:shadow-lg'
                      : 'bg-gray-800 border-purple-700 hover:border-purple-600 hover:shadow-lg'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 ${
                      theme === 'light' ? 'text-purple-600' : 'text-purple-400'
                    }`}>
                      100%
                    </div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.free}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Browser Installation Section */}
        <section id="browsers" className={`py-16 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {texts.availableBrowsers}
              </h2>
              <p className={`text-lg ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {texts.browserInstallDesc}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Chrome', icon: '🌐', color: 'blue', users: '45K+' },
                { name: 'Firefox', icon: '🦊', color: 'orange', users: '3K+' },
                { name: 'Edge', icon: '📘', color: 'blue', users: '1.5K+' },
                { name: 'Safari', icon: '🧭', color: 'gray', users: '500+' }
              ].map((browser) => (
                <div 
                  key={browser.name}
                  className={`relative p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${
                    theme === 'light' 
                      ? 'bg-white border-gray-200 hover:border-blue-300' 
                      : 'bg-gray-900 border-gray-700 hover:border-blue-600'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-4xl mb-4 ${
                      browser.name.toLowerCase() === currentBrowser.toLowerCase() ? 'animate-pulse' : ''
                    }`}>
                      {browser.icon}
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {browser.name}
                    </h3>
                    <p className={`text-sm mb-4 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {browser.users} users
                    </p>
                    <a 
                      href={getExtensionLink(browser.name.toLowerCase())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        browser.name.toLowerCase() === currentBrowser.toLowerCase()
                          ? 'bg-blue-600 text-white'
                          : theme === 'light'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {browser.name.toLowerCase() === currentBrowser.toLowerCase() 
                        ? texts.currentlyUsing
                        : `${texts.installForBrowser} ${browser.name}`
                      }
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Screenshots Gallery */}
        <section className={`py-16 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-white' : 'bg-gray-900'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {texts.screenshots}
              </h2>
              <p className={`text-lg ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {texts.screenshotsDesc}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: texts.mainDashboard, description: texts.mainDashboardDesc },
                { title: texts.siteBlocking, description: texts.siteBlockingDesc },
                { title: texts.focusTimer, description: texts.focusTimerDesc },
                { title: texts.statistics, description: texts.statisticsDesc },
                { title: texts.settings, description: texts.settingsDesc },
                { title: texts.notifications, description: texts.notificationsDesc }
              ].map((screenshot, index) => (
                <div 
                  key={index}
                  className={`group rounded-lg overflow-hidden border transition-all duration-300 hover:shadow-xl ${
                    theme === 'light' 
                      ? 'bg-gray-100 border-gray-200' 
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className={`aspect-video flex items-center justify-center ${
                    theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : 'bg-gradient-to-br from-gray-700 to-gray-800'
                  }`}>
                    <div className="text-center">
                      <img src="/goat.png" alt={screenshot.title} className="w-16 h-16 mx-auto mb-2 object-contain opacity-50" />
                      <div className={`text-sm font-medium ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {screenshot.title}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className={`font-semibold mb-1 ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {screenshot.title}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {screenshot.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={`py-16 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {texts.featuresTitle}
              </h2>
              <p className={`text-lg ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {texts.featuresDesc}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  icon: '🚫', 
                  title: texts.smartSiteBlocking, 
                  description: texts.smartSiteBlockingDesc
                },
                { 
                  icon: '⏰', 
                  title: texts.focusTimerFeature, 
                  description: texts.focusTimerFeatureDesc
                },
                { 
                  icon: '📊', 
                  title: texts.productivityAnalytics, 
                  description: texts.productivityAnalyticsDesc
                },
                { 
                  icon: '🎯', 
                  title: texts.goalSetting, 
                  description: texts.goalSettingDesc
                },
                { 
                  icon: '🔔', 
                  title: texts.smartNotifications, 
                  description: texts.smartNotificationsDesc
                },
                { 
                  icon: '⚙️', 
                  title: texts.customizableSettings, 
                  description: texts.customizableSettingsDesc
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${
                    theme === 'light' 
                      ? 'bg-white border-gray-200 hover:border-blue-300' 
                      : 'bg-gray-900 border-gray-700 hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className={`py-16 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-white' : 'bg-gray-900'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {texts.userReviews}
              </h2>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-lg">{'⭐'}</span>
                  ))}
                </div>
                <span className={`text-lg font-semibold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  4.8
                </span>
                <span className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {texts.ratingText}
                </span>
              </div>
              <p className={`text-lg ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {texts.seeWhatUsers}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  rating: 5,
                  title: "Life changing extension!",
                  content: "Goatly has completely transformed my productivity. I can finally focus on my work without getting distracted by social media.",
                  author: "Sarah Johnson",
                  date: "2 weeks ago",
                  helpful: 23
                },
                {
                  rating: 5,
                  title: "Perfect for students",
                  content: "As a student, I struggle with staying focused while studying. This extension has been a game-changer for my study sessions.",
                  author: "Mike Chen",
                  date: "1 month ago",
                  helpful: 18
                },
                {
                  rating: 4,
                  title: "Great features, easy to use",
                  content: "Really impressed with the features and how intuitive it is. The site blocking feature works perfectly. Highly recommend!",
                  author: "Emily Davis",
                  date: "3 weeks ago",
                  helpful: 15
                },
                {
                  rating: 5,
                  title: "Exactly what I needed",
                  content: "I've tried many productivity extensions, but Goatly is by far the best. Clean interface, powerful features, and it actually works.",
                  author: "Alex Rodriguez",
                  date: "2 months ago",
                  helpful: 31
                },
                {
                  rating: 5,
                  title: "Worth every star",
                  content: "The focus timer has helped me complete more work in less time. Can't imagine working without this extension now.",
                  author: "Lisa Wang",
                  date: "1 week ago",
                  helpful: 12
                },
                {
                  rating: 4,
                  title: "Solid productivity tool",
                  content: "Good extension with useful features. The analytics help me understand my productivity patterns better.",
                  author: "James Wilson",
                  date: "5 days ago",
                  helpful: 8
                }
              ].map((review, index) => (
                <div 
                  key={index}
                  className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${
                    theme === 'light' 
                      ? 'bg-gray-50 border-gray-200 hover:border-blue-300' 
                      : 'bg-gray-800 border-gray-700 hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-sm">{'⭐'}</span>
                      ))}
                    </div>
                    <span className={`text-xs ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {review.date}
                    </span>
                  </div>
                  <h3 className={`font-semibold mb-2 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {review.title}
                  </h3>
                  <p className={`text-sm mb-4 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {review.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {review.author}
                    </div>
                    <button className={`text-xs ${
                      theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
                    }`}>
                      {texts.helpful} ({review.helpful})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Information Section */}
        <section className={`py-16 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.privacySecurity}
                </h3>
                <p className={`text-sm mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {texts.privacyDesc}
                </p>
                <ul className={`text-sm space-y-2 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• {texts.noTracking}</li>
                  <li>• {texts.localData}</li>
                  <li>• {texts.noPersonalInfo}</li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.versionHistory}
                </h3>
                <div className={`text-sm space-y-3 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <div className="border-b pb-2">
                    <div className="font-medium">{texts.version210}</div>
                    <div className="text-xs whitespace-pre-line">{texts.version210Features}</div>
                  </div>
                  <div className="border-b pb-2">
                    <div className="font-medium">{texts.version200}</div>
                    <div className="text-xs whitespace-pre-line">{texts.version200Features}</div>
                  </div>
                  <div>
                    <div className="font-medium">{texts.version150}</div>
                    <div className="text-xs">{texts.version150Features}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.support}
                </h3>
                <p className={`text-sm mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {texts.supportDesc}
                </p>
                <div className="space-y-2">
                  <a href="#" className={`block text-sm hover:underline ${
                    theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                  }`}>
                    📧 {texts.contactSupport}
                  </a>
                  <a href="#" className={`block text-sm hover:underline ${
                    theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                  }`}>
                    📖 {texts.userGuide}
                  </a>
                  <a href="#" className={`block text-sm hover:underline ${
                    theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                  }`}>
                    💬 {texts.communityForum}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={`py-16 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-blue-600' : 'bg-blue-800'
        }`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              {texts.readyToBoost}
            </h2>
            <p className="text-xl mb-8 text-white/90">
              {texts.joinThousands}
            </p>
            <a 
              href={getExtensionLink(currentBrowser)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 bg-white text-blue-600 hover:bg-blue-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
              </svg>
              Add to {getBrowserIcon(currentBrowser)} - It's Free
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 px-4 sm:px-6 lg:px-8 border-t ${
          theme === 'light' 
            ? 'bg-white border-gray-200' 
            : 'bg-gray-900 border-gray-700'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img src="/goat.png" alt="Goatly" className="w-8 h-8 object-contain" />
                  <span className={`font-bold ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    Goatly
                  </span>
                </div>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {texts.tagline}
                </p>
              </div>
              
              <div>
                <h4 className={`font-semibold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.product}
                </h4>
                <ul className={`text-sm space-y-2 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li><a href="#features" className="hover:underline">{texts.features}</a></li>
                  <li><a href="#browsers" className="hover:underline">{texts.browsers}</a></li>
                  <li><a href="#testimonials" className="hover:underline">{texts.reviews}</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className={`font-semibold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.support}
                </h4>
                <ul className={`text-sm space-y-2 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li><a href="#" className="hover:underline">{texts.helpCenter}</a></li>
                  <li><a href="#" className="hover:underline">{texts.privacyPolicy}</a></li>
                  <li><a href="#" className="hover:underline">{texts.termsOfService}</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className={`font-semibold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {texts.connect}
                </h4>
                <ul className={`text-sm space-y-2 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li><a href="#" className="hover:underline">{texts.twitter}</a></li>
                  <li><a href="#" className="hover:underline">{texts.github}</a></li>
                  <li><a href="#" className="hover:underline">{texts.discord}</a></li>
                </ul>
              </div>
            </div>
            
            <div className={`pt-8 border-t text-center text-sm ${
              theme === 'light' 
                ? 'border-gray-200 text-gray-600' 
                : 'border-gray-700 text-gray-400'
            }`}>
              {texts.copyright}
            </div>
          </div>
        </footer>
      </div>
    </LanguageLayout>
  );
}
