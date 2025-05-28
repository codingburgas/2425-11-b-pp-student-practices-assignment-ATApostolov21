export interface User {
  id: number;
  email: string;
  role: 'banking_user' | 'banking_employee';
}

export interface LoanRequest {
  amount: number;
  purpose: string;
  income: number;
  employment_years: number;
  credit_score: number;
}

export interface ChurnAnalysis {
  total_customers: number;
  churn_risk_high: number;
  churn_risk_medium: number;
  churn_risk_low: number;
  key_factors: string[];
} 