# <img src="public/mrfrogo.png" alt="Mr Frogo" width="30"> Frogo - Focus, Rise, Organize, Grow, Overcome

A smart study time management platform inspired by the wisdom of Mr. Frogo.

## 📋 Aboutmr_frogo

**Frogo** is a revolutionary study time management platform that combines the wisdom of focused productivity with modern web technology. Born from the philosophy of Mr. Frogo - a wise frog who understood that success comes not from jumping frequently, but from jumping purposefully.

### 🎯 Our Mission
To help students and professionals transform their study habits through:
- **Focused Learning** - Eliminate distractions and concentrate on what matters
- **Smart Progress Tracking** - Monitor improvement with real-time analytics
- **Gamified Experience** - Make productivity enjoyable and rewarding
- **Community Growth** - Learn and compete with like-minded individuals

### 🐸 The Mr. Frogo Philosophy
*"The secret isn't in jumping a lot... The secret is in jumping in the right direction."*

This simple yet profound principle guides everything we build - every feature, every timer, every achievement is designed to help you make your next jump count.

### 🚀 Why Frogo?
- **Science-Based** - Built on proven productivity techniques
- **Community-Driven** - Shaped by user feedback and real-world usage
- **Privacy-First** - Your data stays yours, always
- **Open Source** - Transparent, customizable, and free forever

## 📖 The Story of Mr. Frogo

On a quiet night beside a small pond, there was a frog different from all the others.

While other frogs jumped aimlessly, this frog sat on a stone near the water, holding a warm cup of coffee and staring at the sky, deep in thought.

His name was Mr. Frogo.

Frogo didn't like chaos or wasting time.
He believed that every jump should be toward a goal.

As time passed, Frogo discovered a simple secret:
The mind is like a pond... if it's calm and clear, you can see everything perfectly.

But when the pond fills with noise, vision disappears.

That's why Frogo started his own method:
sit calmly, drink his coffee, think, then make one focused jump toward a single goal.

And with every jump, he became better.

After years, others started asking:
"How can you focus like that?"

Frogo smiled and said:

"The secret isn't in jumping a lot...
The secret is in jumping in the right direction."

And from there, the FROGO platform was born.

A place that helps people to:

**Focus**
**Rise** 
**Organize**
**Grow**
**Overcome**

And now, every time you enter the platform, you'll find Mr. Frogo sitting with his coffee, waiting for you to say:

"Ready for the next jump?"

## ✨ Key Features

### 📊 **Real-time Leaderboard**
- **WebSocket-based** - Real-time updates without polling
- **State Protection** - Protects local timer from conflicts
- **Auto-sync** - Automatic save every 10 seconds
- **Real-time collaboration** - Instant updates for all users

### ⏱️ **Smart Timer System**
- **Multiple timer types** - YouTube, Pomodoro, Custom
- **Time tracking** - Accurate time tracking to the second
- **Points system** - Points for every 10 seconds of study
- **Formatted display** - Time display in hours, minutes, and seconds

### 🎮 **Gamification System**
- **Coins** - Gold coins as rewards
- **Achievements** - Achievements when reaching goals
- **Leaderboard** - Compete with other users
- **Avatar system** - Customizable profile pictures

### 💾 **Data System**
- **SQLite** - Fast local database
- **Device identification** - Unique ID for each device
- **Data persistence** - Permanent data storage
- **API integration** - Complete API interface

## 🚀 Quick Start

### Requirements
- Node.js 18+
- npm/yarn/pnpm

### Installation
```bash
# Clone the project
git clone <repository-url>
cd frogo

# Install dependencies
npm install

# Run WebSocket server
npm run ws-server

# Run the app
npm run dev
```

### Access the application
- **App:** http://localhost:3000
- **WebSocket Server:** ws://localhost:8080

## 🏗️ Technical Architecture

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Modern styling
- **React Context** - Global state management

### Backend
- **WebSocket Server** - Real-time communications
- **SQLite Database** - Local storage
- **Next.js API Routes** - RESTful API
- **Node.js Runtime** - Server-side operations

### Technical Features
- **Real-time Updates** - No polling required
- **State Management** - Local state protection
- **Database Sync** - Smart synchronization
- **Error Handling** - Robust error management

## 📱 User Interface

### Main Page
- **Timer control** - Start/stop timer
- **Time display** - Show elapsed time
- **Study mode** - Choose study style
- **Quick stats** - Quick statistics

