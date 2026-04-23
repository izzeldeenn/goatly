'use client';

import crypto from 'crypto';

// Detect user's country from timezone and language
export function detectCountry(): string {
  if (typeof window === 'undefined') {
    return 'Unknown';
  }

  try {
    // Get timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Get language
    const language = navigator.language || navigator.languages?.[0] || 'en';
    
    // Map timezone to country
    const timezoneToCountry: { [key: string]: string } = {
      'Asia/Riyadh': 'Saudi Arabia',
      'Asia/Dubai': 'United Arab Emirates',
      'Asia/Kuwait': 'Kuwait',
      'Asia/Qatar': 'Qatar',
      'Asia/Bahrain': 'Bahrain',
      'Asia/Muscat': 'Oman',
      'Europe/London': 'United Kingdom',
      'Europe/Paris': 'France',
      'Europe/Berlin': 'Germany',
      'Europe/Madrid': 'Spain',
      'Europe/Rome': 'Italy',
      'Europe/Amsterdam': 'Netherlands',
      'Europe/Brussels': 'Belgium',
      'Europe/Vienna': 'Austria',
      'Europe/Zurich': 'Switzerland',
      'Europe/Stockholm': 'Sweden',
      'Europe/Oslo': 'Norway',
      'Europe/Copenhagen': 'Denmark',
      'Europe/Helsinki': 'Finland',
      'Europe/Istanbul': 'Turkey',
      'Europe/Athens': 'Greece',
      'Europe/Warsaw': 'Poland',
      'Europe/Prague': 'Czech Republic',
      'Europe/Budapest': 'Hungary',
      'Europe/Bucharest': 'Romania',
      'Europe/Sofia': 'Bulgaria',
      'Europe/Zagreb': 'Croatia',
      'Europe/Ljubljana': 'Slovenia',
      'Europe/Bratislava': 'Slovakia',
      'Europe/Vilnius': 'Lithuania',
      'Europe/Riga': 'Latvia',
      'Europe/Tallinn': 'Estonia',
      'Europe/Dublin': 'Ireland',
      'Europe/Lisbon': 'Portugal',
      'America/New_York': 'United States',
      'America/Los_Angeles': 'United States',
      'America/Chicago': 'United States',
      'America/Phoenix': 'United States',
      'America/Denver': 'United States',
      'America/Toronto': 'Canada',
      'America/Vancouver': 'Canada',
      'America/Montreal': 'Canada',
      'America/Mexico_City': 'Mexico',
      'America/Bogota': 'Colombia',
      'America/Lima': 'Peru',
      'America/Santiago': 'Chile',
      'America/Buenos_Aires': 'Argentina',
      'America/Sao_Paulo': 'Brazil',
      'Asia/Tokyo': 'Japan',
      'Asia/Seoul': 'South Korea',
      'Asia/Shanghai': 'China',
      'Asia/Hong_Kong': 'Hong Kong',
      'Asia/Singapore': 'Singapore',
      'Asia/Kolkata': 'India',
      'Asia/Karachi': 'Pakistan',
      'Asia/Dhaka': 'Bangladesh',
      'Asia/Jakarta': 'Indonesia',
      'Asia/Manila': 'Philippines',
      'Asia/Bangkok': 'Thailand',
      'Asia/Ho_Chi_Minh': 'Vietnam',
      'Asia/Kuala_Lumpur': 'Malaysia',
      'Australia/Sydney': 'Australia',
      'Australia/Melbourne': 'Australia',
      'Pacific/Auckland': 'New Zealand',
      'Africa/Cairo': 'Egypt',
      'Africa/Lagos': 'Nigeria',
      'Africa/Johannesburg': 'South Africa',
      'Africa/Casablanca': 'Morocco',
      'Africa/Tunis': 'Tunisia',
      'Africa/Algiers': 'Algeria',
    };

    // Try to get country from timezone
    let country = timezoneToCountry[timezone];
    
    // If not found, try to extract from language code
    if (!country) {
      const langCode = language.split('-')[1] || language.split('_')[1];
      if (langCode) {
        const countryMap: { [key: string]: string } = {
          'SA': 'Saudi Arabia',
          'AE': 'United Arab Emirates',
          'KW': 'Kuwait',
          'QA': 'Qatar',
          'BH': 'Bahrain',
          'OM': 'Oman',
          'EG': 'Egypt',
          'MA': 'Morocco',
          'TN': 'Tunisia',
          'DZ': 'Algeria',
          'GB': 'United Kingdom',
          'US': 'United States',
          'CA': 'Canada',
          'FR': 'France',
          'DE': 'Germany',
          'ES': 'Spain',
          'IT': 'Italy',
          'NL': 'Netherlands',
          'BE': 'Belgium',
          'AT': 'Austria',
          'CH': 'Switzerland',
          'SE': 'Sweden',
          'NO': 'Norway',
          'DK': 'Denmark',
          'FI': 'Finland',
          'TR': 'Turkey',
          'GR': 'Greece',
          'PL': 'Poland',
          'CZ': 'Czech Republic',
          'HU': 'Hungary',
          'RO': 'Romania',
          'BG': 'Bulgaria',
          'HR': 'Croatia',
          'SI': 'Slovenia',
          'SK': 'Slovakia',
          'LT': 'Lithuania',
          'LV': 'Latvia',
          'EE': 'Estonia',
          'IE': 'Ireland',
          'PT': 'Portugal',
          'MX': 'Mexico',
          'CO': 'Colombia',
          'PE': 'Peru',
          'CL': 'Chile',
          'AR': 'Argentina',
          'BR': 'Brazil',
          'JP': 'Japan',
          'KR': 'South Korea',
          'CN': 'China',
          'HK': 'Hong Kong',
          'SG': 'Singapore',
          'IN': 'India',
          'PK': 'Pakistan',
          'BD': 'Bangladesh',
          'ID': 'Indonesia',
          'PH': 'Philippines',
          'TH': 'Thailand',
          'VN': 'Vietnam',
          'MY': 'Malaysia',
          'AU': 'Australia',
          'NZ': 'New Zealand',
          'NG': 'Nigeria',
          'ZA': 'South Africa',
        };
        country = countryMap[langCode.toUpperCase()] || 'Unknown';
      } else {
        country = 'Unknown';
      }
    }

    return country;
  } catch (error) {
    return 'Unknown';
  }
}

