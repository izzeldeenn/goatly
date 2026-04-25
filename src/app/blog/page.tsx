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

export default function BlogPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CustomThemeProvider>
      <BlogPageContent />
    </CustomThemeProvider>
  );
}

function BlogPageContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const customTheme = useCustomThemeClasses();

  const categories = [
    { id: 'all', name: 'All Posts', icon: '📚' },
    { id: 'study-tips', name: 'Study Tips', icon: '💡' },
    { id: 'product-updates', name: 'Product Updates', icon: '🚀' },
    { id: 'success-stories', name: 'Success Stories', icon: '🎓' },
    { id: 'community', name: 'Community', icon: '🤝' },
    { id: 'research', name: 'Research', icon: '🔬' }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "The Science of Focus: How Your Brain Learns Best",
      excerpt: "Discover the neuroscience behind effective studying and learn evidence-based techniques to maximize your focus and retention.",
      author: "Dr. Sarah Johnson",
      date: "2024-04-15",
      readTime: "8 min read",
      category: "research",
      image: "🧠",
      featured: true,
      tags: ["neuroscience", "focus", "learning"]
    },
    {
      id: 2,
      title: "10 Study Techniques Backed by Science",
      excerpt: "From spaced repetition to active recall, explore proven study methods that top students use to excel.",
      author: "Ahmed Mohammed",
      date: "2024-04-12",
      readTime: "6 min read",
      category: "study-tips",
      image: "📖",
      featured: true,
      tags: ["study-tips", "techniques", "science"]
    },
    {
      id: 3,
      title: "New Feature: AI-Powered Study Recommendations",
      excerpt: "We're excited to introduce our latest AI feature that personalizes your study experience based on your learning patterns.",
      author: "Goatly Team",
      date: "2024-04-10",
      readTime: "4 min read",
      category: "product-updates",
      image: "🤖",
      featured: false,
      tags: ["AI", "new-features", "personalization"]
    },
    {
      id: 4,
      title: "From Struggling Student to Top Performer: Maria's Story",
      excerpt: "How Maria transformed her grades and study habits using Goatly's community features and focus tools.",
      author: "Maria Rodriguez",
      date: "2024-04-08",
      readTime: "5 min read",
      category: "success-stories",
      image: "🌟",
      featured: true,
      tags: ["success-story", "transformation", "motivation"]
    },
    {
      id: 5,
      title: "Building Study Communities: The Goatly Approach",
      excerpt: "Learn how collaborative studying can boost your motivation and why community-driven learning works.",
      author: "Team Goatly",
      date: "2024-04-05",
      readTime: "7 min read",
      category: "community",
      image: "👥",
      featured: false,
      tags: ["community", "collaboration", "motivation"]
    },
    {
      id: 6,
      title: "The Pomodoro Technique: Does It Really Work?",
      excerpt: "We analyzed data from 10,000+ study sessions to find out if the Pomodoro technique lives up to the hype.",
      author: "Research Team",
      date: "2024-04-03",
      readTime: "9 min read",
      category: "research",
      image: "🍅",
      featured: false,
      tags: ["pomodoro", "research", "productivity"]
    },
    {
      id: 7,
      title: "How to Create the Perfect Study Environment",
      excerpt: "From lighting to sound, discover the essential elements of an optimal study space and how to set it up.",
      author: "Lisa Chen",
      date: "2024-04-01",
      readTime: "6 min read",
      category: "study-tips",
      image: "🏠",
      featured: false,
      tags: ["environment", "setup", "productivity"]
    },
    {
      id: 8,
      title: "Community Challenge Results: 30-Day Focus Marathon",
      excerpt: "See the amazing results from our latest community challenge and learn from the winners' strategies.",
      author: "Goatly Team",
      date: "2024-03-28",
      readTime: "5 min read",
      category: "community",
      image: "🏆",
      featured: false,
      tags: ["challenge", "results", "community"]
    }
  ];

  const filteredPosts = blogPosts.filter(post => 
    selectedCategory === 'all' || post.category === selectedCategory
  );

  const featuredPosts = blogPosts.filter(post => post.featured);

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
                <a href="/blog" className={`font-semibold text-blue-600`}>
                  Blog
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
                📝 Community Blog
              </span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
               theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              <span className="block">Insights, Tips, and</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Success Stories
              </span>
            </h1>

            <p className={`text-xl sm:text-2xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Learn from our community, discover study techniques, and stay updated with the latest features and research.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a
                href="/focus"
                className="group px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="flex items-center gap-2">
                  Start Learning
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </a>
              <a
                href="#featured"
                className={`px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all transform hover:scale-105 flex items-center justify-center ${
                  theme === 'light'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-white hover:bg-gray-800'
                }`}
              >
                Read Featured Posts
              </a>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section id="featured" className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className={`text-3xl font-bold mb-8 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Featured Posts
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <article
                  key={post.id}
                  className={`group p-6 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
                  }`}
                >
                  <div className="text-4xl mb-4 text-center">{post.image}</div>
                  
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      post.category === 'research' ? 'bg-purple-100 text-purple-700' :
                      post.category === 'study-tips' ? 'bg-green-100 text-green-700' :
                      post.category === 'success-stories' ? 'bg-blue-100 text-blue-700' :
                      post.category === 'product-updates' ? 'bg-orange-100 text-orange-700' :
                      post.category === 'community' ? 'bg-pink-100 text-pink-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {categories.find(c => c.id === post.category)?.name || post.category}
                    </span>
                  </div>

                  <h3 className={`text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {post.title}
                  </h3>
                  
                  <p className={`mb-4 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {post.excerpt}
                  </p>

                  <div className={`flex items-center justify-between text-sm ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>👤 {post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📅 {post.date}</span>
                      <span>⏱️ {post.readTime}</span>
                    </div>
                  </div>

                  <a
                    href={`/blog/${post.id}`}
                    className={`mt-4 inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors`}
                  >
                    Read More →
                  </a>
                </article>
              ))}
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

        {/* All Posts */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className={`text-3xl font-bold mb-8 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              All Posts
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className={`group p-6 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 hover:shadow-2xl'
                  }`}
                >
                  <div className="text-3xl mb-4 text-center">{post.image}</div>
                  
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      post.category === 'research' ? 'bg-purple-100 text-purple-700' :
                      post.category === 'study-tips' ? 'bg-green-100 text-green-700' :
                      post.category === 'success-stories' ? 'bg-blue-100 text-blue-700' :
                      post.category === 'product-updates' ? 'bg-orange-100 text-orange-700' :
                      post.category === 'community' ? 'bg-pink-100 text-pink-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {categories.find(c => c.id === post.category)?.name || post.category}
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold mb-3 group-hover:text-blue-600 transition-colors ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {post.title}
                  </h3>
                  
                  <p className={`mb-4 text-sm line-clamp-3 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {post.excerpt}
                  </p>

                  <div className={`flex items-center justify-between text-xs ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>👤 {post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📅 {post.date}</span>
                      <span>⏱️ {post.readTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className={`px-2 py-1 rounded text-xs ${
                            theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href={`/blog/${post.id}`}
                      className={`text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm`}
                    >
                      Read →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-900/50'
        }`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Stay Updated
            </h2>
            <p className={`text-xl mb-12 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Get the latest study tips, feature updates, and community stories delivered to your inbox.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className={`flex flex-col sm:flex-row gap-4 ${
                theme === 'light' ? 'bg-white rounded-lg shadow-lg' : 'bg-slate-800 rounded-lg shadow-lg'
              }`}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`flex-1 px-6 py-4 rounded-lg ${
                    theme === 'light'
                      ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                      : 'bg-slate-800 border border-gray-700 text-white placeholder-gray-400'
                  }`}
                />
                <button className={`px-8 py-4 rounded-lg font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}>
                  Subscribe
                </button>
              </div>
              <p className={`text-sm mt-4 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
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
              Sharing knowledge, building community
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
