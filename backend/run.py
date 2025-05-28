from app import create_app, db
from app.models import User, LoanRequest, ChurnAnalysis

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'LoanRequest': LoanRequest,
        'ChurnAnalysis': ChurnAnalysis
    }

if __name__ == '__main__':
    app.run(debug=True, port=5001) 