import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface SpinningIconProps {
  icon: IconDefinition;
  size?: number;
  color?: string;
}

export const SpinningIcon: React.FC<SpinningIconProps> = ({ icon, size = 18, color = '#000' }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <FontAwesomeIcon icon={icon} size={size} color={color} />
    </Animated.View>
  );
};
