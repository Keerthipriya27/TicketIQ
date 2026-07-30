import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';

interface FloatingButtonProps {
  onPress: () => void;
  iconName?: string;
  style?: ViewStyle;
  size?: number;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  iconName = 'plus',
  style,
  size = 60,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      friction: 4,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        style,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.92}
        style={[styles.touchable, containerStyle]}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#EC4899'] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, containerStyle]}
        >
          <Icon name={iconName} size={size * 0.48} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: theme.spacing.xxl,
    right: theme.spacing.xl,
    backgroundColor: 'transparent',
    ...theme.shadows.glow,
  },
  touchable: {
    overflow: 'hidden',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingButton;
