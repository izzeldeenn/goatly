// Build script for Chrome extension
const fs = require('fs');
const path = require('path');

// Create build directory
const buildDir = path.join(__dirname, '../build/chrome');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy extension files
const filesToCopy = [
  'manifest.json',
  'background.js',
  'popup.html',
  'popup.js',
  'content.js',
  'README.md'
];

// Create icons directory
const iconsDir = path.join(buildDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Copy files
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

// Create placeholder icons (you should replace these with actual icons)
const iconSizes = [16, 32, 48, 128];
iconSizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon${size}.png`);
  if (!fs.existsSync(iconPath)) {
    // Create a simple placeholder SVG converted to PNG
    // In a real build, you'd use actual PNG files
    console.log(`Warning: icon${size}.png not found. Please add actual icons.`);
  }
});

console.log('Chrome extension build completed!');
console.log(`Build directory: ${buildDir}`);
console.log('Load the extension in Chrome using chrome://extensions/');
