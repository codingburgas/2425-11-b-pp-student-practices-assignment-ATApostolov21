"""
Base model class with common functionality for AI models
"""

import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
from typing import Dict, Any, Tuple, Optional
from abc import ABC, abstractmethod


class BasePredictor(ABC):
    """
    Base class for prediction models
    """
    
    def __init__(self):
        self.is_trained = False
        self.feature_names = None
        
    @abstractmethod
    def train(self, filepath: str) -> Dict[str, Any]:
        """Train the model"""
        pass
    
    @abstractmethod
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make predictions"""
        pass
    
    def save_model(self, filepath: str) -> None:
        """Save the trained model - to be implemented by subclasses"""
        if not self.is_trained:
            raise ValueError("No trained model to save")
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """Load a trained model - to be implemented by subclasses"""
        print(f"Model loaded from {filepath}")


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
    
    def fit_weighted(self, X: np.ndarray, y: np.ndarray, sample_weights: np.ndarray = None) -> None:
        """
        Train the logistic regression model with sample weights for class balancing
        
        Args:
            X: Feature matrix (m x n)
            y: Target vector (m,)
            sample_weights: Sample weights for class balancing (m,)
        """
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        m, n = X.shape
        
        if sample_weights is None:
            sample_weights = np.ones(m)
        else:
            sample_weights = np.asarray(sample_weights, dtype=np.float64)
        
        # Normalize sample weights
        sample_weights = sample_weights / np.sum(sample_weights) * m
        
        # Initialize weights and bias
        self.weights = np.random.normal(0, 0.01, n).astype(np.float64)
        self.bias = 0.0
        
        prev_cost = float('inf')
        
        for i in range(self.max_iterations):
            # Forward pass
            z = X.dot(self.weights) + self.bias
            predictions = self.sigmoid(z)
            
            # Compute weighted cost
            cost = self._compute_weighted_cost(y, predictions, sample_weights)
            self.cost_history.append(cost)
            
            # Compute weighted gradients
            error = predictions - y
            dw = (1/m) * X.T.dot(error * sample_weights)
            db = (1/m) * np.sum(error * sample_weights)
            
            # Update weights
            self.weights -= self.learning_rate * dw
            self.bias -= self.learning_rate * db
            
            # Check for convergence
            if abs(prev_cost - cost) < self.tolerance:
                print(f"Converged after {i+1} iterations")
                break
                
            prev_cost = cost
            
            if i % 100 == 0:
                print(f"Iteration {i}, Weighted Cost: {cost:.4f}")
    
    def _compute_weighted_cost(self, y_true: np.ndarray, y_pred: np.ndarray, sample_weights: np.ndarray) -> float:
        """Compute weighted logistic regression cost"""
        y_true = np.asarray(y_true, dtype=np.float64)
        y_pred = np.asarray(y_pred, dtype=np.float64)
        sample_weights = np.asarray(sample_weights, dtype=np.float64)
        m = len(y_true)
        
        # Add small epsilon to prevent log(0)
        epsilon = 1e-15
        y_pred = np.clip(y_pred, epsilon, 1 - epsilon)
        
        # Weighted cross-entropy
        cost = -(1/m) * np.sum(sample_weights * (y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred)))
        return cost
    
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


class ModelEvaluator:
    """
    Common evaluation utilities for models
    """
    
    @staticmethod
    def evaluate_binary_classification(y_true: np.ndarray, y_pred: np.ndarray, 
                                     y_pred_proba: np.ndarray = None) -> Dict[str, float]:
        """
        Evaluate binary classification performance
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            y_pred_proba: Predicted probabilities (optional)
            
        Returns:
            Dictionary with evaluation metrics
        """
        # Accuracy
        accuracy = np.mean(y_pred == y_true)
        
        # Confusion Matrix
        tp = np.sum((y_pred == 1) & (y_true == 1))
        tn = np.sum((y_pred == 0) & (y_true == 0))
        fp = np.sum((y_pred == 1) & (y_true == 0))
        fn = np.sum((y_pred == 0) & (y_true == 1))
        
        # Precision, Recall, F1
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        metrics = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'confusion_matrix': [[tn, fp], [fn, tp]]
        }
        
        # Log Loss (if probabilities provided)
        if y_pred_proba is not None:
            epsilon = 1e-15
            y_pred_proba = np.clip(y_pred_proba, epsilon, 1 - epsilon)
            log_loss = -np.mean(y_true * np.log(y_pred_proba) + (1 - y_true) * np.log(1 - y_pred_proba))
            metrics['log_loss'] = log_loss
        
        return metrics
    
    @staticmethod
    def print_evaluation_results(metrics: Dict[str, float], dataset_name: str = "Test"):
        """Print formatted evaluation results"""
        print(f"\n=== {dataset_name.upper()} RESULTS ===")
        print(f"Accuracy: {metrics['accuracy']:.4f}")
        print(f"Precision: {metrics['precision']:.4f}")
        print(f"Recall: {metrics['recall']:.4f}")
        print(f"F1-Score: {metrics['f1_score']:.4f}")
        
        if 'log_loss' in metrics:
            print(f"Log Loss: {metrics['log_loss']:.4f}")
        
        print(f"\nConfusion Matrix:")
        cm = metrics['confusion_matrix']
        print(f"              Predicted")
        print(f"              0    1")
        print(f"Actual  0  {cm[0][0]:4d} {cm[0][1]:4d}")
        print(f"        1  {cm[1][0]:4d} {cm[1][1]:4d}")


class DataUtils:
    """
    Common data processing utilities
    """
    
    @staticmethod
    def normalize_features(X: np.ndarray, feature_means: np.ndarray = None, 
                          feature_stds: np.ndarray = None) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Normalize features using z-score normalization
        
        Args:
            X: Feature matrix
            feature_means: Pre-computed means (optional)
            feature_stds: Pre-computed standard deviations (optional)
            
        Returns:
            Normalized features, means, and standard deviations
        """
        X = np.asarray(X, dtype=np.float64)
        
        if feature_means is None or feature_stds is None:
            feature_means = np.mean(X, axis=0, dtype=np.float64)
            feature_stds = np.std(X, axis=0, dtype=np.float64)
            # Prevent division by zero
            feature_stds = np.where(feature_stds == 0, 1, feature_stds)
        
        X_normalized = (X - feature_means) / feature_stds
        return X_normalized, feature_means, feature_stds
    
    @staticmethod
    def split_data(X: np.ndarray, y: np.ndarray, 
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