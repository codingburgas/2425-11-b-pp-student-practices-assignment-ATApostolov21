# BankTools_AI - Educational Banking Platform

A modern web application that demonstrates AI-powered banking tools and services, built with Flask (Python) backend and React/TypeScript frontend.

## 🚀 Features

### For Banking Customers
- **AI-Powered Loan Applications**: Submit loan requests with instant AI-powered approval predictions
- **Secure Authentication**: Role-based access control with secure login/registration
- **Modern UI**: Clean, responsive interface built with React and TailwindCSS

### For Banking Employees
- **Customer Churn Analysis**: Upload customer data for AI-powered churn prediction
- **Administrative Dashboard**: Access to banking analytics and customer insights
- **Real-time Processing**: Instant feedback on uploaded data and analysis

## 🛠 Tech Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **Flask-Login** - User session management
- **SQLite** - Database (development)
- **Werkzeug** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Heroicons** - Beautiful icons
- **Axios** - HTTP client

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## 🏃‍♂️ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd banktools-ai
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Initialize the database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Start the Flask server
flask run --port 5001
```

### 3. Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5001

## 👥 Demo Accounts

### Banking Customer
- **Email**: `user@test.com`
- **Password**: `password123`
- **Access**: Loan applications and personal banking features

### Banking Employee  
- **Email**: `employee@test.com`
- **Password**: `password123`
- **Access**: Administrative tools and customer analytics

## 🔄 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### User Features
- `POST /user/loan-request` - Submit loan application

### Admin Features
- `POST /admin/churn-upload` - Upload customer data for churn analysis

### Health Check
- `GET /ai_models/health` - AI models service health check

## 📁 Project Structure

```
banktools-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── config.py
│   │   ├── auth/
│   │   ├── user/
│   │   ├── admin/
│   │   └── ai_models/
│   ├── migrations/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── LoanRequestForm.tsx
│   │   │   └── ChurnAnalysisUpload.tsx
│   │   ├── api/
│   │   ├── types/
│   │   ├── config/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🔐 Security Features

- **Password Hashing**: Secure password storage using Werkzeug
- **Session Management**: Flask-Login for secure user sessions
- **Role-Based Access**: Different features for customers vs employees
- **Input Validation**: Form validation on both frontend and backend
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Professional Landing Page**: Modern hero section with feature highlights
- **Intuitive Navigation**: Role-based navigation menus
- **Form Validation**: Real-time feedback and error handling
- **Loading States**: User feedback during API calls
- **Accessible Design**: Semantic HTML and proper ARIA labels

## 🚧 Development Notes

### Database
- Uses SQLite for development (easy setup)
- Can be configured for PostgreSQL in production
- Includes database migrations for easy deployment

### Environment Configuration
- Backend runs on port 5001
- Frontend runs on port 5174
- API base URL configurable via environment variables

### Mock AI Features
- Loan approval predictions use random logic for demo
- Churn analysis returns mock data for demonstration
- Real AI models can be integrated in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes and demonstrates modern web development practices for banking applications.

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**: Make sure ports 5001 and 5174 are available
2. **Database Issues**: Delete `banktools_ai.db` and re-run migrations
3. **CORS Errors**: Ensure backend CORS is properly configured
4. **Node Modules**: Try deleting `node_modules` and running `npm install`

### Getting Help

- Check the browser console for frontend errors
- Check the Flask console for backend errors
- Ensure all dependencies are properly installed

---

Built with ❤️ for educational purposes to demonstrate modern banking technology solutions. 