"""
Generate Messy Churn Dataset for Testing Enhanced Data Quality Features

This script creates a realistic but intentionally messy dataset with:
- Different geographical regions
- Various forms of missing/invalid data
- Inconsistent formatting
- Outliers and data entry errors
- Mixed data types and encoding issues
"""

import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

def generate_messy_churn_dataset(n_customers=2000):
    """
    Generate a messy churn dataset with various data quality issues
    
    Args:
        n_customers: Number of customers to generate
        
    Returns:
        DataFrame with messy churn data
    """
    
    # Define regions with different characteristics
    regions = {
        'North America': {
            'countries': ['USA', 'Canada', 'Mexico'],
            'churn_base_rate': 0.15,
            'salary_range': (30000, 150000),
            'credit_range': (500, 850)
        },
        'Europe': {
            'countries': ['UK', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'],
            'churn_base_rate': 0.12,
            'salary_range': (25000, 120000),
            'credit_range': (400, 800)
        },
        'Asia Pacific': {
            'countries': ['Japan', 'Australia', 'Singapore', 'South Korea', 'India'],
            'churn_base_rate': 0.18,
            'salary_range': (20000, 100000),
            'credit_range': (350, 750)
        },
        'Latin America': {
            'countries': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
            'churn_base_rate': 0.22,
            'salary_range': (15000, 80000),
            'credit_range': (300, 700)
        },
        'Middle East & Africa': {
            'countries': ['UAE', 'Saudi Arabia', 'South Africa', 'Egypt', 'Nigeria'],
            'churn_base_rate': 0.25,
            'salary_range': (18000, 90000),
            'credit_range': (320, 720)
        }
    }
    
    # Various forms of missing/invalid data representations
    missing_values = [
        np.nan, '', ' ', '  ', 'NULL', 'null', 'Null', 'NONE', 'None', 'none',
        'N/A', 'n/a', 'NA', 'na', '#N/A', '#NULL!', '#DIV/0!', '#VALUE!',
        'undefined', 'UNDEFINED', 'missing', 'MISSING', 'unknown', 'UNKNOWN',
        '?', '??', '-', '--', '_', '__', 'nil', 'NIL', 'void', 'VOID',
        'empty', 'EMPTY', '0', 'NaN', 'nan', 'inf', '-inf', 'Infinity'
    ]
    
    # Gender variations (inconsistent formatting)
    gender_variations = {
        'Male': ['Male', 'MALE', 'male', 'M', 'm', 'Man', 'MAN', 'man', 'Boy', 'boy'],
        'Female': ['Female', 'FEMALE', 'female', 'F', 'f', 'Woman', 'WOMAN', 'woman', 'Girl', 'girl']
    }
    
    data = []
    
    for i in range(n_customers):
        # Select region and country
        region = random.choice(list(regions.keys()))
        country = random.choice(regions[region]['countries'])
        
        # Base churn probability for this region
        base_churn_rate = regions[region]['churn_base_rate']
        
        # Generate customer data with intentional messiness
        customer = {}
        
        # Customer ID with various formats and some missing
        if random.random() < 0.05:  # 5% missing customer IDs
            customer['CustomerId'] = random.choice(missing_values)
        else:
            id_formats = [
                f"CUST_{i+1000:06d}",
                f"C{i+1000}",
                f"{country[:2].upper()}{i+1000:05d}",
                f"ID-{i+1000}",
                str(i+1000)
            ]
            customer['CustomerId'] = random.choice(id_formats)
        
        # Customer Name with various issues
        if random.random() < 0.03:  # 3% missing names
            customer['CustomerName'] = random.choice(missing_values)
        else:
            first_names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Maria']
            last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
            name_formats = [
                f"{random.choice(first_names)} {random.choice(last_names)}",
                f"{random.choice(first_names).upper()} {random.choice(last_names).upper()}",
                f"{random.choice(first_names).lower()} {random.choice(last_names).lower()}",
                f" {random.choice(first_names)} {random.choice(last_names)} ",  # Extra spaces
                f"{random.choice(first_names)},{random.choice(last_names)}",  # Wrong separator
            ]
            customer['CustomerName'] = random.choice(name_formats)
        
        # Credit Score with various issues
        if random.random() < 0.08:  # 8% missing/invalid credit scores
            customer['CreditScore'] = random.choice(missing_values)
        elif random.random() < 0.05:  # 5% extreme outliers
            customer['CreditScore'] = random.choice([0, 999, 1200, -100, 9999])
        else:
            base_score = np.random.normal(
                (regions[region]['credit_range'][0] + regions[region]['credit_range'][1]) / 2,
                50
            )
            customer['CreditScore'] = max(regions[region]['credit_range'][0], 
                                        min(regions[region]['credit_range'][1], int(base_score)))
        
        # Geography with inconsistent formatting
        if random.random() < 0.02:  # 2% missing geography
            customer['Geography'] = random.choice(missing_values)
        else:
            geo_formats = [
                country,
                country.upper(),
                country.lower(),
                f" {country} ",  # Extra spaces
                f"{country} ",   # Trailing space
                f" {country}",   # Leading space
            ]
            customer['Geography'] = random.choice(geo_formats)
        
        # Gender with many variations
        if random.random() < 0.04:  # 4% missing gender
            customer['Gender'] = random.choice(missing_values)
        else:
            true_gender = random.choice(['Male', 'Female'])
            customer['Gender'] = random.choice(gender_variations[true_gender])
        
        # Age with various issues
        if random.random() < 0.06:  # 6% missing ages
            customer['Age'] = random.choice(missing_values)
        elif random.random() < 0.03:  # 3% unrealistic ages
            customer['Age'] = random.choice([0, 150, 200, -5, 999])
        else:
            # Age distribution varies by region
            if region == 'Asia Pacific':
                age = np.random.normal(35, 12)
            elif region == 'Europe':
                age = np.random.normal(42, 15)
            else:
                age = np.random.normal(38, 13)
            customer['Age'] = max(18, min(85, int(age)))
        
        # Tenure with some issues
        if random.random() < 0.05:  # 5% missing tenure
            customer['Tenure'] = random.choice(missing_values)
        elif random.random() < 0.02:  # 2% negative tenure
            customer['Tenure'] = random.choice([-1, -5, -10])
        else:
            customer['Tenure'] = np.random.poisson(5)
        
        # Balance with various formats and issues
        if random.random() < 0.07:  # 7% missing balance
            customer['Balance'] = random.choice(missing_values)
        elif random.random() < 0.03:  # 3% extreme values
            customer['Balance'] = random.choice([999999999, -50000, 0])
        else:
            # Balance influenced by region and other factors
            base_balance = np.random.exponential(50000)
            if random.random() < 0.1:  # 10% formatted as strings with currency
                customer['Balance'] = f"${base_balance:,.2f}"
            elif random.random() < 0.05:  # 5% with commas
                customer['Balance'] = f"{base_balance:,.2f}"
            else:
                customer['Balance'] = round(base_balance, 2)
        
        # Number of Products with issues
        if random.random() < 0.04:  # 4% missing
            customer['NumOfProducts'] = random.choice(missing_values)
        elif random.random() < 0.02:  # 2% unrealistic values
            customer['NumOfProducts'] = random.choice([0, 10, 50, -1])
        else:
            customer['NumOfProducts'] = np.random.choice([1, 2, 3, 4], p=[0.3, 0.4, 0.2, 0.1])
        
        # Has Credit Card (boolean with various representations)
        if random.random() < 0.05:  # 5% missing
            customer['HasCrCard'] = random.choice(missing_values)
        else:
            has_card = random.choice([True, False])
            if random.random() < 0.3:  # 30% various boolean representations
                bool_representations = {
                    True: [1, '1', 'True', 'TRUE', 'true', 'Yes', 'YES', 'yes', 'Y', 'y'],
                    False: [0, '0', 'False', 'FALSE', 'false', 'No', 'NO', 'no', 'N', 'n']
                }
                customer['HasCrCard'] = random.choice(bool_representations[has_card])
            else:
                customer['HasCrCard'] = 1 if has_card else 0
        
        # Is Active Member (similar boolean issues)
        if random.random() < 0.05:  # 5% missing
            customer['IsActiveMember'] = random.choice(missing_values)
        else:
            is_active = random.choice([True, False])
            if random.random() < 0.3:  # 30% various boolean representations
                bool_representations = {
                    True: [1, '1', 'True', 'TRUE', 'true', 'Active', 'ACTIVE', 'active'],
                    False: [0, '0', 'False', 'FALSE', 'false', 'Inactive', 'INACTIVE', 'inactive']
                }
                customer['IsActiveMember'] = random.choice(bool_representations[is_active])
            else:
                customer['IsActiveMember'] = 1 if is_active else 0
        
        # Estimated Salary with various issues
        if random.random() < 0.09:  # 9% missing salary
            customer['EstimatedSalary'] = random.choice(missing_values)
        elif random.random() < 0.03:  # 3% extreme values
            customer['EstimatedSalary'] = random.choice([0, 9999999, -10000])
        else:
            salary_range = regions[region]['salary_range']
            salary = np.random.uniform(salary_range[0], salary_range[1])
            if random.random() < 0.1:  # 10% formatted as strings
                customer['EstimatedSalary'] = f"${salary:,.0f}"
            elif random.random() < 0.05:  # 5% with decimals
                customer['EstimatedSalary'] = f"{salary:.2f}"
            else:
                customer['EstimatedSalary'] = round(salary, 0)
        
        # Calculate churn probability based on various factors
        churn_prob = base_churn_rate
        
        # Adjust based on customer characteristics
        try:
            age = float(customer.get('Age', 40))
            if age > 60 or age < 25:
                churn_prob += 0.05
        except:
            pass
        
        try:
            tenure = float(customer.get('Tenure', 5))
            if tenure < 2:
                churn_prob += 0.1
            elif tenure > 8:
                churn_prob -= 0.05
        except:
            pass
        
        try:
            num_products = float(customer.get('NumOfProducts', 2))
            if num_products == 1:
                churn_prob += 0.08
            elif num_products > 3:
                churn_prob += 0.12
        except:
            pass
        
        # Generate churn outcome
        customer['Exited'] = 1 if random.random() < churn_prob else 0
        
        # Add some additional messy columns that shouldn't be there
        if random.random() < 0.1:  # 10% have extra columns
            customer['ExtraColumn1'] = random.choice(['A', 'B', 'C', '', np.nan])
            customer['ExtraColumn2'] = random.choice([123, 456, np.nan, ''])
        
        data.append(customer)
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Add some completely empty rows
    empty_rows = pd.DataFrame([{col: np.nan for col in df.columns} for _ in range(10)])
    df = pd.concat([df, empty_rows], ignore_index=True)
    
    # Add some duplicate rows
    duplicate_indices = np.random.choice(df.index, size=50, replace=False)
    duplicate_rows = df.loc[duplicate_indices].copy()
    df = pd.concat([df, duplicate_rows], ignore_index=True)
    
    # Shuffle the DataFrame
    df = df.sample(frac=1).reset_index(drop=True)
    
    return df

def add_encoding_issues(df):
    """Add character encoding issues to simulate real-world data problems"""
    
    # Add some special characters and encoding issues
    problematic_chars = ['é', 'ñ', 'ü', 'ç', 'ø', '€', '£', '¥', '©', '®', '™']
    
    for idx in df.index:
        if random.random() < 0.05:  # 5% chance of encoding issues
            if 'CustomerName' in df.columns and pd.notna(df.loc[idx, 'CustomerName']):
                name = str(df.loc[idx, 'CustomerName'])
                if len(name) > 3:
                    # Insert random special character
                    pos = random.randint(1, len(name)-1)
                    char = random.choice(problematic_chars)
                    df.loc[idx, 'CustomerName'] = name[:pos] + char + name[pos:]
    
    return df

def main():
    """Generate and save the messy churn dataset"""
    
    print("Generating messy churn dataset for testing...")
    
    # Generate the dataset
    df = generate_messy_churn_dataset(n_customers=2000)
    
    # Add encoding issues
    df = add_encoding_issues(df)
    
    # Save to CSV
    output_file = "datasets/Messy_Churn_Dataset.csv"
    df.to_csv(output_file, index=False)
    
    print(f"Dataset generated and saved to: {output_file}")
    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    
    # Print some statistics about the messiness
    print("\n=== DATA QUALITY ISSUES SUMMARY ===")
    
    total_cells = df.shape[0] * df.shape[1]
    missing_cells = df.isnull().sum().sum()
    
    print(f"Total cells: {total_cells:,}")
    print(f"Missing cells: {missing_cells:,}")
    print(f"Missing percentage: {missing_cells/total_cells*100:.1f}%")
    
    print(f"\nChurn distribution:")
    print(df['Exited'].value_counts())
    
    print(f"\nGeography distribution (top 10):")
    print(df['Geography'].value_counts().head(10))
    
    print(f"\nGender variations:")
    print(df['Gender'].value_counts())
    
    print(f"\nCredit Score data types:")
    print(df['CreditScore'].apply(type).value_counts())
    
    print(f"\nBalance data types:")
    print(df['Balance'].apply(type).value_counts())
    
    print("\nDataset ready for testing enhanced data quality features!")

if __name__ == "__main__":
    main() 