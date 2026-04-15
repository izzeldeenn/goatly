# frogo | study timer

Browser extension that provides a study timer that works in the background while you study on any website.

## Features

- **Background Timer**: Works even when the tab is closed or browser is minimized
- **Pomodoro Technique**: 25-minute work sessions with 5-minute breaks
- **frogo Integration**: Syncs with the frogo study app
- **Cross-browser Support**: Works on Chrome, Firefox, Edge, and Safari
- **Notifications**: Desktop notifications for session changes
- **Statistics**: Track completed sessions and total study time

## Installation

### Chrome/Edge
1. Download the extension files
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

### Firefox
1. Download the extension files
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file

## Usage

1. Click the frogo icon in your browser toolbar
2. Set your preferred work/break durations
3. Click "Start" to begin your study session
4. The timer will work in the background
5. Receive notifications when sessions complete

## Integration with frogo App

The extension automatically detects when you have the frogo app open and syncs timer data between them. This means:

- Timer started in extension syncs to frogo app
- Timer started in frogo app syncs to extension
- Study time is accurately tracked regardless of which interface you use

## Development

### File Structure
```
frogo-study-timer-extension/
  manifest.json          # Extension configuration
  background.js          # Background service worker
  popup.html            # Extension popup interface
  popup.js              # Popup logic
  content.js            # Content script for frogo integration
  icons/                # Extension icons
  README.md             # This file
```

### Building for Different Browsers

#### Chrome/Edge
- Uses Manifest V3
- Service worker for background script
- Chrome Extension APIs

#### Firefox
- Uses Manifest V2 (for compatibility)
- Background page instead of service worker
- Firefox Extension APIs

#### Safari
- Uses Safari Extension format
- Different permission model

### Permissions

- `storage`: Save timer settings and state
- `activeTab`: Access current tab for frogo integration
- `background`: Run background scripts
- `notifications`: Show desktop notifications
- `host_permissions`: Access frogo app URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple browsers
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests:
- Create an issue on GitHub
- Contact the frogo team
- Check the documentation

## Roadmap

- [ ] Multi-language support
- [ ] Custom timer sounds
- [ ] Study goal tracking
- [ ] Calendar integration
- [ ] Team study sessions
- [ ] Mobile companion app
