# 🎯 BankTools AI - User Interface Guide

## Quick Start: What You Need to Know

BankTools AI has **two different tools** for different types of users:

---

## 💰 **Loan Applications** (For Customers)

### Who Can Use This?
- Any customer with a `banking_user` account
- Public customers applying for loans

### What You Need to Fill Out
Just **6 simple fields** in an online form:

| Field | What to Enter | Example |
|-------|---------------|---------|
| **Application Name** | Give your loan a name | "Home Purchase Loan 2025" |
| **Loan Amount** | How much money you need | $250,000 |
| **Loan Purpose** | What's the money for? | "Home Purchase" (from dropdown) |
| **Annual Income** | Your yearly income | $85,000 |
| **Years Employed** | How long at current job | 3.5 years |
| **Credit Score** | Your credit score | 740 |

### What Happens Next?
1. ⚡ **Instant Decision**: Get approved/rejected in 2 seconds
2. 📊 **Confidence Level**: See how confident the AI is (85-99%)
3. 💡 **Explanation**: Understand why you got approved/rejected
4. 📋 **Next Steps**: Clear instructions on what to do next

### Example Result:
```
✅ APPROVED with Very High Confidence (97%)

Risk Factors:
• Credit Score: 740 - Excellent ✅
• Income Level: $85,000 - High ✅
• Employment: 3.5 years - Good ✅
• Debt-to-Income: 23% - Low Risk ✅

Next Steps: Contact our loan specialist at...
```

---

## 📊 **Churn Analysis** (For Banking Employees Only)

### Who Can Use This?
- Banking employees with `banking_employee` accounts
- Risk management teams
- Customer retention specialists

### What You Need to Upload
A **CSV file** with customer data containing these **exact column names**:

```
Required Columns (must match exactly):
✅ CreditScore        - 300 to 850
✅ Geography          - France, Germany, or Spain  
✅ Gender             - Male or Female
✅ Age                - 18 to 100 years
✅ Tenure             - Years as customer (0-50)
✅ Balance            - Account balance in dollars
✅ NumOfProducts      - 1, 2, 3, or 4 products
✅ HasCrCard          - 0 (No) or 1 (Yes)
✅ IsActiveMember     - 0 (Inactive) or 1 (Active)
✅ EstimatedSalary    - Annual salary in dollars

Optional Columns:
• CustomerName        - Customer display name
• CustomerId          - Unique ID for tracking
```

### Sample CSV Format:
```csv
CreditScore,Geography,Gender,Age,Tenure,Balance,NumOfProducts,HasCrCard,IsActiveMember,EstimatedSalary,CustomerName
720,France,Male,35,5,50000,2,1,1,75000,John Smith
650,Germany,Female,42,8,125000,3,1,0,95000,Jane Doe
580,Spain,Male,28,2,0,1,0,1,45000,Bob Johnson
```

### What You Get Back:
1. 📈 **Summary Dashboard**: Total customers, risk breakdown, key metrics
2. 🗺️ **Geographic Analysis**: Which regions have higher churn risk
3. ⚠️ **High-Risk Customers**: List of customers who need immediate attention
4. 💡 **AI Insights**: What factors actually drive customer churn
5. 📊 **Detailed Table**: Every customer with their individual risk score
6. 📄 **Downloadable Report**: PDF/CSV for presentations

### Example Analysis Result:
```
📊 CHURN ANALYSIS COMPLETE

Summary:
• 2,500 customers analyzed
• 127 high-risk customers (5.1%) - Contact immediately
• 445 medium-risk customers (17.8%) - Monitor closely
• Average churn risk: 13.9%

Top Risk Factors (Real AI Analysis):
1. Account Balance (23% impact) - Low balance = higher risk
2. Product Portfolio (19% impact) - Fewer products = higher risk  
3. Customer Activity (17% impact) - Inactive = higher risk
4. Age Demographics (15% impact) - Certain age groups at risk
```

---

## 🔑 **Access & Permissions**

| User Type | Loan Applications | Churn Analysis |
|-----------|-------------------|----------------|
| **Public Customer** | ❌ No access | ❌ No access |
| **Banking User** | ✅ Can apply | ❌ No access |
| **Banking Employee** | ❌ View only | ✅ Full access |

---

## 🚨 **Common Issues & Solutions**

### Loan Application Issues:
- **"Please fill in this field"** → All 6 fields are required
- **"Credit score must be 300-850"** → Enter a valid credit score
- **"Unauthorized access"** → Make sure you're logged in as banking_user

### Churn Analysis Issues:
- **"Missing required columns"** → Check CSV has exact column names listed above
- **"No file selected"** → Must upload a .csv file
- **"Unauthorized access"** → Need banking_employee account
- **"Invalid file type"** → Only .csv files accepted, not .xlsx or .txt

---

## 📞 **Need Help?**

- **Technical Issues**: Contact IT support
- **Loan Questions**: Contact loan specialists  
- **Churn Analysis Training**: Contact risk management team
- **Account Access**: Contact system administrator

---

*Last Updated: June 2025*  
*Platform Version: BankTools AI v2.1* 