### Leaderboard
- **Real-time ranking** - Live ranking
- **User profiles** - User information
- **Study statistics** - Study statistics
- **Achievement badges** - Achievement badges

### Settings
- **Device name** - Device name
- **Avatar selection** - Choose profile picture
- **Theme settings** - Appearance settings
- **Data management** - Data management

## 🔧 Development

### File Structure
```
src/
├── app/                 # Next.js App Router
│   ├── api/             # API routes
│   ├── page.tsx         # Main page
│   └── layout.tsx       # Global layout
├── components/          # React components
│   ├── Timer/           # Timer components
│   ├── Leaderboard/     # Leaderboard components
│   └── UI/              # UI components
├── contexts/            # React Context
│   ├── UserContext.tsx  # User management
│   └── GamificationContext.tsx
├── lib/                 # Helper libraries
│   ├── sqlite.ts        # Database operations
│   ├── websocket-server.ts # WebSocket server
│   └── utils/           # Helper functions
└── utils/               # Utilities
    ├── deviceId.ts      # Device identification
    └── timeFormat.ts    # Time formatting
```

### Available Commands
```bash
# Development
npm run dev              # Run development server
npm run build           # Build production version
npm run start           # Run production server
npm run ws-server       # Run WebSocket server

# Code quality
npm run lint            # Check code
```

## 🎯 Core Concepts

### **Real-time Architecture**
- **WebSocket Connection** - Persistent connection
- **Event Broadcasting** - Send to everyone
- **State Synchronization** - State sync
- **Conflict Resolution** - Conflict handling

### **Data Flow**
1. **Local Update** - Instant UI updates
2. **Accumulation** - Batch updates
3. **Batch Sync** - Periodic database save
4. **Broadcast** - Send to other clients

### **State Protection**
- **Local First** - Priority to local state
- **Selective Sync** - Selective synchronization
- **Conflict Handling** - Conflict handling
- **Data Integrity** - Data integrity

## 🛠️ Customization

### Adding a new timer
```typescript
// in components/Timer
interface TimerProps {
  onStart: () => void;
  onStop: () => void;
  onTimeUpdate: (seconds: number) => void;
}
```

### Modifying WebSocket messages
```typescript
// in lib/websocket-server.ts
interface CustomMessage {
  type: 'custom_action';
  data: any;
}
```

### Adding achievements
```typescript
// in contexts/GamificationContext.tsx
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
}
```

## 🐛 Troubleshooting

### Common Issues
- **WebSocket not working** - Check port 8080
- **Time not saving** - Make sure ws-server is running
- **State conflicts** - Restart the app
- **Database error** - Check file permissions

### Debugging
```bash
# Run with logging
DEBUG=* npm run dev

# Check WebSocket connection
curl -i -N \
     -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: test" \
     -H "Sec-WebSocket-Version: 13" \
     http://localhost:8080/ws
```

## 📈 Performance

### Optimizations
- **Lazy Loading** - Load on demand
- **Debouncing** - Reduce requests
- **Caching** - Temporary storage
- **Optimistic Updates** - Optimistic updates

### Metrics
- **WebSocket Latency** - < 50ms
- **Database Operation** - < 100ms
- **UI Response Time** - < 16ms
- **Memory Usage** - < 100MB

## 🔒 Security

### Protection
- **Input Validation** - Input validation
- **SQL Injection Prevention** - Prevent SQL injection
- **Rate Limiting** - Rate limiting
- **Data Sanitization** - Data sanitization

### Privacy
- **Local Storage** - Local storage only
- **No Tracking** - No tracking
- **Data Control** - User control
- **Minimal Data** - Minimal data only

## 🤝 Contributing

### How to contribute
1. **Fork** the project
2. **Create Branch** for feature
3. **Code Changes** with tests
4. **Pull Request** with description
5. **Code Review** from team

### Standards
- **TypeScript** - Strong types
- **ESLint** - Clean code
- **Tests** - Full coverage
- **Docs** - Clear documentation

## 📄 License

MIT License - Freedom to use, modify, and distribute

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **WebSocket Community** - Real-time technology
- **SQLite Team** - Fast database
- **React Community** - Rich ecosystem

---

**🚀 Developed with ❤️ to help students manage their study time wisely!**

**📞 For contact and support:**
Find Mr. Frogo sitting by his pond, always ready for the next focused jump.

*"The secret isn't in jumping a lot... The secret is in jumping in the right direction."* - Mr. Frogo