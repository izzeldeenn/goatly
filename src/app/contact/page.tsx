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

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CustomThemeProvider>
      <ContactPageContent />
    </CustomThemeProvider>
  );
}

function ContactPageContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const customTheme = useCustomThemeClasses();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
    }, 2000);
  };

  const contactOptions = [
    {
      icon: '💬',
      title: 'Discord Community',
      description: 'Join our active Discord server for instant help and community discussions',
      action: 'Join Discord',
      link: 'https://discord.gg/5wBNne8Z3f',
      color: 'blue'
    },
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Send us a detailed message and we\'ll respond within 24 hours',
      action: 'Send Email',
      link: 'mailto:support@goatly.app',
      color: 'green'
    },
    {
      icon: '🐙',
      title: 'GitHub Issues',
      description: 'Report bugs or request features directly on our GitHub repository',
      action: 'Open Issue',
      link: 'https://github.com/izzeldeenn/goatly/issues',
      color: 'purple'
    },
    {
      icon: '🐦',
      title: 'Social Media',
      description: 'Follow us for updates, tips, and community highlights',
      action: 'Follow Us',
      link: 'https://twitter.com/goatly_app',
      color: 'sky'
    }
  ];

  const faqs = [
    {
      question: "What's the best way to get technical support?",
      answer: "For technical issues, join our Discord server where our community and support team can help you instantly. For complex issues, create a GitHub issue with detailed information."
    },
    {
      question: "How quickly do you respond to emails?",
      answer: "We typically respond to emails within 24 hours during business days. Premium users get priority support with faster response times."
    },
    {
      question: "Can I request a feature?",
      answer: "Absolutely! We love feature requests. The best way is to create an issue on GitHub with detailed description of the feature and why it would be valuable."
    },
    {
      question: "Do you offer phone support?",
      answer: "Currently, we don't offer phone support. However, our Discord community and email support are very responsive for most needs."
    },
    {
      question: "How can I report a security issue?",
      answer: "For security-related issues, please email security@goatly.app directly. We take security very seriously and will respond promptly."
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
                <a href="/contact" className={`font-semibold text-blue-600`}>
                  Contact
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
                📞 Get in Touch
              </span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
               theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              <span className="block">We're Here to</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Help You Succeed
              </span>
            </h1>

            <p className={`text-xl sm:text-2xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Whether you have questions, feedback, or need support - our team and community are ready to help.
            </p>
          </div>
        </section>

        {/* Quick Contact Options */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactOptions.map((option, index) => (
                <a
                  key={index}
                  href={option.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-6 rounded-lg transition-all duration-300 transform hover:scale-105 text-center ${
                    theme === 'light'
                      ? 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                      : 'bg-slate-800/50 border border-gray-700 shadow-lg hover:shadow-2xl'
                  }`}
                >
                  <div className="text-4xl mb-4">{option.icon}</div>
                  <h3 className={`text-lg font-bold mb-2 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {option.title}
                  </h3>
                  <p className={`text-sm mb-4 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {option.description}
                  </p>
                  <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    option.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                    option.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                    option.color === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                    'bg-sky-100 text-sky-700 hover:bg-sky-200'
                  }`}>
                    {option.action}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-900/50'
        }`}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Send Us a Message
              </h2>
              <p className={`text-xl ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Fill out the form below and we'll get back to you as soon as possible
              </p>
            </div>

            {submitStatus === 'success' && (
              <div className={`mb-8 p-6 rounded-lg text-center ${
                theme === 'light' ? 'bg-green-50 border border-green-200' : 'bg-green-900/50 border border-green-700'
              }`}>
                <div className="text-3xl mb-2">✅</div>
                <h3 className={`text-lg font-bold mb-2 ${
                  theme === 'light' ? 'text-green-800' : 'text-green-200'
                }`}>
                  Message Sent Successfully!
                </h3>
                <p className={`${
                  theme === 'light' ? 'text-green-700' : 'text-green-300'
                }`}>
                  We'll get back to you within 24 hours.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className={`p-8 rounded-lg ${
              theme === 'light'
                ? 'bg-white border border-gray-200 shadow-lg'
                : 'bg-slate-800 border border-gray-700 shadow-lg'
            }`}>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        : 'bg-slate-700 border-gray-600 text-white placeholder-gray-400'
                    }`}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        : 'bg-slate-700 border-gray-600 text-white placeholder-gray-400'
                    }`}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-white border-gray-300 text-gray-900'
                        : 'bg-slate-700 border-gray-600 text-white'
                    }`}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        : 'bg-slate-700 border-gray-600 text-white placeholder-gray-400'
                    }`}
                    placeholder="What's this about?"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      : 'bg-slate-700 border-gray-600 text-white placeholder-gray-400'
                  }`}
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <div className="flex items-center justify-between">
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  We'll respond within 24 hours during business days.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : theme === 'light'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Frequently Asked Questions
              </h2>
              <p className={`text-xl ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Quick answers to common questions
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
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
                  <p className={`${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Office Hours */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-slate-100' : 'bg-gradient-to-br from-slate-800 to-gray-900'
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Office Hours & Support Times
              </h2>
              <p className={`text-xl ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                When you can expect to hear from us
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className={`p-6 rounded-lg text-center ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-3xl mb-4">📧</div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Email Support
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Monday - Friday: 9 AM - 6 PM EST
                </p>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Response within 24 hours
                </p>
              </div>

              <div className={`p-6 rounded-lg text-center ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-3xl mb-4">💬</div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Discord Community
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  24/7 Community Support
                </p>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Instant help from community
                </p>
              </div>

              <div className={`p-6 rounded-lg text-center ${
                theme === 'light'
                  ? 'bg-white border border-gray-200 shadow-lg'
                  : 'bg-slate-800 border border-gray-700 shadow-lg'
              }`}>
                <div className="text-3xl mb-4">🐙</div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  GitHub Issues
                </h3>
                <p className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Monday - Friday: Business Hours
                </p>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Technical issues prioritized
                </p>
              </div>
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
