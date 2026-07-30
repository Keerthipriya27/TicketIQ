import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { taskService } from '../services/taskService';
import { authService } from '../services/authService';
import { Task, User, DashboardStats } from '../types';
import ProgressRing from '../components/ProgressRing';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import TaskCard from '../components/TaskCard';
import FloatingButton from '../components/FloatingButton';

export const DashboardScreen = ({ navigation }: any) => {
  const isFocused = useIsFocused();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pendingCount: 0,
    completedCount: 0,
    inProgressCount: 0,
    totalCount: 0,
    progressPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      const allTasks = await taskService.getTasks();
      setTasks(allTasks);

      const calculated = taskService.calculateStats(allTasks);
      setStats(calculated);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning ☀️';
    if (hrs < 18) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  const recentTasks = tasks.slice(0, 3);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Initializing Workspace...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
      >
        {/* Editorial Top Bar Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Academic Student'}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatarRing}>
              <Avatar source={user?.avatarUrl} name={user?.name} size={54} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Hero Progress Bento Card */}
        <Card glass style={styles.heroBentoCard}>
          <View style={styles.progressRow}>
            <View style={styles.progressTextColumn}>
              <View style={styles.badgeLabel}>
                <Text style={styles.badgeText}>TODAY'S WORKFLOW</Text>
              </View>
              <Text style={styles.progressTitle}>Academic Progress</Text>
              <Text style={styles.progressDescription}>
                {stats.completedCount} of {stats.totalCount} tasks completed. Keep up the momentum!
              </Text>
            </View>
            <ProgressRing percentage={stats.progressPercentage} size={105} strokeWidth={12} />
          </View>
        </Card>

        {/* Bento Stats Grid Composition */}
        <View style={styles.bentoStatsGrid}>
          <Card style={[styles.bentoStatCard, { borderTopColor: '#F59E0B', borderTopWidth: 4 }]}>
            <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="clock-outline" size={22} color="#D97706" />
            </View>
            <Text style={styles.statNumber}>{stats.pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>

          <Card style={[styles.bentoStatCard, { borderTopColor: '#6366F1', borderTopWidth: 4 }]}>
            <View style={[styles.statIconBadge, { backgroundColor: '#EEF2FF' }]}>
              <Icon name="progress-clock" size={22} color="#6366F1" />
            </View>
            <Text style={styles.statNumber}>{stats.inProgressCount}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </Card>

          <Card style={[styles.bentoStatCard, { borderTopColor: '#10B981', borderTopWidth: 4 }]}>
            <View style={[styles.statIconBadge, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="check-circle-outline" size={22} color="#059669" />
            </View>
            <Text style={styles.statNumber}>{stats.completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
        </View>

        {/* Recent Tasks List Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TaskList')}>
            <Text style={styles.viewAllText}>View All Tasks →</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Tasks Items */}
        {recentTasks.length > 0 ? (
          recentTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Icon name="calendar-blank-outline" size={44} color={theme.colors.textMuted} />
            <Text style={styles.emptyCardTitle}>Workspace Clean</Text>
            <Text style={styles.emptyCardText}>No upcoming tasks planned. Tap "+" to create one!</Text>
          </Card>
        )}
        
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Add Task CTA */}
      <FloatingButton onPress={() => navigation.navigate('AddTask')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontFamilyMedium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.xs,
  },
  greetingText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: theme.colors.textPrimary,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  avatarRing: {
    padding: 3,
    borderRadius: theme.radius.round,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#6366F1',
    ...theme.shadows.glow,
  },
  heroBentoCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTextColumn: {
    flex: 1,
    paddingRight: theme.spacing.lg,
  },
  badgeLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.round,
    backgroundColor: '#EEF2FF',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: '#6366F1',
    letterSpacing: 1,
  },
  progressTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: theme.colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  progressDescription: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  bentoStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xxl,
    marginHorizontal: -4,
  },
  bentoStatCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.xl,
    ...theme.shadows.md,
  },
  statIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: '#6366F1',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    backgroundColor: '#FFFFFF',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: theme.radius.xl,
  },
  emptyCardTitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  emptyCardText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});

export default DashboardScreen;
