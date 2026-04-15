# Installation Guide

## Quick Start

### For Users

#### Chrome/Edge Installation
1. **Download the extension**
   ```bash
   git clone https://github.com/frogo-app/study-timer-extension.git
   cd frogo-study-timer-extension
   ```

2. **Build the extension**
   ```bash
   npm install
   npm run build-chrome
   ```

3. **Load in Chrome**
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `build/chrome` folder

4. **Pin the extension**
   - Click the puzzle icon in Chrome toolbar
   - Find "frogo | study timer"
   - Click the pin icon to show it in toolbar

#### Firefox Installation
1. **Download and build**
   ```bash
   git clone https://github.com/frogo-app/study-timer-extension.git
   cd frogo-study-timer-extension
   npm install
   npm run build-firefox
   ```

2. **Load in Firefox**
   - Open Firefox
   - Go to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `build/firefox/manifest.json` file

### For Developers

#### Development Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/frogo-app/study-timer-extension.git
   cd frogo-study-timer-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

4. **Load the extension**
   - Follow the user installation steps above
   - Use the `build/chrome` or `build/firefox` directory

5. **Watch for changes**
   - The `npm run dev` command will watch for file changes
   - Reload the extension in browser after making changes

#### Building for Distribution
```bash
# Build for all browsers
npm run build

# Build for Chrome only
npm run build-chrome

# Build for Firefox only
npm run build-firefox
```

## Integration with frogo App

### Adding Extension Support to frogo App

1. **Include the integration script**
   ```html
   <script src="path/to/frogo-integration.js"></script>
   ```
   or add it to your main bundle.

2. **Add timer controls to your UI**
   ```html
   <button data-timer-start onclick="frogoTimer.start()">Start</button>
   <button data-timer-stop onclick="frogoTimer.stop()">Stop</button>
   <button data-timer-reset onclick="frogoTimer.reset()">Reset</button>
   
   <div data-timer-display>25:00</div>
   ```

3. **Listen for timer events**
   ```javascript
   // The integration script automatically updates UI elements
   // You can also listen for custom events
   window.addEventListener('frogoTimerStarted', (event) => {
     console.log('Timer started:', event.detail);
   });
   ```

### Extension Features

#### Background Timer
- Works even when browser is minimized
- Continues timing when tabs are closed
- Syncs with frogo app when reopened

#### Cross-Tab Sync
- Multiple tabs can control the same timer
- State is shared across all browser windows
- Prevents timer conflicts

#### Notifications
- Desktop notifications for session changes
- Visual alerts in frogo app
- Custom notification sounds

#### Statistics
- Track completed sessions
- Monitor total study time
- Calculate study streaks

## Troubleshooting

### Common Issues

#### Extension Not Loading
- **Chrome**: Check Developer mode is enabled
- **Firefox**: Make sure you're loading `manifest.json`
- **All browsers**: Verify build directory exists

#### Timer Not Working
- Check browser permissions
- Ensure frogo app is accessible
- Look for console errors

#### Sync Issues
- Verify both extension and app are running
- Check network connection
- Clear browser storage and try again

#### Notifications Not Showing
- Check browser notification permissions
- Enable desktop notifications in settings
- Verify extension has notification permission

### Debug Mode

#### Chrome Debugging
1. Go to `chrome://extensions/`
2. Find "frogo | study timer"
3. Click "Inspect views: background page"
4. Check console for errors

#### Firefox Debugging
1. Go to `about:debugging`
2. Find the extension
3. Click "Inspect"
4. Check console for errors

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the README for detailed info
- **Community**: Join our Discord server for support

## Permissions Explained

The extension requests these permissions:

- **`storage`**: Save timer settings and state
- **`activeTab`**: Access current tab for frogo integration
- **`background`**: Run background scripts for timer
- **`notifications`**: Show desktop notifications
- **`host_permissions`**: Access frogo app URLs for integration

All permissions are necessary for the extension to function properly.

## Privacy

The extension:
- Does not collect personal data
- Does not track browsing history
- Only stores timer data locally
- Communicates only with frogo app URLs

## Updates

The extension will automatically update when:
- You update it from the source
- Browser checks for updates (if published)
- You manually reload the extension

To check for updates:
1. Go to `chrome://extensions/` or `about:debugging`
2. Find the extension
3. Click "Update" or "Reload"
