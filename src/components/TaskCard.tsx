import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { Task } from '../types';
import Card from './Card';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const getPriorityDetails = (prio: string) => {
    switch (prio) {
      case 'high':
        return { text: '#F43F5E', bg: '#FFE4E6', border: '#FDA4AF', accent: '#F43F5E' };
      case 'medium':
        return { text: '#D97706', bg: '#FEF3C7', border: '#FDE68A', accent: '#F59E0B' };
      case 'low':
      default:
        return { text: '#059669', bg: '#D1FAE5', border: '#A7F3D0', accent: '#10B981' };
    }
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: '#10B981', bg: '#E6F4EA', icon: 'check-circle-outline' };
      case 'in_progress':
        return { label: 'In Progress', color: '#6366F1', bg: '#EEF2FF', icon: 'progress-clock' };
      case 'pending':
      default:
        return { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: 'clock-outline' };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const prio = getPriorityDetails(task.priority);
  const statusDetails = getStatusDetails(task.status);
  const isOverdue = new Date(task.dueDate).getTime() < Date.now() && task.status !== 'completed';

  return (
    <Card onPress={onPress} style={styles.card}>
      {/* Asymmetric Side Accent Strip */}
      <View style={[styles.accentStrip, { backgroundColor: prio.accent }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, task.status === 'completed' && styles.completedText]} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: prio.bg, borderColor: prio.border }]}>
            <Text style={[styles.priorityText, { color: prio.text }]}>{task.priority.toUpperCase()}</Text>
          </View>
        </View>

        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Icon name="calendar-month-outline" size={16} color={isOverdue ? theme.colors.error : theme.colors.textMuted} />
            <Text style={[styles.metaText, isOverdue && styles.overdueText]}>
              {formatDate(task.dueDate)} {isOverdue ? '(Overdue)' : ''}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusDetails.bg }]}>
            <Icon name={statusDetails.icon} size={14} color={statusDetails.color} style={styles.statusIcon} />
            <Text style={[styles.statusText, { color: statusDetails.color }]}>{statusDetails.label}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.xl,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadows.md,
  },
  accentStrip: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.sm,
    letterSpacing: -0.2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
    opacity: 0.7,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.round,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    letterSpacing: 0.8,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: theme.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.textMuted,
    marginLeft: 5,
  },
  overdueText: {
    color: theme.colors.error,
    fontWeight: theme.typography.weights.semibold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.bold,
  },
});

export default TaskCard;
