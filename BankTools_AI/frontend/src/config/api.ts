export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
    },
    USER: {
      LOAN_REQUEST: '/user/loan-request',
    },
    AI_MODELS: {
      PREDICT_LOAN: '/api/predict-loan',
    },
    ADMIN: {
      CHURN_UPLOAD: '/admin/churn-upload',
      CHURN_ANALYSES: '/admin/churn-analyses',
      CHURN_ANALYSIS: '/admin/churn-analysis',
      DELETE_CHURN_ANALYSIS: '/admin/churn-analysis',
    },
  },
  HEADERS: {
    'Content-Type': 'application/json',
  },
} 