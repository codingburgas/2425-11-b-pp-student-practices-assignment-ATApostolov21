"""
Enhanced Churn Prediction Model for BankTools_AI
Uses manual logistic regression implementation with numpy
Dataset: Churn_Modelling.csv
Target: Exited (1 = churned, 0 = stayed)

Enhanced with comprehensive data cleaning and validation using data quality utilities
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib
import os
import warnings
from typing import Tuple, Dict, Any, List, Optional, Union
from scipy import stats

# Import enhanced data quality utilities
from .data_quality_utils import DataQualityAssessment, EnhancedDataCleaner


class DataValidator:
    """
    Comprehensive data validation and cleaning utilities
    """
    
    @staticmethod
    def detect_missing_values(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Comprehensive missing value detection including various forms of NaN/undefined
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with detailed missing value analysis
        """
        missing_analysis = {}
        
        for col in df.columns:
            col_data = df[col]
            
            # Standard missing values
            standard_nulls = col_data.isnull().sum()
            
            # String representations of missing values
            if col_data.dtype == 'object':
                string_nulls = col_data.astype(str).str.lower().isin([
                    'nan', 'null', 'none', 'na', 'n/a', '', ' ', 'undefined', 
                    'missing', 'unknown', '#n/a', '#null!', '#div/0!', '#value!',
                    'nil', 'void', 'empty', '-', '--', '?', '??'
                ]).sum()
            else:
                string_nulls = 0
            
            # Infinite values for numeric columns
            if pd.api.types.is_numeric_dtype(col_data):
                inf_values = np.isinf(col_data).sum()
                # Very large/small values that might be placeholders
                extreme_values = ((col_data > 1e10) | (col_data < -1e10)).sum()
            else:
                inf_values = 0
                extreme_values = 0
            
            # Zero values that might be missing (context-dependent)
            zero_values = (col_data == 0).sum() if pd.api.types.is_numeric_dtype(col_data) else 0
            
            total_missing = standard_nulls + string_nulls + inf_values
            
            missing_analysis[col] = {
                'standard_nulls': int(standard_nulls),
                'string_nulls': int(string_nulls),
                'infinite_values': int(inf_values),
                'extreme_values': int(extreme_values),
                'zero_values': int(zero_values),
                'total_missing': int(total_missing),
                'missing_percentage': float(total_missing / len(df) * 100),
                'data_type': str(col_data.dtype)
            }
        
        return missing_analysis
    
    @staticmethod
    def detect_outliers(df: pd.DataFrame, method: str = 'iqr') -> Dict[str, Any]:
        """
        Detect outliers using multiple methods
        
        Args:
            df: Input DataFrame
            method: Method to use ('iqr', 'zscore', 'isolation_forest')
            
        Returns:
            Dictionary with outlier analysis
        """
        outlier_analysis = {}
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            col_data = df[col].dropna()
            
            if len(col_data) == 0:
                continue
            
            outliers = []
            
            if method == 'iqr':
                Q1 = col_data.quantile(0.25)
                Q3 = col_data.quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)].index.tolist()
            
            elif method == 'zscore':
                z_scores = np.abs(stats.zscore(col_data))
                outliers = df[z_scores > 3].index.tolist()
            
            outlier_analysis[col] = {
                'outlier_count': len(outliers),
                'outlier_percentage': len(outliers) / len(df) * 100,
                'outlier_indices': outliers[:10],  # First 10 for reference
                'method_used': method
            }
        
        return outlier_analysis
    
    @staticmethod
    def validate_data_types(df: pd.DataFrame, expected_types: Dict[str, str]) -> Dict[str, Any]:
        """
        Validate data types and suggest corrections
        
        Args:
            df: Input DataFrame
            expected_types: Dictionary mapping column names to expected types
            
        Returns:
            Dictionary with type validation results
        """
        type_analysis = {}
        
        for col, expected_type in expected_types.items():
            if col not in df.columns:
                type_analysis[col] = {
                    'status': 'missing_column',
                    'current_type': None,
                    'expected_type': expected_type
                }
                continue
            
            current_type = str(df[col].dtype)
            
            # Check if conversion is possible
            conversion_possible = True
            conversion_errors = 0
            
            if expected_type == 'numeric' and not pd.api.types.is_numeric_dtype(df[col]):
                try:
                    pd.to_numeric(df[col], errors='coerce')
                    conversion_errors = df[col].isna().sum() - pd.to_numeric(df[col], errors='coerce').isna().sum()
                except:
                    conversion_possible = False
            
            type_analysis[col] = {
                'status': 'correct' if DataValidator._type_matches(current_type, expected_type) else 'incorrect',
                'current_type': current_type,
                'expected_type': expected_type,
                'conversion_possible': conversion_possible,
                'conversion_errors': conversion_errors
            }
        
        return type_analysis
    
    @staticmethod
    def _type_matches(current_type: str, expected_type: str) -> bool:
        """Check if current type matches expected type"""
        if expected_type == 'numeric':
            return 'int' in current_type or 'float' in current_type
        elif expected_type == 'categorical':
            return 'object' in current_type or 'category' in current_type
        elif expected_type == 'boolean':
            return 'bool' in current_type
        return False


