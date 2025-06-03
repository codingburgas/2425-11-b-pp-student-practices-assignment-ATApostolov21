export interface LoanApplication {
  id: number
  amount: number
  purpose: string
  income: number
  employment_years: number
  credit_score: number
  status: string
  prediction: string
  created_at: string
}

export interface LoanPredictionResponse {
  prediction: {
    approval_status: string
    approval_probability: number
    confidence_level: string
  }
  model_info?: {
    prediction_method: string
  }
} 