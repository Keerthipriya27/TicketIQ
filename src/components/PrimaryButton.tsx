import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
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

  const getGradientColors = () => {
    if (disabled) {
      return ['#CBD5E1', '#94A3B8'];
    }
    switch (variant) {
      case 'secondary':
        return ['#3B82F6', '#06B6D4'];
      case 'danger':
        return ['#F43F5E', '#E11D48'];
      case 'primary':
      default:
        return ['#6366F1', '#8B5CF6', '#EC4899'];
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.92}
        disabled={disabled || loading}
        style={[styles.buttonContainer, style]}
      >
        <LinearGradient
          colors={getGradientColors() as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[styles.text, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: theme.radius.round,
    overflow: 'hidden',
    height: 54,
    justifyContent: 'center',
    marginVertical: theme.spacing.sm,
    ...theme.shadows.glow,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.heavy,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

export default PrimaryButton;
