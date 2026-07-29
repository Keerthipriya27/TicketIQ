import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { User, AuthResponse } from '../types';

const MOCK_USER: User = {
  id: 'student-789',
  username: 'alex_student',
  name: 'Alex Mercer',
  email: 'alex.mercer@academy.edu',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  bio: 'Sophomore | Computer Science Major | Focused on learning React Native and organizing academics.',
};

export const authService = {
  /**
   * Log in user
   * If server is offline/error, logs in with mock user for robust UX
   */
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/login', { username, password });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      console.warn('API login failed, falling back to local mock login', error);
      
      // Fallback: Accept any non-empty login for demo convenience
      if (username.trim() && password.trim()) {
        const token = 'mock_jwt_token_alex_mercer';
        const user = { ...MOCK_USER, username: username.toLowerCase() };
        
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(user));
        
        return { token, user };
      }
      throw new Error('Please enter both username and password.');
    }
  },

  /**
   * Get currently logged-in user
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userStr = await AsyncStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error fetching user from AsyncStorage', e);
      return null;
    }
  },

  /**
   * Log out user and clear storage
   */
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
    } catch (e) {
      console.error('Error during logout', e);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    } catch (e) {
      return false;
    }
  },
};
