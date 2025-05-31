import axios, { AxiosError } from 'axios';
import type { User, LoanRequest } from '../types';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  withCredentials: true, // Important for handling cookies/sessions
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (email: string, password: string, role: User['role']) =>
    api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, { email, password, role }),
  
  login: (email: string, password: string) =>
    api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, { email, password }),
  
  logout: () => api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
};

export const banking = {
  submitLoanRequest: (data: LoanRequest) =>
    api.post(API_CONFIG.ENDPOINTS.USER.LOAN_REQUEST, data),
  
  uploadChurnAnalysis: (file: File, analysisName: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('analysis_name', analysisName);
    return api.post(API_CONFIG.ENDPOINTS.ADMIN.CHURN_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getChurnAnalyses: () =>
    api.get(API_CONFIG.ENDPOINTS.ADMIN.CHURN_ANALYSES),

  getChurnAnalysis: (id: number) =>
    api.get(`${API_CONFIG.ENDPOINTS.ADMIN.CHURN_ANALYSIS}/${id}`),

  deleteChurnAnalysis: (id: number) =>
    api.delete(`${API_CONFIG.ENDPOINTS.ADMIN.DELETE_CHURN_ANALYSIS}/${id}`),
}; 