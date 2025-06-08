"""
Clean Churn Prediction Model for BankTools_AI
Refactored for readability and maintainability
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib
import os
import warnings
from typing import Tuple, Dict, Any, List, Optional

# Import modular components from shared utilities
from ..shared.base_model import BasePredictor, LogisticRegression, ModelEvaluator, DataUtils
from ..shared.validators import DataValidator
from ..shared.data_cleaners import DataCleaner
from ..shared.feature_engineering import ChurnFeatureEngineer
from ..shared.data_quality_utils import DataQualityAssessment, EnhancedDataCleaner

warnings.filterwarnings('ignore')


class ChurnPredictor(BasePredictor):
    """
    Enhanced churn prediction pipeline with comprehensive data validation
    """
    
    def __init__(self):
        super().__init__()
        self.model = LogisticRegression(learning_rate=0.1, max_iterations=2000)
        self.feature_means = None
        self.feature_stds = None
        self.data_quality_assessor = DataQualityAssessment()
        self.data_cleaner = EnhancedDataCleaner()
        self.data_quality_report = None
        
    def load_and_preprocess_data(self, filepath: str) -> Tuple[np.ndarray, np.ndarray]:
        """
        Enhanced data loading and preprocessing with comprehensive validation
        
        Args:
            filepath: Path to the CSV file
            
        Returns:
            X: Preprocessed feature matrix
            y: Target vector
        """
        print("Loading churn dataset with enhanced preprocessing...")
        
        try:
            df = pd.read_csv(filepath)
        except Exception as e:
            raise ValueError(f"Error loading CSV file: {str(e)}")
        
        print(f"Original dataset shape: {df.shape}")
        
        # Step 1: Generate comprehensive data quality report
        validation_rules = self._get_churn_validation_rules()
        quality_report = self.data_quality_assessor.generate_quality_report(df, validation_rules)
        
        self._print_quality_summary(quality_report)
        
        # Step 2: Enhanced data cleaning
        print("\n=== ENHANCED DATA CLEANING ===")
        aggressive_cleaning = quality_report['overall_quality']['score'] < 80
        
        df_clean, cleaning_report = self.data_cleaner.clean_dataset(
            df, 
            target_column='Exited',
            aggressive_cleaning=aggressive_cleaning
        )
        
        self._print_cleaning_summary(cleaning_report)
        
        # Store quality reports
        self.data_quality_report = {
            'initial_quality': quality_report,
            'cleaning_report': cleaning_report,
            'validation_rules': validation_rules
        }
        
        # Step 3: Feature engineering and final preprocessing
        df_processed = ChurnFeatureEngineer.create_churn_features(df_clean)
        
        # Drop unnecessary columns
        columns_to_drop = ['RowNumber', 'CustomerId', 'Surname']
        df_processed = df_processed.drop([col for col in columns_to_drop if col in df_processed.columns], axis=1)
        
        # Validate target column
        if 'Exited' not in df_processed.columns:
            raise ValueError("Target column 'Exited' not found in dataset")
        
        print(f"\nTarget distribution after cleaning:\n{df_processed['Exited'].value_counts()}")
        
        # One-hot encode categorical variables
        categorical_cols = ['Geography', 'Gender']
        existing_categorical_cols = [col for col in categorical_cols if col in df_processed.columns]
        
        if existing_categorical_cols:
            df_encoded = pd.get_dummies(df_processed, columns=existing_categorical_cols, 
                                      prefix=existing_categorical_cols, drop_first=False)
        else:
            df_encoded = df_processed
        
        # Separate features and target
        X = df_encoded.drop('Exited', axis=1)
        y = df_encoded['Exited'].values
        
        # Final validation
        X = self._final_data_validation(X)
        
        self.feature_names = X.columns.tolist()
        print(f"\nFinal features ({len(self.feature_names)}): {self.feature_names}")
        
        # Final quality check
        final_quality = self.data_quality_assessor.assess_completeness(X)
        print(f"Final feature matrix completeness: {final_quality['completeness_percentage']:.1f}%")
        
        return X.values, y
    
    def _get_churn_validation_rules(self) -> Dict[str, Any]:
        """Define validation rules for churn data"""
        return {
            'CreditScore': {'type': 'numeric', 'min_value': 300, 'max_value': 850},
            'Geography': {'type': 'categorical', 'allowed_values': ['France', 'Germany', 'Spain']},
            'Gender': {'type': 'categorical', 'allowed_values': ['Male', 'Female']},
            'Age': {'type': 'numeric', 'min_value': 18, 'max_value': 100},
            'Tenure': {'type': 'numeric', 'min_value': 0, 'max_value': 50},
            'Balance': {'type': 'numeric', 'min_value': 0},
            'NumOfProducts': {'type': 'numeric', 'min_value': 1, 'max_value': 4},
            'HasCrCard': {'type': 'numeric', 'min_value': 0, 'max_value': 1},
            'IsActiveMember': {'type': 'numeric', 'min_value': 0, 'max_value': 1},
            'EstimatedSalary': {'type': 'numeric', 'min_value': 0},
            'Exited': {'type': 'numeric', 'min_value': 0, 'max_value': 1}
        }
    
    def _print_quality_summary(self, quality_report: Dict[str, Any]) -> None:
        """Print data quality summary"""
        print("\n=== COMPREHENSIVE DATA QUALITY ASSESSMENT ===")
        print(f"Overall Data Quality Score: {quality_report['overall_quality']['score']:.1f}/100 (Grade: {quality_report['overall_quality']['grade']})")
        print(f"Completeness: {quality_report['completeness']['completeness_percentage']:.1f}%")
        print(f"Consistency: {quality_report['consistency']['consistency_score']:.1f}%")
        print(f"Validity: {quality_report['validity']['validity_percentage']:.1f}%")
        
        print("\nData Quality Recommendations:")
        for recommendation in quality_report['overall_quality']['recommendations']:
            print(f"  - {recommendation}")
    
    def _print_cleaning_summary(self, cleaning_report: Dict[str, Any]) -> None:
        """Print cleaning summary"""
        print(f"Cleaning completed:")
        print(f"  - Original shape: {cleaning_report['original_shape']}")
        print(f"  - Final shape: {cleaning_report['final_shape']}")
        print(f"  - Data retention: {cleaning_report['cleaning_effectiveness']['data_retention_rate']:.1f}%")
        print(f"  - Feature retention: {cleaning_report['cleaning_effectiveness']['feature_retention_rate']:.1f}%")
        print(f"  - Completeness improvement: {cleaning_report['cleaning_effectiveness']['completeness_improvement']:.1f}%")
        
        print("\nCleaning steps applied:")
        for step in cleaning_report['steps_applied']:
            print(f"  - {step['step']}")
    
    def _final_data_validation(self, X: pd.DataFrame) -> pd.DataFrame:
        """Final validation and cleanup"""
        if X.isnull().any().any():
            print("Warning: NaN values still present after cleaning. Performing final cleanup...")
            for col in X.columns:
                if X[col].isnull().any():
                    if pd.api.types.is_numeric_dtype(X[col]):
                        X[col] = X[col].fillna(X[col].median())
                    else:
                        X[col] = X[col].fillna(X[col].mode().iloc[0] if len(X[col].mode()) > 0 else 'Unknown')
        return X
    
    def get_data_quality_summary(self) -> Dict[str, Any]:
        """Get summary of data quality assessment and cleaning"""
        if not self.data_quality_report:
            return {"error": "No data quality report available. Train the model first."}
        
        initial_quality = self.data_quality_report['initial_quality']
        cleaning_report = self.data_quality_report['cleaning_report']
        
        return {
            'initial_quality_score': initial_quality['overall_quality']['score'],
            'initial_quality_grade': initial_quality['overall_quality']['grade'],
            'completeness_improvement': cleaning_report['cleaning_effectiveness']['completeness_improvement'],
            'data_retention_rate': cleaning_report['cleaning_effectiveness']['data_retention_rate'],
            'feature_retention_rate': cleaning_report['cleaning_effectiveness']['feature_retention_rate'],
            'cleaning_steps_count': len(cleaning_report['steps_applied']),
            'recommendations_followed': len(initial_quality['overall_quality']['recommendations']),
            'final_completeness': cleaning_report['final_completeness']
        }
    
    def train(self, filepath: str) -> Dict[str, Any]:
        """
        Complete training pipeline
        
        Args:
            filepath: Path to the training data
            
        Returns:
            Training results and metrics
        """
        print("Starting churn prediction model training...")
        
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
    
    def predict(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict churn for a single customer
        
        Args:
            customer_data: Dictionary with customer features
            
        Returns:
            Prediction results
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet. Call train() first.")
        
        # Create DataFrame from input
        df = pd.DataFrame([customer_data])
        
        # Preprocess same as training data
        df_encoded = pd.get_dummies(df, columns=['Geography', 'Gender'], prefix=['Geography', 'Gender'])
        
        # Ensure all training features are present
        for feature in self.feature_names:
            if feature not in df_encoded.columns:
                df_encoded[feature] = 0
        
        # Reorder columns to match training
        df_encoded = df_encoded[self.feature_names]
        
        # Normalize
        X_norm, _, _ = DataUtils.normalize_features(df_encoded.values, self.feature_means, self.feature_stds)
        
        # Predict
        probability = self.model.predict_proba(X_norm)[0]
        prediction = int(probability >= 0.5)
        
        # Generate insights
        risk_level = "High" if probability > 0.7 else "Medium" if probability > 0.3 else "Low"
        recommendations = self._generate_churn_recommendations(customer_data, probability, prediction)
        
        return {
            'churn_probability': float(probability),
            'churn_prediction': prediction,
            'risk_level': risk_level,
            'recommendations': recommendations
        }
    
    def _generate_churn_recommendations(self, data: Dict[str, Any], probability: float, prediction: int) -> List[str]:
        """Generate personalized recommendations based on churn prediction"""
        recommendations = []
        
        if probability > 0.5:
            recommendations.extend([
                "Offer personalized retention incentives",
                "Increase customer engagement through targeted communications",
                "Review account benefits and suggest upgrades"
            ])
        
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
        self.is_trained = model_data['is_trained']
        super().load_model(filepath)
    
    def plot_training_history(self) -> None:
        """Plot training cost history"""
        if not self.model.cost_history:
            print("No training history available")
            return
        
        plt.figure(figsize=(10, 6))
        plt.plot(self.model.cost_history)
        plt.title('Training Cost History - Churn Prediction Model')
        plt.xlabel('Iteration')
        plt.ylabel('Cost (Cross-Entropy)')
        plt.grid(True)
        plt.show()


def main():
    """Main function to train the churn prediction model"""
    # Initialize predictor
    predictor = ChurnPredictor()
    
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # Train the model
    dataset_path = "../../datasets/Churn_Modelling.csv"
    results = predictor.train(dataset_path)
    
    # Save the model
    os.makedirs("../models", exist_ok=True)
    predictor.save_model("../models/churn_model.joblib")
    
    # Plot training history
    predictor.plot_training_history()
    
    # Test prediction with sample data
    sample_customer = {
        'CreditScore': 650,
        'Geography': 'France',
        'Gender': 'Female',
        'Age': 35,
        'Tenure': 5,
        'Balance': 50000,
        'NumOfProducts': 2,
        'HasCrCard': 1,
        'IsActiveMember': 1,
        'EstimatedSalary': 75000
    }
    
    prediction = predictor.predict(sample_customer)
    print(f"\nSample Prediction:")
    print(f"Customer data: {sample_customer}")
    print(f"Churn probability: {prediction['churn_probability']:.3f}")
    print(f"Risk level: {prediction['risk_level']}")
    print(f"Recommendations: {prediction['recommendations']}")


if __name__ == "__main__":
    main() 