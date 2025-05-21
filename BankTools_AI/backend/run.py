import os
from app import create_app, db
from app.models import User, LoanPrediction, ChurnData, ChurnPrediction, Token, UserRole
from flask_migrate import Migrate

# Create app with environment-specific config
app = create_app(os.getenv('FLASK_CONFIG') or 'default')
migrate = Migrate(app, db)


@app.shell_context_processor
def make_shell_context():
    """
    Add database models to the Flask shell context.
    This allows easier testing and debugging in the shell.
    """
    return {
        'db': db, 
        'User': User, 
        'LoanPrediction': LoanPrediction,
        'ChurnData': ChurnData, 
        'ChurnPrediction': ChurnPrediction, 
        'Token': Token,
        'UserRole': UserRole
    }


@app.cli.command('init-db')
def init_db_command():
    """
    Initialize the database for the application.
    """
    db.create_all()
    print('Initialized the database.')


@app.cli.command('create-admin')
def create_admin():
    """
    Create an admin user for the application.
    """
    # Check if admin already exists
    admin = User.query.filter_by(role=UserRole.ADMIN).first()
    if admin:
        print('Admin user already exists.')
        return
    
    # Create admin user
    admin = User(
        username='admin',
        email='admin@banktools.ai',
        role=UserRole.ADMIN,
        confirmed=True
    )
    admin.password = 'adminpassword'
    db.session.add(admin)
    db.session.commit()
    
    print('Admin user created successfully.')


@app.cli.command('create-test-users')
def create_test_users():
    """
    Create test users for development and testing.
    """
    # Create a banking user
    bu = User.query.filter_by(email='bu@banktools.ai').first()
    if not bu:
        bu = User(
            username='bankinguser',
            email='bu@banktools.ai',
            role=UserRole.BANKING_USER,
            confirmed=True
        )
        bu.password = 'password'
        db.session.add(bu)
        
    # Create a banking employee
    be = User.query.filter_by(email='be@banktools.ai').first()
    if not be:
        be = User(
            username='bankingemp',
            email='be@banktools.ai',
            role=UserRole.BANKING_EMPLOYEE,
            confirmed=True
        )
        be.password = 'password'
        db.session.add(be)
    
    db.session.commit()
    print('Test users created successfully.')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 