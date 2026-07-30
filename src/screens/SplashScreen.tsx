import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { authService } from '../services/authService';

const { height, width } = Dimensions.get('window');

export const SplashScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating subtle background movement
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 12,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

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
        }, 2200);
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
      colors={['#0F172A', '#1E1B4B', '#312E81'] as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Floating Ambient Glowing Blobs */}
      <Animated.View
        style={[
          styles.blob,
          styles.blobTopRight,
          { transform: [{ translateY: floatAnim }] },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.blobBottomLeft,
          { transform: [{ translateY: Animated.multiply(floatAnim, -1) }] },
        ]}
      />

      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconGlowWrapper}>
          <View style={styles.iconCircle}>
            <Icon name="calendar-check" size={54} color="#6366F1" />
          </View>
        </View>
        <Text style={styles.title}>TaskPlanner</Text>
        <Text style={styles.subtitle}>Organize your academic journey</Text>
      </Animated.View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>TICKETIQ • INTERACTIVE SUITE</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.25,
  },
  blobTopRight: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#8B5CF6',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  blobBottomLeft: {
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: '#6366F1',
    bottom: -width * 0.3,
    left: -width * 0.3,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconGlowWrapper: {
    padding: 12,
    borderRadius: 70,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.glow,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  title: {
    fontSize: theme.typography.sizes.massive,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilyMedium,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  footerContainer: {
    position: 'absolute',
    bottom: height * 0.08,
    zIndex: 10,
  },
  footerText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default SplashScreen;
