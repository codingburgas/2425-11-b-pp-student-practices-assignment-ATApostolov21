"""
Loan Approval Prediction Model for BankTools_AI
Uses SelectKBest for feature selection and aligns with frontend form
Features: amount, purpose, income, employment_years, credit_score
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib
import os
from typing import Tuple, Dict, Any, List
from sklearn.feature_selection import SelectKBest, f_classif, chi2
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import warnings
warnings.filterwarnings('ignore')


class LoanPredictor:
    """
    Loan approval prediction pipeline with feature selection
    Aligned with frontend form: amount, purpose, income, employment_years, credit_score
    """
    
    def __init__(self, n_features: int = 5):
        """
        Initialize the loan predictor
        
        Args:
            n_features: Number of top features to select using SelectKBest
        """
        self.n_features = n_features
        self.pipeline = None
        self.feature_names = None
        self.selected_features = None
        self.label_encoders = {}
        self.is_trained = False
        self.model_performance = {}
        
    def load_and_preprocess_data(self, filepath: str) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Load and preprocess the loan dataset
        
        Args:
            filepath: Path to the CSV file
            
        Returns:
            X: Feature DataFrame
            y: Target Series
        """
        print("Loading loan dataset...")
        df = pd.read_csv(filepath)
        print(f"Dataset shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        
        # Check target distribution
        if 'Loan_Status' in df.columns:
            print(f"Target distribution:\n{df['Loan_Status'].value_counts()}")
        
        # Handle missing values
        print(f"Missing values before cleaning:\n{df.isnull().sum()}")
        
        # Fill missing values for categorical variables
        categorical_cols = ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed', 'Property_Area']
        for col in categorical_cols:
            if col in df.columns and df[col].isnull().any():
                mode_value = df[col].mode()
                if len(mode_value) > 0:
                    df[col] = df[col].fillna(mode_value[0])
        
        # Fill missing values for numerical variables
        numerical_cols = ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term', 'Credit_History']
        for col in numerical_cols:
            if col in df.columns and df[col].isnull().any():
                df[col] = df[col].fillna(df[col].median())
        
        # Handle Dependents column (convert '3+' to '3')
        if 'Dependents' in df.columns:
            df['Dependents'] = df['Dependents'].replace('3+', '3')
            df['Dependents'] = pd.to_numeric(df['Dependents'], errors='coerce')
            df['Dependents'] = df['Dependents'].fillna(0)
        
        print(f"Missing values after cleaning:\n{df.isnull().sum()}")
        
        # Create new features that align with frontend form
        df = self._create_aligned_features(df)
        
        # Separate features and target
        if 'Loan_Status' in df.columns:
            y = (df['Loan_Status'] == 'Y').astype(int)
            X = df.drop(['Loan_Status'], axis=1)
        else:
            y = None
            X = df
        
        # Drop ID column if present
        if 'Loan_ID' in X.columns:
            X = X.drop('Loan_ID', axis=1)
        
        return X, y
    
    def _create_aligned_features(self, df: pd.DataFrame) -> pd.DataFrame:
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
            def determine_purpose(row):
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
            
            df_aligned['purpose'] = df_aligned.apply(determine_purpose, axis=1)
        
        # 3. income = ApplicantIncome + CoapplicantIncome
        if 'ApplicantIncome' in df_aligned.columns and 'CoapplicantIncome' in df_aligned.columns:
            df_aligned['income'] = df_aligned['ApplicantIncome'] + df_aligned['CoapplicantIncome']
        elif 'ApplicantIncome' in df_aligned.columns:
            df_aligned['income'] = df_aligned['ApplicantIncome']
        
        # 4. employment_years = derived from other factors
        # Create synthetic employment years based on income and other factors
        if 'ApplicantIncome' in df_aligned.columns:
            def estimate_employment_years(row):
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
            
            df_aligned['employment_years'] = df_aligned.apply(estimate_employment_years, axis=1)
        
        # 5. credit_score = derived from Credit_History and other factors
        if 'Credit_History' in df.columns:
            def estimate_credit_score(row):
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
            
            df_aligned['credit_score'] = df_aligned.apply(estimate_credit_score, axis=1)
        
        return df_aligned
    
    def prepare_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Prepare features for training/prediction
        
        Args:
            X: Input DataFrame
            
        Returns:
            Processed DataFrame
        """
        X_processed = X.copy()
        
        # Select only the features we want to use (aligned with frontend)
        frontend_features = ['amount', 'purpose', 'income', 'employment_years', 'credit_score']
        
        # Also include original features for feature selection
        original_features = ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed',
                           'ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 
                           'Loan_Amount_Term', 'Credit_History', 'Property_Area']
        
        # Combine all available features
        available_features = []
        for feature in frontend_features + original_features:
            if feature in X_processed.columns:
                available_features.append(feature)
        
        X_processed = X_processed[available_features]
        
        # Encode categorical variables
        categorical_features = ['purpose', 'Gender', 'Married', 'Education', 'Self_Employed', 'Property_Area']
        
        for feature in categorical_features:
            if feature in X_processed.columns:
                if feature not in self.label_encoders:
                    self.label_encoders[feature] = LabelEncoder()
                    X_processed[feature] = self.label_encoders[feature].fit_transform(X_processed[feature].astype(str))
                else:
                    # Handle unseen categories
                    unique_values = X_processed[feature].astype(str).unique()
                    for value in unique_values:
                        if value not in self.label_encoders[feature].classes_:
                            # Add new category
                            self.label_encoders[feature].classes_ = np.append(self.label_encoders[feature].classes_, value)
                    X_processed[feature] = self.label_encoders[feature].transform(X_processed[feature].astype(str))
        
        return X_processed
    
    def train(self, filepath: str, test_size: float = 0.2) -> Dict[str, Any]:
        """
        Train the loan approval model with feature selection
        
        Args:
            filepath: Path to the training data
            test_size: Fraction of data to use for testing
            
        Returns:
            Training results and metrics
        """
        print("Starting loan approval model training...")
        
        # Load and preprocess data
        X, y = self.load_and_preprocess_data(filepath)
        
        # Prepare features
        X_processed = self.prepare_features(X)
        self.feature_names = X_processed.columns.tolist()
        
        print(f"Available features: {self.feature_names}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y, test_size=test_size, random_state=42, stratify=y
        )
        
        # Create pipeline with feature selection and multiple models to test
        models_to_test = {
            'RandomForest': RandomForestClassifier(random_state=42, n_estimators=100),
            'GradientBoosting': GradientBoostingClassifier(random_state=42, n_estimators=100),
            'LogisticRegression': LogisticRegression(random_state=42, max_iter=1000)
        }
        
        best_model = None
        best_score = 0
        best_model_name = ""
        
        print(f"\nTesting different models with SelectKBest (k={self.n_features})...")
        
        for model_name, model in models_to_test.items():
            print(f"\nTesting {model_name}...")
            
            # Create pipeline
            pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('feature_selection', SelectKBest(score_func=f_classif, k=self.n_features)),
                ('classifier', model)
            ])
            
            # Cross-validation
            cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='roc_auc')
            mean_cv_score = cv_scores.mean()
            
            print(f"{model_name} CV ROC-AUC: {mean_cv_score:.4f} (+/- {cv_scores.std() * 2:.4f})")
            
            if mean_cv_score > best_score:
                best_score = mean_cv_score
                best_model = pipeline
                best_model_name = model_name
        
        print(f"\nBest model: {best_model_name} with CV ROC-AUC: {best_score:.4f}")
        
        # Train the best model
        self.pipeline = best_model
        self.pipeline.fit(X_train, y_train)
        
        # Get selected features
        selected_mask = self.pipeline.named_steps['feature_selection'].get_support()
        self.selected_features = [self.feature_names[i] for i in range(len(self.feature_names)) if selected_mask[i]]
        
        print(f"\nSelected top {self.n_features} features: {self.selected_features}")
        
        # Get feature scores
        feature_scores = self.pipeline.named_steps['feature_selection'].scores_
        feature_importance = [(self.feature_names[i], feature_scores[i]) for i in range(len(self.feature_names))]
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        
        print("\nFeature importance scores:")
        for feature, score in feature_importance[:10]:  # Top 10
            print(f"  {feature}: {score:.2f}")
        
        # Evaluate on test set
        y_pred = self.pipeline.predict(X_test)
        y_pred_proba = self.pipeline.predict_proba(X_test)[:, 1]
        
        # Calculate metrics
        test_accuracy = self.pipeline.score(X_test, y_test)
        test_roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        print(f"\n=== TEST RESULTS ===")
        print(f"Test Accuracy: {test_accuracy:.4f}")
        print(f"Test ROC-AUC: {test_roc_auc:.4f}")
        
        print(f"\nClassification Report:")
        print(classification_report(y_test, y_pred))
        
        print(f"\nConfusion Matrix:")
        cm = confusion_matrix(y_test, y_pred)
        print(cm)
        
        # Store performance metrics
        self.model_performance = {
            'best_model': best_model_name,
            'cv_roc_auc': best_score,
            'test_accuracy': test_accuracy,
            'test_roc_auc': test_roc_auc,
            'selected_features': self.selected_features,
            'feature_importance': feature_importance
        }
        
        self.is_trained = True
        
        return self.model_performance
    
    def predict(self, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict loan approval for a single applicant
        
        Args:
            application_data: Dictionary with applicant features
                Expected keys: amount, purpose, income, employment_years, credit_score
            
        Returns:
            Prediction results
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet. Call train() first.")
        
        # Create DataFrame from input
        df = pd.DataFrame([application_data])
        
        # If we have original dataset features, we can create a more complete feature set
        # For now, work with what we have
        
        # Ensure all required features are present
        required_features = ['amount', 'purpose', 'income', 'employment_years', 'credit_score']
        for feature in required_features:
            if feature not in df.columns:
                # Provide default values
                defaults = {
                    'amount': 100,
                    'purpose': 'Personal/Other',
                    'income': 50000,
                    'employment_years': 2,
                    'credit_score': 650
                }
                df[feature] = defaults.get(feature, 0)
        
        # Add any missing features that the model expects
        for feature in self.feature_names:
            if feature not in df.columns:
                # Create synthetic values based on provided data
                if feature == 'ApplicantIncome':
                    df[feature] = df['income'] * 0.7  # Assume 70% is applicant income
                elif feature == 'CoapplicantIncome':
                    df[feature] = df['income'] * 0.3  # Assume 30% is co-applicant income
                elif feature == 'LoanAmount':
                    df[feature] = df['amount']
                elif feature == 'Credit_History':
                    df[feature] = 1 if df['credit_score'].iloc[0] >= 650 else 0
                elif feature == 'Loan_Amount_Term':
                    df[feature] = 360  # Default 30 years
                elif feature in ['Gender', 'Married', 'Education', 'Self_Employed', 'Property_Area']:
                    # Provide reasonable defaults
                    defaults = {
                        'Gender': 'Male',
                        'Married': 'Yes',
                        'Education': 'Graduate',
                        'Self_Employed': 'No',
                        'Property_Area': 'Urban'
                    }
                    df[feature] = defaults.get(feature, 'Unknown')
                elif feature == 'Dependents':
                    df[feature] = 1  # Default 1 dependent
                else:
                    df[feature] = 0  # Default numeric value
        
        # Prepare features
        X_processed = self.prepare_features(df)
        
        # Ensure we have all the features the model expects
        for feature in self.feature_names:
            if feature not in X_processed.columns:
                X_processed[feature] = 0
        
        # Reorder columns to match training data
        X_processed = X_processed[self.feature_names]
        
        # Predict
        probability = self.pipeline.predict_proba(X_processed)[0, 1]
        prediction = int(probability >= 0.5)
        
        # Generate insights
        approval_status = "Approved" if prediction == 1 else "Rejected"
        confidence = "High" if abs(probability - 0.5) > 0.3 else "Medium" if abs(probability - 0.5) > 0.15 else "Low"
        
        # Generate recommendations based on selected features and their importance
        recommendations = self._generate_recommendations(application_data, probability, prediction)
        
        return {
            'approval_probability': float(probability),
            'approval_prediction': prediction,
            'approval_status': approval_status,
            'confidence_level': confidence,
            'recommendations': recommendations,
            'selected_features_used': self.selected_features,
            'model_type': self.model_performance.get('best_model', 'Unknown')
        }
    
    def _generate_recommendations(self, data: Dict[str, Any], probability: float, prediction: int) -> List[str]:
        """Generate personalized recommendations based on the application data"""
        recommendations = []
        
        credit_score = data.get('credit_score', 650)
        income = data.get('income', 50000)
        employment_years = data.get('employment_years', 2)
        amount = data.get('amount', 100000)
        
        if prediction == 0:  # Rejected
            if probability > 0.3:  # Close to approval
                recommendations.extend([
                    "Your application is close to approval. Consider the following improvements:",
                    f"• Increase your credit score (current: {credit_score}). Aim for 700+",
                    "• Consider adding a co-applicant to strengthen your application",
                    "• Reduce the loan amount if possible"
                ])
            else:  # Far from approval
                recommendations.extend([
                    "Your application needs significant improvements:",
                    f"• Improve your credit score substantially (current: {credit_score})",
                    f"• Increase your income or reduce existing debt",
                    "• Consider waiting 6-12 months before reapplying"
                ])
            
            # Specific recommendations based on data
            if credit_score < 650:
                recommendations.append("• Focus on improving credit score - pay bills on time, reduce credit utilization")
            
            if income < 50000:
                recommendations.append("• Consider increasing income through additional employment or side business")
            
            if employment_years < 2:
                recommendations.append("• Build more employment history - lenders prefer 2+ years of stable employment")
            
            debt_to_income = (amount * 0.05 / 12) / (income / 12) if income > 0 else 1
            if debt_to_income > 0.36:
                recommendations.append("• Reduce loan amount or increase income to improve debt-to-income ratio")
        
        else:  # Approved
            recommendations.extend([
                "Congratulations! Your loan application is likely to be approved.",
                "• Prepare required documentation (pay stubs, tax returns, bank statements)",
                "• Review loan terms and interest rates carefully",
                "• Consider shopping around for the best rates"
            ])
            
            if probability < 0.7:
                recommendations.append("• Consider improving your credit score for better interest rates")
        
        return recommendations
    
    def save_model(self, filepath: str) -> None:
        """Save the trained model"""
        if not self.is_trained:
            raise ValueError("No trained model to save")
        
        model_data = {
            'pipeline': self.pipeline,
            'feature_names': self.feature_names,
            'selected_features': self.selected_features,
            'label_encoders': self.label_encoders,
            'n_features': self.n_features,
            'model_performance': self.model_performance,
            'is_trained': self.is_trained
        }
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """Load a trained model"""
        model_data = joblib.load(filepath)
        self.pipeline = model_data['pipeline']
        self.feature_names = model_data['feature_names']
        self.selected_features = model_data['selected_features']
        self.label_encoders = model_data['label_encoders']
        self.n_features = model_data['n_features']
        self.model_performance = model_data['model_performance']
        self.is_trained = model_data['is_trained']
        print(f"Model loaded from {filepath}")
        print(f"Selected features: {self.selected_features}")
        print(f"Model performance: {self.model_performance}")
    
    def plot_feature_importance(self) -> None:
        """Plot feature importance"""
        if not self.is_trained:
            print("Model not trained yet")
            return
        
        feature_importance = self.model_performance.get('feature_importance', [])
        if not feature_importance:
            print("No feature importance data available")
            return
        
        # Plot top 10 features
        features, scores = zip(*feature_importance[:10])
        
        plt.figure(figsize=(12, 8))
        plt.barh(range(len(features)), scores)
        plt.yticks(range(len(features)), features)
        plt.xlabel('Feature Importance Score')
        plt.title('Top 10 Feature Importance Scores')
        plt.gca().invert_yaxis()
        plt.tight_layout()
        plt.show()


def main():
    """Main function to train the loan approval prediction model"""
    # Initialize predictor with top 5 features
    predictor = LoanPredictor(n_features=5)
    
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # Train the model
    dataset_path = "/Users/apostolov31/Desktop/2425-11-b-pp-student-practices-assignment-ATApostolov21/BankTools_AI/datasets/Loan Approval Training Dataset.csv"
    
    results = predictor.train(dataset_path)
    
    # Save the model
    os.makedirs("../models", exist_ok=True)
    predictor.save_model("../models/loan_model.joblib")
    
    # Plot feature importance
    predictor.plot_feature_importance()
    
    # Test prediction with frontend-aligned data
    sample_application = {
        'amount': 150000,
        'purpose': 'Home Purchase',
        'income': 75000,
        'employment_years': 5,
        'credit_score': 720
    }
    
    prediction = predictor.predict(sample_application)
    print(f"\n=== SAMPLE PREDICTION ===")
    print(f"Application data: {sample_application}")
    print(f"Approval probability: {prediction['approval_probability']:.3f}")
    print(f"Status: {prediction['approval_status']}")
    print(f"Confidence: {prediction['confidence_level']}")
    print(f"Model used: {prediction['model_type']}")
    print(f"Selected features: {prediction['selected_features_used']}")
    print(f"Recommendations:")
    for rec in prediction['recommendations']:
        print(f"  {rec}")


if __name__ == "__main__":
    main() 