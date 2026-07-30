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

  useEffect(() => {
    let result = [...tasks];

    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter((task) => task.priority === priorityFilter);
    }

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
    <TouchableOpacity onPress={() => navigation.navigate('AddTask')} style={styles.addHeaderBtn} activeOpacity={0.8}>
      <Icon name="plus" size={22} color="#6366F1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Tasks Feed"
        showBack
        onBackPress={() => navigation.goBack()}
        rightComponent={getHeaderRight()}
      />

      <View style={styles.searchFilterContainer}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>STATUS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <Chip label="All" selected={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
            <Chip label="Pending" selected={statusFilter === 'pending'} onPress={() => setStatusFilter('pending')} />
            <Chip label="In Progress" selected={statusFilter === 'in_progress'} onPress={() => setStatusFilter('in_progress')} />
            <Chip label="Completed" selected={statusFilter === 'completed'} onPress={() => setStatusFilter('completed')} />
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>PRIORITY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <Chip label="All" selected={priorityFilter === 'all'} onPress={() => setPriorityFilter('all')} />
            <Chip
              label="High"
              selected={priorityFilter === 'high'}
              onPress={() => setPriorityFilter('high')}
              activeColor="#FFE4E6"
              activeTextColor="#F43F5E"
            />
            <Chip
              label="Medium"
              selected={priorityFilter === 'medium'}
              onPress={() => setPriorityFilter('medium')}
              activeColor="#FEF3C7"
              activeTextColor="#D97706"
            />
            <Chip
              label="Low"
              selected={priorityFilter === 'low'}
              onPress={() => setPriorityFilter('low')}
              activeColor="#D1FAE5"
              activeTextColor="#059669"
            />
          </ScrollView>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
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
    width: 38,
    height: 38,
    borderRadius: theme.radius.round,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFilterContainer: {
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  filterLabel: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamilyBold,
    fontWeight: theme.typography.weights.heavy,
    color: theme.colors.textMuted,
    width: 70,
    letterSpacing: 1,
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
