from flask import Flask
import secrets

def create_app():
    app = Flask(__name__)
    app.secret_key = secrets.token_hex(16)
    
    # Register blueprints
    from .api import api_routes
    from .main import main_routes
    
    app.register_blueprint(api_routes.bp)
    app.register_blueprint(main_routes.bp)
    
    return app