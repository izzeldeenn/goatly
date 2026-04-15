// Hash-based connection for frogo | study timer

class FrogoAuth {
  constructor() {
    this.currentUser = null;
    this.isConnected = false;
    this.hashKey = null;
    this.frogoBaseUrl = 'http://localhost:3000'; // Change to production URL
  }

  // Initialize connection
  async init() {
    await this.loadStoredConnection();
    await this.checkConnection();
    return this.isConnected;
  }

  // Load stored connection data
  async loadStoredConnection() {
    try {
      const storage = typeof browser !== 'undefined' ? browser : chrome;
      const result = await storage.sync.get(['frogoConnection']);
      if (result.frogoConnection) {
        this.hashKey = result.frogoConnection.hashKey;
        this.currentUser = result.frogoConnection.user;
        this.isConnected = result.frogoConnection.isConnected;
      }
    } catch (error) {
      console.error('Failed to load connection data:', error);
    }
  }

  // Save connection data
  async saveConnectionData(user, hashKey) {
    try {
      this.currentUser = user;
      this.hashKey = hashKey;
      this.isConnected = true;
      
      const storage = typeof browser !== 'undefined' ? browser : chrome;
      await storage.sync.set({
        frogoConnection: {
          user: user,
          hashKey: hashKey,
          isConnected: true,
          lastSync: Date.now()
        }
      });
      
      console.log('Connection data saved successfully');
    } catch (error) {
      console.error('Failed to save connection data:', error);
    }
  }

  // Check connection status with frogo app
  async checkConnection() {
    try {
      if (!this.hashKey) {
        return false;
      }
      
      // Try to get user data via hash key
      const user = await this.getUserByHashKey(this.hashKey);
      
      if (user) {
        await this.saveConnectionData(user, this.hashKey);
        return true;
      } else {
        // Clear invalid connection
        await this.clearConnection();
        return false;
      }
    } catch (error) {
      console.log('Connection check failed:', error.message);
      return false;
    }
  }

  // Connect using hash key
  async connectWithHashKey(hashKey) {
    try {
      // Validate hash key format
      if (!this.isValidHashKey(hashKey)) {
        throw new Error('Invalid hash key format');
      }
      
      // Get user by hash key
      const user = await this.getUserByHashKey(hashKey);
      
      if (user) {
        await this.saveConnectionData(user, hashKey);
        return user;
      } else {
        throw new Error('User not found with this hash key');
      }
    } catch (error) {
      console.error('Hash key connection error:', error.message);
      throw error;
    }
  }

  // Get user by hash key from frogo app
  async getUserByHashKey(hashKey) {
    return new Promise((resolve, reject) => {
      // Use browser.tabs for Firefox compatibility
      const tabsAPI = typeof browser !== 'undefined' ? browser : chrome;
      tabsAPI.query({ url: ["http://localhost:3000/*", "https://frogo-app.vercel.app/*"] }, (tabs) => {
        if (tabs.length > 0) {
          // Send message to frogo tab to get user by hash key
          tabsAPI.tabs.sendMessage(tabs[0].id, {
            action: 'getUserByHashKey',
            hashKey: hashKey
          }, (response) => {
            if (response && response.user) {
              resolve(response.user);
            } else {
              resolve(null);
            }
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  // Validate hash key format
  isValidHashKey(hashKey) {
    // Hash key should be a string of reasonable length (32-128 characters)
    if (typeof hashKey !== 'string') return false;
    if (hashKey.length < 32 || hashKey.length > 128) return false;
    if (!/^[a-zA-Z0-9_-]+$/.test(hashKey)) return false;
    
    return true;
  }

  // Generate hash key prompt
  generateHashKeyPrompt() {
    return `To connect your frogo account:
    
1. Open frogo app on localhost:3000
2. Go to Settings/Profile
3. Find "Extension Hash Key"
4. Copy and paste the key here

The hash key looks like: a1b2c3d4e5f6... (32+ characters)`;
  }

  // Sync timer data with frogo
  async syncTimerData(timerData) {
    if (!this.isConnected) {
      throw new Error('Not connected to frogo');
    }

    try {
      // Send timer data to frogo app via content script
      const tabsAPI = typeof browser !== 'undefined' ? browser : chrome;
      const tabs = await new Promise(resolve => {
        tabsAPI.query({ url: ["http://localhost:3000/*", "https://frogo-app.vercel.app/*"] }, resolve);
      });

      if (tabs.length > 0) {
        await new Promise((resolve, reject) => {
          tabsAPI.tabs.sendMessage(tabs[0].id, {
            action: 'syncTimerData',
            hashKey: this.hashKey,
            timerData: timerData,
            timestamp: Date.now()
          }, (response) => {
            if (response && response.success) {
              resolve(response);
            } else {
              reject(new Error('Failed to sync timer data'));
            }
          });
        });
      }
    } catch (error) {
      console.error('Failed to sync timer data:', error);
      throw error;
    }
  }

  // Clear connection data
  async clearConnection() {
    try {
      this.currentUser = null;
      this.hashKey = null;
      this.isConnected = false;
      
      const storage = typeof browser !== 'undefined' ? browser : chrome;
      await storage.sync.remove(['frogoConnection']);
      console.log('Connection data cleared');
    } catch (error) {
      console.error('Failed to clear connection data:', error);
    }
  }

  // Get current user info
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if connected
  isConnectedToUser() {
    return this.isConnected && this.currentUser;
  }

  // Get user display name
  getUserDisplayName() {
    if (!this.currentUser) return 'Guest';
    
    return this.currentUser.username || 
           this.currentUser.email || 
           this.currentUser.displayName || 
           'User';
  }

  // Get user avatar
  getUserAvatar() {
    if (!this.currentUser) return null;
    
    return this.currentUser.avatar || 
           this.currentUser.photoURL || 
           null;
  }

  // Get hash key
  getHashKey() {
    return this.hashKey;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FrogoAuth;
} else {
  window.FrogoAuth = FrogoAuth;
}
