"""
Test script for base model functionality
"""

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from app.ai_models.base_model import LogisticRegression, ModelEvaluator, DataUtils

def plot_confusion_matrix(confusion_matrix, title='Confusion Matrix'):
    """Plot confusion matrix using seaborn"""
    plt.figure(figsize=(8, 6))
    sns.heatmap(confusion_matrix, 
                annot=True, 
                fmt='d', 
                cmap='Blues',
                xticklabels=['Predicted 0', 'Predicted 1'],
                yticklabels=['Actual 0', 'Actual 1'])
    
    plt.title(title)
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.show()

def test_logistic_regression():
    print("Testing LogisticRegression...")
    
    # Generate synthetic data
    np.random.seed(42)
    X = np.random.randn(1000, 2)  # 1000 samples, 2 features
    y = (X[:, 0] + X[:, 1] > 0).astype(int)  # Simple decision boundary
    
    # Split data
    X_train, X_val, X_test, y_train, y_val, y_test = DataUtils.split_data(X, y)
    
    # Normalize features
    X_train_norm, means, stds = DataUtils.normalize_features(X_train)
    X_val_norm, _, _ = DataUtils.normalize_features(X_val, means, stds)
    X_test_norm, _, _ = DataUtils.normalize_features(X_test, means, stds)
    
    # Train model
    print("\nTraining model...")
    model = LogisticRegression(learning_rate=0.1, max_iterations=1000)
    model.fit(X_train_norm, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test_norm)
    y_pred_proba = model.predict_proba(X_test_norm)
    
    # Evaluate
    metrics = ModelEvaluator.evaluate_binary_classification(y_test, y_pred, y_pred_proba)
    ModelEvaluator.print_evaluation_results(metrics, "Test")
    
    print("\nFinal model weights:", model.weights)
    print("Final model bias:", model.bias)
    
    # Plot confusion matrix
    print("\nPlotting confusion matrix...")
    plot_confusion_matrix(metrics['confusion_matrix'], 'Logistic Regression Confusion Matrix')
    
    return model, metrics

if __name__ == "__main__":
    test_logistic_regression() 