class DataCleaner:
    """
    Enhanced data cleaning utilities
    """
    
    def __init__(self):
        self.cleaning_log = []
    
    def comprehensive_clean(self, df: pd.DataFrame, 
                          target_col: Optional[str] = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Comprehensive data cleaning pipeline
        
        Args:
            df: Input DataFrame
            target_col: Target column name (if any)
            
        Returns:
            Cleaned DataFrame and cleaning report
        """
        cleaning_report = {
            'original_shape': df.shape,
            'steps_performed': [],
            'rows_removed': 0,
            'columns_removed': 0,
            'values_imputed': 0
        }
        
        df_clean = df.copy()
        
        # Step 1: Remove completely empty rows and columns
        initial_rows = len(df_clean)
        df_clean = df_clean.dropna(how='all')
        rows_removed = initial_rows - len(df_clean)
        cleaning_report['rows_removed'] += rows_removed
        if rows_removed > 0:
            cleaning_report['steps_performed'].append(f"Removed {rows_removed} completely empty rows")
        
        initial_cols = len(df_clean.columns)
        df_clean = df_clean.dropna(axis=1, how='all')
        cols_removed = initial_cols - len(df_clean.columns)
        cleaning_report['columns_removed'] += cols_removed
        if cols_removed > 0:
            cleaning_report['steps_performed'].append(f"Removed {cols_removed} completely empty columns")
        
        # Step 2: Handle various forms of missing values
        missing_patterns = [
            'nan', 'null', 'none', 'na', 'n/a', '', ' ', 'undefined', 
            'missing', 'unknown', '#n/a', '#null!', '#div/0!', '#value!',
            'nil', 'void', 'empty', '-', '--', '?', '??', 'NaN', 'NULL', 'NONE'
        ]
        
        for col in df_clean.columns:
            if df_clean[col].dtype == 'object':
                # Replace string representations of missing values
                mask = df_clean[col].astype(str).str.strip().str.lower().isin(missing_patterns)
                values_replaced = mask.sum()
                if values_replaced > 0:
                    df_clean.loc[mask, col] = np.nan
                    cleaning_report['values_imputed'] += values_replaced
                    cleaning_report['steps_performed'].append(
                        f"Replaced {values_replaced} string null values in {col}"
                    )
        
        # Step 3: Handle infinite values
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            inf_mask = np.isinf(df_clean[col])
            inf_count = inf_mask.sum()
            if inf_count > 0:
                df_clean.loc[inf_mask, col] = np.nan
                cleaning_report['values_imputed'] += inf_count
                cleaning_report['steps_performed'].append(
                    f"Replaced {inf_count} infinite values in {col} with NaN"
                )
        
        # Step 4: Intelligent imputation
        imputation_report = self._intelligent_imputation(df_clean, target_col)
        cleaning_report['values_imputed'] += imputation_report['total_imputed']
        cleaning_report['steps_performed'].extend(imputation_report['steps'])
        
        # Step 5: Data type optimization
        df_clean = self._optimize_data_types(df_clean)
        cleaning_report['steps_performed'].append("Optimized data types")
        
        cleaning_report['final_shape'] = df_clean.shape
        cleaning_report['data_quality_score'] = self._calculate_quality_score(df_clean)
        
        return df_clean, cleaning_report
    
    def _intelligent_imputation(self, df: pd.DataFrame, 
                               target_col: Optional[str] = None) -> Dict[str, Any]:
        """
        Intelligent imputation based on data characteristics
        """
        imputation_report = {'total_imputed': 0, 'steps': []}
        
        for col in df.columns:
            if col == target_col:
                continue
            
            missing_count = df[col].isnull().sum()
            if missing_count == 0:
                continue
            
            if pd.api.types.is_numeric_dtype(df[col]):
                # For numeric columns, use median for skewed data, mean for normal
                col_data = df[col].dropna()
                if len(col_data) > 0:
                    skewness = abs(stats.skew(col_data))
                    if skewness > 1:  # Highly skewed
                        fill_value = col_data.median()
                        method = "median"
                    else:
                        fill_value = col_data.mean()
                        method = "mean"
                    
                    df[col] = df[col].fillna(fill_value)
                    imputation_report['total_imputed'] += missing_count
                    imputation_report['steps'].append(
                        f"Imputed {missing_count} values in {col} using {method} ({fill_value:.2f})"
                    )
            
            else:  # Categorical columns
                mode_value = df[col].mode()
                if len(mode_value) > 0:
                    df[col] = df[col].fillna(mode_value[0])
                    imputation_report['total_imputed'] += missing_count
                    imputation_report['steps'].append(
                        f"Imputed {missing_count} values in {col} using mode ({mode_value[0]})"
                    )
        
        return imputation_report
    
    def _optimize_data_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Optimize data types for memory efficiency
        """
        df_optimized = df.copy()
        
        for col in df_optimized.columns:
            if pd.api.types.is_integer_dtype(df_optimized[col]):
                # Optimize integer types
                col_min = df_optimized[col].min()
                col_max = df_optimized[col].max()
                
                if col_min >= 0:  # Unsigned integers
                    if col_max < 255:
                        df_optimized[col] = df_optimized[col].astype(np.uint8)
                    elif col_max < 65535:
                        df_optimized[col] = df_optimized[col].astype(np.uint16)
                    elif col_max < 4294967295:
                        df_optimized[col] = df_optimized[col].astype(np.uint32)
                else:  # Signed integers
                    if col_min > -128 and col_max < 127:
                        df_optimized[col] = df_optimized[col].astype(np.int8)
                    elif col_min > -32768 and col_max < 32767:
                        df_optimized[col] = df_optimized[col].astype(np.int16)
                    elif col_min > -2147483648 and col_max < 2147483647:
                        df_optimized[col] = df_optimized[col].astype(np.int32)
            
            elif pd.api.types.is_float_dtype(df_optimized[col]):
                # Optimize float types
                df_optimized[col] = pd.to_numeric(df_optimized[col], downcast='float')
        
        return df_optimized
    
    def _calculate_quality_score(self, df: pd.DataFrame) -> float:
        """
        Calculate overall data quality score (0-100)
        """
        total_cells = df.shape[0] * df.shape[1]
        if total_cells == 0:
            return 0.0
        
        # Count missing values
        missing_cells = df.isnull().sum().sum()
        
        # Count duplicate rows
        duplicate_rows = df.duplicated().sum()
        
        # Calculate score
        completeness_score = (1 - missing_cells / total_cells) * 70  # 70% weight
        uniqueness_score = (1 - duplicate_rows / len(df)) * 30  # 30% weight
        
        return min(100.0, completeness_score + uniqueness_score)


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
    Enhanced churn prediction pipeline with comprehensive data validation
    """
    
    def __init__(self):
        self.model = LogisticRegression(learning_rate=0.1, max_iterations=2000)
        self.feature_means = None
        self.feature_stds = None
        self.feature_names = None
        self.is_trained = False
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
        print("\n=== COMPREHENSIVE DATA QUALITY ASSESSMENT ===")
        
        # Define validation rules for churn data
        validation_rules = {
            'CreditScore': {
                'type': 'numeric',
                'min_value': 300,
                'max_value': 850
            },
            'Geography': {
                'type': 'categorical',
                'allowed_values': ['France', 'Germany', 'Spain']
            },
            'Gender': {
                'type': 'categorical',
                'allowed_values': ['Male', 'Female']
            },
            'Age': {
                'type': 'numeric',
                'min_value': 18,
                'max_value': 100
            },
            'Tenure': {
                'type': 'numeric',
                'min_value': 0,
                'max_value': 50
            },
            'Balance': {
                'type': 'numeric',
                'min_value': 0
            },
            'NumOfProducts': {
                'type': 'numeric',
                'min_value': 1,
                'max_value': 4
            },
            'HasCrCard': {
                'type': 'numeric',
                'min_value': 0,
                'max_value': 1
            },
            'IsActiveMember': {
                'type': 'numeric',
                'min_value': 0,
                'max_value': 1
            },
            'EstimatedSalary': {
                'type': 'numeric',
                'min_value': 0
            },
            'Exited': {
                'type': 'numeric',
                'min_value': 0,
                'max_value': 1
            }
        }
        
        # Generate comprehensive quality report
        quality_report = self.data_quality_assessor.generate_quality_report(df, validation_rules)
        
        print(f"Overall Data Quality Score: {quality_report['overall_quality']['score']:.1f}/100 (Grade: {quality_report['overall_quality']['grade']})")
        print(f"Completeness: {quality_report['completeness']['completeness_percentage']:.1f}%")
        print(f"Consistency: {quality_report['consistency']['consistency_score']:.1f}%")
        print(f"Validity: {quality_report['validity']['validity_percentage']:.1f}%")
        
        print("\nData Quality Recommendations:")
        for recommendation in quality_report['overall_quality']['recommendations']:
            print(f"  - {recommendation}")
        
        # Step 2: Enhanced data cleaning
        print("\n=== ENHANCED DATA CLEANING ===")
        
        # Use aggressive cleaning if data quality is poor
        aggressive_cleaning = quality_report['overall_quality']['score'] < 80
        
        df_clean, cleaning_report = self.data_cleaner.clean_dataset(
            df, 
            target_column='Exited',
            aggressive_cleaning=aggressive_cleaning
        )
        
        print(f"Cleaning completed:")
        print(f"  - Original shape: {cleaning_report['original_shape']}")
        print(f"  - Final shape: {cleaning_report['final_shape']}")
        print(f"  - Data retention: {cleaning_report['cleaning_effectiveness']['data_retention_rate']:.1f}%")
        print(f"  - Feature retention: {cleaning_report['cleaning_effectiveness']['feature_retention_rate']:.1f}%")
        print(f"  - Completeness improvement: {cleaning_report['cleaning_effectiveness']['completeness_improvement']:.1f}%")
        
        print("\nCleaning steps applied:")
        for step in cleaning_report['steps_applied']:
            print(f"  - {step['step']}: {step}")
        
        # Store quality reports for later use
        self.data_quality_report = {
            'initial_quality': quality_report,
            'cleaning_report': cleaning_report,
            'validation_rules': validation_rules
        }
        
        # Step 3: Feature engineering and final preprocessing
        df_processed = self._enhanced_feature_engineering(df_clean)
        
        # Drop unnecessary columns
        columns_to_drop = ['RowNumber', 'CustomerId', 'Surname']
        df_processed = df_processed.drop([col for col in columns_to_drop if col in df_processed.columns], axis=1)
        
        # Validate target column
        if 'Exited' not in df_processed.columns:
            raise ValueError("Target column 'Exited' not found in dataset")
        
        print(f"\nTarget distribution after cleaning:\n{df_processed['Exited'].value_counts()}")
        
        # One-hot encode categorical variables with error handling
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
        
        # Final validation - ensure no missing values remain
        if X.isnull().any().any():
            print("Warning: NaN values still present after cleaning. Performing final cleanup...")
            # Use median for numeric, mode for categorical
            for col in X.columns:
                if X[col].isnull().any():
                    if pd.api.types.is_numeric_dtype(X[col]):
                        X[col] = X[col].fillna(X[col].median())
                    else:
                        X[col] = X[col].fillna(X[col].mode().iloc[0] if len(X[col].mode()) > 0 else 'Unknown')
        
        self.feature_names = X.columns.tolist()
        print(f"\nFinal features ({len(self.feature_names)}): {self.feature_names}")
        
        # Final quality check
        final_quality = self.data_quality_assessor.assess_completeness(X)
        print(f"Final feature matrix completeness: {final_quality['completeness_percentage']:.1f}%")
        
        return X.values, y
    
    def _enhanced_feature_engineering(self, df: pd.DataFrame) -> pd.DataFrame:
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
    
    def get_data_quality_summary(self) -> Dict[str, Any]:
        """
        Get summary of data quality assessment and cleaning
        
        Returns:
            Dictionary with data quality summary
        """
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