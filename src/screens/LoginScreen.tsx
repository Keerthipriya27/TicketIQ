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
            <View style={styles.logoCircle}>
              <Icon name="calendar-check" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to manage your study tasks</Text>
          </View>

          <Card style={styles.loginCard}>
            <Input
              label="Username"
              placeholder="e.g. alex_student"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
              autoCapitalize="none"
              icon={<Icon name="account-outline" size={20} color={theme.colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
              icon={<Icon name="lock-outline" size={20} color={theme.colors.textMuted} />}
            />

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitButton}
            />
          </Card>

          <View style={styles.demoNotice}>
            <Icon name="information-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.demoText}>
              Mock login enabled. Enter any username and password to test.
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
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    paddingVertical: theme.spacing.huge,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.huge,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  welcomeTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  loginCard: {
    padding: theme.spacing.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    ...theme.shadows.lg,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  demoText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textMuted,
    marginLeft: 6,
    textAlign: 'center',
  },
});

export default LoginScreen;
