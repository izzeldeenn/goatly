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

export default function TeamPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CustomThemeProvider>
      <TeamPageContent />
    </CustomThemeProvider>
  );
}

function TeamPageContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const customTheme = useCustomThemeClasses();

  const coreTeam = [
    {
      name: "Izzeldeenn",
      role: "Founder & Lead Developer",
      bio: "Created Goatly to solve his own focus challenges. Passionate about open-source and community-driven education.",
      avatar: "👨‍💻",
      github: "izzeldeenn",
      contributions: "Core architecture, focus timer, study rooms",
      location: "Egypt"
    },
    {
      name: "Sarah Ahmed",
      role: "Community Manager",
      bio: "Dedicated to building supportive study communities and helping students achieve their goals.",
      avatar: "👩‍💼",
      github: "sarahahmed",
      contributions: "Community features, Discord management, user support",
      location: "UAE"
    },
    {
      name: "Mohammed Ali",
      role: "UX/UI Designer",
      bio: "Focuses on creating intuitive and beautiful interfaces that enhance the study experience.",
      avatar: "🎨",
      github: "mohammedali",
      contributions: "UI design, user experience, theme system",
      location: "Saudi Arabia"
    }
  ];

  const communityLeaders = [
    {
      name: "Ahmed Mohammed",
      role: "Discord Moderator",
      bio: "Helps maintain a positive and productive community environment.",
      avatar: "👨‍🎓",
      contributions: "Community moderation, study events, user support",
      location: "Jordan"
    },
    {
      name: "Maria Rodriguez",
      role: "Content Creator",
      bio: "Creates educational content and tutorials to help students use Goatly effectively.",
      avatar: "👩‍🏫",
      contributions: "Video tutorials, blog posts, study guides",
      location: "Spain"
    },
    {
      name: "Chen Wei",
      role: "Technical Support",
      bio: "Provides technical assistance and helps users troubleshoot issues.",
      avatar: "👨‍🔧",
      contributions: "Bug reports, technical documentation, user support",
      location: "China"
    }
  ];

  const contributors = [
    {
      name: "Lisa Chen",
      role: "Frontend Developer",
      contributions: "React components, UI improvements",
      avatar: "👩‍💻"
    },
    {
      name: "John Smith",
      role: "Backend Developer", 
      contributions: "API development, database optimization",
      avatar: "👨‍💻"
    },
    {
      name: "Fatima Al-Rashid",
      role: "Mobile Developer",
      contributions: "Mobile app development, responsive design",
      avatar: "👩‍📱"
    },
    {
      name: "David Kim",
      role: "DevOps Engineer",
      contributions: "Infrastructure, deployment, monitoring",
      avatar: "👨‍🔧"
    },
    {
      name: "Priya Sharma",
      role: "QA Tester",
      contributions: "Testing, bug reports, user feedback",
      avatar: "👩‍🔬"
    },
    {
      name: "Carlos Rodriguez",
      role: "Translator",
      contributions: "Spanish localization, community outreach",
      avatar: "👨‍🌐"
    }
  ];

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
                <a href="/team" className={`font-semibold text-blue-600`}>
                  Team
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
                👥 Meet the Team
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

            <p className={`text-xl sm:text-2xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Meet the passionate individuals who make Goatly possible - from developers to community leaders, we're all students helping students.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contribute"
                className="group px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="flex items-center gap-2">
                  Join Our Team
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </a>
              <a
                href="https://github.com/izzeldeenn/goatly"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all transform hover:scale-105 flex items-center justify-center ${
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

        {/* Core Team */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Core Team
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                The driving force behind Goatly's development and vision
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {coreTeam.map((member, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 shadow-lg hover:shadow-2xl'
                  }`}
                >
                  <div className="text-center mb-6">
                    <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-5xl mb-4`}>
                      {member.avatar}
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {member.name}
                    </h3>
                    <p className={`text-blue-600 font-medium mb-2`}>
                      {member.role}
                    </p>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      📍 {member.location}
                    </p>
                  </div>
                  
                  <p className={`mb-6 text-center ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {member.bio}
                  </p>

                  <div className={`mb-6 p-4 rounded-lg ${
                    theme === 'light' ? 'bg-gray-50' : 'bg-slate-700'
                  }`}>
                    <h4 className={`font-bold mb-2 text-sm ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      Key Contributions:
                    </h4>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {member.contributions}
                    </p>
                  </div>

                  <div className="flex justify-center gap-4">
                    <a
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-slate-600'
                      }`}
                    >
                      <span className="text-xl">🐙</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Leaders */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-900/50'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Community Leaders
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Dedicated volunteers who keep our community thriving
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {communityLeaders.map((leader, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 shadow-lg hover:shadow-2xl'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-4xl mb-3`}>
                      {leader.avatar}
                    </div>
                    <h3 className={`text-xl font-bold mb-1 ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {leader.name}
                    </h3>
                    <p className={`text-green-600 font-medium text-sm mb-1`}>
                      {leader.role}
                    </p>
                    <p className={`text-xs ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      📍 {leader.location}
                    </p>
                  </div>
                  
                  <p className={`mb-4 text-sm text-center ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {leader.bio}
                  </p>

                  <div className={`p-3 rounded-lg text-xs ${
                    theme === 'light' ? 'bg-gray-50' : 'bg-slate-700'
                  }`}>
                    <p className={`${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      <strong>Contributions:</strong> {leader.contributions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contributors */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Amazing Contributors
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Hundreds of contributors make Goatly better every day
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
              {contributors.map((contributor, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg text-center transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 shadow-lg hover:shadow-2xl'
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl mb-3`}>
                    {contributor.avatar}
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {contributor.name}
                  </h3>
                  <p className={`text-xs text-blue-600 mb-2`}>
                    {contributor.role}
                  </p>
                  <p className={`text-xs ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {contributor.contributions}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className={`text-lg mb-6 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                And 500+ more contributors from around the world!
              </p>
              <a
                href="https://github.com/izzeldeenn/goatly/graphs/contributors"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">🐙</span>
                View All Contributors
              </a>
            </div>
          </div>
        </section>

        {/* Join Team */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-slate-100' : 'bg-gradient-to-br from-slate-800 to-gray-900'
        }`}>
          <div className="max-w-6xl mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Want to Join Our Team?
            </h2>
            <p className={`text-xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Whether you're a developer, designer, writer, or just passionate about education - there's a place for you in our community.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className={`p-6 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-3xl mb-4">👨‍💻</div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Developers
                </h3>
                <p className={`text-sm mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Help us build features, fix bugs, and improve performance
                </p>
                <a
                  href="https://github.com/izzeldeenn/goatly/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-blue-600 font-medium hover:text-blue-700 text-sm`}
                >
                  Find Issues →
                </a>
              </div>

              <div className={`p-6 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-3xl mb-4">🎨</div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Designers
                </h3>
                <p className={`text-sm mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Improve our user experience and create beautiful interfaces
                </p>
                <a
                  href="/contribute"
                  className={`text-blue-600 font-medium hover:text-blue-700 text-sm`}
                >
                  Design Guidelines →
                </a>
              </div>

              <div className={`p-6 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-3xl mb-4">📝</div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Content Creators
                </h3>
                <p className={`text-sm mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Write tutorials, create videos, and share knowledge
                </p>
                <a
                  href="/blog"
                  className={`text-blue-600 font-medium hover:text-blue-700 text-sm`}
                >
                  Content Guidelines →
                </a>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="/contribute"
                className="group px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center gap-2"
              >
                Start Contributing
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="https://discord.gg/5wBNne8Z3f"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all transform hover:scale-105 flex items-center gap-2 ${
                  theme === 'light'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-white hover:bg-gray-800'
                }`}
              >
                Join Discord
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
              Built with ❤️ by our amazing community
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
