import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { User, DashboardStats } from '../types';
import AppHeader from '../components/AppHeader';
import Avatar from '../components/Avatar';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';

export const ProfileScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    pendingCount: 0,
    completedCount: 0,
    inProgressCount: 0,
    totalCount: 0,
    progressPercentage: 0,
  });

  useEffect(() => {
    const fetchUserDataAndStats = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        const tasks = await taskService.getTasks();
        const calculated = taskService.calculateStats(tasks);
        setStats(calculated);
      } catch (e) {
        console.error('Failed to load profile statistics', e);
      }
    };

    fetchUserDataAndStats();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of TaskPlanner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const renderSettingItem = (icon: string, label: string, color = theme.colors.textPrimary, onPress?: () => void) => {
    return (
      <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7} key={label}>
        <View style={styles.settingItemLeft}>
          <View style={styles.settingIconContainer}>
            <Icon name={icon} size={22} color={theme.colors.primary} />
          </View>
          <Text style={[styles.settingLabel, { color }]}>{label}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={theme.colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Profile" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Banner with Profile Info */}
        <LinearGradient
          colors={theme.colors.primaryGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerOverlay} />
        </LinearGradient>

        <View style={styles.avatarSection}>
          <Avatar source={user?.avatarUrl} name={user?.name} size={90} style={styles.profileAvatar} />
          <Text style={styles.profileName}>{user?.name || 'Academic Student'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'student@academy.edu'}</Text>
          <Text style={styles.profileBio}>{user?.bio || 'No bio configured yet.'}</Text>
        </View>

        {/* Statistics Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionHeading}>My Statistics</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalCount}</Text>
              <Text style={styles.statLabel}>Tasks Created</Text>
            </Card>
            <Card style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.statusCompleted }]}>
                {stats.completedCount}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Card>
          </View>
          <View style={styles.statsGrid}>
            <Card style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.statusPending }]}>
                {stats.pendingCount}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card>
            <Card style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {stats.progressPercentage}%
              </Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </Card>
          </View>
        </View>

        {/* Settings Options List */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeading}>Settings</Text>
          <Card style={styles.settingsCard}>
            {renderSettingItem('account-edit-outline', 'Edit Profile')}
            {renderSettingItem('bell-outline', 'Notification Preferences')}
            {renderSettingItem('palette-outline', 'Theme customization')}
            {renderSettingItem('help-circle-outline', 'Help & Support')}
          </Card>
        </View>

        {/* Logout Button */}
        <PrimaryButton
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutBtn}
        />
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  banner: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -45,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  profileAvatar: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...theme.shadows.lg,
  },
  profileName: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  profileEmail: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  profileBio: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    lineHeight: 18,
  },
  statsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeading: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    paddingLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: -2,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  settingsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilyMedium,
    fontWeight: theme.typography.weights.medium,
  },
  logoutBtn: {
    marginHorizontal: theme.spacing.xl,
  },
});

export default ProfileScreen;
