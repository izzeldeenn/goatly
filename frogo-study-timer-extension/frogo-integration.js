// frogo app integration script
// This script should be added to the frogo app to communicate with the browser extension

(function() {
  'use strict';
  
  // Check if extension is available
  let extensionAvailable = false;
  
  // Initialize integration
  function initFrogoIntegration() {
    // Check if we can communicate with extension
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      extensionAvailable = true;
      console.log('frogo extension detected');
    } else {
      console.log('frogo extension not available');
    }
    
    // Listen for messages from frogo app
    window.addEventListener('message', (event) => {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'frogoTimerCommand') {
        // Forward commands to extension background
        const runtime = typeof browser !== 'undefined' ? browser : chrome;
        runtime.sendMessage({
          action: event.data.command,
          data: event.data.data
        });
      } else if (event.data.type === 'frogoExtensionRequest') {
        // Handle extension requests
        handleExtensionRequest(event.data.action, event.data);
      }
    });
    
    // Notify extension that frogo app is ready
    notifyExtension('frogoAppReady', {});
  }
  
  // Handle extension requests
  function handleExtensionRequest(action, data) {
    switch (action) {
      case 'getCurrentUser':
        // Try to get current user from frogo app
        const user = getCurrentUserFromFrogo();
        window.postMessage({
          type: 'frogoExtensionResponse',
          action: action,
          user: user
        }, '*');
        break;
      case 'getUserByHashKey':
        // Get user by hash key
        const userByHash = getUserByHashKey(data.hashKey);
        window.postMessage({
          type: 'frogoExtensionResponse',
          action: action,
          user: userByHash
        }, '*');
        break;
      case 'syncTimerData':
        // Sync timer data
        const syncResult = syncTimerData(data.hashKey, data.timerData);
        window.postMessage({
          type: 'frogoExtensionResponse',
          action: action,
          success: true,
          data: syncResult
        }, '*');
        break;
    }
  }
  
  // Get current user from frogo app
  function getCurrentUserFromFrogo() {
    // Try different methods to get current user
    
    // Method 1: Check if UserContext is available
    if (window.frogoUserContext) {
      return window.frogoUserContext.getCurrentUser();
    }
    
    // Method 2: Check localStorage
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user;
      }
    } catch (error) {
      console.log('Failed to get user from localStorage:', error);
    }
    
    // Method 3: Check for other common storage keys
    const storageKeys = ['user', 'authUser', 'loggedInUser', 'frogoUser'];
    for (const key of storageKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const user = JSON.parse(data);
          if (user.id || user.accountId) {
            return user;
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }
  
  // Get user by hash key
  function getUserByHashKey(hashKey) {
    // This would be implemented in the frogo app
    // For now, return null - the frogo app needs to implement this
    console.log('getUserByHashKey called with:', hashKey);
    return null;
  }
  
  // Sync timer data
  function syncTimerData(hashKey, timerData) {
    // This would be implemented in the frogo app
    // For now, return success - the frogo app needs to implement this
    console.log('syncTimerData called with:', hashKey, timerData);
    return { success: true };
  }
  
  // Handle messages from extension
  function handleExtensionMessage(event) {
    if (event.data.type === 'frogoTimerEvent') {
      handleTimerEvent(event.data.event, event.data.data);
    }
  }
  
  // Handle timer events from extension
  function handleTimerEvent(event, data) {
    switch (event) {
      case 'timerStarted':
        onTimerStarted(data);
        break;
      case 'timerStopped':
        onTimerStopped(data);
        break;
      case 'sessionComplete':
        onSessionComplete(data);
        break;
      default:
        console.log('Unknown timer event:', event, data);
    }
  }
  
  // Timer event handlers
  function onTimerStarted(data) {
    console.log('Timer started from extension:', data);
    
    // Update frogo app state
    if (window.frogoTimerState) {
      window.frogoTimerState.isRunning = true;
      window.frogoTimerState.currentSession = data.session;
    }
    
    // Update UI if timer components are available
    updateTimerUI();
    
    // Start study session in frogo
    if (window.startStudySession) {
      window.startStudySession();
    }
  }
  
  function onTimerStopped(data) {
    console.log('Timer stopped from extension:', data);
    
    // Update frogo app state
    if (window.frogoTimerState) {
      window.frogoTimerState.isRunning = false;
    }
    
    // Update UI if timer components are available
    updateTimerUI();
    
    // End study session in frogo
    if (window.endStudySession) {
      window.endStudySession();
    }
  }
  
  function onSessionComplete(data) {
    console.log('Session completed from extension:', data);
    
    // Update frogo app state
    if (window.frogoTimerState) {
      window.frogoTimerState.completedSessions = data.completedSessions;
      window.frogoTimerState.currentSession = data.session;
    }
    
    // Show notification in frogo app
    showNotification('Session Complete!', `Great job! ${data.completedSessions} sessions completed.`);
    
    // Update UI
    updateTimerUI();
  }
  
  // Notify extension of events
  function notifyExtension(event, data) {
    if (extensionAvailable) {
      // Try to send message to extension
      try {
        chrome.runtime.sendMessage({
          action: 'frogoEvent',
          event: event,
          data: data
        });
      } catch (error) {
        console.log('Failed to communicate with extension:', error);
      }
    }
    
    // Also send via postMessage for content script
    window.postMessage({
      type: 'frogoTimerCommand',
      command: event,
      data: data
    }, '*');
  }
  
  // Update timer UI in frogo app
  function updateTimerUI() {
    // This would update the timer components in the frogo app
    // Implementation depends on the frogo app structure
    
    // Example: Update timer display
    const timerElements = document.querySelectorAll('[data-timer-display]');
    timerElements.forEach(element => {
      if (window.frogoTimerState) {
        const minutes = Math.floor(window.frogoTimerState.timeLeft / 60);
        const seconds = window.frogoTimerState.timeLeft % 60;
        element.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    });
    
    // Example: Update control buttons
    const startButtons = document.querySelectorAll('[data-timer-start]');
    const stopButtons = document.querySelectorAll('[data-timer-stop]');
    
    if (window.frogoTimerState && window.frogoTimerState.isRunning) {
      startButtons.forEach(btn => btn.disabled = true);
      stopButtons.forEach(btn => btn.disabled = false);
    } else {
      startButtons.forEach(btn => btn.disabled = false);
      stopButtons.forEach(btn => btn.disabled = true);
    }
  }
  
  // Show notification in frogo app
  function showNotification(title, message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
      <div style="font-size: 14px; opacity: 0.9;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }
  
  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Global frogo timer state
  window.frogoTimerState = {
    isRunning: false,
    timeLeft: 25 * 60,
    currentSession: 'work',
    completedSessions: 0
  };
  
  // Global frogo timer API
  window.frogoTimer = {
    start: function() {
      notifyExtension('startTimer', {});
    },
    
    stop: function() {
      notifyExtension('stopTimer', {});
    },
    
    reset: function() {
      notifyExtension('resetTimer', {});
    },
    
    getState: function() {
      return window.frogoTimerState;
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFrogoIntegration);
  } else {
    initFrogoIntegration();
  }
  
})();
