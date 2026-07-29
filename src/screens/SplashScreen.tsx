import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { authService } from '../services/authService';

const { height } = Dimensions.get('window');

export const SplashScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Check auth status and navigate after delay
    const checkAuthAndNavigate = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        setTimeout(() => {
          if (authenticated) {
            navigation.replace('Dashboard');
          } else {
            navigation.replace('Login');
          }
        }, 2200); // Wait for logo display animation
      } catch (e) {
        setTimeout(() => {
          navigation.replace('Login');
        }, 2200);
      }
    };

    checkAuthAndNavigate();
  }, []);

  return (
    <LinearGradient
      colors={theme.colors.primaryGradient as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconCircle}>
          <Icon name="calendar-check" size={56} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>TaskPlanner</Text>
        <Text style={styles.subtitle}>Organize your academic journey</Text>
      </Animated.View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Powered by React Native</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  title: {
    fontSize: 36,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  footerContainer: {
    position: 'absolute',
    bottom: height * 0.08,
  },
  footerText: {
    fontSize: theme.typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default SplashScreen;
