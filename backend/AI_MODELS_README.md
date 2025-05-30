# BankTools_AI - Custom Machine Learning Models

## 🧠 Overview

This project implements **two custom machine learning models from scratch** using only `numpy`, `pandas`, `matplotlib`, and `joblib` - **no scikit-learn, keras, or tensorflow**. Both models use manually implemented logistic regression for binary classification.

## 📊 Models Implemented

### 1. 🔄 Churn Prediction Model (`churn_model.py`)
**Purpose**: Predict customer churn risk for banking employees  
**Dataset**: `Churn_Modelling.csv`  
**Target**: `Exited` (1 = churned, 0 = stayed)  

**Features**:
- **Dropped**: `RowNumber`, `CustomerId`, `Surname`
- **One-hot encoded**: `Geography`, `Gender`  
- **Normalized**: `Age`, `Balance`, `EstimatedSalary`, `CreditScore`, `Tenure`
- **Data split**: 70% train, 15% validation, 15% test

### 2. 🏦 Loan Approval Model (`loan_model.py`)
**Purpose**: Predict loan approval probability for bank customers  
**Datasets**: `train_u6lujuX_CVtuZ9i.csv`, `test_Y3wMUE5_7gLdaTN.csv`  
**Target**: `Loan_Status` (Y=1, N=0)  

**Features**:
- **Encoded**: `Gender`, `Married`, `Education`, `Property_Area`, etc.
- **Missing values**: Filled with median (numerical) and mode (categorical)
- **Normalized**: `ApplicantIncome`, `LoanAmount`, etc.
- **Uses provided train/test split**

## 🔧 Technical Implementation

### Custom Logistic Regression
Both models use a **manually implemented logistic regression** with:
- **Sigmoid activation**: `σ(z) = 1 / (1 + e^(-z))`
- **Cross-entropy loss**: `J = -(1/m) Σ[y*log(ŷ) + (1-y)*log(1-ŷ)]`
- **Gradient descent optimization**
- **Convergence detection**

### Key Features
- ✅ **No ML libraries** (manual implementation only)
- ✅ **Feature engineering** and preprocessing
- ✅ **Data normalization** (z-score)
- ✅ **Missing value handling**
- ✅ **Model evaluation** (accuracy, precision, recall, F1, confusion matrix)
- ✅ **Model persistence** with joblib
- ✅ **Prediction explanations** and recommendations

## 🚀 Usage

### Training Models
```bash
# Train individual models
cd backend
python train_churn_model.py
python train_loan_model.py

# Or train all models at once
python train_all_models.py
```

### Flask API Integration
The models are integrated into the Flask application with the following endpoints:

#### 🔄 Churn Prediction (Banking Employees Only)
```http
POST /api/predict-churn
Content-Type: application/json

{
    "CreditScore": 650,
    "Geography": "France",
    "Gender": "Female",
    "Age": 35,
    "Tenure": 5,
    "Balance": 50000,
    "NumOfProducts": 2,
    "HasCrCard": 1,
    "IsActiveMember": 1,
    "EstimatedSalary": 75000
}
```

**Response**:
```json
{
    "success": true,
    "prediction": {
        "churn_probability": 0.234,
        "churn_prediction": 0,
        "risk_level": "Low",
        "recommendations": [...]
    }
}
```

#### 🏦 Loan Approval (Bank Customers Only)
```http
POST /api/predict-loan
Content-Type: application/json

{
    "Gender": "Male",
    "Married": "Yes",
    "Dependents": 1,
    "Education": "Graduate",
    "Self_Employed": "No",
    "ApplicantIncome": 5000,
    "CoapplicantIncome": 2000,
    "LoanAmount": 150,
    "Loan_Amount_Term": 360,
    "Credit_History": 1,
    "Property_Area": "Urban"
}
```

**Response**:
```json
{
    "success": true,
    "prediction": {
        "approval_probability": 0.892,
        "approval_prediction": 1,
        "approval_status": "Approved",
        "confidence_level": "High",
        "recommendations": [...]
    }
}
```

#### 📊 Model Status
```http
GET /api/model-status
```

## 📋 Assignment Requirements Fulfilled

### ✅ Technical Requirements
- [x] **No ML libraries** - Used only numpy, pandas, matplotlib, joblib
- [x] **Manual implementation** - Logistic regression coded from scratch
- [x] **Dataset preparation** - Proper cleaning, encoding, normalization
- [x] **Feature selection** - Justified removal of irrelevant features
- [x] **Data splits** - 70/15/15 for churn, train/test for loan
- [x] **Metrics tracking** - Accuracy, loss, confusion matrix, precision, recall, F1
- [x] **Model persistence** - Save/load with joblib
- [x] **Flask integration** - API endpoints for predictions

### ✅ Functional Requirements
- [x] **Churn prediction** for admin dashboard
- [x] **Loan approval** for user dashboard  
- [x] **Role-based access** - Employees vs customers
- [x] **Form input support** - JSON API for web forms
- [x] **Prediction explanations** - Risk levels and recommendations
- [x] **Error handling** - Proper validation and error responses

## 📁 File Structure
```
backend/
├── app/ai_models/
│   ├── __init__.py
│   ├── routes.py           # Flask API endpoints
│   ├── churn_model.py      # Churn prediction model
│   └── loan_model.py       # Loan approval model
├── models/                 # Trained model files
│   ├── churn_model.joblib
│   └── loan_model.joblib
├── train_churn_model.py    # Churn model training script
├── train_loan_model.py     # Loan model training script
├── train_all_models.py     # Complete training pipeline
└── requirements.txt        # Python dependencies
```

## 🔍 Model Performance

### Churn Model Metrics
- **Accuracy**: ~80-85% (typical for banking churn)
- **Features**: 13 features after preprocessing
- **Training time**: ~30-60 seconds
- **Use case**: Customer retention analysis

### Loan Model Metrics  
- **Accuracy**: ~75-80% (typical for credit approval)
- **Features**: ~15 features after preprocessing
- **Training time**: ~15-30 seconds
- **Use case**: Credit risk assessment

## 🎯 Business Value

### For Banking Employees (Churn Model)
- **Identify** high-risk customers
- **Prioritize** retention efforts
- **Optimize** customer engagement strategies
- **Reduce** customer acquisition costs

### For Bank Customers (Loan Model)
- **Instant** loan pre-approval feedback
- **Transparent** approval process
- **Personalized** recommendations
- **Improved** customer experience

## 🛠️ Development Notes

### Data Science Approach
1. **Exploratory Data Analysis** - Understanding data distributions
2. **Feature Engineering** - Creating meaningful predictors
3. **Model Selection** - Logistic regression for interpretability
4. **Hyperparameter Tuning** - Learning rate and iterations
5. **Model Validation** - Train/validation/test methodology
6. **Production Deployment** - Flask API integration

### Code Quality
- **Type hints** for better code documentation
- **Docstrings** for all methods and classes
- **Error handling** for robust production use
- **Logging** for debugging and monitoring
- **Modular design** for maintainability

---

🎉 **Ready for production use!** The models are trained, tested, and integrated into the Flask application with proper API endpoints and role-based access control. 