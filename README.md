# <img src="public/goat.png" alt="Mr Goatly" width="30"> Goatly - Focus, Rise, Organize, Grow, Overcome

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Community](https://img.shields.io/badge/community-Open%20Source-orange.svg)
![Language](https://img.shields.io/badge/TypeScript-blue.svg)
![Framework](https://img.shields.io/badge/Next.js-black.svg)

**🌟 An open-source community-driven study time management platform built by students, for students.**

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen.svg)](https://goatly-community.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Contribute-purple.svg)](https://github.com/izzeldeenn/GOATLY)
[![Discord](https://img.shields.io/badge/Discord-Join-7289da.svg)](https://discord.gg/5wBNne8Z3f)

</div>

## 📖 Table of Contents

- [🌟 About](#-about)
- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [🤝 Contributing](#-contributing)
- [📊 Community Impact](#-community-impact)
- [🔧 Development](#-development)
- [📄 License](#-license)

## 🌟 About

Goatly is more than just a study timer—it's a comprehensive open-source platform designed to help students achieve deep focus and academic excellence through community-driven tools and collaborative learning.

### Our Mission

> **"Focus Together, Succeed Together"** - We believe that the power of community can transform individual study habits into collective success.

### What Makes Goatly Different

- **🌍 Community-Driven**: Built by students, for students
- **🔓 Open Source**: Transparent, customizable, and free forever
- **🎯 Focus-Oriented**: Designed specifically for deep work and concentration
- **📊 Data-Driven**: Smart analytics to track and improve study patterns
- **🤝 Collaborative**: Learn from peers and share success strategies

### � The Mr. Goatly Philosophy

*"The secret isn't in jumping a lot... The secret is in jumping in the right direction."*

This simple yet profound principle guides everything we build - every feature, every timer, every achievement is designed to help you make your next jump count.

## ✨ Features

### 🎯 Core Study Tools

| Feature | Description |
|---------|-------------|
| **🧘 Deep Focus Mode** | Community-tested techniques for achieving maximum concentration |
| **📈 Smart Goal Tracking** | Set, track, and achieve academic goals with peer support |
| **🔥 Streak Tracking** | Maintain consistent study habits with community accountability |
| **📊 Progress Analytics** | Visual insights into your study patterns and improvement areas |

### 🌟 Community Features

| Feature | Description |
|---------|-------------|
| **💬 Peer Support Network** | Connect with motivated students worldwide |
| **🏆 Community Challenges** | Participate in focus challenges and competitions |
| **📚 Shared Resources** | Access community-curated study materials and techniques |
| **🎓 Success Stories** | Learn from real experiences of fellow students |

### 🛠️ Technical Features

| Feature | Description |
|---------|-------------|
| **🌙 Dark/Light Themes** | Comfortable studying in any environment |
| **📱 Responsive Design** | Study on any device, anywhere |
| **🔄 Real-time Updates** | Live progress tracking and community interactions |
| **🔐 Privacy-First** | Your data is yours - we don't sell or share it |

### ⚡ Advanced Features

- **📊 Real-time Leaderboard** - WebSocket-based live updates without polling
- **⏱️ Smart Timer System** - Multiple timer types (YouTube, Pomodoro, Custom)
- **🎮 Gamification System** - Coins, achievements, and avatar customization
- **💾 Smart Data System** - SQLite with device identification and API integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/izzeldeenn/GOATLY.git
cd GOATLY

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the App

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run WebSocket server (for real-time features)
npm run ws-server
```

Visit [http://localhost:3000](http://localhost:3000) to see Goatly in action!

## 🛠️ Tech Stack

### Frontend

- **⚛️ Next.js 14** - React framework with App Router
- **📘 TypeScript** - Type-safe development
- **🎨 Tailwind CSS** - Utility-first styling
- **🔥 Framer Motion** - Smooth animations
- **🌙 Next Themes** - Dark/light mode support

### Backend & Database

- **🗄️ Supabase** - PostgreSQL database & real-time features
- **🔐 NextAuth.js** - Authentication & security
- **📊 Real-time Subscriptions** - Live updates
- **🌐 WebSocket Server** - Real-time communications

### Development Tools

- **📦 ESLint & Prettier** - Code quality
- **🧪 Jest & Testing Library** - Testing framework
- **🚀 Vercel** - Deployment platform

### Architecture

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── focus/          # Main application
│   └── page.tsx        # Landing page
├── components/         # Reusable UI components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── utils/             # Utility functions
└── constants/         # App constants
```

## 🤝 Contributing

We welcome contributions from everyone! Whether you're a developer, designer, or student passionate about focus and productivity.

### 🎯 How to Contribute

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **💫 Make your changes**
4. **✅ Test thoroughly**
5. **📤 Commit and push**
   ```bash
   git commit -m 'Add amazing feature'
   git push origin feature/amazing-feature
   ```
6. **🔄 Create a Pull Request**

### 🏷️ Contribution Areas

- **🐛 Bug Fixes**: Help us squash those bugs!
- **✨ New Features**: Suggest and implement new study tools
- **📚 Documentation**: Improve our docs and README
- **🎨 Design**: UI/UX improvements and themes
- **🌍 Translation**: Help us reach more students worldwide

### 📋 Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation when necessary
- Be respectful and constructive in PR discussions

## 📊 Community Impact

### 📈 Our Growing Community

| Metric | Current | Goal |
|--------|---------|------|
| **👥 Community Members** | 1,000+ | 10,000+ |
| **📚 Study Hours Tracked** | 50,000+ | 1,000,000+ |
| **🎯 Goals Achieved** | 5,000+ | 100,000+ |
| **🌍 Countries Represented** | 25+ | 100+ |

### 🏆 Success Stories

> *"This community transformed my academic life. The open-source approach and peer support kept me accountable and focused."* - Ahmed Mohammed, Computer Science Student

> *"Being part of this community made all the difference. We share techniques, motivate each other, and celebrate success together."* - Sarah Ahmed, Medical Student

> *"The collaborative environment and open-source tools helped me develop sustainable study habits and achieve my goals."* - Mohammed Ali, Engineering Student

## 🔧 Development

### 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run ws-server` | Run WebSocket server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run type-check` | TypeScript type checking |

### 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 🚀 Deployment

Goatly is deployed on Vercel for seamless integration:

```bash
# Deploy to Vercel
npm run deploy

# Or use the Vercel CLI
vercel --prod
```

### 📱 User Interface

#### Main Page
- **Timer control** - Start/stop timer
- **Time display** - Show elapsed time
- **Study mode** - Choose study style
- **Quick stats** - Quick statistics

#### Leaderboard
- **Real-time ranking** - Live ranking
- **User profiles** - User information
- **Study statistics** - Study statistics
- **Achievement badges** - Achievement badges

#### Settings
- **Device name** - Device name
- **Avatar selection** - Choose profile picture
- **Theme settings** - Appearance settings
- **Data management** - Data management

## 🌟 Roadmap

### 🚀 Upcoming Features

- [ ] **📱 Mobile App** - Native iOS and Android applications
- [ ] **🤖 AI Study Assistant** - Personalized study recommendations
- [ ] **🎮 Gamification** - Points, badges, and leaderboards
- [ ] **👥 Study Groups** - Create and join focused study groups
- [ ] **📝 Note Integration** - Connect with popular note-taking apps
- [ ] **🔔 Smart Notifications** - Intelligent reminder system

### 🌍 Community Goals

- [ ] **🌐 Multi-language Support** - Reach students globally
- [ ] **🏫 School Integration** - Partner with educational institutions
- [ ] **📚 Resource Library** - Comprehensive study material collection
- [ ] **🎓 Certification Program** - Recognize study achievements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🤝 What MIT Means

- ✅ **Freedom**: Use, modify, and distribute freely
- ✅ **Commercial Use**: Use in commercial projects
- ✅ **No Warranty**: Use at your own risk
- ✅ **Attribution**: Include original license and copyright

## 🙏 Acknowledgments

### 🌟 Special Thanks

- **👥 Our Community Contributors** - Everyone who helped build Goatly
- **🎨 Design Inspiration** - Modern productivity and focus apps
- **📚 Educational Resources** - Study techniques and research
- **🛠️ Open Source Community** - Tools and libraries that make this possible

### 📚 Resources & Inspiration

- [Deep Work by Cal Newport](https://www.calnewport.com/books/deep-work/)
- [Pomodoro Technique](https://francescocirillo.com/pages/pomodoro-technique)
- [Open Source Community Guidelines](https://opensource.guide/)

## 📞 Get in Touch

### 🌐 Connect With Us

| Platform | Link |
|----------|------|
| **🚀 GitHub** | [github.com/izzeldeenn/GOATLY](https://github.com/izzeldeenn/GOATLY) |
| **💬 Discord** | [discord.gg/5wBNne8Z3f](https://discord.gg/5wBNne8Z3f) |
| **🌐 Live Demo** | [goatly-community.vercel.app](https://goatly-community.vercel.app) |
| **📧 Email** | [support@goatly.app](mailto:support@goatly.app) |

### 🎯 Join Our Mission

Become part of a growing movement of students committed to focus, learning, and mutual success. Whether you want to:

- **🛠️ Contribute Code** - Help us build better features
- **📝 Share Feedback** - Tell us what works and what doesn't
- **🌍 Spread the Word** - Help other students discover Goatly
- **🤝 Partner With Us** - Schools, organizations, and communities

**Your journey starts here. Together, we focus, rise, organize, grow, and overcome with Goatly.**

---

<div align="center">

**⭐ Star this repo if it helped you focus better!**

Made with ❤️ by the Goatly Community

*"great of all time"*

**� "The secret isn't in jumping a lot... The secret is in jumping in the right direction." - Mr. Goatly**

</div>