// Generate or retrieve a unique user account ID based on device
export function getAccountId(): string {
  if (typeof window === 'undefined') {
    return 'server-account';
  }
  
  // Try to get from localStorage first
  let accountId = localStorage.getItem('fahman_hub_account_id');
  
  if (!accountId) {
    // Try session storage (for private browsing)
    try {
      accountId = sessionStorage.getItem('fahman_hub_account_id');
    } catch (error) {
      // Session storage not available
    }
  }
  
  if (!accountId) {
    // Generate a new unique account ID with hash key
    accountId = generateAccountId();
    
    // Try to save to localStorage
    try {
      localStorage.setItem('fahman_hub_account_id', accountId);
    } catch (error) {
      // Private browsing mode, try session storage
      try {
        sessionStorage.setItem('fahman_hub_account_id', accountId);
      } catch (sessionError) {
        // Using in-memory account ID for private browsing
      }
    }
  }
  
  return accountId;
}

function generateAccountId(): string {
  try {
    // Create a unique hash based on device fingerprint
    const deviceFingerprint = createDeviceFingerprint();
    
    const hash = crypto.createHash('sha256').update(deviceFingerprint).digest('hex');
    
    // Use a more stable account ID format without timestamp for consistency
    const accountId = `user_${hash.substring(0, 16)}`;
    return accountId;
  } catch (error) {
    // Fallback for private browsing or restricted environments
    // Try to get from sessionStorage first for consistency
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const existingFallbackId = sessionStorage.getItem('fahman_hub_fallback_account_id');
        if (existingFallbackId) {
          return existingFallbackId;
        }
      } catch (e) {
        // Session storage not accessible
      }
    }
    
    // Generate new fallback ID only if needed
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fallbackId = `fallback_${timestamp}_${random}`;
    
    // Save fallback ID to sessionStorage for consistency
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem('fahman_hub_fallback_account_id', fallbackId);
      } catch (e) {
        // Could not save fallback ID to sessionStorage
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
  const accountId = getAccountId();
  const isFallback = accountId.startsWith('fallback_');
  
  // Check if account info exists
  let accountInfo = localStorage.getItem('fahman_hub_account_info');
  
  if (accountInfo) {
    const info = JSON.parse(accountInfo);
    // Update last login time
    info.lastLogin = new Date().toISOString();
    try {
      localStorage.setItem('fahman_hub_account_info', JSON.stringify(info));
    } catch (error) {
      // Failed to update localStorage
    }
    return info;
  }
  
  // Create new account info
  let hashKey, username, email;
  
  if (isFallback) {
    // Fallback account for private browsing
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    hashKey = `fallback_${timestamp}`;
    username = `PrivateUser${random}`;
    email = `private${random}@fahman.local`;
  } else {
    // Regular account
    hashKey = generateHashKey(accountId);
    username = generateUsername(accountId);
    email = `${username}@fahman.local`;
  }
  
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
  
  // Try to save to localStorage, but handle private browsing gracefully
  try {
    localStorage.setItem('fahman_hub_account_info', JSON.stringify(info));
  } catch (error) {
    // Fallback to session storage for private browsing
    try {
      sessionStorage.setItem('fahman_hub_account_info', JSON.stringify(info));
    } catch (sessionError) {
      // Using in-memory storage only
    }
  }
  
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

// Generate a unique device ID based on hardware characteristics (stable across browsers)
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server-device';
  }

  // Try to get from localStorage first
  let deviceId = localStorage.getItem('fahman_hub_device_id');

  if (!deviceId) {
    // Try session storage (for private browsing)
    try {
      deviceId = sessionStorage.getItem('fahman_hub_device_id');
    } catch (error) {
      // Session storage not available
    }
  }

  if (!deviceId) {
    // Generate a new unique device ID based on hardware fingerprint
    deviceId = generateDeviceId();

    // Try to save to localStorage
    try {
      localStorage.setItem('fahman_hub_device_id', deviceId);
    } catch (error) {
      // Private browsing mode, try session storage
      try {
        sessionStorage.setItem('fahman_hub_device_id', deviceId);
      } catch (sessionError) {
        // Using in-memory device ID for private browsing
      }
    }
  }

  return deviceId;
}

