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
      // Filter user specific tasks if necessary (here we mock for single user flow)
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
    if (hrs < 12) {
      return 'Good Morning ☀️';
    }
    if (hrs < 18) {
      return 'Good Afternoon 🌤️';
    }
    return 'Good Evening 🌙';
  };

  const recentTasks = tasks.slice(0, 3); // Get top 3 recent tasks

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your planner...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Academic Student'}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Profile')}>
            <Avatar source={user?.avatarUrl} name={user?.name} size={50} />
          </TouchableOpacity>
        </View>

        {/* Progress Overview Section */}
        <Card style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View style={styles.progressTextColumn}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressDescription}>
                {stats.completedCount} of {stats.totalCount} tasks completed. Keep it up!
              </Text>
            </View>
            <ProgressRing percentage={stats.progressPercentage} size={90} strokeWidth={10} />
          </View>
        </Card>

        {/* Stats Mini Grid */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statsCard, { borderLeftWidth: 4, borderLeftColor: theme.colors.statusPending }]}>
            <View style={styles.statIconContainer}>
              <Icon name="clock-outline" size={24} color={theme.colors.statusPending} />
            </View>
            <Text style={styles.statNumber}>{stats.pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>

          <Card style={[styles.statsCard, { borderLeftWidth: 4, borderLeftColor: theme.colors.statusInProgress }]}>
            <View style={styles.statIconContainer}>
              <Icon name="progress-clock" size={24} color={theme.colors.statusInProgress} />
            </View>
            <Text style={styles.statNumber}>{stats.inProgressCount}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </Card>

          <Card style={[styles.statsCard, { borderLeftWidth: 4, borderLeftColor: theme.colors.statusCompleted }]}>
            <View style={styles.statIconContainer}>
              <Icon name="check-circle-outline" size={24} color={theme.colors.statusCompleted} />
            </View>
            <Text style={styles.statNumber}>{stats.completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
        </View>

        {/* Recent Tasks List Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TaskList')}>
            <Text style={styles.viewAllText}>View All</Text>
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
            <Icon name="calendar-blank-outline" size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyCardText}>No tasks planned. Tap "+" to start!</Text>
          </Card>
        )}
        
        {/* Extra spacing for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Add Task Button */}
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
    fontFamily: theme.typography.fontFamily,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.xs,
  },
  greetingText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textMuted,
  },
  userName: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  progressCard: {
    padding: theme.spacing.lg,
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTextColumn: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  progressTitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  progressDescription: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
    ...theme.shadows.sm,
  },
  statIconContainer: {
    marginBottom: 6,
  },
  statNumber: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  viewAllText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: '#FFFFFF',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  emptyCardText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
});

export default DashboardScreen;
