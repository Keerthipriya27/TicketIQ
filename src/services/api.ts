import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let Config: any = {};
if (Platform.OS !== 'web') {
  try {
    Config = require('react-native-config').default;
  } catch (e) {
    Config = {};
  }
}

// Get base URL with fallbacks
const getBaseUrl = (): string => {
  return Config?.API_BASE_URL || 'http://127.0.0.1:8000';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer Token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error reading token from storage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with non-2xx status code
      errorMessage = error.response.data?.message || `Request failed with status ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response was received
      errorMessage = 'No response received from server. Please check your internet connection.';
    } else {
      // Something else caused the error
      errorMessage = error.message;
    }
    
    const formattedError = new Error(errorMessage);
    (formattedError as any).status = error.response?.status;
    (formattedError as any).originalError = error;
    
    return Promise.reject(formattedError);
  }
);

export default api;
