// Background script for frogo | study timer
let studyTimer = null;
let startTime = null;
let isRunning = false;
let currentSession = null;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('frogo | study timer installed');
  
  // Set default settings
  chrome.storage.sync.set({
    timerSettings: {
      workMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 15,
      longBreakInterval: 4
    },
    timerState: {
      timeLeft: 25 * 60,
      isRunning: false,
      currentSession: 'work',
      completedSessions: 0
    }
  });
});

// Handle timer start/stop from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'startTimer':
      startTimer();
      sendResponse({ success: true });
      break;
      
    case 'stopTimer':
      stopTimer();
      sendResponse({ success: true });
      break;
      
    case 'resetTimer':
      resetTimer();
      sendResponse({ success: true });
      break;
      
    case 'getTimerState':
      getTimerState().then(state => sendResponse(state));
      return true; // Keep message channel open for async response
      
    case 'updateTimerSettings':
      updateTimerSettings(request.settings);
      sendResponse({ success: true });
      break;
  }
});

// Start timer function
function startTimer() {
  if (isRunning) return;
  
  chrome.storage.sync.get(['timerState'], (result) => {
    const state = result.timerState || {
      timeLeft: 25 * 60,
      isRunning: false,
      currentSession: 'work',
      completedSessions: 0
    };
    
    // Ensure timeLeft is valid
    if (!state.timeLeft || state.timeLeft <= 0) {
      state.timeLeft = 25 * 60;
    }
    
    isRunning = true;
    startTime = Date.now();
    currentSession = state.currentSession || 'work';
    
    // Update badge
    chrome.action.setBadgeText({ text: 'RUN' });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    
    // Start timer interval
    studyTimer = setInterval(() => {
      updateTimer();
    }, 1000);
    
    // Notify frogo app if possible
    notifyFrogoApp('timerStarted', { session: currentSession });
  });
}

// Stop timer function
function stopTimer() {
  if (!isRunning) return;
  
  isRunning = false;
  if (studyTimer) {
    clearInterval(studyTimer);
    studyTimer = null;
  }
  
  // Update badge
  chrome.action.setBadgeText({ text: '' });
  
  // Notify frogo app
  notifyFrogoApp('timerStopped', {});
}

// Reset timer function
function resetTimer() {
  stopTimer();
  
  chrome.storage.sync.get(['timerSettings'], (result) => {
    const settings = result.timerSettings || {};
    const defaultTime = settings.workMinutes || 25;
    
    chrome.storage.sync.set({
      timerState: {
        timeLeft: defaultTime * 60,
        isRunning: false,
        currentSession: 'work',
        completedSessions: 0
      }
    });
  });
}

// Update timer function
function updateTimer() {
  chrome.storage.sync.get(['timerState', 'timerSettings'], (result) => {
    const state = result.timerState || {
      timeLeft: 25 * 60,
      isRunning: false,
      currentSession: 'work',
      completedSessions: 0
    };
    const settings = result.timerSettings || {};
    
    // Ensure timeLeft is valid
    let currentTimeLeft = Number(state.timeLeft) || 25 * 60;
    if (currentTimeLeft <= 0) currentTimeLeft = 25 * 60;
    
    let newTimeLeft = currentTimeLeft - 1;
    let newCompletedSessions = state.completedSessions || 0;
    let newCurrentSession = state.currentSession || 'work';
    
    // Handle session completion
    if (newTimeLeft <= 0) {
      if (newCurrentSession === 'work') {
        newCompletedSessions++;
        
        // Check if it's time for a long break
        if (newCompletedSessions % settings.longBreakInterval === 0) {
          newCurrentSession = 'longBreak';
          newTimeLeft = settings.longBreakMinutes * 60;
        } else {
          newCurrentSession = 'shortBreak';
          newTimeLeft = settings.breakMinutes * 60;
        }
        
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Work Session Complete!',
          message: 'Time for a break!'
        });
      } else {
        // Break is over, back to work
        newCurrentSession = 'work';
        newTimeLeft = settings.workMinutes * 60;
        
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Break Complete!',
          message: 'Time to get back to work!'
        });
      }
      
      // Notify frogo app
      notifyFrogoApp('sessionComplete', {
        session: newCurrentSession,
        completedSessions: newCompletedSessions
      });
    }
    
    // Update storage
    chrome.storage.sync.set({
      timerState: {
        timeLeft: newTimeLeft,
        isRunning: isRunning,
        currentSession: newCurrentSession,
        completedSessions: newCompletedSessions
      }
    });
    
    // Update badge with time
    const minutes = Math.floor(newTimeLeft / 60);
    const seconds = newTimeLeft % 60;
    chrome.action.setBadgeText({ 
      text: `${minutes}:${seconds.toString().padStart(2, '0')}` 
    });
  });
}

// Get timer state
function getTimerState() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['timerState'], (result) => {
      resolve(result.timerState || {});
    });
  });
}

// Update timer settings
function updateTimerSettings(settings) {
  chrome.storage.sync.set({ timerSettings: settings });
}

// Notify frogo app (if it's open)
function notifyFrogoApp(event, data) {
  chrome.tabs.query({ url: ["http://localhost:3000/*", "https://frogo-app.vercel.app/*"] }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'frogoTimerEvent',
        event: event,
        data: data
      });
    });
  });
}

// Handle browser startup
chrome.runtime.onStartup.addListener(() => {
  // Restore timer state if it was running
  chrome.storage.sync.get(['timerState'], (result) => {
    const state = result.timerState || {};
    if (state.isRunning) {
      startTimer();
    }
  });
});
