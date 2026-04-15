// Content script for frogo | study timer
// This script runs on all pages to communicate with the frogo app

// Listen for messages from the extension popup
const runtime = typeof browser !== 'undefined' ? browser : chrome;
runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'frogoTimerEvent') {
    // Forward timer events to the frogo app
    forwardToFrogoApp(request.event, request.data);
    sendResponse({ success: true });
  } else if (request.action === 'getCurrentUser') {
    // Get current user from frogo app
    getCurrentUserFromApp().then(user => {
      sendResponse({ user: user });
    }).catch(error => {
      sendResponse({ user: null, error: error.message });
    });
    return true; // Keep message channel open for async response
  } else if (request.action === 'getUserByHashKey') {
    // Get user by hash key from frogo app
    getUserByHashKey(request.hashKey).then(user => {
      sendResponse({ user: user });
    }).catch(error => {
      sendResponse({ user: null, error: error.message });
    });
    return true; // Keep message channel open for async response
  } else if (request.action === 'syncTimerData') {
    // Sync timer data with frogo app
    syncTimerData(request.hashKey, request.timerData).then(response => {
      sendResponse(response);
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }
});

// Get current user from frogo app
async function getCurrentUserFromApp() {
  return new Promise((resolve, reject) => {
    if (!isFrogoApp()) {
      reject(new Error('Not on frogo app'));
      return;
    }
    
    // Try to get user from window object
    try {
      // Send message to frogo app window
      window.postMessage({
        type: 'frogoExtensionRequest',
        action: 'getCurrentUser'
      }, '*');
      
      // Listen for response
      const timeout = setTimeout(() => {
        reject(new Error('Timeout getting user data'));
      }, 5000);
      
      const handleMessage = (event) => {
        if (event.data.type === 'frogoExtensionResponse' && event.data.action === 'getCurrentUser') {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          
          if (event.data.user) {
            resolve(event.data.user);
          } else {
            reject(new Error('No user logged in'));
          }
        }
      };
      
      window.addEventListener('message', handleMessage);
    } catch (error) {
      reject(error);
    }
  });
}

// Forward events to frogo app
function forwardToFrogoApp(event, data) {
  // Check if we're on the frogo app page
  if (isFrogoApp()) {
    // Send message to frogo app window
    window.postMessage({
      type: 'frogoTimerEvent',
      event: event,
      data: data
    }, '*');
  }
}

// Check if current page is frogo app
function isFrogoApp() {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === 'frogo-app.vercel.app';
}

// Get user by hash key from frogo app
async function getUserByHashKey(hashKey) {
  return new Promise((resolve, reject) => {
    if (!isFrogoApp()) {
      reject(new Error('Not on frogo app'));
      return;
    }
    
    // Send message to frogo app window
    window.postMessage({
      type: 'frogoExtensionRequest',
      action: 'getUserByHashKey',
      hashKey: hashKey
    }, '*');
    
    // Listen for response
    const timeout = setTimeout(() => {
      reject(new Error('Timeout getting user data'));
    }, 5000);
    
    const handleMessage = (event) => {
      if (event.data.type === 'frogoExtensionResponse' && event.data.action === 'getUserByHashKey') {
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
        
        if (event.data.user) {
          resolve(event.data.user);
        } else {
          resolve(null);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
  });
}

// Sync timer data with frogo app
async function syncTimerData(hashKey, timerData) {
  return new Promise((resolve, reject) => {
    if (!isFrogoApp()) {
      reject(new Error('Not on frogo app'));
      return;
    }
    
    // Send message to frogo app window
    window.postMessage({
      type: 'frogoExtensionRequest',
      action: 'syncTimerData',
      hashKey: hashKey,
      timerData: timerData,
      timestamp: Date.now()
    }, '*');
    
    // Listen for response
    const timeout = setTimeout(() => {
      reject(new Error('Timeout syncing timer data'));
    }, 5000);
    
    const handleMessage = (event) => {
      if (event.data.type === 'frogoExtensionResponse' && event.data.action === 'syncTimerData') {
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
        
        resolve({ success: true, data: event.data });
      }
    };
    
    window.addEventListener('message', handleMessage);
  });
}

// Listen for messages from frogo app
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.origin !== window.location.origin) return;
  
  if (event.data.type === 'frogoTimerCommand') {
    // Forward commands to extension background
    runtime.sendMessage({
      action: event.data.command,
      data: event.data.data
    });
  }
});

// Inject frogo timer integration script into frogo app
if (isFrogoApp()) {
  injectFrogoIntegration();
}

function injectFrogoIntegration() {
  const script = document.createElement('script');
  script.textContent = `
    // frogo timer integration script
    window.frogoTimerExtension = {
      // Send timer events to extension
      sendTimerEvent: function(event, data) {
        window.postMessage({
          type: 'frogoTimerCommand',
          command: event,
          data: data
        }, '*');
      },
      
      // Listen for extension events
      onExtensionEvent: function(callback) {
        window.addEventListener('message', function(event) {
          if (event.data.type === 'frogoTimerEvent') {
            callback(event.data.event, event.data.data);
          }
        });
      }
    };
    
    // Notify extension that frogo app is ready
    window.postMessage({
      type: 'frogoTimerCommand',
      command: 'frogoAppReady',
      data: {}
    }, '*');
  `;
  
  document.head.appendChild(script);
}
