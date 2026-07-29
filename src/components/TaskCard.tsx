import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { Task } from '../types';
import Card from './Card';
import Chip from './Chip';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const getPriorityColors = (prio: string) => {
    switch (prio) {
      case 'high':
        return { text: theme.colors.priorityHigh, bg: theme.colors.priorityHighBg };
      case 'medium':
        return { text: theme.colors.priorityMedium, bg: theme.colors.priorityMediumBg };
      case 'low':
      default:
        return { text: theme.colors.priorityLow, bg: theme.colors.priorityLowBg };
    }
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: theme.colors.statusCompleted, icon: 'check-circle-outline' };
      case 'in_progress':
        return { label: 'In Progress', color: theme.colors.statusInProgress, icon: 'progress-clock' };
      case 'pending':
      default:
        return { label: 'Pending', color: theme.colors.statusPending, icon: 'clock-outline' };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return dateStr;
      }
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const prioColors = getPriorityColors(task.priority);
  const statusDetails = getStatusDetails(task.status);
  const isOverdue = new Date(task.dueDate).getTime() < Date.now() && task.status !== 'completed';

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, task.status === 'completed' && styles.completedText]} numberOfLines={1}>
          {task.title}
        </Text>
        <Chip
          label={task.priority.toUpperCase()}
          activeColor={prioColors.bg}
          activeTextColor={prioColors.text}
          selected={true}
          style={styles.priorityChip}
          textStyle={styles.priorityText}
        />
      </View>

      {task.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Icon name="calendar" size={16} color={isOverdue ? theme.colors.error : theme.colors.textMuted} />
          <Text style={[styles.metaText, isOverdue && styles.overdueText]}>
            {formatDate(task.dueDate)} {isOverdue ? '(Overdue)' : ''}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusDetails.color + '15' }]}>
          <Icon name={statusDetails.icon} size={14} color={statusDetails.color} style={styles.statusIcon} />
          <Text style={[styles.statusText, { color: statusDetails.color }]}>{statusDetails.label}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFF2F7',
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  priorityChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 0,
    marginVertical: 0,
    borderWidth: 0,
    height: 'auto',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: theme.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  overdueText: {
    color: theme.colors.error,
    fontWeight: theme.typography.weights.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
