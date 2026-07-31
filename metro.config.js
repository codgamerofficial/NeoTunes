const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Blacklist node_modules watcher depth issues on Windows
config.resolver.blockList = [
  /node_modules\/.*\/android\/.*/,
  /node_modules\/.*\/ios\/.*/,
];

module.exports = config;
