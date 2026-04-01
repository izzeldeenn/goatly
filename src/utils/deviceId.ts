'use client';

import crypto from 'crypto';

// Generate or retrieve a unique user account ID based on device
export function getAccountId(): string {
  if (typeof window === 'undefined') {
    console.log('🖥️ Server environment detected');
    return 'server-account';
  }

  console.log('🔍 Getting account ID...');
  
  // Try to get from localStorage first
  let accountId = localStorage.getItem('fahman_hub_account_id');
  console.log('📦 LocalStorage account ID:', accountId);
  
  if (!accountId) {
    // Try session storage (for private browsing)
    try {
      accountId = sessionStorage.getItem('fahman_hub_account_id');
      console.log('📦 SessionStorage account ID:', accountId);
    } catch (error) {
      console.log('❌ Session storage not available:', error);
    }
  }
  
  if (!accountId) {
    console.log('🔄 No account ID found, generating new one...');
    // Generate a new unique account ID with hash key
    accountId = generateAccountId();
    console.log('🆕 Generated account ID:', accountId);
    
    // Try to save to localStorage
    try {
      localStorage.setItem('fahman_hub_account_id', accountId);
      console.log('✅ Saved to localStorage');
    } catch (error) {
      console.log('❌ LocalStorage failed:', error);
      // Private browsing mode, try session storage
      try {
        sessionStorage.setItem('fahman_hub_account_id', accountId);
        console.log('✅ Saved to sessionStorage');
      } catch (sessionError) {
        console.log('❌ SessionStorage also failed:', sessionError);
        console.log('💾 Using in-memory account ID for private browsing');
      }
    }
  }
  
  console.log('✅ Final account ID:', accountId);
  return accountId;
}

function generateAccountId(): string {
  console.log('🔄 Generating account ID...');
  try {
    console.log('🔍 Creating device fingerprint...');
    // Create a unique hash based on device fingerprint
    const deviceFingerprint = createDeviceFingerprint();
    console.log('📱 Device fingerprint:', deviceFingerprint);
    
    const hash = crypto.createHash('sha256').update(deviceFingerprint).digest('hex');
    
    // Use a more stable account ID format without timestamp for consistency
    const accountId = `user_${hash.substring(0, 16)}`;
    console.log('✅ Generated stable account ID:', accountId);
    return accountId;
  } catch (error) {
    console.log('❌ Error generating normal account ID:', error);
    // Fallback for private browsing or restricted environments
    // Try to get from sessionStorage first for consistency
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const existingFallbackId = sessionStorage.getItem('fahman_hub_fallback_account_id');
        if (existingFallbackId) {
          console.log('🔄 Reusing existing fallback account ID:', existingFallbackId);
          return existingFallbackId;
        }
      } catch (e) {
        console.log('❌ Session storage not accessible:', e);
      }
    }
    
    // Generate new fallback ID only if needed
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fallbackId = `fallback_${timestamp}_${random}`;
    console.log('🔄 Generated new fallback account ID:', fallbackId);
    
    // Save fallback ID to sessionStorage for consistency
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem('fahman_hub_fallback_account_id', fallbackId);
      } catch (e) {
        console.log('❌ Could not save fallback ID to sessionStorage:', e);
      }
    }
    
    return fallbackId;
  }
}

function createDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server-fingerprint';
  }

  // Collect device information for fingerprinting
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    (navigator as any).deviceMemory || 'unknown'
  ].join('|');

  return fingerprint;
}

// Get account info for user identification
export function getAccountInfo(): {
  accountId: string;
  username: string;
  email: string;
  hashKey: string;
  deviceInfo: any;
  createdAt: string;
  lastLogin: string;
} {
  console.log('🔍 Getting account info...');
  const accountId = getAccountId();
  const isFallback = accountId.startsWith('fallback_');
  console.log('📊 Is fallback account:', isFallback);
  
  // Check if account info exists
  let accountInfo = localStorage.getItem('fahman_hub_account_info');
  
  if (accountInfo) {
    console.log('📦 Found existing account info');
    const info = JSON.parse(accountInfo);
    // Update last login time
    info.lastLogin = new Date().toISOString();
    try {
      localStorage.setItem('fahman_hub_account_info', JSON.stringify(info));
      console.log('✅ Updated account info in localStorage');
    } catch (error) {
      console.log('❌ Failed to update localStorage:', error);
    }
    console.log('✅ Returning existing account info');
    return info;
  }
  
  console.log('🔄 Creating new account info...');
  // Create new account info
  let hashKey, username, email;
  
  if (isFallback) {
    // Fallback account for private browsing
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    hashKey = `fallback_${timestamp}`;
    username = `PrivateUser${random}`;
    email = `private${random}@fahman.local`;
    console.log('🔄 Created fallback account details');
  } else {
    // Regular account
    hashKey = generateHashKey(accountId);
    username = generateUsername(accountId);
    email = `${username}@fahman.local`;
    console.log('🔄 Created regular account details');
  }
  
  console.log('📝 Creating account info object with:', { accountId, username, email, isFallback });
  
  const info = {
    accountId,
    username,
    email,
    hashKey,
    deviceInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language || 'ar',
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  console.log('💾 Attempting to save account info...');
  // Try to save to localStorage, but handle private browsing gracefully
  try {
    localStorage.setItem('fahman_hub_account_info', JSON.stringify(info));
    console.log('✅ Saved account info to localStorage');
  } catch (error) {
    console.log('❌ LocalStorage failed:', error);
    // Fallback to session storage for private browsing
    try {
      sessionStorage.setItem('fahman_hub_account_info', JSON.stringify(info));
      console.log('✅ Saved account info to sessionStorage');
    } catch (sessionError) {
      console.log('❌ SessionStorage also failed:', sessionError);
      console.log('💾 Using in-memory storage only');
    }
  }
  
  console.log('✅ Created and saved new account info');
  return info;
}

function generateHashKey(accountId: string): string {
  // Generate a unique hash key for the account
  const timestamp = Date.now();
  const random = Math.random().toString(36);
  const combined = `${accountId}_${timestamp}_${random}`;
  
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 32);
}

function generateUsername(accountId: string): string {
  // Generate a friendly username based on account ID
  const adjectives = ['Smart', 'Creative', 'Focused', 'Dedicated', 'Productive', 'Brilliant', 'Motivated', 'Disciplined'];
  const nouns = ['Learner', 'Student', 'Scholar', 'Master', 'Expert', 'Genius', 'Champion', 'Achiever'];
  
  const randomIndex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
  };
  
  const hash = randomIndex(accountId);
  const adjective = adjectives[hash % adjectives.length];
  const noun = nouns[Math.floor(hash / adjectives.length) % nouns.length];
  const number = (hash % 9999) + 1;
  
  return `${adjective}${noun}${number}`;
}

// Legacy functions for backward compatibility
export function getDeviceId(): string {
  return getAccountId();
}

export function getDeviceInfo() {
  return getAccountInfo();
}
