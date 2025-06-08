# Messy Churn Dataset for Testing Enhanced Data Quality Features

## Overview

This dataset (`Messy_Churn_Dataset.csv`) has been specifically created to test the enhanced data quality assessment and cleaning capabilities of the churn analysis model. It contains **2,060 customer records** with **intentionally introduced data quality issues** that mirror real-world data problems.

## Dataset Characteristics

### Geographic Diversity
- **5 Regions**: North America, Europe, Asia Pacific, Latin America, Middle East & Africa
- **21 Countries**: USA, Canada, Mexico, UK, Germany, France, Italy, Spain, Netherlands, Japan, Australia, Singapore, South Korea, India, Brazil, Argentina, Chile, Colombia, Peru, UAE, Saudi Arabia, South Africa, Egypt, Nigeria
- **Regional Churn Patterns**: Different base churn rates per region (12%-25%)

### Data Quality Issues Introduced

#### 1. Missing Values (13.0% overall missing rate)
- **30+ Different Representations**:
  - Standard: `NaN`, `null`, `None`, `NA`
  - Excel errors: `#N/A`, `#NULL!`, `#DIV/0!`, `#VALUE!`
  - Placeholder values: `-`, `--`, `_`, `__`, `?`, `??`
  - Text representations: `undefined`, `missing`, `unknown`, `empty`, `void`
  - Case variations: `NULL`, `Null`, `NONE`, `None`
  - Numeric representations: `inf`, `-inf`, `Infinity`

#### 2. Inconsistent Formatting
- **Geography**: Mixed case (`USA`, `usa`, `Usa`), extra spaces (` USA `, `USA `)
- **Gender**: 20+ variations (`Male`, `MALE`, `M`, `m`, `Man`, `Boy`, etc.)
- **Boolean Fields**: Multiple representations (`1`, `True`, `Yes`, `Y`, `Active`)
- **Names**: Case inconsistencies, extra spaces, wrong separators

#### 3. Data Type Issues
- **Credit Scores**: Mixed types (int, float, string)
- **Balance**: Currency formatting (`$50,000.00`), comma separators
- **Salary**: String formatting with currency symbols
- **Boolean fields**: String representations mixed with numeric

#### 4. Outliers and Invalid Values
- **Credit Scores**: Impossible values (0, 999, 1200, -100, 9999)
- **Ages**: Unrealistic values (0, 150, 200, -5, 999)
- **Tenure**: Negative values (-1, -5, -10)
- **Balance**: Extreme values (999,999,999, -50,000)
- **Products**: Invalid counts (0, 10, 50, -1)

#### 5. Structural Issues
- **Empty Rows**: 10 completely empty records
- **Duplicate Records**: 50 duplicate customer entries
- **Extra Columns**: Irrelevant columns (`ExtraColumn1`, `ExtraColumn2`)
- **Encoding Issues**: Special characters in names (é, ñ, ü, ç, ø, €, £, ¥)

## Column Details

| Column | Data Issues | Missing Rate | Examples of Problems |
|--------|-------------|--------------|---------------------|
| `CustomerId` | Format variations, missing | 5% | `CUST_001000`, `C1000`, `US01000`, `ID-1000` |
| `CustomerName` | Case issues, spaces, encoding | 3% | `JOHN SMITH`, ` john smith `, `John,Smith` |
| `CreditScore` | Type mixing, outliers | 8% | `"null"`, `9999`, `-100`, `"undefined"` |
| `Geography` | Case/space inconsistencies | 2% | `USA`, `usa`, ` USA `, `"--"` |
| `Gender` | 20+ variations | 4% | `Male`, `M`, `man`, `Boy`, `"?"` |
| `Age` | Outliers, missing | 6% | `0`, `150`, `"nan"`, `-5` |
| `Tenure` | Negative values | 5% | `-1`, `"null"`, `"missing"` |
| `Balance` | Format mixing, currency | 7% | `"$50,000.00"`, `999999999`, `"undefined"` |
| `NumOfProducts` | Invalid counts | 4% | `0`, `50`, `"--"`, `-1` |
| `HasCrCard` | Boolean variations | 5% | `"True"`, `"Yes"`, `"Y"`, `"1"` |
| `IsActiveMember` | Boolean variations | 5% | `"Active"`, `"true"`, `"1"`, `"No"` |
| `EstimatedSalary` | Format mixing, currency | 9% | `"$75,000"`, `9999999`, `"null"` |
| `Exited` | Target variable | 0% | Clean target for model training |

## Regional Characteristics

### North America (USA, Canada, Mexico)
- **Base Churn Rate**: 15%
- **Salary Range**: $30,000 - $150,000
- **Credit Range**: 500 - 850

### Europe (UK, Germany, France, Italy, Spain, Netherlands)
- **Base Churn Rate**: 12%
- **Salary Range**: $25,000 - $120,000
- **Credit Range**: 400 - 800

### Asia Pacific (Japan, Australia, Singapore, South Korea, India)
- **Base Churn Rate**: 18%
- **Salary Range**: $20,000 - $100,000
- **Credit Range**: 350 - 750

### Latin America (Brazil, Argentina, Chile, Colombia, Peru)
- **Base Churn Rate**: 22%
- **Salary Range**: $15,000 - $80,000
- **Credit Range**: 300 - 700

### Middle East & Africa (UAE, Saudi Arabia, South Africa, Egypt, Nigeria)
- **Base Churn Rate**: 25%
- **Salary Range**: $18,000 - $90,000
- **Credit Range**: 320 - 720

## Testing Scenarios

This dataset is designed to test:

1. **Missing Value Detection**: Can the model identify all 30+ forms of missing values?
2. **Data Standardization**: Can it normalize inconsistent formatting?
3. **Type Conversion**: Can it handle mixed data types appropriately?
4. **Outlier Detection**: Can it identify and handle extreme/invalid values?
5. **Data Cleaning**: Can it clean the data while preserving valid information?
6. **Geographic Analysis**: Can it handle diverse international data?
7. **Memory Optimization**: Can it optimize data types for efficiency?
8. **Quality Scoring**: Can it accurately assess data quality?

## Expected Model Performance

With the enhanced data quality features, the model should:

- **Detect 99%+ of missing values** across all representations
- **Achieve 85%+ data quality score** after cleaning
- **Retain 90%+ of valid data** during cleaning process
- **Standardize all formatting inconsistencies**
- **Handle all geographic and demographic variations**
- **Provide detailed quality reports** with actionable insights

## Usage Instructions

1. **Upload the dataset** through the churn analysis interface
2. **Monitor the processing logs** to see data quality assessment
3. **Review the quality report** for detailed analysis
4. **Check the cleaning effectiveness** metrics
5. **Analyze the final predictions** across different regions

## Quality Metrics to Monitor

- **Initial Quality Score**: Expected ~60-70/100 (Grade: D-C)
- **Post-Cleaning Score**: Expected ~85-95/100 (Grade: B-A)
- **Completeness Improvement**: Expected +20-30%
- **Data Retention Rate**: Expected 85-95%
- **Processing Success Rate**: Expected 90-95%

This dataset provides a comprehensive test of the enhanced churn model's ability to handle real-world data quality challenges while maintaining prediction accuracy across diverse geographic markets. 