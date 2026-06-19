#!/usr/bin/env node
/**
 * Package Figma plugin for distribution
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pluginDir = path.join(__dirname, '..', 'plugin');
const distDir = path.join(pluginDir, 'dist');

console.log('Packaging Figma plugin...');

// Create package directory
const packageDir = path.join(__dirname, '..', 'figma-bridge-plugin');
if (fs.existsSync(packageDir)) {
  fs.rmSync(packageDir, { recursive: true });
}
fs.mkdirSync(packageDir, { recursive: true });

// Copy necessary files
const filesToCopy = [
  'dist/code.js',
  'manifest.json',
  'README.md'
];

filesToCopy.forEach(file => {
  const src = path.join(pluginDir, file);
  const dest = path.join(packageDir, file);

  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${file}`);
  } else {
    console.warn(`File not found: ${file}`);
  }
});

console.log('Plugin packaged successfully!');
console.log(`Package location: ${packageDir}`);
console.log('\nTo install in Figma Desktop:');
console.log('1. Open Figma Desktop');
console.log('2. Go to Plugins > Development > Import plugin from manifest');
console.log('3. Select the manifest.json file in the package directory');
