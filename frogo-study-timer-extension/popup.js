// Popup script for frogo | study timer
let timerState = {};
let timerSettings = {};
let frogoAuth = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize authentication
  frogoAuth = new FrogoAuth();
  await frogoAuth.init();
  
  loadTimerState();
  loadTimerSettings();
  setupEventListeners();
  checkFrogoConnection();
  updateUserDisplay();
  
  // Update timer display every second
  setInterval(updateDisplay, 1000);
  
  // Sync with frogo every 30 seconds
  setInterval(syncWithFrogo, 30000);
});

// Load timer state from storage
function loadTimerState() {
  const storage = typeof browser !== 'undefined' ? browser : chrome;
  storage.sync.get(['timerState'], (result) => {
    timerState = result.timerState || {
      timeLeft: 25 * 60,
      isRunning: false,
      currentSession: 'work',
      completedSessions: 0
    };
    updateDisplay();
  });
}

// Load timer settings from storage
function loadTimerSettings() {
  const storage = typeof browser !== 'undefined' ? browser : chrome;
  storage.sync.get(['timerSettings'], (result) => {
    timerSettings = result.timerSettings || {
      workMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 15,
      longBreakInterval: 4
    };
    updateSettingsDisplay();
  });
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('startBtn').addEventListener('click', startTimer);
  document.getElementById('stopBtn').addEventListener('click', stopTimer);
  document.getElementById('resetBtn').addEventListener('click', resetTimer);
  
  // Settings inputs
  document.getElementById('workMinutes').addEventListener('change', updateSettings);
  document.getElementById('breakMinutes').addEventListener('change', updateSettings);
  document.getElementById('longBreakMinutes').addEventListener('change', updateSettings);
  
  // Connection buttons
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  
  if (connectBtn) {
    connectBtn.addEventListener('click', connectToFrogo);
  }
  
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', disconnectFromFrogo);
  }
}

// Start timer
function startTimer() {
  const runtime = typeof browser !== 'undefined' ? browser : chrome;
  runtime.sendMessage({ action: 'startTimer' }, (response) => {
    if (response.success) {
      loadTimerState();
    }
  });
}

// Stop timer
function stopTimer() {
  const runtime = typeof browser !== 'undefined' ? browser : chrome;
  runtime.sendMessage({ action: 'stopTimer' }, (response) => {
    if (response.success) {
      loadTimerState();
    }
  });
}

// Reset timer
function resetTimer() {
  const runtime = typeof browser !== 'undefined' ? browser : chrome;
  runtime.sendMessage({ action: 'resetTimer' }, (response) => {
    if (response.success) {
      loadTimerState();
    }
  });
}

// Update settings
function updateSettings() {
  const newSettings = {
    workMinutes: parseInt(document.getElementById('workMinutes').value) || 25,
    breakMinutes: parseInt(document.getElementById('breakMinutes').value) || 5,
    longBreakMinutes: parseInt(document.getElementById('longBreakMinutes').value) || 15,
    longBreakInterval: timerSettings.longBreakInterval || 4
  };
  
  const runtime = typeof browser !== 'undefined' ? browser : chrome;
  runtime.sendMessage({ 
    action: 'updateTimerSettings', 
    settings: newSettings 
  }, (response) => {
    if (response.success) {
      timerSettings = newSettings;
    }
  });
}

