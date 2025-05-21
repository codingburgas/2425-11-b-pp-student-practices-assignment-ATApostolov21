import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_mail import Mail
from flask_cors import CORS

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
mail = Mail()

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Configure the app
    from app.config import config
    app.config.from_object(config[config_name])
    
    # Enable CORS for connecting with React frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    mail.init_app(app)
    
    # Configure login manager
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'
    
    # Register blueprints
    from app.auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/api/auth')
    
    from app.user import user as user_blueprint
    app.register_blueprint(user_blueprint, url_prefix='/api/user')
    
    from app.admin import admin as admin_blueprint
    app.register_blueprint(admin_blueprint, url_prefix='/api/admin')
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy'}
    
    return app 