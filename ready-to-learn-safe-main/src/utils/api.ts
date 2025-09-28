/**
 * Centralized API configuration and utilities
 * 
 * This module provides a centralized way to configure API endpoints
 * and makes the application deployment-ready by using environment variables
 * instead of hardcoded localhost URLs.
 */

import axios from 'axios';

// Get the API base URL from environment variables
// In development: VITE_API_URL=http://localhost:5001/api
// In production: VITE_API_URL=https://your-api-domain.com/api
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (!envUrl) {
    console.warn(
      'VITE_API_URL is not set in environment variables. ' +
      'Falling back to localhost for development. ' +
      'Make sure to set this in production!'
    );
    return 'http://localhost:5001/api';
  }
  
  return envUrl;
};

// Export the API base URL for use in components
export const API_BASE_URL = getApiBaseUrl();

// Create a configured axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userType');
      window.location.href = '/auth';
    }
    
    // Log API errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function to make API calls without manually setting headers
 * Usage: apiCall('get', '/student/profile')
 */
export const apiCall = async (method: 'get' | 'post' | 'put' | 'delete', endpoint: string, data?: any) => {
  return apiClient[method](endpoint, data);
};

/**
 * Helper functions for common API patterns
 */
export const api = {
  // Authentication
  auth: {
    studentLogin: (credentials: { email: string; password: string }) =>
      apiClient.post('/student/login', credentials),
    studentRegister: (data: any) =>
      apiClient.post('/student/register', data),
    studentLogout: () =>
      apiClient.post('/student/logout'),
    institutionLogin: (credentials: { email: string; password: string }) =>
      apiClient.post('/institution/login', credentials),
    institutionRegister: (data: any) =>
      apiClient.post('/institution/register', data),
    institutionLogout: () =>
      apiClient.post('/institution/logout'),
  },
  
  // Student endpoints
  student: {
    getProfile: () => apiClient.get('/student/profile'),
    updateProfile: (data: any) => apiClient.put('/student/profile', data),
    getDashboard: () => apiClient.get('/student/dashboard'),
    getDashboardData: () => apiClient.get('/student/dashboard-data'),
    getProgress: () => apiClient.get('/student/progress-dashboard'),
  },
  
  // Institution endpoints
  institution: {
    getStudentsProgress: (params: any) => apiClient.get('/institution/students-progress', { params }),
    getAnalytics: () => apiClient.get('/institution/analytics'),
  },
  
  // Modules and quizzes
  modules: {
    getAll: () => apiClient.get('/modules'),
    getById: (id: string) => apiClient.get(`/modules/${id}`),
    getQuizzes: (moduleId: string) => apiClient.get(`/modules/${moduleId}/quizzes`),
    submitQuiz: (moduleId: string, quizId: string, answers: any) =>
      apiClient.post(`/modules/${moduleId}/quiz/${quizId}/submit`, answers),
  },
  
  // Weather and alerts
  weather: {
    getCurrent: (location?: any) => apiClient.get('/weather/current', { params: location }),
    getAlerts: () => apiClient.get('/weather/alerts'),
  },
  
  alerts: {
    getAll: (params?: any) => apiClient.get('/alerts', { params }),
    create: (data: any) => apiClient.post('/alerts', data),
    update: (id: string, data: any) => apiClient.put(`/alerts/${id}`, data),
    delete: (id: string) => apiClient.delete(`/alerts/${id}`),
  },
  
  // Chatbot
  chatbot: {
    sendMessage: (message: string) => apiClient.post('/chatbot/chat', { message }),
  },
};

// Export environment-aware configuration
export const config = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: API_BASE_URL,
};

export default apiClient;