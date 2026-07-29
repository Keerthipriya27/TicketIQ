import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeColor?: string;
  inactiveColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
  textStyle,
  activeColor = theme.colors.primary,
  inactiveColor = '#F3F4F6',
  activeTextColor = '#FFFFFF',
  inactiveTextColor = theme.colors.textMuted,
}) => {
  const isClickable = !!onPress;
  const Component = isClickable ? TouchableOpacity : TouchableOpacity; // Touch feedback even if just display

  return (
    <Component
      onPress={onPress}
      disabled={!isClickable}
      activeOpacity={0.8}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? activeColor : inactiveColor,
          borderColor: selected ? activeColor : '#E5E7EB',
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected ? activeTextColor : inactiveTextColor,
            fontWeight: selected ? theme.typography.weights.semibold : theme.typography.weights.medium,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Component>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    marginRight: theme.spacing.sm,
    marginVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamilyMedium,
  },
});

export default Chip;
