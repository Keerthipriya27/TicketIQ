import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { taskService } from '../services/taskService';
import { Task } from '../types';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import Chip from '../components/Chip';

export const TaskDetailsScreen = ({ route, navigation }: any) => {
  const { taskId } = route.params || {};
  const isFocused = useIsFocused();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTask = async () => {
    setLoading(true);
    try {
      if (taskId) {
        const item = await taskService.getTaskById(taskId);
        setTask(item);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load task details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused && taskId) {
      loadTask();
    }
  }, [isFocused, taskId]);

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (task) {
              await taskService.deleteTask(task.id);
              navigation.goBack();
            }
          } catch (e) {
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  const getPriorityBadgeColors = (priority: string) => {
    switch (priority) {
      case 'high':
        return { text: theme.colors.priorityHigh, bg: theme.colors.priorityHighBg };
      case 'medium':
        return { text: theme.colors.priorityMedium, bg: theme.colors.priorityMediumBg };
      case 'low':
      default:
        return { text: theme.colors.priorityLow, bg: theme.colors.priorityLowBg };
    }
  };

  const getStatusBadgeDetails = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: theme.colors.statusCompleted, bg: theme.colors.statusCompletedBg, icon: 'check-circle' };
      case 'in_progress':
        return { label: 'In Progress', color: theme.colors.statusInProgress, bg: theme.colors.statusInProgressBg, icon: 'clock-fast' };
      case 'pending':
      default:
        return { label: 'Pending', color: theme.colors.statusPending, bg: theme.colors.statusPendingBg, icon: 'clock-outline' };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Task Details" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const prioColors = getPriorityBadgeColors(task.priority);
  const statusDetails = getStatusBadgeDetails(task.status);
  const isOverdue = new Date(task.dueDate).getTime() < Date.now() && task.status !== 'completed';

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Task Details" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Title & Priority Row */}
        <View style={styles.headerSection}>
          <Text style={[styles.title, task.status === 'completed' && styles.completedText]}>
            {task.title}
          </Text>
          <View style={styles.badgeRow}>
            <Chip
              label={task.priority.toUpperCase()}
              activeColor={prioColors.bg}
              activeTextColor={prioColors.text}
              selected={true}
              style={styles.priorityChip}
              textStyle={styles.priorityText}
            />
            <View style={[styles.statusBadge, { backgroundColor: statusDetails.bg }]}>
              <Icon name={statusDetails.icon} size={16} color={statusDetails.color} style={styles.statusIcon} />
              <Text style={[styles.statusLabel, { color: statusDetails.color }]}>{statusDetails.label}</Text>
            </View>
          </View>
        </View>

        {/* Date Card */}
        <Card style={styles.metaCard}>
          <View style={styles.metaRow}>
            <View style={[styles.metaIconContainer, { backgroundColor: isOverdue ? '#FEE2E2' : '#EFF6FF' }]}>
              <Icon name="calendar-month" size={24} color={isOverdue ? theme.colors.error : '#2563EB'} />
            </View>
            <View style={styles.metaTextContainer}>
              <Text style={styles.metaTitle}>Due Date</Text>
              <Text style={[styles.metaValue, isOverdue && styles.overdueText]}>
                {formatDate(task.dueDate)} {isOverdue ? '(Overdue)' : ''}
              </Text>
            </View>
          </View>
        </Card>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionHeading}>Description</Text>
          <Card style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              {task.description || 'No description provided for this academic task.'}
            </Text>
          </Card>
        </View>

        {/* Timestamps */}
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>
            Created on {new Date(task.createdAt).toLocaleDateString()} at{' '}
            {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <PrimaryButton
            title="Edit Task"
            onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
            variant="primary"
            style={styles.actionBtn}
          />
          <PrimaryButton
            title="Delete Task"
            onPress={handleDelete}
            variant="danger"
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.error,
    fontFamily: theme.typography.fontFamilyMedium,
  },
  headerSection: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 26,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    lineHeight: 32,
    marginBottom: theme.spacing.sm,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priorityChip: {
    marginRight: theme.spacing.sm,
    borderWidth: 0,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.bold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.round,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
  },
  metaCard: {
    padding: theme.spacing.md,
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  metaTextContainer: {
    flex: 1,
  },
  metaTitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontFamilyMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilyMedium,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  overdueText: {
    color: theme.colors.error,
    fontWeight: theme.typography.weights.bold,
  },
  descriptionSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeading: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  descriptionText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  timeSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.huge,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontFamily,
  },
  actionsContainer: {
    marginTop: theme.spacing.sm,
  },
  actionBtn: {
    marginVertical: 6,
  },
});

export default TaskDetailsScreen;
