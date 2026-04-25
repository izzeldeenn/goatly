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

export default function NewsletterPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CustomThemeProvider>
      <NewsletterPageContent />
    </CustomThemeProvider>
  );
}

function NewsletterPageContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const customTheme = useCustomThemeClasses();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail('');
    }, 3000);
  };

  const recentNewsletters = [
    {
      id: 1,
      title: "🍅 The Pomodoro Revolution",
      excerpt: "Discover how thousands of students are using the Pomodoro technique to boost their productivity by 300%",
      date: "2024-04-15",
      readTime: "5 min read",
      category: "Study Tips"
    },
    {
      id: 2,
      title: "🚀 New AI Features Released!",
      excerpt: "We're excited to announce our latest AI-powered study recommendations and smart scheduling features",
      date: "2024-04-12",
      readTime: "3 min read",
      category: "Product Updates"
    },
    {
      id: 3,
      title: "🏆 Community Challenge Winners",
      excerpt: "Meet the winners of our 30-day focus marathon and learn their secrets to success",
      date: "2024-04-08",
      readTime: "7 min read",
      category: "Community"
    },
    {
      id: 4,
      title: "📚 Building Better Study Habits",
      excerpt: "Science-backed strategies to create sustainable study habits that last a lifetime",
      date: "2024-04-05",
      readTime: "6 min read",
      category: "Research"
    }
  ];

  const newsletterStats = [
    {
      number: "50K+",
      label: "Active Subscribers"
    },
    {
      number: "95%",
      label: "Open Rate"
    },
    {
      number: "4.8",
      label: "Average Rating"
    },
    {
      number: "Weekly",
      label: "Publication Frequency"
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
                <a href="/newsletter" className={`font-semibold text-blue-600`}>
                  Newsletter
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
                📧 Weekly Newsletter
              </span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
               theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              <span className="block">Study Smarter,</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Not Harder
              </span>
            </h1>

            <p className={`text-xl sm:text-2xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Get weekly study tips, productivity hacks, and exclusive updates delivered to your inbox. Join 50,000+ students leveling up their study game.
            </p>

            {/* Subscribe Form */}
            <div className="max-w-md mx-auto mb-12">
              {isSubscribed ? (
                <div className={`p-6 rounded-lg text-center ${
                  theme === 'light' ? 'bg-green-50 border border-green-200' : 'bg-green-900/50 border border-green-700'
                }`}>
                  <div className="text-3xl mb-2">🎉</div>
                  <h3 className={`text-lg font-bold mb-2 ${
                    theme === 'light' ? 'text-green-800' : 'text-green-200'
                  }`}>
                    Successfully Subscribed!
                  </h3>
                  <p className={`${
                    theme === 'light' ? 'text-green-700' : 'text-green-300'
                  }`}>
                    Check your email for a welcome message.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className={`flex flex-col sm:flex-row gap-4 p-6 rounded-lg ${
                  theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-800 shadow-lg'
                }`}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className={`flex-1 px-6 py-4 rounded-lg ${
                      theme === 'light'
                        ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                        : 'bg-slate-700 border border-gray-600 text-white placeholder-gray-400'
                    }`}
                  />
                  <button
                    type="submit"
                    className={`px-8 py-4 rounded-lg font-semibold transition-all ${
                      theme === 'light'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Subscribe Free
                  </button>
                </form>
              )}
              
              <p className={`text-sm mt-4 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {newsletterStats.map((stat, index) => (
                <div key={index} className={`text-center p-6 rounded-lg ${
                  theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-800 shadow-lg'
                }`}>
                  <div className={`text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                    {stat.number}
                  </div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What You'll Get */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                What You'll Get
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Actionable insights delivered to your inbox every week
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className={`text-center p-6 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-4xl mb-4">💡</div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Study Tips
                </h3>
                <p className={`${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Evidence-based techniques to improve your focus and retention
                </p>
              </div>

              <div className={`text-center p-6 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-4xl mb-4">🚀</div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Product Updates
                </h3>
                <p className={`${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Be the first to know about new features and improvements
                </p>
              </div>

              <div className={`text-center p-6 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-4xl mb-4">🎓</div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Success Stories
                </h3>
                <p className={`${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Learn from real students achieving their academic goals
                </p>
              </div>

              <div className={`text-center p-6 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-4xl mb-4">🔬</div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Research Insights
                </h3>
                <p className={`${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Latest findings from learning science and productivity research
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Newsletters */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-900/50'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Recent Newsletters
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                See what our subscribers are reading every week
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {recentNewsletters.map((newsletter) => (
                <article
                  key={newsletter.id}
                  className={`p-6 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 shadow-lg hover:shadow-2xl'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className={`text-xl font-bold mb-2 ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {newsletter.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      newsletter.category === 'Study Tips' ? 'bg-green-100 text-green-700' :
                      newsletter.category === 'Product Updates' ? 'bg-blue-100 text-blue-700' :
                      newsletter.category === 'Community' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {newsletter.category}
                    </span>
                  </div>
                  
                  <p className={`mb-4 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {newsletter.excerpt}
                  </p>

                  <div className={`flex items-center justify-between text-sm ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <span>📅 {newsletter.date}</span>
                    <span>⏱️ {newsletter.readTime}</span>
                  </div>

                  <button className={`mt-4 text-blue-600 font-medium hover:text-blue-700 transition-colors`}>
                    Read Full Article →
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                What Our Readers Say
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Join thousands of students who look forward to our newsletter every week
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className={`p-6 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-xl">⭐</span>
                  ))}
                </div>
                <p className={`mb-4 italic ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  "The Goatly newsletter transformed my study habits. Every tip is practical and immediately applicable."
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold`}>
                    A
                  </div>
                  <div>
                    <div className={`font-bold ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      Ahmed M.
                    </div>
                    <div className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Computer Science Student
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-xl">⭐</span>
                  ))}
                </div>
                <p className={`mb-4 italic ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  "I look forward to the Goatly newsletter every Monday. It's the perfect way to start my study week!"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold`}>
                    S
                  </div>
                  <div>
                    <div className={`font-bold ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      Sarah K.
                    </div>
                    <div className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Medical Student
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-lg ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800/50 border border-gray-700 shadow-lg'
              }`}>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-xl">⭐</span>
                  ))}
                </div>
                <p className={`mb-4 italic ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  "The research-backed tips have helped me improve my grades while studying less. Game changer!"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold`}>
                    M
                  </div>
                  <div>
                    <div className={`font-bold ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      Maria R.
                    </div>
                    <div className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Engineering Student
                    </div>
                  </div>
                </div>
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
              Ready to Level Up Your Study Game?
            </h2>
            <p className={`text-xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Join 50,000+ students who receive our weekly newsletter and transform their study habits.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => document.getElementById('newsletter-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="group px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center gap-2"
              >
                Subscribe Now
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
              <a
                href="/blog"
                className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all transform hover:scale-105 flex items-center gap-2 ${
                  theme === 'light'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-white hover:bg-gray-800'
                }`}
              >
                Read Past Issues
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
              Study smarter, not harder
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
