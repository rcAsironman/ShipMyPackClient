// src/components/Text.tsx
import React from 'react';
import { Text as RNText, TextProps, Platform } from 'react-native';
import { remapProps } from 'nativewind';

// Define your custom Text component
const Text: React.FC<TextProps> = ({ style, ...props }) => {
  const fontStyle = Platform.OS === 'android' ? { fontFamily: 'Roboto' } : {};
  return <RNText {...props} style={[fontStyle, style]} />;
};

// Use remapProps to map className to style
remapProps(Text, {
  className: 'style',
});

// Export the remapped component
export default Text;
