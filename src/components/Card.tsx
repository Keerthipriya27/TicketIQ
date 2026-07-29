import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { theme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, glass = false }) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        glass && styles.glass,
        style,
      ]}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#F1F3F9',
    ...theme.shadows.md,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default Card;
