"""
Custom Loan Approval Prediction Model for BankTools_AI
Uses manual logistic regression implementation with numpy
Datasets: train_u6lujuX_CVtuZ9i.csv, test_Y3wMUE5_7gLdaTN.csv
Target: Loan_Status (Y/N → 1/0)
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib
import os
from typing import Tuple, Dict, Any


class LogisticRegression:
    """
    Custom Logistic Regression implementation from scratch using numpy
    """
    
    def __init__(self, learning_rate: float = 0.01, max_iterations: int = 1000, tolerance: float = 1e-6):
        """
        Initialize the logistic regression model
        
        Args:
            learning_rate: Learning rate for gradient descent
            max_iterations: Maximum number of iterations
            tolerance: Convergence tolerance
        """
        self.learning_rate = learning_rate
        self.max_iterations = max_iterations
        self.tolerance = tolerance
        self.weights = None
        self.bias = None
        self.cost_history = []
        
    def sigmoid(self, z: np.ndarray) -> np.ndarray:
        """Sigmoid activation function with clipping to prevent overflow"""
        z = np.asarray(z, dtype=np.float64)
        z = np.clip(z, -500, 500)  # Prevent overflow
        return 1 / (1 + np.exp(-z))
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        """
        Train the logistic regression model
        
        Args:
            X: Feature matrix (m x n)
            y: Target vector (m,)
        """
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        m, n = X.shape
        
        # Initialize weights and bias
        self.weights = np.random.normal(0, 0.01, n).astype(np.float64)
        self.bias = 0.0
        
        prev_cost = float('inf')
        
        for i in range(self.max_iterations):
            # Forward pass
            z = X.dot(self.weights) + self.bias
            predictions = self.sigmoid(z)
            
            # Compute cost (log-likelihood)
            cost = self._compute_cost(y, predictions)
            self.cost_history.append(cost)
            
            # Compute gradients
            dw = (1/m) * X.T.dot(predictions - y)
            db = (1/m) * np.sum(predictions - y)
            
            # Update weights
            self.weights -= self.learning_rate * dw
            self.bias -= self.learning_rate * db
            
            # Check for convergence
            if abs(prev_cost - cost) < self.tolerance:
                print(f"Converged after {i+1} iterations")
                break
                
            prev_cost = cost
            
            if i % 100 == 0:
                print(f"Iteration {i}, Cost: {cost:.4f}")
    
    def _compute_cost(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """Compute logistic regression cost (cross-entropy)"""
        y_true = np.asarray(y_true, dtype=np.float64)
        y_pred = np.asarray(y_pred, dtype=np.float64)
        m = len(y_true)
        # Add small epsilon to prevent log(0)
        epsilon = 1e-15
        y_pred = np.clip(y_pred, epsilon, 1 - epsilon)
        return -(1/m) * np.sum(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Predict class probabilities"""
        X = np.asarray(X, dtype=np.float64)
        z = X.dot(self.weights) + self.bias
        return self.sigmoid(z)
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make binary predictions"""
        probabilities = self.predict_proba(X)
        return (probabilities >= 0.5).astype(int)


class LoanPredictor:
    """
    Complete loan approval prediction pipeline
    """
    
    def __init__(self):
        self.model = LogisticRegression(learning_rate=0.1, max_iterations=2000)
        self.feature_means = None
        self.feature_stds = None
        self.feature_names = None
        self.is_trained = False
        
    def load_and_preprocess_data(self, train_filepath: str, test_filepath: str = None) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Load and preprocess the loan datasets
        
        Args:
            train_filepath: Path to the training CSV file
            test_filepath: Path to the test CSV file (optional)
            
        Returns:
            X_train, y_train, X_test, y_test (test may be None if no test file)
        """
        print("Loading loan datasets...")
        
        # Load training data
        train_df = pd.read_csv(train_filepath)
        print(f"Training dataset shape: {train_df.shape}")
        
        # Load test data if provided
        test_df = None
        if test_filepath and os.path.exists(test_filepath):
            test_df = pd.read_csv(test_filepath)
            print(f"Test dataset shape: {test_df.shape}")
        
        # Check target distribution in training data
        if 'Loan_Status' in train_df.columns:
            print(f"Target distribution in training data:\n{train_df['Loan_Status'].value_counts()}")
        
        # Preprocess training data
        X_train, y_train = self._preprocess_single_dataset(train_df, is_train=True)
        
        # Preprocess test data if available
        X_test, y_test = None, None
        if test_df is not None:
            X_test, y_test = self._preprocess_single_dataset(test_df, is_train=False)
        
        return X_train, y_train, X_test, y_test
    
    def _preprocess_single_dataset(self, df: pd.DataFrame, is_train: bool = True) -> Tuple[np.ndarray, np.ndarray]:
        """
        Preprocess a single dataset
        
        Args:
            df: Input dataframe
            is_train: Whether this is training data
            
        Returns:
            X: Feature matrix
            y: Target vector (None if no target column)
        """
        # Drop Loan_ID if present
        if 'Loan_ID' in df.columns:
            df = df.drop('Loan_ID', axis=1)
        
        # Handle missing values
        print(f"Missing values before cleaning:\n{df.isnull().sum()}")
        
        # Fill missing values for categorical variables
        categorical_cols = ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed', 'Property_Area']
        for col in categorical_cols:
            if col in df.columns and df[col].isnull().any():
                mode_value = df[col].mode()
                if len(mode_value) > 0:
                    df[col] = df[col].fillna(mode_value[0])
                else:
                    # Default values if mode can't be calculated
                    defaults = {
                        'Gender': 'Male',
                        'Married': 'Yes',
                        'Dependents': '0',
                        'Education': 'Graduate',
                        'Self_Employed': 'No',
                        'Property_Area': 'Urban'
                    }
                    df[col] = df[col].fillna(defaults.get(col, 'Unknown'))
        
        # Fill missing values for numerical variables
        numerical_cols = ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term', 'Credit_History']
        for col in numerical_cols:
            if col in df.columns and df[col].isnull().any():
                df[col] = df[col].fillna(df[col].median())
        
        print(f"Missing values after cleaning:\n{df.isnull().sum()}")
        
        # Handle Dependents column (convert '3+' to '3')
        if 'Dependents' in df.columns:
            df['Dependents'] = df['Dependents'].replace('3+', '3')
            df['Dependents'] = pd.to_numeric(df['Dependents'], errors='coerce')
            df['Dependents'] = df['Dependents'].fillna(0)
        
        # Convert Loan_Status to binary (Y=1, N=0)
        y = None
        if 'Loan_Status' in df.columns:
            y = (df['Loan_Status'] == 'Y').astype(int).values
            df = df.drop('Loan_Status', axis=1)
        
        # Encode categorical variables
        categorical_cols_to_encode = ['Gender', 'Married', 'Education', 'Self_Employed', 'Property_Area']
        for col in categorical_cols_to_encode:
            if col in df.columns:
                df = pd.get_dummies(df, columns=[col], prefix=[col])
        
        # Store feature names for the first time (training)
        if is_train:
            self.feature_names = df.columns.tolist()
            print(f"Features: {self.feature_names}")
        else:
            # Ensure test data has same features as training data
            for feature in self.feature_names:
                if feature not in df.columns:
                    df[feature] = 0
            # Reorder columns to match training data
            df = df[self.feature_names]
        
        return df.values, y
    
    def normalize_features(self, X: np.ndarray, fit: bool = True) -> np.ndarray:
        """
        Normalize features using z-score normalization
        
        Args:
            X: Feature matrix
            fit: Whether to fit normalization parameters
            
        Returns:
            Normalized feature matrix
        """
        X = np.asarray(X, dtype=np.float64)
        
        if fit:
            self.feature_means = np.mean(X, axis=0, dtype=np.float64)
            self.feature_stds = np.std(X, axis=0, dtype=np.float64)
            # Prevent division by zero
            self.feature_stds = np.where(self.feature_stds == 0, 1, self.feature_stds)
        
        return (X - self.feature_means) / self.feature_stds
    
    def evaluate(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """
        Evaluate model performance
        
        Args:
            X: Feature matrix
            y: True labels
            
        Returns:
            Dictionary with evaluation metrics
        """
        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)
        
        # Accuracy
        accuracy = np.mean(predictions == y)
        
        # Confusion Matrix
        tp = np.sum((predictions == 1) & (y == 1))
        tn = np.sum((predictions == 0) & (y == 0))
        fp = np.sum((predictions == 1) & (y == 0))
        fn = np.sum((predictions == 0) & (y == 1))
        
        # Precision, Recall, F1
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        # Log Loss
        epsilon = 1e-15
        probabilities = np.clip(probabilities, epsilon, 1 - epsilon)
        log_loss = -np.mean(y * np.log(probabilities) + (1 - y) * np.log(1 - probabilities))
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'log_loss': log_loss,
            'confusion_matrix': [[tn, fp], [fn, tp]]
        }
    
    def train(self, train_filepath: str, test_filepath: str = None) -> Dict[str, Any]:
        """
        Complete training pipeline
        
        Args:
            train_filepath: Path to the training data
            test_filepath: Path to the test data (optional)
            
        Returns:
            Training results and metrics
        """
        print("Starting loan approval prediction model training...")
        
        # Load and preprocess data
        X_train, y_train, X_test, y_test = self.load_and_preprocess_data(train_filepath, test_filepath)
        
        # Normalize features
        X_train_norm = self.normalize_features(X_train, fit=True)
        
        # Train model
        print("Training logistic regression model...")
        self.model.fit(X_train_norm, y_train)
        
        # Evaluate on training set
        train_metrics = self.evaluate(X_train_norm, y_train)
        
        # Evaluate on test set if available
        test_metrics = None
        if X_test is not None and y_test is not None:
            X_test_norm = self.normalize_features(X_test, fit=False)
            test_metrics = self.evaluate(X_test_norm, y_test)
        
        self.is_trained = True
        
        # Print results
        print("\n=== TRAINING RESULTS ===")
        print(f"Train Accuracy: {train_metrics['accuracy']:.4f}")
        print(f"Train Precision: {train_metrics['precision']:.4f}")
        print(f"Train Recall: {train_metrics['recall']:.4f}")
        print(f"Train F1-Score: {train_metrics['f1_score']:.4f}")
        print(f"Train Log Loss: {train_metrics['log_loss']:.4f}")
        
        if test_metrics:
            print(f"\n=== TEST RESULTS ===")
            print(f"Test Accuracy: {test_metrics['accuracy']:.4f}")
            print(f"Test Precision: {test_metrics['precision']:.4f}")
            print(f"Test Recall: {test_metrics['recall']:.4f}")
            print(f"Test F1-Score: {test_metrics['f1_score']:.4f}")
            print(f"Test Log Loss: {test_metrics['log_loss']:.4f}")
            
            print(f"\nConfusion Matrix (Test Set):")
            cm = test_metrics['confusion_matrix']
            print(f"              Predicted")
            print(f"              0    1")
            print(f"Actual  0  {cm[0][0]:4d} {cm[0][1]:4d}")
            print(f"        1  {cm[1][0]:4d} {cm[1][1]:4d}")
        
        return {
            'train_metrics': train_metrics,
            'test_metrics': test_metrics,
            'cost_history': self.model.cost_history,
            'feature_names': self.feature_names
        }
    
    def predict(self, applicant_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict loan approval for a single applicant
        
        Args:
            applicant_data: Dictionary with applicant features
            
        Returns:
            Prediction results
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet. Call train() first.")
        
        # Create DataFrame from input
        df = pd.DataFrame([applicant_data])
        
        # Preprocess same as training data
        X, _ = self._preprocess_single_dataset(df, is_train=False)
        
        # Normalize
        X_norm = self.normalize_features(X, fit=False)
        
        # Predict
        probability = self.model.predict_proba(X_norm)[0]
        prediction = int(probability >= 0.5)
        
        # Generate insights
        approval_status = "Approved" if prediction == 1 else "Rejected"
        confidence = "High" if abs(probability - 0.5) > 0.3 else "Medium" if abs(probability - 0.5) > 0.15 else "Low"
        
        recommendations = []
        if prediction == 0:  # Rejected
            if probability > 0.3:  # Close to approval threshold
                recommendations.extend([
                    "Consider increasing down payment",
                    "Add a co-applicant to strengthen the application",
                    "Improve credit history before reapplying"
                ])
            else:
                recommendations.extend([
                    "Significantly improve credit score",
                    "Increase income or reduce existing debt",
                    "Consider a smaller loan amount"
                ])
        else:  # Approved
            recommendations.extend([
                "Congratulations! Your loan application meets our criteria",
                "Please provide required documentation",
                "Review terms and conditions carefully"
            ])
        
        return {
            'approval_probability': float(probability),
            'approval_prediction': prediction,
            'approval_status': approval_status,
            'confidence_level': confidence,
            'recommendations': recommendations
        }
    
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
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """Load a trained model"""
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.feature_means = model_data['feature_means']
        self.feature_stds = model_data['feature_stds']
        self.feature_names = model_data['feature_names']
        self.is_trained = model_data['is_trained']
        print(f"Model loaded from {filepath}")
    
    def plot_training_history(self) -> None:
        """Plot training cost history"""
        if not self.model.cost_history:
            print("No training history available")
            return
        
        plt.figure(figsize=(10, 6))
        plt.plot(self.model.cost_history)
        plt.title('Training Cost History - Loan Approval Model')
        plt.xlabel('Iteration')
        plt.ylabel('Cost (Cross-Entropy)')
        plt.grid(True)
        plt.show()


def main():
    """Main function to train the loan approval prediction model"""
    # Initialize predictor
    predictor = LoanPredictor()
    
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # Train the model
    train_path = "../../datasets/Loan Prediction Dataset/train_u6lujuX_CVtuZ9i.csv"
    test_path = "../../datasets/Loan Prediction Dataset/test_Y3wMUE5_7gLdaTN.csv"
    
    results = predictor.train(train_path, test_path)
    
    # Save the model
    os.makedirs("../models", exist_ok=True)
    predictor.save_model("../models/loan_model.joblib")
    
    # Plot training history
    predictor.plot_training_history()
    
    # Test prediction with sample data
    sample_applicant = {
        'Gender': 'Male',
        'Married': 'Yes',
        'Dependents': 1,
        'Education': 'Graduate',
        'Self_Employed': 'No',
        'ApplicantIncome': 5000,
        'CoapplicantIncome': 2000,
        'LoanAmount': 150,
        'Loan_Amount_Term': 360,
        'Credit_History': 1,
        'Property_Area': 'Urban'
    }
    
    prediction = predictor.predict(sample_applicant)
    print(f"\nSample Prediction:")
    print(f"Applicant data: {sample_applicant}")
    print(f"Approval probability: {prediction['approval_probability']:.3f}")
    print(f"Status: {prediction['approval_status']}")
    print(f"Confidence: {prediction['confidence_level']}")
    print(f"Recommendations: {prediction['recommendations']}")


if __name__ == "__main__":
    main() 