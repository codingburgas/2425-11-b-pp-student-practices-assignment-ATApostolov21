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


class DataQualityAssessment:
    """
    Comprehensive data quality assessment utilities
    """
    
    @staticmethod
    def assess_completeness(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Assess data completeness across multiple dimensions
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with completeness metrics
        """
        total_cells = df.shape[0] * df.shape[1]
        
        # Standard missing values
        standard_missing = df.isnull().sum().sum()
        
        # Extended missing value patterns
        extended_missing = 0
        missing_patterns = [
            r'^$',  # Empty string
            r'^\s+$',  # Whitespace only
            r'^(nan|null|none|na|n/a)$',  # Standard null representations
            r'^(undefined|missing|unknown)$',  # Undefined values
            r'^(#n/a|#null!|#div/0!|#value!)$',  # Excel error values
            r'^(nil|void|empty)$',  # Other null representations
            r'^(-|--|_|__)$',  # Dash/underscore placeholders
            r'^(\?|\?\?)$',  # Question mark placeholders
        ]
        
        for col in df.select_dtypes(include=['object']).columns:
            for pattern in missing_patterns:
                extended_missing += df[col].astype(str).str.lower().str.match(pattern).sum()
        
        # Infinite values in numeric columns
        infinite_values = 0
        for col in df.select_dtypes(include=[np.number]).columns:
            infinite_values += np.isinf(df[col]).sum()
        
        total_missing = standard_missing + extended_missing + infinite_values
        
        return {
            'total_cells': total_cells,
            'standard_missing': int(standard_missing),
            'extended_missing': int(extended_missing),
            'infinite_values': int(infinite_values),
            'total_missing': int(total_missing),
            'completeness_percentage': ((total_cells - total_missing) / total_cells * 100) if total_cells > 0 else 0,
            'column_completeness': {
                col: {
                    'missing_count': int(df[col].isnull().sum()),
                    'completeness_percentage': ((len(df) - df[col].isnull().sum()) / len(df) * 100) if len(df) > 0 else 0
                }
                for col in df.columns
            }
        }
    
    @staticmethod
    def assess_consistency(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Assess data consistency and identify inconsistencies
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with consistency metrics
        """
        consistency_issues = {}
        
        for col in df.columns:
            col_issues = []
            
            if df[col].dtype == 'object':
                # Check for case inconsistencies
                unique_values = df[col].dropna().astype(str)
                case_variants = {}
                for value in unique_values:
                    lower_value = value.lower()
                    if lower_value in case_variants:
                        case_variants[lower_value].append(value)
                    else:
                        case_variants[lower_value] = [value]
                
                case_inconsistencies = {k: v for k, v in case_variants.items() if len(v) > 1}
                if case_inconsistencies:
                    col_issues.append(f"Case inconsistencies: {len(case_inconsistencies)} groups")
                
                # Check for whitespace inconsistencies
                whitespace_variants = df[col].dropna().astype(str).apply(lambda x: x != x.strip()).sum()
                if whitespace_variants > 0:
                    col_issues.append(f"Whitespace inconsistencies: {whitespace_variants} values")
                
                # Check for encoding issues
                encoding_issues = df[col].dropna().astype(str).apply(
                    lambda x: bool(re.search(r'[^\x00-\x7F]', x))
                ).sum()
                if encoding_issues > 0:
                    col_issues.append(f"Potential encoding issues: {encoding_issues} values")
            
            elif pd.api.types.is_numeric_dtype(df[col]):
                # Check for unrealistic values (basic heuristics)
                col_data = df[col].dropna()
                if len(col_data) > 0:
                    # Check for values that are exactly zero (might be missing)
                    zero_count = (col_data == 0).sum()
                    if zero_count > len(col_data) * 0.1:  # More than 10% zeros
                        col_issues.append(f"High zero count: {zero_count} values ({zero_count/len(col_data)*100:.1f}%)")
                    
                    # Check for repeated values (might indicate default/placeholder values)
                    value_counts = col_data.value_counts()
                    if len(value_counts) > 0:
                        most_common_count = value_counts.iloc[0]
                        if most_common_count > len(col_data) * 0.3:  # More than 30% same value
                            col_issues.append(f"High repetition: {most_common_count} instances of {value_counts.index[0]}")
            
            if col_issues:
                consistency_issues[col] = col_issues
        
        return {
            'columns_with_issues': len(consistency_issues),
            'total_columns': len(df.columns),
            'consistency_score': ((len(df.columns) - len(consistency_issues)) / len(df.columns) * 100) if len(df.columns) > 0 else 100,
            'detailed_issues': consistency_issues
        }
    
    @staticmethod
    def assess_validity(df: pd.DataFrame, validation_rules: Dict[str, Dict]) -> Dict[str, Any]:
        """
        Assess data validity against predefined rules
        
        Args:
            df: Input DataFrame
            validation_rules: Dictionary with validation rules per column
                Format: {
                    'column_name': {
                        'type': 'numeric'|'categorical'|'date',
                        'min_value': float (for numeric),
                        'max_value': float (for numeric),
                        'allowed_values': list (for categorical),
                        'pattern': str (regex pattern for strings)
                    }
                }
        
        Returns:
            Dictionary with validity assessment
        """
        validity_results = {}
        total_violations = 0
        
        for col, rules in validation_rules.items():
            if col not in df.columns:
                validity_results[col] = {
                    'status': 'column_missing',
                    'violations': 0,
                    'violation_percentage': 0
                }
                continue
            
            col_data = df[col].dropna()
            violations = 0
            violation_details = []
            
            if rules.get('type') == 'numeric':
                # Check if values are numeric
                try:
                    numeric_data = pd.to_numeric(col_data, errors='coerce')
                    non_numeric = numeric_data.isnull().sum() - col_data.isnull().sum()
                    violations += non_numeric
                    if non_numeric > 0:
                        violation_details.append(f"{non_numeric} non-numeric values")
                    
                    # Check range constraints
                    valid_numeric = numeric_data.dropna()
                    if 'min_value' in rules:
                        below_min = (valid_numeric < rules['min_value']).sum()
                        violations += below_min
                        if below_min > 0:
                            violation_details.append(f"{below_min} values below minimum ({rules['min_value']})")
                    
                    if 'max_value' in rules:
                        above_max = (valid_numeric > rules['max_value']).sum()
                        violations += above_max
                        if above_max > 0:
                            violation_details.append(f"{above_max} values above maximum ({rules['max_value']})")
                
                except Exception as e:
                    violation_details.append(f"Error in numeric validation: {str(e)}")
            
            elif rules.get('type') == 'categorical':
                if 'allowed_values' in rules:
                    invalid_values = ~col_data.isin(rules['allowed_values'])
                    invalid_count = invalid_values.sum()
                    violations += invalid_count
                    if invalid_count > 0:
                        violation_details.append(f"{invalid_count} values not in allowed set")
            
            elif rules.get('type') == 'string':
                if 'pattern' in rules:
                    try:
                        pattern_violations = ~col_data.astype(str).str.match(rules['pattern'])
                        pattern_violation_count = pattern_violations.sum()
                        violations += pattern_violation_count
                        if pattern_violation_count > 0:
                            violation_details.append(f"{pattern_violation_count} values don't match pattern")
                    except Exception as e:
                        violation_details.append(f"Error in pattern validation: {str(e)}")
            
            validity_results[col] = {
                'status': 'valid' if violations == 0 else 'invalid',
                'violations': int(violations),
                'violation_percentage': (violations / len(col_data) * 100) if len(col_data) > 0 else 0,
                'violation_details': violation_details
            }
            
            total_violations += violations
        
        total_values = sum(len(df[col].dropna()) for col in validation_rules.keys() if col in df.columns)
        
        return {
            'total_violations': int(total_violations),
            'total_validated_values': int(total_values),
            'validity_percentage': ((total_values - total_violations) / total_values * 100) if total_values > 0 else 100,
            'column_results': validity_results
        }
    
    @staticmethod
    def generate_quality_report(df: pd.DataFrame, 
                              validation_rules: Optional[Dict[str, Dict]] = None) -> Dict[str, Any]:
        """
        Generate comprehensive data quality report
        
        Args:
            df: Input DataFrame
            validation_rules: Optional validation rules
            
        Returns:
            Comprehensive quality report
        """
        report = {
            'dataset_info': {
                'shape': df.shape,
                'memory_usage_mb': df.memory_usage(deep=True).sum() / 1024 / 1024,
                'dtypes': df.dtypes.to_dict()
            }
        }
        
        # Completeness assessment
        report['completeness'] = DataQualityAssessment.assess_completeness(df)
        
        # Consistency assessment
        report['consistency'] = DataQualityAssessment.assess_consistency(df)
        
        # Validity assessment (if rules provided)
        if validation_rules:
            report['validity'] = DataQualityAssessment.assess_validity(df, validation_rules)
        
        # Overall quality score
        completeness_score = report['completeness']['completeness_percentage']
        consistency_score = report['consistency']['consistency_score']
        validity_score = report['validity']['validity_percentage'] if validation_rules else 100
        
        # Weighted average (completeness: 40%, consistency: 30%, validity: 30%)
        overall_score = (completeness_score * 0.4 + consistency_score * 0.3 + validity_score * 0.3)
        
        report['overall_quality'] = {
            'score': overall_score,
            'grade': DataQualityAssessment._get_quality_grade(overall_score),
            'recommendations': DataQualityAssessment._generate_recommendations(report)
        }
        
        return report
    
    @staticmethod
    def _get_quality_grade(score: float) -> str:
        """Convert quality score to letter grade"""
        if score >= 95:
            return 'A+'
        elif score >= 90:
            return 'A'
        elif score >= 85:
            return 'B+'
        elif score >= 80:
            return 'B'
        elif score >= 75:
            return 'C+'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'
    
    @staticmethod
    def _generate_recommendations(report: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on quality assessment"""
        recommendations = []
        
        completeness = report['completeness']['completeness_percentage']
        consistency = report['consistency']['consistency_score']
        
        if completeness < 90:
            recommendations.append("Address missing values through imputation or data collection")
        
        if consistency < 80:
            recommendations.append("Standardize data formats and resolve inconsistencies")
        
        if 'validity' in report and report['validity']['validity_percentage'] < 85:
            recommendations.append("Implement data validation rules and clean invalid values")
        
        if report['dataset_info']['memory_usage_mb'] > 100:
            recommendations.append("Consider data type optimization to reduce memory usage")
        
        # Column-specific recommendations
        for col, col_completeness in report['completeness']['column_completeness'].items():
            if col_completeness['completeness_percentage'] < 70:
                recommendations.append(f"Column '{col}' has low completeness ({col_completeness['completeness_percentage']:.1f}%) - consider removal or targeted data collection")
        
        if not recommendations:
            recommendations.append("Data quality is good - maintain current data management practices")
        
        return recommendations


class EnhancedDataCleaner:
    """
    Enhanced data cleaning with comprehensive preprocessing capabilities
    """
    
    def __init__(self):
        self.cleaning_history = []
        self.transformation_log = []
    
    def clean_dataset(self, df: pd.DataFrame, 
                     target_column: Optional[str] = None,
                     aggressive_cleaning: bool = False) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Comprehensive dataset cleaning
        
        Args:
            df: Input DataFrame
            target_column: Target column name (protected from removal)
            aggressive_cleaning: Whether to apply aggressive cleaning methods
            
        Returns:
            Cleaned DataFrame and cleaning report
        """
        cleaning_report = {
            'original_shape': df.shape,
            'steps_applied': [],
            'data_removed': {
                'rows': 0,
                'columns': 0,
                'values': 0
            },
            'transformations_applied': []
        }
        
        df_clean = df.copy()
        
        # Step 1: Remove completely empty rows/columns
        df_clean, step_report = self._remove_empty_data(df_clean, target_column)
        cleaning_report['steps_applied'].append(step_report)
        cleaning_report['data_removed']['rows'] += step_report.get('rows_removed', 0)
        cleaning_report['data_removed']['columns'] += step_report.get('columns_removed', 0)
        
        # Step 2: Standardize missing value representations
        df_clean, step_report = self._standardize_missing_values(df_clean)
        cleaning_report['steps_applied'].append(step_report)
        cleaning_report['data_removed']['values'] += step_report.get('values_standardized', 0)
        
        # Step 3: Handle infinite and extreme values
        df_clean, step_report = self._handle_infinite_values(df_clean)
        cleaning_report['steps_applied'].append(step_report)
        cleaning_report['data_removed']['values'] += step_report.get('values_handled', 0)
        
        # Step 4: Data type optimization and conversion
        df_clean, step_report = self._optimize_data_types(df_clean)
        cleaning_report['steps_applied'].append(step_report)
        cleaning_report['transformations_applied'].extend(step_report.get('transformations', []))
        
        # Step 5: Intelligent missing value imputation
        df_clean, step_report = self._intelligent_imputation(df_clean, target_column)
        cleaning_report['steps_applied'].append(step_report)
        cleaning_report['data_removed']['values'] += step_report.get('values_imputed', 0)
        
        # Step 6: Outlier handling (if aggressive cleaning enabled)
        if aggressive_cleaning:
            df_clean, step_report = self._handle_outliers(df_clean, target_column)
            cleaning_report['steps_applied'].append(step_report)
            cleaning_report['data_removed']['rows'] += step_report.get('rows_removed', 0)
        
        # Step 7: Final validation
        final_quality = DataQualityAssessment.assess_completeness(df_clean)
        
        cleaning_report.update({
            'final_shape': df_clean.shape,
            'final_completeness': final_quality['completeness_percentage'],
            'cleaning_effectiveness': self._calculate_cleaning_effectiveness(df, df_clean)
        })
        
        return df_clean, cleaning_report
    
    def _remove_empty_data(self, df: pd.DataFrame, 
                          target_column: Optional[str] = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Remove completely empty rows and columns"""
        initial_shape = df.shape
        
        # Remove empty rows
        df_clean = df.dropna(how='all')
        rows_removed = initial_shape[0] - df_clean.shape[0]
        
        # Remove empty columns (except target)
        columns_to_check = [col for col in df_clean.columns if col != target_column]
        empty_columns = [col for col in columns_to_check if df_clean[col].isnull().all()]
        df_clean = df_clean.drop(columns=empty_columns)
        columns_removed = len(empty_columns)
        
        return df_clean, {
            'step': 'remove_empty_data',
            'rows_removed': rows_removed,
            'columns_removed': columns_removed,
            'empty_columns': empty_columns
        }
    
    def _standardize_missing_values(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Standardize various representations of missing values"""
        df_clean = df.copy()
        values_standardized = 0
        
        # Extended missing value patterns
        missing_patterns = [
            'nan', 'null', 'none', 'na', 'n/a', '', ' ', 'undefined', 
            'missing', 'unknown', '#n/a', '#null!', '#div/0!', '#value!',
            'nil', 'void', 'empty', '-', '--', '_', '__', '?', '??',
            'NaN', 'NULL', 'NONE', 'Null', 'None'
        ]
        
        for col in df_clean.columns:
            if df_clean[col].dtype == 'object':
                # Create mask for missing patterns
                mask = df_clean[col].astype(str).str.strip().isin(missing_patterns)
                count = mask.sum()
                if count > 0:
                    df_clean.loc[mask, col] = np.nan
                    values_standardized += count
        
        return df_clean, {
            'step': 'standardize_missing_values',
            'values_standardized': values_standardized,
            'patterns_checked': len(missing_patterns)
        }
    
    def _handle_infinite_values(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Handle infinite and extreme values"""
        df_clean = df.copy()
        values_handled = 0
        
        numeric_columns = df_clean.select_dtypes(include=[np.number]).columns
        
        for col in numeric_columns:
            # Handle infinite values
            inf_mask = np.isinf(df_clean[col])
            inf_count = inf_mask.sum()
            if inf_count > 0:
                df_clean.loc[inf_mask, col] = np.nan
                values_handled += inf_count
            
            # Handle extreme values (beyond reasonable bounds)
            col_data = df_clean[col].dropna()
            if len(col_data) > 0:
                # Use 99.9th percentile as upper bound for extreme values
                upper_bound = col_data.quantile(0.999)
                lower_bound = col_data.quantile(0.001)
                
                extreme_mask = (df_clean[col] > upper_bound * 100) | (df_clean[col] < lower_bound * 100)
                extreme_count = extreme_mask.sum()
                if extreme_count > 0:
                    df_clean.loc[extreme_mask, col] = np.nan
                    values_handled += extreme_count
        
        return df_clean, {
            'step': 'handle_infinite_values',
            'values_handled': values_handled,
            'columns_processed': len(numeric_columns)
        }
    
    def _optimize_data_types(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Optimize data types for memory efficiency"""
        df_clean = df.copy()
        transformations = []
        
        for col in df_clean.columns:
            original_dtype = df_clean[col].dtype
            
            if pd.api.types.is_integer_dtype(df_clean[col]):
                # Optimize integer types
                col_min = df_clean[col].min()
                col_max = df_clean[col].max()
                
                if pd.notna(col_min) and pd.notna(col_max):
                    if col_min >= 0:  # Unsigned integers
                        if col_max < 255:
                            df_clean[col] = df_clean[col].astype('uint8')
                        elif col_max < 65535:
                            df_clean[col] = df_clean[col].astype('uint16')
                    else:  # Signed integers
                        if col_min > -128 and col_max < 127:
                            df_clean[col] = df_clean[col].astype('int8')
                        elif col_min > -32768 and col_max < 32767:
                            df_clean[col] = df_clean[col].astype('int16')
                    
                    if df_clean[col].dtype != original_dtype:
                        transformations.append(f"{col}: {original_dtype} -> {df_clean[col].dtype}")
            
            elif pd.api.types.is_float_dtype(df_clean[col]):
                # Try to downcast floats
                df_clean[col] = pd.to_numeric(df_clean[col], downcast='float')
                if df_clean[col].dtype != original_dtype:
                    transformations.append(f"{col}: {original_dtype} -> {df_clean[col].dtype}")
        
        return df_clean, {
            'step': 'optimize_data_types',
            'transformations': transformations
        }
    
    def _intelligent_imputation(self, df: pd.DataFrame, 
                               target_column: Optional[str] = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Intelligent missing value imputation"""
        df_clean = df.copy()
        values_imputed = 0
        imputation_methods = {}
        
        for col in df_clean.columns:
            if col == target_column:
                continue
            
            missing_count = df_clean[col].isnull().sum()
            if missing_count == 0:
                continue
            
            if pd.api.types.is_numeric_dtype(df_clean[col]):
                col_data = df_clean[col].dropna()
                if len(col_data) > 0:
                    # Choose imputation method based on distribution
                    skewness = abs(stats.skew(col_data))
                    
                    if skewness > 2:  # Highly skewed - use median
                        fill_value = col_data.median()
                        method = 'median'
                    elif missing_count / len(df_clean) > 0.3:  # High missing rate - use mode
                        fill_value = col_data.mode().iloc[0] if len(col_data.mode()) > 0 else col_data.median()
                        method = 'mode'
                    else:  # Use mean for normal distributions
                        fill_value = col_data.mean()
                        method = 'mean'
                    
                    df_clean[col] = df_clean[col].fillna(fill_value)
                    values_imputed += missing_count
                    imputation_methods[col] = f"{method} ({fill_value:.2f})"
            
            else:  # Categorical data
                mode_values = df_clean[col].mode()
                if len(mode_values) > 0:
                    df_clean[col] = df_clean[col].fillna(mode_values.iloc[0])
                    values_imputed += missing_count
                    imputation_methods[col] = f"mode ({mode_values.iloc[0]})"
        
        return df_clean, {
            'step': 'intelligent_imputation',
            'values_imputed': values_imputed,
            'methods_used': imputation_methods
        }
    
    def _handle_outliers(self, df: pd.DataFrame, 
                        target_column: Optional[str] = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Handle outliers using IQR method"""
        df_clean = df.copy()
        rows_removed = 0
        outlier_columns = []
        
        numeric_columns = [col for col in df_clean.select_dtypes(include=[np.number]).columns 
                          if col != target_column]
        
        for col in numeric_columns:
            col_data = df_clean[col].dropna()
            if len(col_data) < 10:  # Skip if too few data points
                continue
            
            Q1 = col_data.quantile(0.25)
            Q3 = col_data.quantile(0.75)
            IQR = Q3 - Q1
            
            if IQR > 0:  # Avoid division by zero
                lower_bound = Q1 - 3 * IQR  # More conservative than 1.5
                upper_bound = Q3 + 3 * IQR
                
                outlier_mask = (df_clean[col] < lower_bound) | (df_clean[col] > upper_bound)
                outlier_count = outlier_mask.sum()
                
                if outlier_count > 0 and outlier_count < len(df_clean) * 0.05:  # Remove only if < 5% of data
                    df_clean = df_clean[~outlier_mask]
                    rows_removed += outlier_count
                    outlier_columns.append(col)
        
        return df_clean, {
            'step': 'handle_outliers',
            'rows_removed': rows_removed,
            'columns_processed': outlier_columns
        }
    
    def _calculate_cleaning_effectiveness(self, df_original: pd.DataFrame, 
                                        df_clean: pd.DataFrame) -> Dict[str, float]:
        """Calculate cleaning effectiveness metrics"""
        original_completeness = DataQualityAssessment.assess_completeness(df_original)['completeness_percentage']
        final_completeness = DataQualityAssessment.assess_completeness(df_clean)['completeness_percentage']
        
        return {
            'completeness_improvement': final_completeness - original_completeness,
            'data_retention_rate': (df_clean.shape[0] / df_original.shape[0]) * 100,
            'feature_retention_rate': (df_clean.shape[1] / df_original.shape[1]) * 100
        } 