const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-vector-icons': require.resolve('@expo/vector-icons'),
  'react-native-vector-icons/MaterialCommunityIcons': require.resolve('@expo/vector-icons/MaterialCommunityIcons'),
};

module.exports = config;
