// Build script for Firefox extension
const fs = require('fs');
const path = require('path');

// Create build directory
const buildDir = path.join(__dirname, '../build/firefox');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Read Chrome manifest and convert to Firefox format
const chromeManifestPath = path.join(__dirname, '../manifest.json');
const firefoxManifestPath = path.join(buildDir, 'manifest.json');

if (fs.existsSync(chromeManifestPath)) {
  const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, 'utf8'));
  
  // Convert to Firefox manifest (Manifest V2)
  const firefoxManifest = {
    ...chromeManifest,
    manifest_version: 2,
    background: {
      scripts: ['background.js'],
      persistent: false
    },
    browser_action: chromeManifest.action,
    permissions: [
      ...chromeManifest.permissions.filter(p => p !== 'background'),
      ...(chromeManifest.host_permissions || [])
    ]
  };
  
  // Remove manifest_version 3 specific fields
  delete firefoxManifest.action;
  delete firefoxManifest.background.service_worker;
  delete firefoxManifest.host_permissions;
  delete firefoxManifest.web_accessible_resources;
  
  fs.writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, 2));
  console.log('Created Firefox manifest.json');
} else {
  console.error('Chrome manifest.json not found');
  process.exit(1);
}

// Copy extension files
const filesToCopy = [
  'background.js',
  'popup.html',
  'popup.js',
  'content.js',
  'README.md'
];

filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, '..', file);
  const destPath = path.join(buildDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file}`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

// Create icons directory
const iconsDir = path.join(buildDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Copy icons if they exist
const iconSizes = [16, 32, 48, 128];
iconSizes.forEach(size => {
  const srcIcon = path.join(__dirname, '../icons', `icon${size}.png`);
  const destIcon = path.join(iconsDir, `icon${size}.png`);
  
  if (fs.existsSync(srcIcon)) {
    fs.copyFileSync(srcIcon, destIcon);
  } else {
    console.log(`Warning: icon${size}.png not found`);
  }
});

console.log('Firefox extension build completed!');
console.log(`Build directory: ${buildDir}`);
console.log('Load the extension in Firefox using about:debugging');
