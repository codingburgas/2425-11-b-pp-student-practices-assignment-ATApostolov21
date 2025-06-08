from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    
    # Configure LoginManager
    login_manager.login_view = None  # Disable automatic redirects for API
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'
    login_manager.session_protection = 'strong'
    
    # Custom unauthorized handler for API responses
    @login_manager.unauthorized_handler
    def unauthorized():
        from flask import request, jsonify
        if request.path.startswith('/api') or request.path.startswith('/admin') or request.path.startswith('/user'):
            return jsonify({'error': 'Authentication required', 'message': 'Please log in to access this resource'}), 401
        else:
            return jsonify({'error': 'Authentication required'}), 401
    
    mail.init_app(app)
    migrate.init_app(app, db)
    CORS(app, 
         origins=['http://localhost:5173', 'http://localhost:5174'],
         supports_credentials=True,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'])
    
    # Register blueprints
    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    from app.user import bp as user_bp
    app.register_blueprint(user_bp, url_prefix='/api/user')
    
    from app.admin import bp as admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Register AI models blueprint
    from app.ai_models import create_blueprint
    ai_models_bp = create_blueprint()
    app.register_blueprint(ai_models_bp, url_prefix='/api')
    
    @login_manager.user_loader
    def load_user(id):
        from app.models import User
        return User.query.get(int(id))
    
    # Load AI models after app context is available
    with app.app_context():
        try:
            from app.ai_models.routes import load_models
            load_models()
        except Exception as e:
            print(f"Warning: Could not load AI models: {str(e)}")
    
    return app 