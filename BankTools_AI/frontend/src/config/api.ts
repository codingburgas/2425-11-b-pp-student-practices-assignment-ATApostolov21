export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
    },
    USER: {
      PROFILE: '/api/user/profile',
      UPDATE_EMAIL: '/api/user/update-email',
      UPDATE_PASSWORD: '/api/user/update-password',
      DELETE_ACCOUNT: '/api/user/delete-account',
      LOAN_REQUEST: '/api/user/loan-request',
      LOAN_REQUESTS: '/api/user/loan-requests',
      LOAN_REQUEST_DETAILS: '/api/user/loan-request',
      DELETE_LOAN_REQUEST: '/api/user/loan-request',
    },
    AI_MODELS: {
      PREDICT_LOAN: '/api/predict-loan',
    },
    ADMIN: {
      CHURN_UPLOAD: '/api/admin/churn-upload',
      CHURN_ANALYSES: '/api/admin/churn-analyses',
      CHURN_ANALYSIS: '/api/admin/churn-analysis',
      DELETE_CHURN_ANALYSIS: '/api/admin/churn-analysis',
    },
  },
  HEADERS: {
    'Content-Type': 'application/json',
  },
} 