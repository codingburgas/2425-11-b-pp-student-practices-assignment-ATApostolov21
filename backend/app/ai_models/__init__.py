from flask import Blueprint

bp = Blueprint('ai_models', __name__)

from app.ai_models import routes 