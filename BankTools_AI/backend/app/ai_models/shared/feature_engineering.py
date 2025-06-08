"""
Feature engineering utilities for AI models
"""

import numpy as np
import pandas as pd
from typing import Dict, Any


class ChurnFeatureEngineer:
    """
    Feature engineering for churn prediction model
    """
    
    @staticmethod
    def create_churn_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Enhanced feature engineering with domain knowledge and data quality considerations
        """
        df_enhanced = df.copy()
        
        print("\n=== FEATURE ENGINEERING ===")
        
        # Create interaction features only if base features are available and have good quality
        features_created = []
        
        if 'Balance' in df_enhanced.columns and 'EstimatedSalary' in df_enhanced.columns:
            # Balance to salary ratio (handle division by zero)
            df_enhanced['BalanceToSalaryRatio'] = df_enhanced['Balance'] / (df_enhanced['EstimatedSalary'] + 1)
            features_created.append('BalanceToSalaryRatio')
        
        if 'Age' in df_enhanced.columns:
            # Age groups with meaningful business segments
            df_enhanced['AgeGroup'] = pd.cut(df_enhanced['Age'], 
                                           bins=[0, 25, 35, 50, 65, 100], 
                                           labels=['Young', 'YoungAdult', 'MiddleAge', 'Senior', 'Elderly'])
            features_created.append('AgeGroup')
        
        if 'CreditScore' in df_enhanced.columns:
            # Credit score categories based on industry standards
            df_enhanced['CreditCategory'] = pd.cut(df_enhanced['CreditScore'],
                                                 bins=[0, 580, 670, 740, 800, 850],
                                                 labels=['Poor', 'Fair', 'Good', 'VeryGood', 'Excellent'])
            features_created.append('CreditCategory')
        
        if 'Tenure' in df_enhanced.columns and 'Age' in df_enhanced.columns:
            # Customer lifecycle stage
            df_enhanced['CustomerLifecycleStage'] = np.where(
                df_enhanced['Tenure'] < 2, 'New',
                np.where(df_enhanced['Tenure'] < 5, 'Growing', 
                        np.where(df_enhanced['Tenure'] < 10, 'Mature', 'Loyal'))
            )
            features_created.append('CustomerLifecycleStage')
        
        if 'NumOfProducts' in df_enhanced.columns and 'Balance' in df_enhanced.columns:
            # Product utilization efficiency
            df_enhanced['ProductUtilization'] = np.where(
                df_enhanced['NumOfProducts'] > 0,
                df_enhanced['Balance'] / df_enhanced['NumOfProducts'],
                0
            )
            features_created.append('ProductUtilization')
        
        # Convert categorical features to numeric for modeling
        categorical_features_to_encode = ['AgeGroup', 'CreditCategory', 'CustomerLifecycleStage']
        for col in categorical_features_to_encode:
            if col in df_enhanced.columns:
                df_enhanced[col] = pd.Categorical(df_enhanced[col]).codes
        
        print(f"Created {len(features_created)} new features: {features_created}")
        
        return df_enhanced


class LoanFeatureEngineer:
    """
    Feature engineering for loan prediction model
    """
    
    @staticmethod
    def create_aligned_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features that align with the frontend form
        
        Args:
            df: Original DataFrame
            
        Returns:
            DataFrame with aligned features
        """
        # Create a copy to avoid modifying original
        df_aligned = df.copy()
        
        # Map original features to frontend-aligned features
        
        # 1. amount = LoanAmount (already exists)
        if 'LoanAmount' in df_aligned.columns:
            df_aligned['amount'] = df_aligned['LoanAmount']
        
        # 2. purpose = derived from loan characteristics
        # Create a synthetic purpose based on loan amount and other factors
        if 'LoanAmount' in df_aligned.columns and 'Property_Area' in df_aligned.columns:
            df_aligned['purpose'] = df_aligned.apply(
                LoanFeatureEngineer._determine_purpose, axis=1
            )
        
        # 3. income = ApplicantIncome + CoapplicantIncome
        if 'ApplicantIncome' in df_aligned.columns and 'CoapplicantIncome' in df_aligned.columns:
            df_aligned['income'] = df_aligned['ApplicantIncome'] + df_aligned['CoapplicantIncome']
        elif 'ApplicantIncome' in df_aligned.columns:
            df_aligned['income'] = df_aligned['ApplicantIncome']
        
        # 4. employment_years = derived from other factors
        if 'ApplicantIncome' in df_aligned.columns:
            df_aligned['employment_years'] = df_aligned.apply(
                LoanFeatureEngineer._estimate_employment_years, axis=1
            )
        
        # 5. credit_score = derived from Credit_History and other factors
        if 'Credit_History' in df_aligned.columns:
            df_aligned['credit_score'] = df_aligned.apply(
                LoanFeatureEngineer._estimate_credit_score, axis=1
            )
        
        return df_aligned
    
    @staticmethod
    def _determine_purpose(row):
        """Determine loan purpose based on loan amount and property area"""
        loan_amount = row.get('LoanAmount', 0)
        property_area = row.get('Property_Area', 'Urban')
        
        if loan_amount >= 300:
            return 'Home Purchase'
        elif loan_amount >= 200:
            return 'Home Refinance'
        elif loan_amount >= 100:
            return 'Auto Loan'
        elif loan_amount >= 50:
            return 'Personal Loan'
        else:
            return 'Personal/Other'
    
    @staticmethod
    def _estimate_employment_years(row):
        """Estimate employment years based on income and education"""
        income = row.get('ApplicantIncome', 0)
        education = row.get('Education', 'Graduate')
        age_proxy = row.get('Dependents', 0)  # More dependents might indicate older age
        
        base_years = 2.0  # Base employment years
        
        # Higher income suggests more experience
        if income >= 20000:
            base_years += 8
        elif income >= 15000:
            base_years += 6
        elif income >= 10000:
            base_years += 4
        elif income >= 5000:
            base_years += 2
        
        # Education factor
        if education == 'Graduate':
            base_years += 2
        
        # Age proxy (dependents)
        base_years += age_proxy * 1.5
        
        return min(base_years, 40)  # Cap at 40 years
    
    @staticmethod
    def _estimate_credit_score(row):
        """Estimate credit score based on credit history and other factors"""
        credit_history = row.get('Credit_History', 0)
        income = row.get('ApplicantIncome', 0)
        education = row.get('Education', 'Graduate')
        self_employed = row.get('Self_Employed', 'No')
        
        # Base score
        if credit_history == 1:
            base_score = 700  # Good credit history
        else:
            base_score = 600  # Poor credit history
        
        # Income factor
        if income >= 20000:
            base_score += 50
        elif income >= 15000:
            base_score += 30
        elif income >= 10000:
            base_score += 20
        elif income >= 5000:
            base_score += 10
        
        # Education factor
        if education == 'Graduate':
            base_score += 20
        
        # Employment type factor
        if self_employed == 'Yes':
            base_score -= 30  # Self-employed typically have lower scores
        
        # Add some randomness to make it realistic
        import random
        random.seed(int(income) if income > 0 else 42)  # Deterministic randomness
        base_score += random.randint(-50, 50)
        
        return max(300, min(850, base_score))  # Keep within valid range 