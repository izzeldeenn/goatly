// Watch script for development
const fs = require('fs');
const path = require('path');

// Files to watch
const filesToWatch = [
  'manifest.json',
  'background.js',
  'popup.html',
  'popup.js',
  'content.js'
];

// Build directories
const chromeBuildDir = path.join(__dirname, '../build/chrome');
const firefoxBuildDir = path.join(__dirname, '../build/firefox');

console.log('Watching for file changes...');
console.log('Press Ctrl+C to stop watching');

// Watch each file
filesToWatch.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (fs.existsSync(filePath)) {
    fs.watchFile(filePath, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log(`\nFile changed: ${file}`);
        
        // Copy to Chrome build
        const chromeDest = path.join(chromeBuildDir, file);
        if (fs.existsSync(chromeBuildDir)) {
          fs.copyFileSync(filePath, chromeDest);
          console.log(`Updated Chrome build: ${file}`);
        }
        
        // Copy to Firefox build
        const firefoxDest = path.join(firefoxBuildDir, file);
        if (fs.existsSync(firefoxBuildDir)) {
          fs.copyFileSync(filePath, firefoxDest);
          console.log(`Updated Firefox build: ${file}`);
        }
        
        console.log('Builds updated. Reload the extension in your browser.');
      }
    });
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

// Handle manifest.json specially for Firefox
const manifestPath = path.join(__dirname, '../manifest.json');
if (fs.existsSync(manifestPath)) {
  fs.watchFile(manifestPath, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      console.log('\nManifest changed. Rebuilding Firefox manifest...');
      
      // Rebuild Firefox manifest
      const chromeManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const firefoxManifest = {
        ...chromeManifest,
        manifest_version: 2,
        background: {
          scripts: ['background.js'],
          persistent: false
        },
        browser_action: chromeManifest.action,
        permissions: chromeManifest.permissions.filter(p => p !== 'background'),
        host_permissions: chromeManifest.host_permissions
      };
      
      delete firefoxManifest.action;
      delete firefoxManifest.background.service_worker;
      
      const firefoxManifestPath = path.join(firefoxBuildDir, 'manifest.json');
      if (fs.existsSync(firefoxBuildDir)) {
        fs.writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, 2));
        console.log('Updated Firefox manifest.json');
      }
    }
  });
}

process.on('SIGINT', () => {
  console.log('\nStopping file watcher...');
  process.exit(0);
});
