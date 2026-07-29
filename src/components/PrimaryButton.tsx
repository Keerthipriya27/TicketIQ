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
import LinearGradient from 'react-native-linear-gradient';
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
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getGradientColors = () => {
    if (disabled) {
      return ['#E5E7EB', '#E5E7EB'];
    }
    switch (variant) {
      case 'secondary':
        return theme.colors.secondaryGradient;
      case 'danger':
        return ['#EF4444', '#DC2626'];
      case 'primary':
      default:
        return theme.colors.primaryGradient;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
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
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    height: 52,
    justifyContent: 'center',
    marginVertical: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0.5,
  },
});

export default PrimaryButton;