// Update display
function updateDisplay() {
  // Ensure timerState.timeLeft is a valid number
  const timeLeft = Number(timerState.timeLeft) || (timerSettings.workMinutes || 25) * 60;
  
  // Update timer display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);
  document.getElementById('timerDisplay').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Update session type
  const sessionType = document.getElementById('sessionType');
  switch (timerState.currentSession) {
    case 'work':
      sessionType.textContent = 'Work Session';
      sessionType.style.background = 'rgba(244, 67, 54, 0.3)';
      break;
    case 'shortBreak':
      sessionType.textContent = 'Short Break';
      sessionType.style.background = 'rgba(76, 175, 80, 0.3)';
      break;
    case 'longBreak':
      sessionType.textContent = 'Long Break';
      sessionType.style.background = 'rgba(33, 150, 243, 0.3)';
      break;
  }
  
  // Update control buttons
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  
  if (timerState.isRunning) {
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
  
  // Update stats
  document.getElementById('completedSessions').textContent = timerState.completedSessions || 0;
  
  // Calculate total study time (completed sessions * work duration)
  const totalMinutes = (timerState.completedSessions || 0) * (timerSettings.workMinutes || 25);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  document.getElementById('totalStudyTime').textContent = `${totalHours}h ${remainingMinutes}m`;
  
  // Update current streak (simplified - would need more complex logic)
  document.getElementById('currentStreak').textContent = '1 day'; // Placeholder
}

// Update settings display
function updateSettingsDisplay() {
  document.getElementById('workMinutes').value = timerSettings.workMinutes || 25;
  document.getElementById('breakMinutes').value = timerSettings.breakMinutes || 5;
  document.getElementById('longBreakMinutes').value = timerSettings.longBreakMinutes || 15;
}

// Check frogo connection
function checkFrogoConnection() {
  const tabsAPI = typeof browser !== 'undefined' ? browser : chrome;
  tabsAPI.query({ url: ["http://localhost:3000/*", "https://frogo-app.vercel.app/*"] }, (tabs) => {
    const syncStatus = document.getElementById('syncStatus');
    const syncText = document.getElementById('syncText');
    
    if (tabs.length > 0) {
      syncStatus.className = 'sync-status sync-connected';
      syncText.textContent = 'Connected to frogo app';
    } else {
      syncStatus.className = 'sync-status sync-disconnected';
      syncText.textContent = 'frogo app not detected';
    }
  });
}

// Update user display
function updateUserDisplay() {
  const userSection = document.getElementById('userSection');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const hashKeyInput = document.getElementById('hashKeyInput');
  
  if (frogoAuth && frogoAuth.isConnectedToUser()) {
    // User is connected
    if (userSection) userSection.style.display = 'block';
    if (userName) userName.textContent = frogoAuth.getUserDisplayName();
    if (userAvatar) {
      const avatar = frogoAuth.getUserAvatar();
      if (avatar) {
        userAvatar.src = avatar;
        userAvatar.style.display = 'block';
      } else {
        userAvatar.style.display = 'none';
      }
    }
    if (connectBtn) connectBtn.style.display = 'none';
    if (disconnectBtn) disconnectBtn.style.display = 'block';
    if (hashKeyInput) hashKeyInput.style.display = 'none';
  } else {
    // User is not connected
    if (userSection) userSection.style.display = 'none';
    if (connectBtn) connectBtn.style.display = 'block';
    if (disconnectBtn) disconnectBtn.style.display = 'none';
    if (hashKeyInput) hashKeyInput.style.display = 'block';
  }
}

// Connect to frogo with hash key
async function connectToFrogo() {
  const hashKeyInput = document.getElementById('hashKeyInput');
  const hashKey = hashKeyInput ? hashKeyInput.value.trim() : '';
  
  if (!hashKey) {
    showNotification('Please enter your hash key', 'error');
    return;
  }
  
  try {
    await frogoAuth.connectWithHashKey(hashKey);
    updateUserDisplay();
    showNotification('Connected to frogo!', 'success');
    
    // Sync timer data after connection
    await syncWithFrogo();
  } catch (error) {
    console.error('Connection failed:', error);
    showNotification('Failed to connect to frogo: ' + error.message, 'error');
  }
}

// Disconnect from frogo
async function disconnectFromFrogo() {
  try {
    await frogoAuth.clearConnection();
    updateUserDisplay();
    showNotification('Disconnected from frogo', 'info');
  } catch (error) {
    console.error('Disconnect failed:', error);
  }
}

// Sync timer data with frogo
async function syncWithFrogo() {
  if (!frogoAuth || !frogoAuth.isConnectedToUser()) {
    return;
  }

  try {
    await frogoAuth.syncTimerData(timerState);
    console.log('Timer data synced with frogo');
  } catch (error) {
    console.error('Failed to sync with frogo:', error);
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 10px 15px;
    border-radius: 5px;
    color: white;
    font-size: 14px;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Set background color based on type
  switch (type) {
    case 'success':
      notification.style.background = '#4CAF50';
      break;
    case 'error':
      notification.style.background = '#f44336';
      break;
    default:
      notification.style.background = '#2196F3';
  }
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Listen for messages from background script
const runtime = typeof browser !== 'undefined' ? browser : chrome;
runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'timerUpdate') {
    loadTimerState();
    syncWithFrogo(); // Sync when timer updates
  }
});
