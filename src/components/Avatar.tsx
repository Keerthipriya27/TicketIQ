import React from 'react';
import { StyleSheet, Text, View, Image, ViewStyle, ImageStyle } from 'react-native';
import { theme } from '../theme';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ source, name = 'User', size = 50, style }) => {
  const getInitials = (fullName: string) => {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const textStyle = {
    fontSize: size * 0.4,
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[styles.image, containerStyle as ImageStyle]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.fallback, containerStyle]}>
          <Text style={[styles.fallbackText, textStyle]}>{getInitials(name)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...theme.shadows.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
  },
  fallbackText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
  },
});

export default Avatar;
