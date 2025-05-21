import unittest
from flask import current_app
from app import create_app, db
from app.models import User, UserRole


class BasicTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        
    def test_app_exists(self):
        self.assertIsNotNone(current_app)
        
    def test_app_is_testing(self):
        self.assertTrue(current_app.config['TESTING'])
        
    def test_user_model(self):
        # Test user creation
        user = User(email='test@example.com', username='test', role=UserRole.BANKING_USER)
        user.password = 'password'
        db.session.add(user)
        db.session.commit()
        
        # Test user retrieval
        retrieved_user = User.query.filter_by(email='test@example.com').first()
        self.assertIsNotNone(retrieved_user)
        self.assertEqual(retrieved_user.username, 'test')
        self.assertEqual(retrieved_user.role, UserRole.BANKING_USER)
        
        # Test password verification
        self.assertTrue(retrieved_user.verify_password('password'))
        self.assertFalse(retrieved_user.verify_password('wrong_password'))
        
    def test_user_roles(self):
        # Test banking user role
        bu = User(email='bu@example.com', username='bu', role=UserRole.BANKING_USER)
        self.assertTrue(bu.is_banking_user())
        self.assertFalse(bu.is_banking_employee())
        self.assertFalse(bu.is_admin())
        
        # Test banking employee role
        be = User(email='be@example.com', username='be', role=UserRole.BANKING_EMPLOYEE)
        self.assertFalse(be.is_banking_user())
        self.assertTrue(be.is_banking_employee())
        self.assertFalse(be.is_admin())
        
        # Test admin role
        admin = User(email='admin@example.com', username='admin', role=UserRole.ADMIN)
        self.assertFalse(admin.is_banking_user())
        self.assertFalse(admin.is_banking_employee())
        self.assertTrue(admin.is_admin())


if __name__ == '__main__':
    unittest.main() 