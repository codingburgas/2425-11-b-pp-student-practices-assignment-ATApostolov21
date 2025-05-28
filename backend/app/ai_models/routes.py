from flask import jsonify
from app.ai_models import bp

@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'AI models service is running'
    }) 