const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const baseConfig = getDefaultConfig(__dirname);
const mergedConfig = mergeConfig(baseConfig, {});

module.exports = withNativeWind(mergedConfig, {
  input: './global.css',
});