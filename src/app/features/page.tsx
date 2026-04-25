'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageLayout } from '@/components/ui/LanguageLayout';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CustomThemeProvider } from '@/contexts/CustomThemeContext';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';
import { GoatlyStructuredData } from '@/components/seo/StructuredData';

export default function FeaturesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CustomThemeProvider>
      <FeaturesPageContent />
    </CustomThemeProvider>
  );
}

function FeaturesPageContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const customTheme = useCustomThemeClasses();

  return (
    <LanguageLayout>
      <GoatlyStructuredData />
      <div className={`min-h-screen ${
        theme === 'light' 
          ? 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100' 
          : 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900'
      }`}>
        {/* Header */}
        <header className={`fixed top-0 w-full z-50 backdrop-blur-lg border-b ${
          theme === 'light' 
            ? 'bg-white/80 border-gray-200' 
            : 'bg-black border-gray-800'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Logo />
              </div>
              
              <nav className="hidden md:flex items-center gap-8">
                <a href="/" className={`transition-colors hover:text-blue-600 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Home
                </a>
                <a href="/focus" className={`transition-colors hover:text-blue-600 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Study
                </a>
                <a href="/features" className={`font-semibold text-blue-600`}>
                  Features
                </a>
                <a href="/pricing" className={`transition-colors hover:text-blue-600 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Pricing
                </a>
              </nav>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <a
                  href="/focus"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    theme === 'light'
                      ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Start Studying
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className={`relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' 
            ? 'bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100' 
            : 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900'
        }`}>
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-6">
              <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${
                theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              }`}>
                🚀 Community-Driven Features
              </span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
               theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              <span className="block">Powerful Features for</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Focused Learning
              </span>
            </h1>

            <p className={`text-xl sm:text-2xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Built by students, for students. Every feature is designed to help you achieve deep focus and academic excellence through community collaboration.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a
                href="/focus"
                className="group px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="flex items-center gap-2">
                  Try Features Now
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </a>
              <a
                href="#core-features"
                className={`px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all transform hover:scale-105 flex items-center justify-center ${
                  theme === 'light'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-white hover:bg-gray-800'
                }`}
              >
                Explore Features
              </a>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section id="core-features" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Core Study Tools
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Essential tools designed for maximum focus and productivity
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Deep Focus Mode */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  🧘
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Deep Focus Mode
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Community-tested techniques for achieving maximum concentration and eliminating distractions.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Pomodoro timer integration</li>
                  <li>• Ambient sound library</li>
                  <li>• Website blocking tools</li>
                  <li>• Focus session analytics</li>
                </ul>
              </div>

              {/* Smart Goal Tracking */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
                  📈
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Smart Goal Tracking
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Set, track, and achieve academic goals with AI-powered recommendations and peer support.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Personalized goal suggestions</li>
                  <li>• Progress visualization</li>
                  <li>• Milestone celebrations</li>
                  <li>• Accountability partnerships</li>
                </ul>
              </div>

              {/* Streak Tracking */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  🔥
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Streak Tracking
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Maintain consistent study habits with community accountability and achievement systems.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Daily streak counters</li>
                  <li>• Streak recovery options</li>
                  <li>• Community challenges</li>
                  <li>• Achievement badges</li>
                </ul>
              </div>

              {/* Progress Analytics */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  📊
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Progress Analytics
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Visual insights into your study patterns and areas for improvement with detailed reports.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Detailed time tracking</li>
                  <li>• Productivity patterns</li>
                  <li>• Performance metrics</li>
                  <li>• Export capabilities</li>
                </ul>
              </div>

              {/* Study Rooms */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
                  🏠
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Study Rooms
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Join or create virtual study spaces with real-time collaboration and accountability.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Real-time member presence</li>
                  <li>• Shared study timers</li>
                  <li>• Voice and text chat</li>
                  <li>• Room analytics</li>
                </ul>
              </div>

              {/* Music Integration */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  🎵
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Music Integration
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Built-in YouTube Music player with focus-enhancing playlists and ambient sounds.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• YouTube Music integration</li>
                  <li>• Focus playlists</li>
                  <li>• Ambient sound library</li>
                  <li>• Personalized recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Community Features */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-900/50'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Community Features
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Connect, collaborate, and succeed together with our community-driven tools
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Peer Support */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  💬
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Peer Support
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Connect with motivated students worldwide and share your learning journey.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Global student network</li>
                  <li>• Study buddy matching</li>
                  <li>• Peer accountability</li>
                  <li>• Success sharing</li>
                </ul>
              </div>

              {/* Community Challenges */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  🏆
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Community Challenges
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Participate in focus challenges and competitions with exciting rewards.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Weekly study challenges</li>
                  <li>• Team competitions</li>
                  <li>• Reward systems</li>
                  <li>• Leaderboard rankings</li>
                </ul>
              </div>

              {/* Shared Resources */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                  📚
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Shared Resources
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Access community-curated study materials, techniques, and best practices.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Study material library</li>
                  <li>• Technique tutorials</li>
                  <li>• Best practice guides</li>
                  <li>• User-generated content</li>
                </ul>
              </div>

              {/* Success Stories */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                  🎓
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Success Stories
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Learn from real experiences and achievements of fellow community members.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Member testimonials</li>
                  <li>• Achievement showcases</li>
                  <li>• Learning journeys</li>
                  <li>• Success strategies</li>
                </ul>
              </div>

              {/* Gamification */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  🎮
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Gamification
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Earn coins, unlock achievements, and customize your learning experience.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Coin reward system</li>
                  <li>• Achievement badges</li>
                  <li>• Level progression</li>
                  <li>• Avatar customization</li>
                </ul>
              </div>

              {/* Social Features */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  🌐
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Social Features
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Connect with friends, share progress, and build your learning network.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Friend connections</li>
                  <li>• Progress sharing</li>
                  <li>• Study groups</li>
                  <li>• Social feeds</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Features */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Technical Excellence
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Built with cutting-edge technology for the best user experience
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Real-time Updates */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  ⚡
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Real-time Updates
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Live progress tracking and community interactions with WebSocket technology.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Live leaderboards</li>
                  <li>• Real-time notifications</li>
                  <li>• Instant messaging</li>
                  <li>• Live study sessions</li>
                </ul>
              </div>

              {/* Privacy First */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  🔐
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Privacy First
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Your data is yours - we don't sell or share your information with anyone.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• End-to-end encryption</li>
                  <li>• Data ownership</li>
                  <li>• GDPR compliant</li>
                  <li>• Transparent policies</li>
                </ul>
              </div>

              {/* Responsive Design */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  📱
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Responsive Design
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Study on any device, anywhere with our fully responsive and adaptive interface.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Mobile optimized</li>
                  <li>• Tablet support</li>
                  <li>• Desktop experience</li>
                  <li>• Cross-device sync</li>
                </ul>
              </div>

              {/* Dark/Light Themes */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-600 to-gray-800 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                  🌙
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Dark/Light Themes
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Comfortable studying in any environment with customizable themes and appearances.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• Multiple theme options</li>
                  <li>• Custom color schemes</li>
                  <li>• Eye comfort modes</li>
                  <li>• Personalized layouts</li>
                </ul>
              </div>

              {/* Open Source */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  🔓
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Open Source
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Transparent, customizable, and free forever with community-driven development.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• MIT licensed</li>
                  <li>• Community contributions</li>
                  <li>• Transparent development</li>
                  <li>• Customizable codebase</li>
                </ul>
              </div>

              {/* API Integration */}
              <div className={`group relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 hover:shadow-xl'
                  : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
              }`}>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 text-5xl mb-6 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  🔌
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  API Integration
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Powerful APIs and webhooks for developers to build custom integrations.
                </p>
                <ul className={`space-y-2 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <li>• RESTful APIs</li>
                  <li>• Webhook support</li>
                  <li>• Developer documentation</li>
                  <li>• SDK availability</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-slate-100' : 'bg-gradient-to-br from-slate-800 to-gray-900'
        }`}>
          <div className="max-w-6xl mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Ready to Experience All Features?
            </h2>
            <p className={`text-xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Join thousands of students who are already using Goatly to achieve their academic goals. Start your focused learning journey today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="/focus"
                className="group px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center gap-2"
              >
                Start Using Features
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="/pricing"
                className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all transform hover:scale-105 flex items-center gap-2 ${
                  theme === 'light'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-white hover:bg-gray-800'
                }`}
              >
                View Pricing Plans
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
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <img 
                  src="/goat.png" 
                  alt="Goatly Logo" 
                  className="w-10 h-10 object-contain"
                />
                <div className="flex flex-col">
                  <div className="text-2xl font-bold tracking-tight">
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
            
            <div className={`text-sm ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Open-source community building the future of focused learning
            </div>
            
            <div className={`mt-6 pt-6 border-t text-center text-sm ${
              theme === 'light'
                ? 'border-gray-200 text-gray-600'
                : 'border-gray-800 text-gray-400'
            }`}>
              © 2024 Goatly Community. Open-source, student-driven, always free.
            </div>
          </div>
        </footer>
      </div>
    </LanguageLayout>
  );
}
