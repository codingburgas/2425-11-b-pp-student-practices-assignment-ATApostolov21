"""
Data cleaning utilities for AI models
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, Tuple
from scipy import stats


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


class LoanDataCleaner:
    """
    Specialized data cleaner for loan data
    """
    
    @staticmethod
    def clean_loan_data(df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean loan-specific data
        """
        df_clean = df.copy()
        
        # Handle missing values for categorical variables
        categorical_cols = ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed', 'Property_Area']
        for col in categorical_cols:
            if col in df_clean.columns and df_clean[col].isnull().any():
                mode_value = df_clean[col].mode()
                if len(mode_value) > 0:
                    df_clean[col] = df_clean[col].fillna(mode_value[0])
        
        # Handle missing values for numerical variables
        numerical_cols = ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term', 'Credit_History']
        for col in numerical_cols:
            if col in df_clean.columns and df_clean[col].isnull().any():
                df_clean[col] = df_clean[col].fillna(df_clean[col].median())
        
        # Handle Dependents column (convert '3+' to '3')
        if 'Dependents' in df_clean.columns:
            df_clean['Dependents'] = df_clean['Dependents'].replace('3+', '3')
            df_clean['Dependents'] = pd.to_numeric(df_clean['Dependents'], errors='coerce')
            df_clean['Dependents'] = df_clean['Dependents'].fillna(0)
        
        return df_clean 