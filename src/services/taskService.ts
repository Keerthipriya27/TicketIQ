import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { Task, TaskPriority, TaskStatus, DashboardStats } from '../types';

const STORAGE_KEY = '@student_tasks';

const INITIAL_MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Complete Mobile App Implementation',
    description: 'Implement navigation flow, Context API integration, and Axios services layer for the Student Task Planner.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
    priority: 'high',
    status: 'in_progress',
    userId: 'student-789',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Revise Operating Systems Chapter 4',
    description: 'Prepare revision notes on CPU Scheduling algorithms (FIFO, Round Robin, Shortest Job First).',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day from now
    priority: 'medium',
    status: 'pending',
    userId: 'student-789',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Submit Physics Lab Report',
    description: 'Calculate the acceleration due to gravity using a simple pendulum experiment data and write findings.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
    priority: 'high',
    status: 'pending',
    userId: 'student-789',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Design UI mockup in Figma',
    description: 'Create high fidelity interactive mockups for the dashboard and profile screens.',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    priority: 'low',
    status: 'completed',
    userId: 'student-789',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Select College Electives',
    description: 'Choose between Advanced Machine Learning and Cloud Computing courses for next semester.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
    priority: 'medium',
    status: 'completed',
    userId: 'student-789',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to initialize local storage
const initializeLocalTasks = async (): Promise<Task[]> => {
  const local = await AsyncStorage.getItem(STORAGE_KEY);
  if (!local) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_TASKS));
    return INITIAL_MOCK_TASKS;
  }
  return JSON.parse(local);
};

export const taskService = {
  /**
   * Get all tasks
   */
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get<Task[]>('/tasks');
      // Sync local storage with server
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.warn('API getTasks failed, returning local storage tasks', error);
      return await initializeLocalTasks();
    }
  },

  /**
   * Get task by ID
   */
  getTaskById: async (id: string): Promise<Task> => {
    try {
      const response = await api.get<Task>(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`API getTaskById(${id}) failed, returning local storage item`, error);
      const tasks = await initializeLocalTasks();
      const task = tasks.find((t) => t.id === id);
      if (!task) {
        throw new Error('Task not found');
      }
      return task;
    }
  },

  /**
   * Create a new task
   */
  createTask: async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      const response = await api.post<Task>('/tasks', taskData);
      // Sync local
      const localTasks = await initializeLocalTasks();
      localTasks.unshift(response.data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localTasks));
      return response.data;
    } catch (error) {
      console.warn('API createTask failed, creating locally', error);
      const userStr = await AsyncStorage.getItem('auth_user');
      const userId = userStr ? JSON.parse(userStr).id : 'student-789';

      const newTask: Task = {
        ...taskData,
        id: `local-${Date.now()}`,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const localTasks = await initializeLocalTasks();
      localTasks.unshift(newTask);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localTasks));
      return newTask;
    }
  },

  /**
   * Update task by ID
   */
  updateTask: async (id: string, taskData: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Task> => {
    try {
      const response = await api.put<Task>(`/tasks/${id}`, taskData);
      // Sync local
      const localTasks = await initializeLocalTasks();
      const index = localTasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        localTasks[index] = response.data;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localTasks));
      }
      return response.data;
    } catch (error) {
      console.warn(`API updateTask(${id}) failed, updating locally`, error);
      const localTasks = await initializeLocalTasks();
      const index = localTasks.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Task not found');
      }

      const updatedTask: Task = {
        ...localTasks[index],
        ...taskData,
        updatedAt: new Date().toISOString(),
      };

      localTasks[index] = updatedTask;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localTasks));
      return updatedTask;
    }
  },

  /**
   * Delete task by ID
   */
  deleteTask: async (id: string): Promise<void> => {
    try {
      await api.delete(`/tasks/${id}`);
      // Sync local
      const localTasks = await initializeLocalTasks();
      const filtered = localTasks.filter((t) => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.warn(`API deleteTask(${id}) failed, deleting locally`, error);
      const localTasks = await initializeLocalTasks();
      const filtered = localTasks.filter((t) => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  },

  /**
   * Calculate dashboard statistics from tasks
   */
  calculateStats: (tasks: Task[]): DashboardStats => {
    const totalCount = tasks.length;
    const completedCount = tasks.filter((t) => t.status === 'completed').length;
    const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
    const pendingCount = tasks.filter((t) => t.status === 'pending').length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      pendingCount,
      completedCount,
      inProgressCount,
      totalCount,
      progressPercentage,
    };
  },
};
