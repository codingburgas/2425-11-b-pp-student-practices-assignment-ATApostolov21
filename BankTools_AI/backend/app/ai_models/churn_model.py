"""
Custom Churn Prediction Model for BankTools_AI
Uses manual logistic regression implementation with numpy
Dataset: Churn_Modelling.csv
Target: Exited (1 = churned, 0 = stayed)
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


class ChurnPredictor:
    """
    Complete churn prediction pipeline
    """
    
    def __init__(self):
        self.model = LogisticRegression(learning_rate=0.1, max_iterations=2000)
        self.feature_means = None
        self.feature_stds = None
        self.feature_names = None
        self.is_trained = False
        
    def load_and_preprocess_data(self, filepath: str) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load and preprocess the churn dataset
        
        Args:
            filepath: Path to the CSV file
            
        Returns:
            X: Preprocessed feature matrix
            y: Target vector
        """
        print("Loading churn dataset...")
        df = pd.read_csv(filepath)
        
        print(f"Dataset shape: {df.shape}")
        print(f"Target distribution:\n{df['Exited'].value_counts()}")
        
        # Drop unnecessary columns
        df = df.drop(['RowNumber', 'CustomerId', 'Surname'], axis=1)
        
        # Handle missing values
        print(f"Missing values before cleaning:\n{df.isnull().sum()}")
        
        # Fill missing numerical values with median
        numerical_cols = ['Age', 'Balance', 'EstimatedSalary', 'CreditScore', 'Tenure']
        for col in numerical_cols:
            if df[col].isnull().any():
                df[col] = df[col].fillna(df[col].median())
        
        # Fill missing categorical values with mode
        categorical_cols = ['Geography', 'Gender', 'HasCrCard', 'IsActiveMember', 'NumOfProducts']
        for col in categorical_cols:
            if col in df.columns and df[col].isnull().any():
                df[col] = df[col].fillna(df[col].mode()[0])
        
        print(f"Missing values after cleaning:\n{df.isnull().sum()}")
        
        # One-hot encode categorical variables
        df_encoded = pd.get_dummies(df, columns=['Geography', 'Gender'], prefix=['Geography', 'Gender'])
        
        # Separate features and target
        X = df_encoded.drop('Exited', axis=1)
        y = df_encoded['Exited'].values
        
        self.feature_names = X.columns.tolist()
        print(f"Features: {self.feature_names}")
        
        return X.values, y
    
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
    
    def split_data(self, X: np.ndarray, y: np.ndarray, 
                   train_ratio: float = 0.7, val_ratio: float = 0.15) -> Tuple:
        """
        Split data into train/validation/test sets
        
        Args:
            X: Feature matrix
            y: Target vector
            train_ratio: Training set ratio
            val_ratio: Validation set ratio
            
        Returns:
            Tuple of (X_train, X_val, X_test, y_train, y_val, y_test)
        """
        m = len(X)
        indices = np.random.permutation(m)
        
        train_end = int(train_ratio * m)
        val_end = int((train_ratio + val_ratio) * m)
        
        train_idx = indices[:train_end]
        val_idx = indices[train_end:val_end]
        test_idx = indices[val_end:]
        
        X_train, X_val, X_test = X[train_idx], X[val_idx], X[test_idx]
        y_train, y_val, y_test = y[train_idx], y[val_idx], y[test_idx]
        
        print(f"Data split - Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
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
        X_train, X_val, X_test, y_train, y_val, y_test = self.split_data(X, y)
        
        # Normalize features
        X_train_norm = self.normalize_features(X_train, fit=True)
        X_val_norm = self.normalize_features(X_val, fit=False)
        X_test_norm = self.normalize_features(X_test, fit=False)
        
        # Train model
        print("Training logistic regression model...")
        self.model.fit(X_train_norm, y_train)
        
        # Evaluate on all sets
        train_metrics = self.evaluate(X_train_norm, y_train)
        val_metrics = self.evaluate(X_val_norm, y_val)
        test_metrics = self.evaluate(X_test_norm, y_test)
        
        self.is_trained = True
        
        # Print results
        print("\n=== TRAINING RESULTS ===")
        print(f"Train Accuracy: {train_metrics['accuracy']:.4f}")
        print(f"Validation Accuracy: {val_metrics['accuracy']:.4f}")
        print(f"Test Accuracy: {test_metrics['accuracy']:.4f}")
        
        print(f"\nTest Set Detailed Metrics:")
        print(f"Precision: {test_metrics['precision']:.4f}")
        print(f"Recall: {test_metrics['recall']:.4f}")
        print(f"F1-Score: {test_metrics['f1_score']:.4f}")
        print(f"Log Loss: {test_metrics['log_loss']:.4f}")
        
        print(f"\nConfusion Matrix (Test Set):")
        cm = test_metrics['confusion_matrix']
        print(f"              Predicted")
        print(f"              0    1")
        print(f"Actual  0  {cm[0][0]:4d} {cm[0][1]:4d}")
        print(f"        1  {cm[1][0]:4d} {cm[1][1]:4d}")
        
        return {
            'train_metrics': train_metrics,
            'val_metrics': val_metrics,
            'test_metrics': test_metrics,
            'cost_history': self.model.cost_history,
            'feature_names': self.feature_names
        }
    
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
        # One-hot encode
        df_encoded = pd.get_dummies(df, columns=['Geography', 'Gender'], prefix=['Geography', 'Gender'])
        
        # Ensure all training features are present
        for feature in self.feature_names:
            if feature not in df_encoded.columns:
                df_encoded[feature] = 0
        
        # Reorder columns to match training
        df_encoded = df_encoded[self.feature_names]
        
        # Normalize
        X = self.normalize_features(df_encoded.values, fit=False)
        
        # Predict
        probability = self.model.predict_proba(X)[0]
        prediction = int(probability >= 0.5)
        
        # Generate insights
        risk_level = "High" if probability > 0.7 else "Medium" if probability > 0.3 else "Low"
        
        recommendations = []
        if probability > 0.5:
            recommendations.extend([
                "Offer personalized retention incentives",
                "Increase customer engagement through targeted communications",
                "Review account benefits and suggest upgrades"
            ])
        
        return {
            'churn_probability': float(probability),
            'churn_prediction': prediction,
            'risk_level': risk_level,
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