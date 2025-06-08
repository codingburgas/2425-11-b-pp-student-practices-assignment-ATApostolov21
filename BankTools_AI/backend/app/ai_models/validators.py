"""
Data validation utilities for AI models
"""

import numpy as np
import pandas as pd
from typing import Dict, Any
from scipy import stats


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