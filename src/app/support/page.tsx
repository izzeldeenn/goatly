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

export default function SupportPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CustomThemeProvider>
      <SupportPageContent />
    </CustomThemeProvider>
  );
}

function SupportPageContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const customTheme = useCustomThemeClasses();

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'features', name: 'Features', icon: '⭐' },
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'billing', name: 'Billing', icon: '💳' },
    { id: 'technical', name: 'Technical', icon: '🔧' },
    { id: 'community', name: 'Community', icon: '🤝' }
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: "How do I create an account?",
      answer: "Creating an account is simple! Click 'Start Studying' on the homepage, then choose 'Create Account'. You can sign up with email or use your existing Google account. The whole process takes less than 30 seconds.",
      helpful: 45
    },
    {
      category: 'getting-started',
      question: "What's the difference between Free and Premium plans?",
      answer: "Our Free plan includes all core features like basic timer, study rooms, and community access. Premium adds unlimited sessions, advanced analytics, custom themes, priority support, and data export features.",
      helpful: 38
    },
    {
      category: 'features',
      question: "How do study rooms work?",
      answer: "Study rooms are virtual spaces where you can study with others in real-time. Create your own room or join existing ones. Each room has a shared timer, member list, and chat. You can see who's actively studying and motivate each other.",
      helpful: 52
    },
    {
      category: 'features',
      question: "Can I customize my study experience?",
      answer: "Yes! Premium users can customize themes, backgrounds, sounds, and timer settings. Free users have access to basic customization options. You can also set personal goals and track your progress.",
      helpful: 29
    },
    {
      category: 'account',
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page. Enter your email address, and we'll send you a password reset link. The link expires after 24 hours for security reasons.",
      helpful: 31
    },
    {
      category: 'account',
      question: "Can I change my username?",
      answer: "Yes! Go to Settings > Profile > Edit Username. You can change your username once every 30 days. Your old username becomes available for others to use.",
      helpful: 18
    },
    {
      category: 'billing',
      question: "How do I cancel my subscription?",
      answer: "You can cancel anytime from Settings > Billing > Manage Subscription. Your access continues until the end of your billing period. No cancellation fees or penalties.",
      helpful: 24
    },
    {
      category: 'billing',
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for new Premium subscriptions. If you're not satisfied, contact support within 14 days of your first payment for a full refund.",
      helpful: 19
    },
    {
      category: 'technical',
      question: "Why isn't the timer working?",
      answer: "First, check your internet connection. Make sure you're logged in. Try refreshing the page. If issues persist, clear your browser cache or try a different browser. Most timer issues are resolved with these steps.",
      helpful: 33
    },
    {
      category: 'technical',
      question: "Is Goatly available on mobile?",
      answer: "Yes! Goatly works on all devices with a web browser. We also have mobile apps for iOS and Android. Your data syncs seamlessly across all devices when you're logged in.",
      helpful: 41
    },
    {
      category: 'community',
      question: "How do I join the Discord community?",
      answer: "Click the Discord icon in our footer or visit goatly.app/discord. Our Discord has study channels, voice rooms, events, and direct access to our team. It's free for all users!",
      helpful: 56
    },
    {
      category: 'community',
      question: "Can I contribute to Goatly's development?",
      answer: "Absolutely! Goatly is open-source. Visit our GitHub repository to report issues, suggest features, or contribute code. We welcome contributions from developers, designers, and students.",
      helpful: 47
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const tutorials = [
    {
      title: "Getting Started with Goatly",
      duration: "5 min",
      level: "Beginner",
      thumbnail: "🎬",
      description: "Learn the basics of Goatly in this quick introduction video."
    },
    {
      title: "Mastering Study Rooms",
      duration: "8 min", 
      level: "Intermediate",
      thumbnail: "🏠",
      description: "Discover how to create and manage effective study rooms."
    },
    {
      title: "Advanced Analytics Guide",
      duration: "12 min",
      level: "Advanced", 
      thumbnail: "📊",
      description: "Deep dive into understanding and using your study analytics."
    },
    {
      title: "Community Features Overview",
      duration: "6 min",
      level: "Beginner",
      thumbnail: "👥", 
      description: "Explore all community features and how to make the most of them."
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
                <a href="/support" className={`font-semibold text-blue-600`}>
                  Support
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
                💬 Community Help Center
              </span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
               theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              <span className="block">How Can We</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Help You Today?
              </span>
            </h1>

            <p className={`text-xl sm:text-2xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Find answers, learn new features, and get the most out of your Goatly experience.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className={`relative rounded-lg ${
                theme === 'light' ? 'bg-white' : 'bg-slate-800'
              }`}>
                <input
                  type="text"
                  placeholder="Search for help articles, tutorials, or FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-6 py-4 rounded-lg text-lg ${
                    theme === 'light'
                      ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                      : 'bg-slate-800 border border-gray-700 text-white placeholder-gray-400'
                  }`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-2xl">🔍</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              <a
                href="https://discord.gg/5wBNne8Z3f"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-6 rounded-lg transition-all transform hover:scale-105 text-center ${
                  theme === 'light'
                    ? 'bg-white border border-gray-200 hover:shadow-xl'
                    : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
                }`}
              >
                <div className="text-3xl mb-3">💬</div>
                <h3 className={`font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Live Chat Support
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Get instant help from our community
                </p>
              </a>

              <a
                href="/contact"
                className={`p-6 rounded-lg transition-all transform hover:scale-105 text-center ${
                  theme === 'light'
                    ? 'bg-white border border-gray-200 hover:shadow-xl'
                    : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
                }`}
              >
                <div className="text-3xl mb-3">📧</div>
                <h3 className={`font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Email Support
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Send us a detailed message
                </p>
              </a>

              <a
                href="https://github.com/izzeldeenn/goatly/issues"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-6 rounded-lg transition-all transform hover:scale-105 text-center ${
                  theme === 'light'
                    ? 'bg-white border border-gray-200 hover:shadow-xl'
                    : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
                }`}
              >
                <div className="text-3xl mb-3">🐛</div>
                <h3 className={`font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Report a Bug
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Help us improve Goatly
                </p>
              </a>

              <a
                href="/features"
                className={`p-6 rounded-lg transition-all transform hover:scale-105 text-center ${
                  theme === 'light'
                    ? 'bg-white border border-gray-200 hover:shadow-xl'
                    : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
                }`}
              >
                <div className="text-3xl mb-3">📚</div>
                <h3 className={`font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Feature Requests
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Suggest new features
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedCategory === category.id
                      ? theme === 'light'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'light'
                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-slate-800 border border-gray-700 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-3xl font-bold mb-8 text-center ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200'
                      : 'bg-slate-800/50 border border-gray-700'
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-3 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {faq.question}
                  </h3>
                  <p className={`mb-4 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {faq.answer}
                  </p>
                  <div className={`flex items-center justify-between text-sm ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <span>👍 {faq.helpful} people found this helpful</span>
                    <button className="hover:text-blue-600 transition-colors">
                      Was this helpful?
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-900/50'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Video Tutorials
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Learn Goatly features step-by-step with our video guides
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tutorials.map((tutorial, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg transition-all transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
                  }`}
                >
                  <div className="text-4xl mb-4 text-center">{tutorial.thumbnail}</div>
                  <h3 className={`font-bold mb-2 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {tutorial.title}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {tutorial.description}
                  </p>
                  <div className={`flex items-center justify-between text-sm ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <span>⏱️ {tutorial.duration}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      tutorial.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                      tutorial.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {tutorial.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Still Need Help?
            </h2>
            <p className={`text-xl mb-12 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Our support team is here to help you succeed with Goatly
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className={`p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-4xl mb-4">📧</div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Email Support
                </h3>
                <p className={`mb-6 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Get help via email within 24 hours. Perfect for detailed questions and technical issues.
                </p>
                <a
                  href="/contact"
                  className={`inline-block px-6 py-3 rounded-lg font-semibold transition-all ${
                    theme === 'light'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Send Email
                </a>
              </div>

              <div className={`p-8 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-4xl mb-4">💬</div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Discord Community
                </h3>
                <p className={`mb-6 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Join our active Discord community for instant help, study tips, and connect with other students.
                </p>
                <a
                  href="https://discord.gg/5wBNne8Z3f"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block px-6 py-3 rounded-lg font-semibold transition-all ${
                    theme === 'light'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Join Discord
                </a>
              </div>
            </div>

            <div className={`p-8 rounded-lg ${
              theme === 'light'
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-slate-800 border border-blue-700'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                🎓 Premium Support
              </h3>
              <p className={`mb-4 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Premium users get priority support with faster response times and dedicated assistance.
              </p>
              <a
                href="/pricing"
                className={`inline-block px-6 py-3 rounded-lg font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Upgrade to Premium
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
              We're here to help you succeed
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
