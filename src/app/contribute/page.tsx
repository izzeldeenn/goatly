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

export default function ContributePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CustomThemeProvider>
      <ContributePageContent />
    </CustomThemeProvider>
  );
}

function ContributePageContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [selectedContribution, setSelectedContribution] = useState('all');
  const customTheme = useCustomThemeClasses();

  const contributionTypes = [
    {
      id: 'development',
      name: 'Code Development',
      icon: '👨‍💻',
      description: 'Help build features, fix bugs, and improve performance',
      difficulty: 'Advanced',
      timeCommitment: '5-10 hours/week'
    },
    {
      id: 'design',
      name: 'Design & UX',
      icon: '🎨',
      description: 'Create beautiful interfaces and improve user experience',
      difficulty: 'Intermediate',
      timeCommitment: '3-8 hours/week'
    },
    {
      id: 'content',
      name: 'Content Creation',
      icon: '📝',
      description: 'Write tutorials, create videos, and share knowledge',
      difficulty: 'Beginner',
      timeCommitment: '2-5 hours/week'
    },
    {
      id: 'community',
      name: 'Community Support',
      icon: '🤝',
      description: 'Help users, moderate discussions, and organize events',
      difficulty: 'Beginner',
      timeCommitment: '2-4 hours/week'
    },
    {
      id: 'translation',
      name: 'Localization',
      icon: '🌍',
      description: 'Translate Goatly into different languages',
      difficulty: 'Intermediate',
      timeCommitment: '3-6 hours/week'
    },
    {
      id: 'testing',
      name: 'Testing & QA',
      icon: '🔬',
      description: 'Find bugs, test features, and provide feedback',
      difficulty: 'Beginner',
      timeCommitment: '1-3 hours/week'
    }
  ];

  const currentProjects = [
    {
      title: 'Mobile App Development',
      description: 'Help us build native iOS and Android apps for Goatly',
      skills: ['React Native', 'TypeScript', 'Mobile UI/UX'],
      difficulty: 'Advanced',
      urgency: 'High',
      contributors: 3,
      maxContributors: 8
    },
    {
      title: 'AI Study Assistant',
      description: 'Implement AI-powered study recommendations and scheduling',
      skills: ['Python', 'Machine Learning', 'API Integration'],
      difficulty: 'Advanced',
      urgency: 'Medium',
      contributors: 2,
      maxContributors: 5
    },
    {
      title: 'Arabic Localization',
      description: 'Translate the entire Goatly interface to Arabic',
      skills: ['Arabic', 'Translation', 'Cultural Adaptation'],
      difficulty: 'Beginner',
      urgency: 'High',
      contributors: 1,
      maxContributors: 3
    },
    {
      title: 'Video Tutorial Series',
      description: 'Create comprehensive video tutorials for all Goatly features',
      skills: ['Video Editing', 'Teaching', 'Screen Recording'],
      difficulty: 'Intermediate',
      urgency: 'Medium',
      contributors: 4,
      maxContributors: 6
    },
    {
      title: 'Performance Optimization',
      description: 'Improve app performance and reduce loading times',
      skills: ['React', 'Performance Analysis', 'Optimization'],
      difficulty: 'Advanced',
      urgency: 'Medium',
      contributors: 2,
      maxContributors: 4
    },
    {
      title: 'Community Discord Bot',
      description: 'Build a Discord bot for study reminders and community features',
      skills: ['Discord API', 'Node.js', 'Bot Development'],
      difficulty: 'Intermediate',
      urgency: 'Low',
      contributors: 1,
      maxContributors: 3
    }
  ];

  const benefits = [
    {
      icon: '🎓',
      title: 'Learn New Skills',
      description: 'Gain hands-on experience with modern technologies and best practices'
    },
    {
      icon: '🌍',
      title: 'Global Community',
      description: 'Connect with developers and students from around the world'
    },
    {
      icon: '📈',
      title: 'Build Your Portfolio',
      description: 'Add meaningful open-source contributions to your resume'
    },
    {
      icon: '🏆',
      title: 'Recognition & Rewards',
      description: 'Get featured on our contributor wall and earn special badges'
    },
    {
      icon: '🚀',
      title: 'Impact Education',
      description: 'Help thousands of students achieve their academic goals'
    },
    {
      icon: '🔓',
      title: 'Flexible Schedule',
      description: 'Contribute on your own time, from anywhere in the world'
    }
  ];

  const getStartedSteps = [
    {
      step: 1,
      title: 'Join Our Discord',
      description: 'Connect with our community and introduce yourself',
      action: 'Join Discord Server'
    },
    {
      step: 2,
      title: 'Explore GitHub',
      description: 'Browse our repository and understand the codebase',
      action: 'View Repository'
    },
    {
      step: 3,
      title: 'Choose Your Contribution',
      description: 'Pick a project that matches your skills and interests',
      action: 'Browse Projects'
    },
    {
      step: 4,
      title: 'Make Your First Contribution',
      description: 'Start with a small issue or documentation improvement',
      action: 'Find Good First Issues'
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
                <a href="/contribute" className={`font-semibold text-blue-600`}>
                  Contribute
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
                🚀 Open Source Community
              </span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
               theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              <span className="block">Contribute to the</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Future of Learning
              </span>
            </h1>

            <p className={`text-xl sm:text-2xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Join our global community of contributors building the world's best open-source study platform. Every contribution matters!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a
                href="https://github.com/izzeldeenn/goatly"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="flex items-center gap-2">
                  Start Contributing
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </a>
              <a
                href="https://discord.gg/5wBNne8Z3f"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all transform hover:scale-105 flex items-center justify-center ${
                  theme === 'light'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-white hover:bg-gray-800'
                }`}
              >
                Join Discord
              </a>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className={`text-center p-6 rounded-lg ${
                theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-800 shadow-lg'
              }`}>
                <div className={`text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                  500+
                </div>
                <div className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Contributors
                </div>
              </div>
              <div className={`text-center p-6 rounded-lg ${
                theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-800 shadow-lg'
              }`}>
                <div className={`text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent`}>
                  2K+
                </div>
                <div className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Contributions
                </div>
              </div>
              <div className={`text-center p-6 rounded-lg ${
                theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-800 shadow-lg'
              }`}>
                <div className={`text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent`}>
                  50+
                </div>
                <div className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Countries
                </div>
              </div>
              <div className={`text-center p-6 rounded-lg ${
                theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-800 shadow-lg'
              }`}>
                <div className={`text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                  100%
                </div>
                <div className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Open Source
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ways to Contribute */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Ways to Contribute
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Find the perfect way to contribute based on your skills and interests
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contributionTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-6 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 shadow-lg hover:shadow-2xl'
                  }`}
                >
                  <div className="text-4xl mb-4">{type.icon}</div>
                  <h3 className={`text-xl font-bold mb-3 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {type.name}
                  </h3>
                  <p className={`mb-4 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {type.description}
                  </p>
                  <div className={`flex items-center justify-between text-sm ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <span className={`px-2 py-1 rounded ${
                      type.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                      type.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {type.difficulty}
                    </span>
                    <span>⏱️ {type.timeCommitment}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Current Projects */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-900/50'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Current Projects
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Join these exciting projects and make a real impact
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {currentProjects.map((project, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 shadow-lg hover:shadow-2xl'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className={`text-xl font-bold ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.urgency === 'High' ? 'bg-red-100 text-red-700' :
                        project.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {project.urgency} Priority
                      </span>
                    </div>
                  </div>
                  
                  <p className={`mb-4 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {project.description}
                  </p>

                  <div className={`mb-4 p-3 rounded-lg ${
                    theme === 'light' ? 'bg-gray-50' : 'bg-slate-700'
                  }`}>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {project.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className={`px-2 py-1 rounded text-xs ${
                            theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-900 text-blue-300'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`text-sm ${
                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        👥 {project.contributors}/{project.maxContributors}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                        project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {project.difficulty}
                      </span>
                    </div>
                    <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}>
                      Join Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Why Contribute?
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Discover the amazing benefits of joining our open-source community
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`text-center p-6 rounded-lg ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 shadow-lg'
                      : 'bg-slate-800/50 border border-gray-700 shadow-lg'
                  }`}
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className={`text-xl font-bold mb-3 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {benefit.title}
                  </h3>
                  <p className={`${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Get Started */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-slate-100' : 'bg-gradient-to-br from-slate-800 to-gray-900'
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Get Started in 4 Steps
              </h2>
              <p className={`text-xl ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Your journey to becoming a Goatly contributor starts here
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {getStartedSteps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4`}>
                    {step.step}
                  </div>
                  <h3 className={`text-lg font-bold mb-3 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`mb-4 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                  }`}>
                    {step.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Ready to Make an Impact?
            </h2>
            <p className={`text-xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Join thousands of contributors who are building the future of education. Every contribution, no matter how small, helps students worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="https://github.com/izzeldeenn/goatly"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center gap-2"
              >
                <span className="flex items-center gap-2">
                  🐙 View on GitHub
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
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
                💬 Join Discord
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
              Built together, by the community, for the community
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
