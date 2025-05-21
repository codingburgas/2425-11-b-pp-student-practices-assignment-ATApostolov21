from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import db, login_manager
import uuid
import enum


class UserRole(enum.Enum):
    BANKING_USER = "banking_user"
    BANKING_EMPLOYEE = "banking_employee"
    ADMIN = "admin"


# User model
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(64), unique=True, index=True)
    username = db.Column(db.String(64), unique=True, index=True)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.Enum(UserRole), default=UserRole.BANKING_USER)
    confirmed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    loan_predictions = db.relationship('LoanPrediction', backref='user', lazy='dynamic')
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_banking_user(self):
        return self.role == UserRole.BANKING_USER
    
    def is_banking_employee(self):
        return self.role == UserRole.BANKING_EMPLOYEE
    
    def is_admin(self):
        return self.role == UserRole.ADMIN
    
    def generate_confirmation_token(self):
        return str(uuid.uuid4())
    
    def __repr__(self):
        return f'<User {self.username}>'


# Loan prediction model for Banking Users
class LoanPrediction(db.Model):
    __tablename__ = 'loan_predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Loan application data
    loan_amount = db.Column(db.Float, nullable=False)
    loan_term = db.Column(db.Integer, nullable=False)  # in months
    credit_score = db.Column(db.Integer, nullable=False)
    annual_income = db.Column(db.Float, nullable=False)
    employment_years = db.Column(db.Float, nullable=False)
    debt_to_income = db.Column(db.Float, nullable=False)
    
    # Prediction result
    approved = db.Column(db.Boolean, nullable=True)
    approval_probability = db.Column(db.Float, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<LoanPrediction {self.id} - User {self.user_id}>'


# Customer churn prediction data for Banking Employees
class ChurnData(db.Model):
    __tablename__ = 'churn_data'
    
    id = db.Column(db.Integer, primary_key=True)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    dataset_name = db.Column(db.String(128), nullable=False)
    file_path = db.Column(db.String(256), nullable=False)
    row_count = db.Column(db.Integer, nullable=False)
    processed = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    predictions = db.relationship('ChurnPrediction', backref='dataset', lazy='dynamic')
    uploader = db.relationship('User', foreign_keys=[uploaded_by], backref='uploaded_datasets')
    
    def __repr__(self):
        return f'<ChurnData {self.dataset_name}>'


# Churn prediction results
class ChurnPrediction(db.Model):
    __tablename__ = 'churn_predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    dataset_id = db.Column(db.Integer, db.ForeignKey('churn_data.id'))
    
    customer_id = db.Column(db.String(64), nullable=False)
    churn_probability = db.Column(db.Float, nullable=False)
    will_churn = db.Column(db.Boolean, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ChurnPrediction {self.id} - Customer {self.customer_id}>'


# Token model for email confirmation
class Token(db.Model):
    __tablename__ = 'tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(64), unique=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    type = db.Column(db.String(20), default='confirmation')  # confirmation, reset, etc.
    expiration = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='tokens')
    
    def __repr__(self):
        return f'<Token {self.token}>'


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id)) 