# 🚀 Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Security Verification
- [ ] All sensitive data removed from source code
- [ ] Environment variables validated
- [ ] `.env*` files in `.gitignore`
- [ ] No hardcoded credentials
- [ ] Example files contain placeholders only

### ✅ Environment Setup
- [ ] Supabase project created
- [ ] Database schema applied
- [ ] RLS policies configured
- [ ] Environment variables ready

---

## 🔧 Environment Variables

### Development (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Production (Vercel Dashboard)
1. Go to Vercel Project → Settings → Environment Variables
2. Add the same variables as development
3. Select appropriate environments (Production, Preview, Development)

---

## 🚀 Deployment Steps

### 1. GitHub Upload
```bash
# 1. Remove sensitive data (already done)
# 2. Commit changes
git add .
git commit -m "Security: Remove sensitive data and add validation"
git push origin main
```

### 2. Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
3. Add environment variables in Vercel dashboard
4. Deploy!

---

## 🔐 Production Security

### Supabase Configuration
```sql
-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public access (for demo)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- For production, consider stricter policies:
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = account_id);
```

### Environment Variable Security
- ✅ No private keys in client code
- ✅ Only public anon key exposed
- ✅ Server-side operations use service role key
- ✅ Database access controlled by RLS

---

## 📊 Monitoring & Security

### Security Headers (Next.js Config)
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];

module.exports = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Rate Limiting (Optional)
```javascript
// middleware.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

---

## 🎯 Post-Deployment Verification

### ✅ Functionality Tests
- [ ] User account creation works
- [ ] Leaderboard displays correctly
- [ ] Real-time updates work
- [ ] Multiple users can join
- [ ] Private browsing works

### ✅ Security Tests
- [ ] No credentials in client-side code
- [ ] Environment variables are secure
- [ ] Database access is restricted
- [ ] API endpoints are protected
- [ ] CORS is configured correctly

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📞 Support & Monitoring

### Error Tracking
- Set up Vercel Analytics
- Configure error reporting
- Monitor database performance
- Track user activity

### Backup Strategy
- Supabase automatic backups enabled
- Regular database exports
- Environment variable backups
- Code repository version control

---

## 🎉 Deployment Complete!

Your application is now:
✅ **Secure** - No sensitive data exposed
✅ **Scalable** - Ready for production traffic
✅ **Maintainable** - Proper CI/CD setup
✅ **Monitorable** - Error tracking enabled

**🚀 Ready for production!**
