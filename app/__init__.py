from flask import Flask
import secrets

def create_app():
    app = Flask(__name__)
    # Generate a secure random secret key
    app.secret_key = secrets.token_hex(16)
    
    from .routes import routes
    app.register_blueprint(routes)
    
    return app