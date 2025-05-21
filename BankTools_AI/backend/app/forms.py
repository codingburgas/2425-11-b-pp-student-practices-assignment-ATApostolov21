from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, SelectField, FloatField, IntegerField, FileField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError, NumberRange
from app.models import User, UserRole


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email(), Length(1, 64)])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Keep me logged in')
    submit = SubmitField('Log In')


class RegistrationForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email(), Length(1, 64)])
    username = StringField('Username', validators=[DataRequired(), Length(3, 64)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    password2 = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password', message='Passwords must match.')])
    role = SelectField('Role', choices=[(role.value, role.name.replace('_', ' ').title()) for role in UserRole], validators=[DataRequired()])
    submit = SubmitField('Register')
    
    def validate_email(self, field):
        if User.query.filter_by(email=field.data).first():
            raise ValidationError('Email already registered.')
    
    def validate_username(self, field):
        if User.query.filter_by(username=field.data).first():
            raise ValidationError('Username already in use.')


class PasswordResetRequestForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email(), Length(1, 64)])
    submit = SubmitField('Reset Password')


class PasswordResetForm(FlaskForm):
    password = PasswordField('New Password', validators=[DataRequired(), Length(min=8)])
    password2 = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password', message='Passwords must match.')])
    submit = SubmitField('Reset Password')


class LoanPredictionForm(FlaskForm):
    loan_amount = FloatField('Loan Amount ($)', validators=[DataRequired(), NumberRange(min=1000, max=1000000)])
    loan_term = IntegerField('Loan Term (months)', validators=[DataRequired(), NumberRange(min=6, max=360)])
    credit_score = IntegerField('Credit Score', validators=[DataRequired(), NumberRange(min=300, max=850)])
    annual_income = FloatField('Annual Income ($)', validators=[DataRequired(), NumberRange(min=10000)])
    employment_years = FloatField('Years of Employment', validators=[DataRequired(), NumberRange(min=0)])
    debt_to_income = FloatField('Debt-to-Income Ratio (%)', validators=[DataRequired(), NumberRange(min=0, max=100)])
    submit = SubmitField('Get Prediction')


class ChurnDataUploadForm(FlaskForm):
    dataset_name = StringField('Dataset Name', validators=[DataRequired(), Length(1, 128)])
    file = FileField('CSV File', validators=[DataRequired()])
    submit = SubmitField('Upload Dataset') 