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
    ADMIN: {
      CHURN_UPLOAD: '/admin/churn-upload',
    },
  },
  HEADERS: {
    'Content-Type': 'application/json',
  },
} 