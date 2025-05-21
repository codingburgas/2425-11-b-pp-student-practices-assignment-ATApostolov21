from app import create_app, db
from app.models import User, Token

def delete_custom_users():
    """
    Delete all user accounts except the default ones (admin, bankinguser, bankingemp)
    """
    app = create_app()
    with app.app_context():
        # Keep only the default users 
        default_usernames = ['admin', 'bankinguser', 'bankingemp']
        
        # List all users before deletion
        all_users = User.query.all()
        print(f"Found {len(all_users)} users before deletion:")
        for user in all_users:
            print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Role: {user.role}")
        
        # Delete tokens first (foreign key constraints)
        users_to_delete = User.query.filter(~User.username.in_(default_usernames)).all()
        user_ids = [user.id for user in users_to_delete]
        
        if user_ids:
            # Delete tokens
            tokens_deleted = Token.query.filter(Token.user_id.in_(user_ids)).delete(synchronize_session=False)
            print(f"Deleted {tokens_deleted} tokens")
            
            # Delete users
            users_deleted = User.query.filter(~User.username.in_(default_usernames)).delete(synchronize_session=False)
            print(f"Deleted {users_deleted} custom user accounts")
            
            # Commit changes
            db.session.commit()
        else:
            print("No custom users found to delete")
        
        # List all users after deletion
        remaining_users = User.query.all()
        print(f"\nRemaining {len(remaining_users)} users:")
        for user in remaining_users:
            print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Role: {user.role}")

if __name__ == "__main__":
    delete_custom_users()