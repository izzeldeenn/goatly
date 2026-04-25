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

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CustomThemeProvider>
      <AboutPageContent />
    </CustomThemeProvider>
  );
}

function AboutPageContent() {
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
                <a href="/features" className={`transition-colors hover:text-blue-600 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Features
                </a>
                <a href="/about" className={`font-semibold text-blue-600`}>
                  About
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
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-6">
                  <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${
                    theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    🎯 Our Mission
                  </span>
                </div>

                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
                   theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  <span className="block">Building the Future of</span>
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Focused Learning
                  </span>
                </h1>

                <p className={`text-xl sm:text-2xl mb-8 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  We're a community-driven platform dedicated to helping students achieve deep focus and academic excellence through collaborative learning and open-source technology.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/focus"
                    className="group px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <span className="flex items-center gap-2">
                      Join Our Mission
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </a>
                  <a
                    href="#story"
                    className={`px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all transform hover:scale-105 flex items-center justify-center ${
                      theme === 'light'
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'border-gray-600 text-white hover:bg-gray-800'
                    }`}
                  >
                    Learn Our Story
                  </a>
                </div>
              </div>
              
              <div className="relative">
                <div className={`p-8 rounded-lg ${
                  theme === 'light'
                    ? 'bg-white shadow-xl'
                    : 'bg-slate-800 shadow-2xl'
                }`}>
                  <div className="text-center mb-8">
                    <img 
                      src="/goat.png" 
                      alt="Mr Goatly" 
                      className="w-24 h-24 mx-auto mb-4 object-contain"
                    />
                    <h3 className={`text-2xl font-bold mb-2 ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      The Mr. Goatly Philosophy
                    </h3>
                  </div>
                  
                  <blockquote className={`text-lg italic text-center mb-6 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    "The secret isn't in jumping a lot... The secret is in jumping in the right direction."
                  </blockquote>
                  
                  <p className={`text-center ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    This simple yet profound principle guides everything we build - every feature, every timer, every achievement is designed to help you make your next jump count.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section id="story" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Our Story
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                From a simple idea to a global community of focused learners
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* The Beginning */}
              <div className={`p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-4xl mb-6">🌱</div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  The Beginning
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Started as a simple timer app by students who understood the struggle of maintaining focus in a world full of distractions.
                </p>
                <div className={`text-sm font-medium ${
                  theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                }`}>
                  2022 - First Version
                </div>
              </div>

              {/* The Growth */}
              <div className={`p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-4xl mb-6">🚀</div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  The Growth
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Evolved into a comprehensive platform as thousands of students joined and contributed their ideas and feedback.
                </p>
                <div className={`text-sm font-medium ${
                  theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                }`}>
                  2023 - Community Expansion
                </div>
              </div>

              {/* The Future */}
              <div className={`p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-4xl mb-6">🌟</div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  The Future
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Building the future of collaborative learning with AI-powered features and global community initiatives.
                </p>
                <div className={`text-sm font-medium ${
                  theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                }`}>
                  2024+ - Innovation Continues
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-900/50'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Our Core Values
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Open Source */}
              <div className={`text-center p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-5xl mb-6 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  🔓
                </div>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Open Source
                </h3>
                <p className={`${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  We believe in transparency, collaboration, and the power of community-driven development.
                </p>
              </div>

              {/* Student First */}
              <div className={`text-center p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-5xl mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  🎓
                </div>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Student First
                </h3>
                <p className={`${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Every decision we make is centered around helping students succeed and achieve their goals.
                </p>
              </div>

              {/* Community Driven */}
              <div className={`text-center p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-5xl mb-6 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  🤝
                </div>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Community Driven
                </h3>
                <p className={`${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Our platform is built by students, for students, with continuous community input and contributions.
                </p>
              </div>

              {/* Privacy First */}
              <div className={`text-center p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-5xl mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  🔐
                </div>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Privacy First
                </h3>
                <p className={`${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  We protect your data and never compromise your privacy for profit or convenience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Impact */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Our Impact
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Numbers that show our growing influence on student success
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className={`text-center p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className={`text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                  50K+
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Active Students
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  From 150+ countries worldwide
                </p>
              </div>

              <div className={`text-center p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className={`text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent`}>
                  1M+
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Study Hours Tracked
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Collective focus time
                </p>
              </div>

              <div className={`text-center p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className={`text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent`}>
                  100K+
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Goals Achieved
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Academic milestones reached
                </p>
              </div>

              <div className={`text-center p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className={`text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                  95%
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Success Rate
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Students report improved focus
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-900/50'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Built by the Community
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Our team extends far beyond core developers - it includes every student who contributes, suggests, and uses Goatly
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Core Contributors */}
              <div className={`p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold`}>
                    GC
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 text-center ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Global Contributors
                </h3>
                <p className={`text-center mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  500+ developers, designers, and students from around the world contributing to our open-source project.
                </p>
                <div className={`text-center text-sm font-medium ${
                  theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                }`}>
                  GitHub Community
                </div>
              </div>

              {/* Community Leaders */}
              <div className={`p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold`}>
                    CL
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 text-center ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Community Leaders
                </h3>
                <p className={`text-center mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Dedicated volunteers who moderate forums, organize events, and help new members get started.
                </p>
                <div className={`text-center text-sm font-medium ${
                  theme === 'light' ? 'text-green-600' : 'text-green-400'
                }`}>
                  Volunteer Team
                </div>
              </div>

              {/* Student Ambassadors */}
              <div className={`p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold`}>
                    SA
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 text-center ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Student Ambassadors
                </h3>
                <p className={`text-center mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Students who represent Goatly at their schools and universities, spreading awareness and building local communities.
                </p>
                <div className={`text-center text-sm font-medium ${
                  theme === 'light' ? 'text-orange-600' : 'text-orange-400'
                }`}>
                  Global Network
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Join Us */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-slate-100' : 'bg-gradient-to-br from-slate-800 to-gray-900'
        }`}>
          <div className="max-w-6xl mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Be Part of Our Story
            </h2>
            <p className={`text-xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Whether you're a student, developer, designer, or passionate about education - there's a place for you in our community.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <a
                href="/contribute"
                className={`p-6 rounded-lg transition-all transform hover:scale-105 ${
                  theme === 'light'
                    ? 'bg-white border border-gray-200 hover:shadow-xl'
                    : 'bg-slate-800 border border-gray-700 hover:shadow-2xl'
                }`}
              >
                <div className="text-3xl mb-4">🚀</div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Contribute Code
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Help us build features and fix bugs
                </p>
              </a>

              <a
                href="/contribute"
                className={`p-6 rounded-lg transition-all transform hover:scale-105 ${
                  theme === 'light'
                    ? 'bg-white border border-gray-200 hover:shadow-xl'
                    : 'bg-slate-800 border border-gray-700 hover:shadow-2xl'
                }`}
              >
                <div className="text-3xl mb-4">🎨</div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Design & UX
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Improve our user experience
                </p>
              </a>

              <a
                href="/contribute"
                className={`p-6 rounded-lg transition-all transform hover:scale-105 ${
                  theme === 'light'
                    ? 'bg-white border border-gray-200 hover:shadow-xl'
                    : 'bg-slate-800 border border-gray-700 hover:shadow-2xl'
                }`}
              >
                <div className="text-3xl mb-4">📝</div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Content & Ideas
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Share your knowledge and feedback
                </p>
              </a>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="/focus"
                className="group px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center gap-2"
              >
                Start Using Goatly
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="https://github.com/izzeldeenn/goatly"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all transform hover:scale-105 flex items-center gap-2 ${
                  theme === 'light'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-white hover:bg-gray-800'
                }`}
              >
                View on GitHub
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
            
            <div className={`text-sm mb-6 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Building the future of focused learning, together
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
