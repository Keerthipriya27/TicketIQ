import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { taskService } from '../services/taskService';
import { TaskPriority, TaskStatus } from '../types';
import AppHeader from '../components/AppHeader';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import Card from '../components/Card';
import Chip from '../components/Chip';

export const AddTaskScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState(getTodayString(0));
  const [selectedDatePreset, setSelectedDatePreset] = useState<'today' | 'tomorrow' | 'nextWeek' | 'custom'>('today');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  const validate = () => {
    let valid = true;
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      valid = false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dueDate.trim()) {
      newErrors.dueDate = 'Due date is required';
      valid = false;
    } else if (!dateRegex.test(dueDate)) {
      newErrors.dueDate = 'Use YYYY-MM-DD format';
      valid = false;
    } else {
      const parsed = Date.parse(dueDate);
      if (isNaN(parsed)) {
        newErrors.dueDate = 'Invalid date';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleDatePreset = (preset: 'today' | 'tomorrow' | 'nextWeek') => {
    setSelectedDatePreset(preset);
    if (preset === 'today') {
      setDueDate(getTodayString(0));
    } else if (preset === 'tomorrow') {
      setDueDate(getTodayString(1));
    } else if (preset === 'nextWeek') {
      setDueDate(getTodayString(7));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const isoDueDate = new Date(dueDate).toISOString();
      await taskService.createTask({
        title,
        description,
        dueDate: isoDueDate,
        priority,
        status,
      });
      setLoading(false);
      navigation.goBack();
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e.message || 'Failed to create task');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Create Task" showBack onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Card glass style={styles.formCard}>
            <Input
              label="Task Title"
              placeholder="e.g. Prep Chemistry Assignment"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            <Input
              label="Description (Optional)"
              placeholder="e.g. Review pages 12-25, sketch lab report..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              inputStyle={styles.descriptionInput}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>PRIORITY LEVEL</Text>
              <View style={styles.chipRow}>
                <Chip
                  label="High"
                  selected={priority === 'high'}
                  onPress={() => setPriority('high')}
                  activeColor="#FFE4E6"
                  activeTextColor="#F43F5E"
                  style={styles.flexChip}
                />
                <Chip
                  label="Medium"
                  selected={priority === 'medium'}
                  onPress={() => setPriority('medium')}
                  activeColor="#FEF3C7"
                  activeTextColor="#D97706"
                  style={styles.flexChip}
                />
                <Chip
                  label="Low"
                  selected={priority === 'low'}
                  onPress={() => setPriority('low')}
                  activeColor="#D1FAE5"
                  activeTextColor="#059669"
                  style={styles.flexChip}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>INITIAL STATUS</Text>
              <View style={styles.chipRow}>
                <Chip
                  label="Pending"
                  selected={status === 'pending'}
                  onPress={() => setStatus('pending')}
                  style={styles.flexChip}
                />
                <Chip
                  label="In Progress"
                  selected={status === 'in_progress'}
                  onPress={() => setStatus('in_progress')}
                  style={styles.flexChip}
                />
                <Chip
                  label="Completed"
                  selected={status === 'completed'}
                  onPress={() => setStatus('completed')}
                  style={styles.flexChip}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DUE DATE</Text>
              <View style={styles.chipRow}>
                <Chip
                  label="Today"
                  selected={selectedDatePreset === 'today'}
                  onPress={() => handleDatePreset('today')}
                  style={styles.flexChip}
                />
                <Chip
                  label="Tomorrow"
                  selected={selectedDatePreset === 'tomorrow'}
                  onPress={() => handleDatePreset('tomorrow')}
                  style={styles.flexChip}
                />
                <Chip
                  label="In 1 Week"
                  selected={selectedDatePreset === 'nextWeek'}
                  onPress={() => handleDatePreset('nextWeek')}
                  style={styles.flexChip}
                />
                <Chip
                  label="Custom"
                  selected={selectedDatePreset === 'custom'}
                  onPress={() => setSelectedDatePreset('custom')}
                  style={styles.flexChip}
                />
              </View>

              {selectedDatePreset === 'custom' && (
                <Input
                  placeholder="YYYY-MM-DD"
                  value={dueDate}
                  onChangeText={setDueDate}
                  error={errors.dueDate}
                  icon={<Icon name="calendar-range" size={20} color="#6366F1" />}
                  containerStyle={styles.customDateInput}
                />
              )}
            </View>

            <PrimaryButton
              title="Save Task"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitBtn}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
  },
  formCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    ...theme.shadows.lg,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
  },
  section: {
    marginVertical: theme.spacing.sm,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: theme.colors.textMuted,
    marginBottom: 8,
    paddingLeft: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  flexChip: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    marginHorizontal: 3,
    marginVertical: 4,
  },
  customDateInput: {
    marginTop: theme.spacing.sm,
  },
  submitBtn: {
    marginTop: theme.spacing.xl,
  },
});

export default AddTaskScreen;
