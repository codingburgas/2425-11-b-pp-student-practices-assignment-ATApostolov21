"""
Clean Loan Prediction Model for BankTools_AI
Refactored for readability and maintainability
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib
import os
import warnings
from typing import Tuple, Dict, Any, List

# Import modular components from shared utilities
from ..shared.base_model import BasePredictor, LogisticRegression, ModelEvaluator, DataUtils
from ..shared.data_cleaners import LoanDataCleaner
from ..shared.feature_engineering import LoanFeatureEngineer

warnings.filterwarnings('ignore')


class LoanPredictor(BasePredictor):
    """
    Clean loan prediction pipeline with modular components
    """
    
    def __init__(self):
        super().__init__()
        self.model = LogisticRegression(learning_rate=0.01, max_iterations=1000)
        self.feature_means = None
        self.feature_stds = None
        self.label_encoders = {}
        
    def load_and_preprocess_data(self, filepath: str) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load and preprocess loan data
        
        Args:
            filepath: Path to the CSV file
            
        Returns:
            X: Preprocessed feature matrix
            y: Target vector
        """
        print("Loading loan dataset...")
        
        try:
            df = pd.read_csv(filepath)
        except Exception as e:
            raise ValueError(f"Error loading CSV file: {str(e)}")
        
        print(f"Original dataset shape: {df.shape}")
        
        # Clean the data
        df_clean = LoanDataCleaner.clean_loan_data(df)
        print(f"Dataset shape after cleaning: {df_clean.shape}")
        
        # Create features aligned with frontend
        df_processed = LoanFeatureEngineer.create_aligned_features(df_clean)
        
        # Drop string columns that are not meant for categorical encoding
        # The purpose column is synthetic and should be dropped for training
        string_columns_to_drop = ['purpose']  # Add other string columns that shouldn't be encoded
        df_processed = df_processed.drop([col for col in string_columns_to_drop if col in df_processed.columns], axis=1)
        
        # Validate target column
        if 'Loan_Status' not in df_processed.columns:
            raise ValueError("Target column 'Loan_Status' not found in dataset")
        
        print(f"\nTarget distribution after cleaning:\n{df_processed['Loan_Status'].value_counts()}")
        
        # Encode categorical variables
        categorical_cols = ['Gender', 'Married', 'Education', 'Self_Employed', 'Property_Area']
        existing_categorical_cols = [col for col in categorical_cols if col in df_processed.columns]
        
        if existing_categorical_cols:
            df_encoded = pd.get_dummies(df_processed, columns=existing_categorical_cols, 
                                      prefix=existing_categorical_cols, drop_first=False)
        else:
            df_encoded = df_processed
        
        # Separate features and target
        X = df_encoded.drop('Loan_Status', axis=1)
        y = df_encoded['Loan_Status'].values
        
        # Final check: drop any remaining string columns that slipped through
        string_columns = X.select_dtypes(include=['object']).columns.tolist()
        if string_columns:
            print(f"Dropping remaining string columns: {string_columns}")
            X = X.drop(string_columns, axis=1)
        
        # Convert target to binary (Y=1, N=0)
        y = (y == 'Y').astype(int)
        
        # Store feature names
        self.feature_names = X.columns.tolist()
        print(f"\nFinal features ({len(self.feature_names)}): {self.feature_names}")
        
        return X.values, y
    
    def train(self, filepath: str) -> Dict[str, Any]:
        """
        Complete training pipeline
        
        Args:
            filepath: Path to the training data
            
        Returns:
            Training results and metrics
        """
        print("Starting loan prediction model training...")
        
        # Load and preprocess data
        X, y = self.load_and_preprocess_data(filepath)
        
        # Split data
        X_train, X_val, X_test, y_train, y_val, y_test = DataUtils.split_data(X, y)
        
        # Normalize features
        X_train_norm, self.feature_means, self.feature_stds = DataUtils.normalize_features(X_train)
        X_val_norm, _, _ = DataUtils.normalize_features(X_val, self.feature_means, self.feature_stds)
        X_test_norm, _, _ = DataUtils.normalize_features(X_test, self.feature_means, self.feature_stds)
        
        # Train model
        print("Training logistic regression model...")
        self.model.fit(X_train_norm, y_train)
        
        # Evaluate on all sets
        train_metrics = self._evaluate_model(X_train_norm, y_train)
        val_metrics = self._evaluate_model(X_val_norm, y_val)
        test_metrics = self._evaluate_model(X_test_norm, y_test)
        
        self.is_trained = True
        
        # Print results
        ModelEvaluator.print_evaluation_results(train_metrics, "Train")
        ModelEvaluator.print_evaluation_results(val_metrics, "Validation")
        ModelEvaluator.print_evaluation_results(test_metrics, "Test")
        
        return {
            'train_metrics': train_metrics,
            'val_metrics': val_metrics,
            'test_metrics': test_metrics,
            'cost_history': self.model.cost_history,
            'feature_names': self.feature_names
        }
    
    def _evaluate_model(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """Evaluate model performance"""
        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)
        
        return ModelEvaluator.evaluate_binary_classification(y, predictions, probabilities)
    
    def predict(self, loan_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict loan approval for a single application
        
        Args:
            loan_data: Dictionary with loan application features
            
        Returns:
            Prediction results
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet. Call train() first.")
        
        # Convert frontend data to model format
        model_data = self._convert_frontend_to_model_format(loan_data)
        
        # Create DataFrame from input
        df = pd.DataFrame([model_data])
        
        # Apply same preprocessing as training
        df_clean = LoanDataCleaner.clean_loan_data(df)
        df_processed = LoanFeatureEngineer.create_aligned_features(df_clean)
        
        # Drop string columns that are not meant for categorical encoding
        string_columns_to_drop = ['purpose']
        df_processed = df_processed.drop([col for col in string_columns_to_drop if col in df_processed.columns], axis=1)
        
        # Encode categorical variables
        categorical_cols = ['Gender', 'Married', 'Education', 'Self_Employed', 'Property_Area']
        existing_categorical_cols = [col for col in categorical_cols if col in df_processed.columns]
        
        if existing_categorical_cols:
            df_encoded = pd.get_dummies(df_processed, columns=existing_categorical_cols, 
                                      prefix=existing_categorical_cols, drop_first=False)
        else:
            df_encoded = df_processed
        
        # Ensure all training features are present
        for feature in self.feature_names:
            if feature not in df_encoded.columns:
                df_encoded[feature] = 0
        
        # Remove any extra columns and reorder to match training
        df_encoded = df_encoded[self.feature_names]
        
        # Normalize
        X_norm, _, _ = DataUtils.normalize_features(df_encoded.values, self.feature_means, self.feature_stds)
        
        # Predict
        probability = self.model.predict_proba(X_norm)[0]
        prediction = int(probability >= 0.5)
        
        # Generate insights
        approval_status = "Approved" if prediction == 1 else "Rejected"
        confidence = probability if prediction == 1 else 1 - probability
        risk_level = self._assess_risk_level(loan_data, probability)
        recommendations = self._generate_loan_recommendations(loan_data, probability, prediction)
        
        return {
            'approval_probability': float(probability),
            'approval_prediction': prediction,
            'approval_status': approval_status,
            'confidence_level': self._get_confidence_level(confidence),
            'confidence': float(confidence),  # Keep both for backward compatibility
            'risk_level': risk_level,
            'recommendations': recommendations
        }
    
    def _convert_frontend_to_model_format(self, frontend_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert frontend form data to model format
        
        Args:
            frontend_data: Data from frontend form
            
        Returns:
            Data in model format
        """
        # Map frontend fields to model fields
        model_data = {}
        
        # Direct mappings
        if 'amount' in frontend_data:
            model_data['LoanAmount'] = frontend_data['amount'] / 1000  # Convert to thousands
        
        if 'income' in frontend_data:
            model_data['ApplicantIncome'] = frontend_data['income']
            model_data['CoapplicantIncome'] = 0  # Assume no co-applicant for now
        
        if 'employment_years' in frontend_data:
            # Map employment years to loan term (simplified mapping)
            model_data['Loan_Amount_Term'] = min(360, max(120, frontend_data['employment_years'] * 12))
        
        if 'credit_score' in frontend_data:
            # Map credit score to credit history (simplified)
            model_data['Credit_History'] = 1 if frontend_data['credit_score'] >= 650 else 0
        
        # Default values for missing fields
        model_data.setdefault('Gender', 'Male')
        model_data.setdefault('Married', 'Yes')
        model_data.setdefault('Dependents', 0)
        model_data.setdefault('Education', 'Graduate')
        model_data.setdefault('Self_Employed', 'No')
        model_data.setdefault('Property_Area', 'Urban')
        
        return model_data
    
    def _assess_risk_level(self, loan_data: Dict[str, Any], probability: float) -> str:
        """Assess risk level based on loan data and prediction probability"""
        if probability > 0.8:
            return "Low Risk"
        elif probability > 0.6:
            return "Medium Risk"
        elif probability > 0.4:
            return "High Risk"
        else:
            return "Very High Risk"
    
    def _get_confidence_level(self, confidence: float) -> str:
        """Convert numeric confidence to text level"""
        if confidence > 0.8:
            return "High"
        elif confidence > 0.6:
            return "Medium"
        else:
            return "Low"
    
    def _generate_loan_recommendations(self, data: Dict[str, Any], 
                                     probability: float, prediction: int) -> List[str]:
        """Generate personalized recommendations based on loan prediction"""
        recommendations = []
        
        if prediction == 0:  # Rejected
            recommendations.extend([
                "Consider improving your credit score before reapplying",
                "Reduce existing debt to improve debt-to-income ratio",
                "Consider applying for a smaller loan amount",
                "Provide additional income documentation or include a co-applicant"
            ])
            
            # Specific recommendations based on data
            if 'credit_score' in data and data['credit_score'] < 650:
                recommendations.append("Focus on improving credit score above 650")
            
            if 'income' in data and 'amount' in data:
                debt_to_income = data['amount'] / (data['income'] * 12) if data['income'] > 0 else float('inf')
                if debt_to_income > 0.3:
                    recommendations.append("Consider reducing loan amount to improve debt-to-income ratio")
        
        else:  # Approved
            recommendations.extend([
                "Congratulations! Your loan application meets our criteria",
                "Review the terms and conditions carefully",
                "Consider setting up automatic payments to maintain good standing"
            ])
            
            if probability < 0.7:
                recommendations.append("Consider providing additional documentation to strengthen your application")
        
        return recommendations
    
    def save_model(self, filepath: str) -> None:
        """Save the trained model"""
        if not self.is_trained:
            raise ValueError("No trained model to save")
        
        model_data = {
            'model': self.model,
            'feature_means': self.feature_means,
            'feature_stds': self.feature_stds,
            'feature_names': self.feature_names,
            'label_encoders': self.label_encoders,
            'is_trained': self.is_trained
        }
        joblib.dump(model_data, filepath)
        super().save_model(filepath)
    
    def load_model(self, filepath: str) -> None:
        """Load a trained model"""
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.feature_means = model_data['feature_means']
        self.feature_stds = model_data['feature_stds']
        self.feature_names = model_data['feature_names']
        self.label_encoders = model_data.get('label_encoders', {})
        self.is_trained = model_data['is_trained']
        super().load_model(filepath)
    
    def plot_training_history(self) -> None:
        """Plot training cost history"""
        if not self.model.cost_history:
            print("No training history available")
            return
        
        plt.figure(figsize=(10, 6))
        plt.plot(self.model.cost_history)
        plt.title('Training Cost History - Loan Prediction Model')
        plt.xlabel('Iteration')
        plt.ylabel('Cost (Cross-Entropy)')
        plt.grid(True)
        plt.show()


def main():
    """Main function to train the loan prediction model"""
    # Initialize predictor
    predictor = LoanPredictor()
    
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # Train the model
    dataset_path = "../../datasets/loan_data.csv"
    results = predictor.train(dataset_path)
    
    # Save the model
    os.makedirs("../models", exist_ok=True)
    predictor.save_model("../models/loan_model.joblib")
    
    # Plot training history
    predictor.plot_training_history()
    
    # Test prediction with sample data
    sample_application = {
        'amount': 150000,
        'purpose': 'Home Purchase',
        'income': 60000,
        'employment_years': 5,
        'credit_score': 720
    }
    
    prediction = predictor.predict(sample_application)
    print(f"\nSample Prediction:")
    print(f"Application data: {sample_application}")
    print(f"Approval probability: {prediction['approval_probability']:.3f}")
    print(f"Status: {prediction['approval_status']}")
    print(f"Risk level: {prediction['risk_level']}")
    print(f"Recommendations: {prediction['recommendations']}")


if __name__ == "__main__":
    main() 