function generateDeviceId(): string {
  try {
    // Create a device fingerprint based on hardware characteristics (stable across browsers)
    const deviceFingerprint = [
      navigator.platform,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      (navigator as any).deviceMemory || 'unknown',
      (navigator as any).maxTouchPoints || 0,
    ].join('|');

    const hash = crypto.createHash('sha256').update(deviceFingerprint).digest('hex');
    return `device_${hash.substring(0, 16)}`;
  } catch (error) {
    // Fallback for restricted environments
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `device_fallback_${timestamp}_${random}`;
  }
}

// Generate a unique browser ID based on browser-specific characteristics
export function getBrowserId(): string {
  if (typeof window === 'undefined') {
    return 'server-browser';
  }

  // Try to get from localStorage first
  let browserId = localStorage.getItem('fahman_hub_browser_id');

  if (!browserId) {
    // Try session storage (for private browsing)
    try {
      browserId = sessionStorage.getItem('fahman_hub_browser_id');
    } catch (error) {
      // Session storage not available
    }
  }

  if (!browserId) {
    // Generate a new unique browser ID based on browser fingerprint
    browserId = generateBrowserId();

    // Try to save to localStorage
    try {
      localStorage.setItem('fahman_hub_browser_id', browserId);
    } catch (error) {
      // Private browsing mode, try session storage
      try {
        sessionStorage.setItem('fahman_hub_browser_id', browserId);
      } catch (sessionError) {
        // Using in-memory browser ID for private browsing
      }
    }
  }

  return browserId;
}

function generateBrowserId(): string {
  try {
    // Create a browser fingerprint based on browser-specific characteristics
    const browserFingerprint = [
      navigator.userAgent,
      navigator.language,
      navigator.languages?.join(',') || '',
      (navigator as any).vendor || '',
      (navigator as any).product || '',
      (navigator as any).appName || '',
    ].join('|');

    const hash = crypto.createHash('sha256').update(browserFingerprint).digest('hex');
    return `browser_${hash.substring(0, 16)}`;
  } catch (error) {
    // Fallback for restricted environments
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `browser_fallback_${timestamp}_${random}`;
  }
}

// Legacy functions for backward compatibility
export function getLegacyDeviceId(): string {
  return getAccountId();
}

export function getDeviceInfo() {
  return getAccountInfo();
}
