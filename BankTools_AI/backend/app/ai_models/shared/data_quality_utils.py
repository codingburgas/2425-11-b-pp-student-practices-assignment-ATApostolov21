"""
Data Quality Assessment and Validation Utilities for BankTools_AI

This module provides comprehensive data quality assessment, validation, and cleaning
utilities that can be used across different AI models in the application.
"""

import numpy as np
import pandas as pd
import warnings
from typing import Dict, List, Tuple, Any, Optional, Union
from scipy import stats
import re
from .validators import DataValidator


class DataQualityAssessment:
    """
    Comprehensive data quality assessment tools
    """
    
    def __init__(self):
        self.validator = DataValidator()
    
    def generate_quality_report(self, df: pd.DataFrame, validation_rules: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive data quality report
        
        Args:
            df: Input DataFrame
            validation_rules: Dictionary of validation rules per column
            
        Returns:
            Comprehensive quality report
        """
        report = {
            'completeness': self.assess_completeness(df),
            'consistency': self.assess_consistency(df),
            'validity': self.assess_validity(df, validation_rules),
            'uniqueness': self.assess_uniqueness(df),
            'outliers': self.assess_outliers(df)
        }
        
        # Calculate overall quality score and grade
        overall_quality = self._calculate_overall_quality(report)
        report['overall_quality'] = overall_quality
        
        return report
    
    def assess_completeness(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Assess data completeness"""
        total_cells = df.shape[0] * df.shape[1]
        missing_cells = df.isnull().sum().sum()
        completeness_percentage = ((total_cells - missing_cells) / total_cells) * 100
        
        return {
            'total_cells': total_cells,
            'missing_cells': missing_cells,
            'completeness_percentage': completeness_percentage,
            'missing_by_column': df.isnull().sum().to_dict(),
            'columns_with_missing': df.columns[df.isnull().any()].tolist()
        }
    
    def assess_consistency(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Assess data consistency"""
        consistency_issues = []
        consistency_score = 100.0
        
        # Check for inconsistent data types within columns
        for col in df.columns:
            if df[col].dtype == 'object':
                try:
                    # Try to convert to numeric
                    pd.to_numeric(df[col], errors='raise')
                except (ValueError, TypeError):
                    # Check for mixed types
                    types = df[col].apply(type).unique()
                    if len(types) > 1:
                        consistency_issues.append(f"Mixed data types in column '{col}': {types}")
                        consistency_score -= 5
        
        # Check for inconsistent categorical values (similar strings)
        for col in df.select_dtypes(include=['object']).columns:
            unique_values = df[col].dropna().unique()
            if len(unique_values) > 1:
                # Check for potential inconsistencies (case sensitivity, extra spaces)
                cleaned_values = [str(val).strip().lower() for val in unique_values]
                if len(set(cleaned_values)) < len(unique_values):
                    consistency_issues.append(f"Potential case/spacing inconsistencies in column '{col}'")
                    consistency_score -= 3
        
        return {
            'consistency_score': max(0, consistency_score),
            'consistency_issues': consistency_issues,
            'issues_count': len(consistency_issues)
        }
    
    def assess_validity(self, df: pd.DataFrame, validation_rules: Dict[str, Any]) -> Dict[str, Any]:
        """Assess data validity based on business rules"""
        validity_issues = []
        total_values = 0
        invalid_values = 0
        
        for col, rules in validation_rules.items():
            if col not in df.columns:
                continue
            
            col_data = df[col].dropna()
            total_values += len(col_data)
            
            if rules['type'] == 'numeric':
                # Check numeric range
                if 'min_value' in rules:
                    invalid_count = (col_data < rules['min_value']).sum()
                    if invalid_count > 0:
                        validity_issues.append(f"{invalid_count} values in '{col}' below minimum {rules['min_value']}")
                        invalid_values += invalid_count
                
                if 'max_value' in rules:
                    invalid_count = (col_data > rules['max_value']).sum()
                    if invalid_count > 0:
                        validity_issues.append(f"{invalid_count} values in '{col}' above maximum {rules['max_value']}")
                        invalid_values += invalid_count
            
            elif rules['type'] == 'categorical':
                # Check allowed values
                if 'allowed_values' in rules:
                    invalid_mask = ~col_data.isin(rules['allowed_values'])
                    invalid_count = invalid_mask.sum()
                    if invalid_count > 0:
                        invalid_vals = col_data[invalid_mask].unique()
                        validity_issues.append(f"{invalid_count} invalid values in '{col}': {invalid_vals}")
                        invalid_values += invalid_count
        
        validity_percentage = ((total_values - invalid_values) / total_values * 100) if total_values > 0 else 100
        
        return {
            'validity_percentage': validity_percentage,
            'validity_issues': validity_issues,
            'total_values_checked': total_values,
            'invalid_values_count': invalid_values
        }
    
    def assess_uniqueness(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Assess data uniqueness"""
        duplicate_rows = df.duplicated().sum()
        uniqueness_percentage = ((len(df) - duplicate_rows) / len(df) * 100) if len(df) > 0 else 100
        
        # Check column-level uniqueness
        column_uniqueness = {}
        for col in df.columns:
            unique_values = df[col].nunique()
            total_values = len(df[col].dropna())
            if total_values > 0:
                column_uniqueness[col] = (unique_values / total_values) * 100
            else:
                column_uniqueness[col] = 100
        
        return {
            'duplicate_rows': duplicate_rows,
            'uniqueness_percentage': uniqueness_percentage,
            'column_uniqueness': column_uniqueness
        }
    
    def assess_outliers(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Assess outliers in numeric columns"""
        outlier_info = {}
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            col_data = df[col].dropna()
            if len(col_data) > 0:
                Q1 = col_data.quantile(0.25)
                Q3 = col_data.quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outliers = col_data[(col_data < lower_bound) | (col_data > upper_bound)]
                outlier_info[col] = {
                    'outlier_count': len(outliers),
                    'outlier_percentage': (len(outliers) / len(col_data)) * 100,
                    'lower_bound': lower_bound,
                    'upper_bound': upper_bound
                }
        
        return outlier_info
    
    def _calculate_overall_quality(self, report: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall quality score and recommendations"""
        # Weighted scoring
        completeness_weight = 0.3
        consistency_weight = 0.25
        validity_weight = 0.25
        uniqueness_weight = 0.2
        
        score = (
            report['completeness']['completeness_percentage'] * completeness_weight +
            report['consistency']['consistency_score'] * consistency_weight +
            report['validity']['validity_percentage'] * validity_weight +
            report['uniqueness']['uniqueness_percentage'] * uniqueness_weight
        )
        
        # Determine grade
        if score >= 90:
            grade = 'A'
        elif score >= 80:
            grade = 'B'
        elif score >= 70:
            grade = 'C'
        elif score >= 60:
            grade = 'D'
        else:
            grade = 'F'
        
        # Generate recommendations
        recommendations = []
        if report['completeness']['completeness_percentage'] < 95:
            recommendations.append("Address missing values through imputation or data collection")
        if report['consistency']['consistency_score'] < 90:
            recommendations.append("Standardize data formats and resolve inconsistencies")
        if report['validity']['validity_percentage'] < 95:
            recommendations.append("Validate and correct out-of-range or invalid values")
        if report['uniqueness']['uniqueness_percentage'] < 95:
            recommendations.append("Remove duplicate records")
        
        return {
            'score': score,
            'grade': grade,
            'recommendations': recommendations
        }


class EnhancedDataCleaner:
    """
    Enhanced data cleaning with configurable aggressiveness
    """
    
    def __init__(self):
        self.cleaning_log = []
    
    def clean_dataset(self, df: pd.DataFrame, target_column: str = None, 
                     aggressive_cleaning: bool = False) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Clean dataset with configurable aggressiveness
        
        Args:
            df: Input DataFrame
            target_column: Target column name (protected from removal)
            aggressive_cleaning: Whether to apply aggressive cleaning
            
        Returns:
            Cleaned DataFrame and cleaning report
        """
        cleaning_report = {
            'original_shape': df.shape,
            'steps_applied': [],
            'aggressive_cleaning': aggressive_cleaning
        }
        
        df_clean = df.copy()
        
        # Step 1: Remove completely empty rows and columns
        initial_rows = len(df_clean)
        df_clean = df_clean.dropna(how='all')
        rows_removed = initial_rows - len(df_clean)
        if rows_removed > 0:
            cleaning_report['steps_applied'].append({
                'step': f"Removed {rows_removed} completely empty rows",
                'impact': f"{rows_removed} rows"
            })
        
        # Step 2: Handle missing values
        if aggressive_cleaning:
            # Aggressive: Remove columns with >50% missing values
            missing_threshold = 0.5
        else:
            # Conservative: Remove columns with >80% missing values
            missing_threshold = 0.8
        
        columns_to_drop = []
        for col in df_clean.columns:
            if col == target_column:
                continue  # Protect target column
            
            missing_ratio = df_clean[col].isnull().sum() / len(df_clean)
            if missing_ratio > missing_threshold:
                columns_to_drop.append(col)
        
        if columns_to_drop:
            df_clean = df_clean.drop(columns_to_drop, axis=1)
            cleaning_report['steps_applied'].append({
                'step': f"Removed {len(columns_to_drop)} columns with >{missing_threshold*100}% missing values",
                'impact': f"Columns removed: {columns_to_drop}"
            })
        
        # Step 3: Handle outliers
        if aggressive_cleaning:
            df_clean = self._remove_outliers(df_clean, cleaning_report, target_column)
        
        # Step 4: Impute remaining missing values
        df_clean = self._impute_missing_values(df_clean, cleaning_report, target_column)
        
        # Step 5: Calculate cleaning effectiveness
        cleaning_effectiveness = self._calculate_cleaning_effectiveness(df, df_clean)
        cleaning_report['cleaning_effectiveness'] = cleaning_effectiveness
        cleaning_report['final_shape'] = df_clean.shape
        cleaning_report['final_completeness'] = ((df_clean.shape[0] * df_clean.shape[1] - df_clean.isnull().sum().sum()) / 
                                                (df_clean.shape[0] * df_clean.shape[1]) * 100)
        
        return df_clean, cleaning_report
    
    def _remove_outliers(self, df: pd.DataFrame, cleaning_report: Dict[str, Any], 
                        target_column: str = None) -> pd.DataFrame:
        """Remove outliers using IQR method"""
        df_clean = df.copy()
        initial_rows = len(df_clean)
        
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        if target_column and target_column in numeric_cols:
            numeric_cols = numeric_cols.drop(target_column)  # Don't remove outliers from target
        
        outlier_mask = pd.Series([False] * len(df_clean))
        
        for col in numeric_cols:
            Q1 = df_clean[col].quantile(0.25)
            Q3 = df_clean[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            col_outliers = (df_clean[col] < lower_bound) | (df_clean[col] > upper_bound)
            outlier_mask |= col_outliers
        
        df_clean = df_clean[~outlier_mask]
        rows_removed = initial_rows - len(df_clean)
        
        if rows_removed > 0:
            cleaning_report['steps_applied'].append({
                'step': f"Removed {rows_removed} outlier rows",
                'impact': f"{rows_removed} rows"
            })
        
        return df_clean
    
    def _impute_missing_values(self, df: pd.DataFrame, cleaning_report: Dict[str, Any], 
                              target_column: str = None) -> pd.DataFrame:
        """Impute remaining missing values"""
        df_clean = df.copy()
        imputation_count = 0
        
        for col in df_clean.columns:
            if col == target_column:
                continue  # Don't impute target column
            
            missing_count = df_clean[col].isnull().sum()
            if missing_count == 0:
                continue
            
            if pd.api.types.is_numeric_dtype(df_clean[col]):
                # Use median for numeric columns
                fill_value = df_clean[col].median()
                df_clean[col] = df_clean[col].fillna(fill_value)
            else:
                # Use mode for categorical columns
                mode_values = df_clean[col].mode()
                if len(mode_values) > 0:
                    fill_value = mode_values[0]
                    df_clean[col] = df_clean[col].fillna(fill_value)
            
            imputation_count += missing_count
        
        if imputation_count > 0:
            cleaning_report['steps_applied'].append({
                'step': f"Imputed {imputation_count} missing values",
                'impact': f"{imputation_count} values"
            })
        
        return df_clean
    
    def _calculate_cleaning_effectiveness(self, original_df: pd.DataFrame, 
                                        cleaned_df: pd.DataFrame) -> Dict[str, float]:
        """Calculate cleaning effectiveness metrics"""
        original_completeness = ((original_df.shape[0] * original_df.shape[1] - original_df.isnull().sum().sum()) / 
                               (original_df.shape[0] * original_df.shape[1]) * 100)
        
        final_completeness = ((cleaned_df.shape[0] * cleaned_df.shape[1] - cleaned_df.isnull().sum().sum()) / 
                            (cleaned_df.shape[0] * cleaned_df.shape[1]) * 100)
        
        return {
            'data_retention_rate': (len(cleaned_df) / len(original_df)) * 100,
            'feature_retention_rate': (len(cleaned_df.columns) / len(original_df.columns)) * 100,
            'completeness_improvement': final_completeness - original_completeness,
            'original_completeness': original_completeness,
            'final_completeness': final_completeness
        } 