#!/usr/bin/env python3
"""
Improved Churn Model Training Script
Addresses the conservative bias and improves churn detection sensitivity
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.utils.class_weight import compute_class_weight

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ai_models.churn.churn_model_clean import ChurnPredictor

class ImprovedChurnPredictor(ChurnPredictor):
    """Enhanced ChurnPredictor with better sensitivity to churn detection"""
    
    def __init__(self):
        super().__init__()
        # Use more aggressive learning parameters for better convergence
        from app.ai_models.shared.base_model import LogisticRegression
        self.model = LogisticRegression(learning_rate=0.05, max_iterations=3000, tolerance=1e-8)
        
    def train_with_class_balancing(self, filepath: str) -> dict:
        """Train with class balancing to address churn imbalance"""
        print("🚀 Training IMPROVED churn model with class balancing...")
        
        # Load and preprocess data
        X, y = self.load_and_preprocess_data(filepath)
        
        # Calculate class weights to handle imbalance
        classes = np.unique(y)
        class_weights = compute_class_weight('balanced', classes=classes, y=y)
        weight_dict = dict(zip(classes, class_weights))
        
        print(f"📊 Class distribution: {np.bincount(y)}")
        print(f"⚖️ Class weights: {weight_dict}")
        
        # Apply sample weights during training
        sample_weights = np.array([weight_dict[label] for label in y])
        
        # Split data with the same random state for reproducibility
        from app.ai_models.shared.base_model import DataUtils
        X_train, X_val, X_test, y_train, y_val, y_test = DataUtils.split_data(X, y)
        
        # Get corresponding sample weights for training set
        train_indices = np.arange(len(X_train))
        train_sample_weights = sample_weights[:len(X_train)]
        
        # Normalize features
        X_train_norm, self.feature_means, self.feature_stds = DataUtils.normalize_features(X_train)
        X_val_norm, _, _ = DataUtils.normalize_features(X_val, self.feature_means, self.feature_stds)
        X_test_norm, _, _ = DataUtils.normalize_features(X_test, self.feature_means, self.feature_stds)
        
        # Train model with weighted samples
        print("🎯 Training with balanced class weights...")
        self.model.fit_weighted(X_train_norm, y_train, sample_weights=train_sample_weights)
        
        # Evaluate
        train_metrics = self._evaluate_model(X_train_norm, y_train)
        val_metrics = self._evaluate_model(X_val_norm, y_val)
        test_metrics = self._evaluate_model(X_test_norm, y_test)
        
        self.is_trained = True
        
        # Enhanced evaluation with churn-specific metrics
        print("\n" + "="*60)
        print("🎯 IMPROVED CHURN MODEL EVALUATION")
        print("="*60)
        
        self._print_enhanced_metrics(train_metrics, "TRAINING")
        self._print_enhanced_metrics(val_metrics, "VALIDATION") 
        self._print_enhanced_metrics(test_metrics, "TEST")
        
        # Test sensitivity on validation set
        self._test_churn_sensitivity(X_val_norm, y_val)
        
        return {
            'train_metrics': train_metrics,
            'val_metrics': val_metrics, 
            'test_metrics': test_metrics,
            'class_weights': weight_dict,
            'feature_names': self.feature_names
        }
    
    def _print_enhanced_metrics(self, metrics, dataset_name):
        """Print enhanced metrics focused on churn detection"""
        print(f"\n📈 {dataset_name} RESULTS:")
        print(f"   Overall Accuracy: {metrics['accuracy']:.3f}")
        print(f"   🎯 Churn Recall (Sensitivity): {metrics['recall']:.3f} ⭐")
        print(f"   ⚡ Churn Precision: {metrics['precision']:.3f}")
        print(f"   🏆 F1-Score: {metrics['f1_score']:.3f}")
        
        # Calculate specificity (true negative rate) 
        tn, fp, fn, tp = np.array(metrics['confusion_matrix']).flatten()
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
        print(f"   🛡️  Non-churn Specificity: {specificity:.3f}")
        
        # Show confusion matrix in a clear format
        print(f"   📊 Confusion Matrix:")
        print(f"       Predicted:  No Churn | Churn")
        print(f"       No Churn:      {tn:4d}  |  {fp:3d}")
        print(f"       Churn:         {fn:4d}  |  {tp:3d}")
        
    def _test_churn_sensitivity(self, X_val, y_val):
        """Test how many churners we catch with different thresholds"""
        print(f"\n🔍 CHURN SENSITIVITY ANALYSIS:")
        print(f"   Total churners in validation: {y_val.sum()}")
        
        probabilities = self.model.predict_proba(X_val)
        
        thresholds = [0.15, 0.25, 0.35, 0.45, 0.5]
        for threshold in thresholds:
            predictions = (probabilities >= threshold).astype(int)
            caught_churners = np.sum((predictions == 1) & (y_val == 1))
            total_churners = np.sum(y_val == 1)
            false_positives = np.sum((predictions == 1) & (y_val == 0))
            
            sensitivity = caught_churners / total_churners if total_churners > 0 else 0
            print(f"   Threshold {threshold:.2f}: Caught {caught_churners:3d}/{total_churners} churners ({sensitivity:.1%}) | FP: {false_positives}")

def main():
    """Main training function"""
    print("🎯 Starting IMPROVED Churn Model Training")
    print("="*50)
    
    # Check for training data
    dataset_path = "datasets/Churn_Modelling.csv"
    if not os.path.exists(dataset_path):
        dataset_path = "../datasets/Churn_Modelling.csv"
    
    if not os.path.exists(dataset_path):
        print("❌ Training dataset not found!")
        return
    
    # Initialize improved predictor
    predictor = ImprovedChurnPredictor()
    
    # Train with class balancing
    try:
        results = predictor.train_with_class_balancing(dataset_path)
        
        # Save the improved model
        model_path = "models/churn_model.joblib"
        os.makedirs("models", exist_ok=True)
        predictor.save_model(model_path)
        
        print(f"\n✅ Improved model saved to: {model_path}")
        print(f"🎯 Key improvements:")
        print(f"   - Class balancing to handle 20% churn rate")
        print(f"   - Lower risk thresholds (35% for high, 15% for medium)")
        print(f"   - Enhanced recommendations")
        print(f"   - Better sensitivity to churn patterns")
        
        # Test with sample predictions
        test_customers = [
            {
                'CreditScore': 400,  # Low credit score
                'Geography': 'Germany', 
                'Gender': 'Female',
                'Age': 45,
                'Tenure': 1,  # Short tenure
                'Balance': 0,  # No balance
                'NumOfProducts': 1,  # Single product
                'HasCrCard': 0,  # No credit card
                'IsActiveMember': 0,  # Inactive
                'EstimatedSalary': 30000
            },
            {
                'CreditScore': 750,  # Good credit
                'Geography': 'France',
                'Gender': 'Male', 
                'Age': 35,
                'Tenure': 8,  # Long tenure
                'Balance': 120000,  # High balance
                'NumOfProducts': 3,  # Multiple products
                'HasCrCard': 1,
                'IsActiveMember': 1,  # Active
                'EstimatedSalary': 75000
            }
        ]
        
        print(f"\n🧪 Testing improved model:")
        for i, customer in enumerate(test_customers, 1):
            prediction = predictor.predict(customer)
            print(f"\n   Customer {i}: {prediction['risk_level']} Risk ({prediction['churn_probability']:.1%})")
            print(f"   Top recommendation: {prediction['recommendations'][0] if prediction['recommendations'] else 'None'}")
            
    except Exception as e:
        print(f"❌ Training failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 