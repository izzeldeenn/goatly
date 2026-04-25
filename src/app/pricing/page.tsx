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

export default function PricingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CustomThemeProvider>
      <PricingPageContent />
    </CustomThemeProvider>
  );
}

function PricingPageContent() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const customTheme = useCustomThemeClasses();

  const plans = [
    {
      name: 'Free',
      price: billingCycle === 'monthly' ? '$0' : '$0',
      description: 'Perfect for getting started',
      features: [
        'Basic focus timer',
        'Study room access',
        'Community features',
        'Basic analytics',
        '5 study sessions per day',
        'Standard themes'
      ],
      limitations: [
        'Limited storage',
        'Basic support',
        'No premium features'
      ],
      cta: 'Get Started',
      popular: false,
      color: 'gray'
    },
    {
      name: 'Student',
      price: billingCycle === 'monthly' ? '$4.99' : '$49.99',
      description: 'Most popular for students',
      features: [
        'Everything in Free',
        'Unlimited study sessions',
        'Advanced analytics',
        'Custom themes',
        'Priority support',
        'Export data',
        'Study room creation',
        'Achievement system'
      ],
      limitations: [],
      cta: 'Start Free Trial',
      popular: true,
      color: 'blue'
    },
    {
      name: 'Team',
      price: billingCycle === 'monthly' ? '$9.99' : '$99.99',
      description: 'For study groups and classes',
      features: [
        'Everything in Student',
        'Team management',
        'Collaborative analytics',
        'Custom study rooms',
        'Team challenges',
        'Admin dashboard',
        'API access',
        'White-label options'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple'
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
                <a href="/pricing" className={`font-semibold text-blue-600`}>
                  Pricing
                </a>
                <a href="/about" className={`transition-colors hover:text-blue-600 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  About
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
                💰 Free Forever
              </span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
               theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              <span className="block">Simple, Transparent</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>

            <p className={`text-xl sm:text-2xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Start free, upgrade when you need more. No hidden fees, no surprises. Always transparent pricing.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <span className={`text-lg font-medium ${
                billingCycle === 'monthly' 
                  ? theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                  : theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg font-medium ${
                billingCycle === 'yearly' 
                  ? theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                  : theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Yearly
                <span className={`ml-2 text-sm font-bold text-green-600`}>
                  Save 17%
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative p-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    plan.popular
                      ? theme === 'light'
                        ? 'bg-white border-2 border-blue-500 shadow-xl hover:shadow-2xl'
                        : 'bg-slate-800 border-2 border-blue-500 shadow-2xl hover:shadow-3xl'
                      : theme === 'light'
                        ? 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                        : 'bg-slate-800/50 border border-gray-700 shadow-lg hover:shadow-2xl'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold ${
                        theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className={`text-2xl font-bold mb-2 ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className={`text-4xl font-bold ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        {plan.price}
                      </span>
                      {plan.price !== '$0' && (
                        <span className={`text-lg ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <span className="text-green-500 mr-3 mt-1">✓</span>
                          <span className={`text-sm ${
                            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                          }`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start">
                          <span className="text-gray-400 mr-3 mt-1">-</span>
                          <span className={`text-sm ${
                            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {limitation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={plan.name === 'Team' ? '/contact' : '/focus'}
                    className={`w-full text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : theme === 'light'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-900/50'
        }`}>
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
                Everything you need to know about our pricing
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "Is Goatly really free forever?",
                  answer: "Yes! Our free plan includes all core features and will always remain free. You can study, join rooms, and use community features without ever paying."
                },
                {
                  question: "Can I change my plan anytime?",
                  answer: "Absolutely! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately, and we'll prorate any differences."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and various local payment methods depending on your country. All payments are processed securely."
                },
                {
                  question: "Do you offer educational discounts?",
                  answer: "Yes! Students with valid .edu email addresses get 50% off the Student plan. We also offer special pricing for educational institutions."
                },
                {
                  question: "Is my data safe and private?",
                  answer: "Absolutely! We're privacy-first and never sell your data. All plans include the same strong privacy protections and data ownership rights."
                },
                {
                  question: "Can I try premium features before upgrading?",
                  answer: "Yes! We offer a 14-day free trial of all premium features. No credit card required to start your trial."
                }
              ].map((faq, index) => (
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

        {/* CTA Section */}
        <section className={`py-24 px-4 sm:px-6 lg:px-8 ${
          theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-slate-100' : 'bg-gradient-to-br from-slate-800 to-gray-900'
        }`}>
          <div className="max-w-6xl mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Ready to Start Your Journey?
            </h2>
            <p className={`text-xl mb-12 max-w-3xl mx-auto ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Join thousands of students who are already achieving their goals with Goatly. Start free, upgrade when you're ready.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="/focus"
                className="group px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center gap-2"
              >
                Start Free Today
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="/contact"
                className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all transform hover:scale-105 flex items-center gap-2 ${
                  theme === 'light'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-white hover:bg-gray-800'
                }`}
              >
                Contact Sales
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
              Free forever, premium when you need it
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
