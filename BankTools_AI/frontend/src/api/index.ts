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
    api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, { email, password, account_type: role === 'banking_user' ? 'customer' : 'employee' }),
  
  login: (email: string, password: string) =>
    api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, { email, password }),
  
  logout: () => api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
};

export const user = {
  profile: () => api.get(API_CONFIG.ENDPOINTS.USER.PROFILE),
  
  updateEmail: (email: string) =>
    api.put(API_CONFIG.ENDPOINTS.USER.UPDATE_EMAIL, { email }),
  
  updatePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    api.put(API_CONFIG.ENDPOINTS.USER.UPDATE_PASSWORD, { 
      currentPassword, 
      newPassword, 
      confirmPassword 
    }),

  submitLoanRequest: (loanData: Omit<LoanRequest, 'id' | 'userId' | 'status' | 'createdAt'>) =>
    api.post(API_CONFIG.ENDPOINTS.USER.LOAN_REQUEST, loanData),

  getLoanRequests: () => api.get(API_CONFIG.ENDPOINTS.USER.LOAN_REQUESTS),

  getLoanRequestDetails: (id: number) =>
    api.get(`${API_CONFIG.ENDPOINTS.USER.LOAN_REQUEST_DETAILS}/${id}`),

  deleteLoanRequest: (id: number) =>
    api.delete(`${API_CONFIG.ENDPOINTS.USER.DELETE_LOAN_REQUEST}/${id}`),
};

export const banking = {
  // Use the user endpoint that handles simple form data and includes mapping logic
  submitLoanRequest: (data: LoanRequest) =>
    api.post(API_CONFIG.ENDPOINTS.USER.LOAN_REQUEST, data),
  
  // Enhanced AI-powered loan request using the full AI model format
  submitAdvancedLoanRequest: (data: any) =>
    api.post(API_CONFIG.ENDPOINTS.AI_MODELS.PREDICT_LOAN, data),
  
  // Get all loan requests for the authenticated user
  getUserLoanRequests: () =>
    api.get(API_CONFIG.ENDPOINTS.USER.LOAN_REQUESTS),
  
  // Get details of a specific loan request
  getLoanRequestDetails: (loanId: number) =>
    api.get(`${API_CONFIG.ENDPOINTS.USER.LOAN_REQUEST_DETAILS}/${loanId}`),
  
  // Delete a specific loan request
  deleteLoanRequest: (loanId: number) =>
    api.delete(`${API_CONFIG.ENDPOINTS.USER.DELETE_LOAN_REQUEST}/${loanId}`),
  
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