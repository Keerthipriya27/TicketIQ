import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { authService } from '../services/authService';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import Card from '../components/Card';

export const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const validate = () => {
    let valid = true;
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await authService.login(username, password);
      setLoading(false);
      navigation.replace('Dashboard');
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Login Failed', e.message || 'Check your credentials and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.headerSection}>
            <View style={styles.logoBadge}>
              <Icon name="calendar-check" size={44} color="#6366F1" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to manage your academic productivity workflow</Text>
          </View>

          <Card glass style={styles.loginCard}>
            <Input
              label="Username"
              placeholder="e.g. alex_student"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
              autoCapitalize="none"
              icon={<Icon name="account-outline" size={20} color="#6366F1" />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
              icon={<Icon name="lock-outline" size={20} color="#6366F1" />}
            />

            <PrimaryButton
              title="Sign In to Dashboard"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitButton}
            />
          </Card>

          <View style={styles.demoNotice}>
            <Icon name="shield-check-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.demoText}>
              Mock auth enabled. Type any username & password to enter.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
    paddingVertical: theme.spacing.huge,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoBadge: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...theme.shadows.glow,
  },
  welcomeTitle: {
    fontSize: theme.typography.sizes.huge,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  welcomeSubtitle: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    maxWidth: 300,
  },
  loginCard: {
    padding: theme.spacing.xxl,
    borderRadius: theme.radius.xl,
    ...theme.shadows.lg,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.md,
  },
  demoText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.textMuted,
    marginLeft: 6,
    textAlign: 'center',
  },
});

export default LoginScreen;
