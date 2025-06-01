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

// Enhanced loan prediction response from AI model
export interface LoanPredictionResponse {
  success: boolean;
  message?: string;
  request_id?: number;
  prediction: {
    approval_status: 'Approved' | 'Rejected';
    approval_probability: number;
    confidence_level: 'High' | 'Medium' | 'Low';
    recommendations: string[];
  };
  model_info: {
    prediction_method: 'ai_model' | 'rule_based' | 'error_fallback';
    model_available: boolean;
  };
}

// Risk assessment breakdown for visualization
export interface RiskAssessment {
  creditScore: {
    score: number;
    rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    impact: 'Positive' | 'Neutral' | 'Negative';
    weight: number;
  };
  income: {
    amount: number;
    adequacy: 'High' | 'Medium' | 'Low';
    impact: 'Positive' | 'Neutral' | 'Negative';
    weight: number;
  };
  employment: {
    years: number;
    stability: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    impact: 'Positive' | 'Neutral' | 'Negative';
    weight: number;
  };
  debtToIncome: {
    ratio: number;
    level: 'Low' | 'Moderate' | 'High' | 'Very High';
    impact: 'Positive' | 'Neutral' | 'Negative';
    weight: number;
  };
}

export interface ChurnAnalysisListItem {
  id: number;
  name: string;
  created_at: string;
  total_customers: number;
  avg_churn_risk: number;
  high_risk_customers: number;
}

export interface ChurnAnalysis {
  total_customers: number;
  churn_risk_high: number;
  churn_risk_medium: number;
  churn_risk_low: number;
  key_factors: string[];
} 