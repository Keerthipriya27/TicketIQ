import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';
import { taskService } from '../services/taskService';
import { Task, TaskPriority, TaskStatus } from '../types';
import SearchBar from '../components/SearchBar';
import Chip from '../components/Chip';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import AppHeader from '../components/AppHeader';

export const TaskListScreen = ({ navigation }: any) => {
  const isFocused = useIsFocused();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');

  const loadTasks = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      const allTasks = await taskService.getTasks();
      setTasks(allTasks);
    } catch (e) {
      console.error('Failed to load tasks list', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadTasks();
    }
  }, [isFocused]);

  // Apply filters and search
  useEffect(() => {
    let result = [...tasks];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    // Search query filter
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(result);
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks(false);
  };

  const getHeaderRight = () => (
    <TouchableOpacity onPress={() => navigation.navigate('AddTask')} style={styles.addHeaderBtn}>
      <Icon name="plus" size={24} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="My Tasks"
        showBack
        onBackPress={() => navigation.goBack()}
        rightComponent={getHeaderRight()}
      />

      {/* Search and Filters panel */}
      <View style={styles.searchFilterContainer}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* Status filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <Chip label="All" selected={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
            <Chip label="Pending" selected={statusFilter === 'pending'} onPress={() => setStatusFilter('pending')} />
            <Chip label="In Progress" selected={statusFilter === 'in_progress'} onPress={() => setStatusFilter('in_progress')} />
            <Chip label="Completed" selected={statusFilter === 'completed'} onPress={() => setStatusFilter('completed')} />
          </ScrollView>
        </View>

        {/* Priority filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Priority:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <Chip label="All" selected={priorityFilter === 'all'} onPress={() => setPriorityFilter('all')} />
            <Chip
              label="High"
              selected={priorityFilter === 'high'}
              onPress={() => setPriorityFilter('high')}
              activeColor={theme.colors.priorityHighBg}
              activeTextColor={theme.colors.priorityHigh}
            />
            <Chip
              label="Medium"
              selected={priorityFilter === 'medium'}
              onPress={() => setPriorityFilter('medium')}
              activeColor={theme.colors.priorityMediumBg}
              activeTextColor={theme.colors.priorityMedium}
            />
            <Chip
              label="Low"
              selected={priorityFilter === 'low'}
              onPress={() => setPriorityFilter('low')}
              activeColor={theme.colors.priorityLowBg}
              activeTextColor={theme.colors.priorityLow}
            />
          </ScrollView>
        </View>
      </View>

      {/* Tasks List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title={searchQuery.trim().length > 0 || statusFilter !== 'all' || priorityFilter !== 'all' ? 'No matching tasks' : 'Your schedule is clear!'}
              description={searchQuery.trim().length > 0 || statusFilter !== 'all' || priorityFilter !== 'all' ? 'Try adjusting your search query or filter chips.' : 'Create a new task to organize your study planner.'}
              actionTitle={searchQuery.trim().length > 0 || statusFilter !== 'all' || priorityFilter !== 'all' ? 'Reset Filters' : 'Add Task'}
              onActionPress={() => {
                if (searchQuery.trim().length > 0 || statusFilter !== 'all' || priorityFilter !== 'all') {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                } else {
                  navigation.navigate('AddTask');
                }
              }}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  addHeaderBtn: {
    padding: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryLight,
  },
  searchFilterContainer: {
    padding: theme.spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.textMuted,
    width: 60,
    textTransform: 'uppercase',
  },
  filterRow: {
    flex: 1,
  },
  listContainer: {
    padding: theme.spacing.lg,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TaskListScreen;
