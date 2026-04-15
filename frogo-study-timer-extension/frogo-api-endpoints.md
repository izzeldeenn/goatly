# frogo API Endpoints for Extension Integration

## Authentication Endpoints

### GET /api/auth/me
Get current authenticated user information.

**Response:**
```json
{
  "ok": true,
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "displayName": "Display Name",
    "avatar": "https://example.com/avatar.jpg",
    "score": 1000,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Timer Endpoints

### POST /api/timer/sync
Sync timer data with frogo server.

**Request:**
```json
{
  "userId": "user_id",
  "timerData": {
    "timeLeft": 1500,
    "isRunning": true,
    "currentSession": "work",
    "completedSessions": 3
  },
  "timestamp": 1640995200000
}
```

**Response:**
```json
{
  "ok": true,
  "synced": true,
  "serverTime": 1640995200000
}
```

### GET /api/timer/history/:userId
Get user's timer history.

**Response:**
```json
{
  "ok": true,
  "history": [
    {
      "date": "2024-01-01",
      "sessions": 4,
      "totalTime": 5400,
      "score": 100
    }
  ]
}
```

## User Endpoints

### PUT /api/user/stats
Update user's study statistics.

**Request:**
```json
{
  "userId": "user_id",
  "stats": {
    "totalStudyTime": 3600,
    "sessions": 2,
    "streak": 5,
    "lastStudyDate": "2024-01-01"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "updated": true,
  "newStats": {
    "totalStudyTime": 3600,
    "sessions": 2,
    "streak": 5,
    "lastStudyDate": "2024-01-01"
  }
}
```

## Implementation in frogo App

Add these API routes to your frogo app:

```javascript
// pages/api/auth/me.js
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  // Get current user from session/token
  const user = await getCurrentUser(req);
  
  if (!user) {
    return res.json({ ok: false, error: 'Not authenticated' });
  }
  
  res.json({ ok: true, user });
}

// pages/api/timer/sync.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { userId, timerData, timestamp } = req.body;
  
  // Validate user
  const user = await getUserById(userId);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Invalid user' });
  }
  
  // Update user's timer data in database
  await updateTimerData(userId, timerData);
  
  res.json({ 
    ok: true, 
    synced: true, 
    serverTime: Date.now() 
  });
}

// pages/api/timer/history/[userId].js
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  const { userId } = req.query;
  
  // Get user's timer history
  const history = await getTimerHistory(userId);
  
  res.json({ ok: true, history });
}

// pages/api/user/stats.js
export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();
  
  const { userId, stats } = req.body;
  
  // Update user's statistics
  const updatedStats = await updateUserStats(userId, stats);
  
  res.json({ ok: true, updated: true, newStats: updatedStats });
}
```

## Security Considerations

1. **Authentication**: Use proper JWT tokens or session validation
2. **Authorization**: Ensure users can only access their own data
3. **Rate Limiting**: Implement rate limiting on API endpoints
4. **CORS**: Configure CORS properly for extension access
5. **Data Validation**: Validate all incoming data

## CORS Configuration

Add this to your frogo app's CORS configuration:

```javascript
// next.config.js or API middleware
const corsOptions = {
  origin: [
    'chrome-extension://*', // Chrome extensions
    'moz-extension://*',    // Firefox extensions
    'safari-web-extension://*' // Safari extensions
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## Testing the Integration

1. Start your frogo app on `localhost:3000`
2. Install the extension
3. Click "Connect to frogo" button
4. Check browser console for authentication logs
5. Verify timer data syncs properly

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check CORS configuration
2. **Authentication Failures**: Verify user session management
3. **Sync Issues**: Check network requests and API responses
4. **Extension Permissions**: Ensure extension has required permissions

### Debug Steps

1. Open browser DevTools
2. Check Network tab for API requests
3. Verify extension storage data
4. Check console for error messages
