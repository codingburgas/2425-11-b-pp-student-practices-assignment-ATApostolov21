from app import create_app, db
from app.models import User

def confirm_all_users():
    """
    Set the confirmed flag to True for all users in the database
    """
    app = create_app()
    with app.app_context():
        # List all users before update
        all_users = User.query.all()
        print(f"Found {len(all_users)} users:")
        for user in all_users:
            print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Role: {user.role}, Confirmed: {user.confirmed}")
        
        # Update unconfirmed users
        unconfirmed_users = User.query.filter_by(confirmed=False).all()
        
        if unconfirmed_users:
            for user in unconfirmed_users:
                user.confirmed = True
                print(f"Confirming user: {user.username} ({user.email})")
            
            # Commit changes
            db.session.commit()
            print(f"Confirmed {len(unconfirmed_users)} users")
        else:
            print("No unconfirmed users found")
        
        # List all users after update
        print("\nUser status after update:")
        for user in User.query.all():
            print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Role: {user.role}, Confirmed: {user.confirmed}")

if __name__ == "__main__":
    confirm_all_users() 