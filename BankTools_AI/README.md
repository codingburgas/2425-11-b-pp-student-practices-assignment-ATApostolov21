# BankTools_AI

BankTools_AI is a full-stack AI-powered platform providing banking tools for both banking employees and banking users.

## Features

### For Banking Users (BU)
- Loan approval prediction based on financial data
- Personalized dashboard with loan application history
- Email confirmation and account management

### For Banking Employees (BE)
- Customer churn analysis through dataset uploads
- Visualization of customer churn probability
- Dataset management and batch processing

## Project Structure

The project consists of two main components:

### 1. Frontend (MVP_UI_mockdata)
- Built with React, TypeScript, Tailwind CSS, and Vite
- Responsive UI with role-based views
- Interactive forms for data submission

### 2. Backend
- Flask RESTful API with modular structure using Blueprints
- PostgreSQL database with SQLAlchemy ORM
- Role-based authentication and email confirmation
- Placeholder AI models for loan approval and churn prediction

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL database

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables (create a .env file):
```
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://username:password@localhost/banktools_dev
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
```

5. Initialize the database:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
flask init-db
flask create-admin  # Create admin user
flask create-test-users  # Create test users (optional)
```

6. Run the backend server:
```bash
flask run
# or
python run.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../MVP_UI_mockdata
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file with API URL:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user
- `POST /api/auth/logout` - Log out the current user
- `GET /api/auth/confirm/<token>` - Confirm a user's email
- `POST /api/auth/resend-confirmation` - Resend confirmation email
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password/<token>` - Reset password with token
- `GET /api/auth/profile` - Get current user profile

### Banking User
- `GET /api/user/dashboard` - Get banking user dashboard data
- `POST /api/user/loan-prediction` - Submit loan application for prediction
- `GET /api/user/loan-predictions` - Get user's loan prediction history
- `GET /api/user/loan-prediction/<id>` - Get specific loan prediction

### Banking Employee
- `GET /api/admin/dashboard` - Get banking employee dashboard data
- `POST /api/admin/upload-dataset` - Upload churn dataset
- `GET /api/admin/datasets` - Get employee's uploaded datasets
- `GET /api/admin/dataset/<id>` - Get specific dataset with predictions
- `POST /api/admin/process-dataset/<id>` - Process a dataset

## Development

### Backend Structure
- `app/` - Flask application package
  - `__init__.py` - Application factory
  - `config.py` - Configuration settings
  - `models.py` - Database models
  - `forms.py` - Form validation
  - `email.py` - Email utilities
  - `auth/` - Authentication blueprint
  - `user/` - Banking user blueprint
  - `admin/` - Banking employee blueprint
  - `ai_models/` - AI model implementations
  - `templates/` - Email templates
  - `static/` - Static files

### Testing
Run tests with pytest:
```bash
cd backend
pytest
```

## License
This project is licensed under the MIT License. 