import sys
import os

# ============================================
# cPanel Python App Entry Point
# FastAPI(ASGI) → WSGI 변환
# ============================================

# Python path setup
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.insert(0, BACKEND_DIR)

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Import FastAPI app
from main import app as fastapi_app

# ASGI → WSGI 변환 (cPanel/LiteSpeed 호환)
try:
    from asgiref.wsgi import WsgiToAsgi
    # If asgiref is available, we might be in ASGI mode already
    application = fastapi_app
except ImportError:
    pass

# Method 1: Use a2wsgi (lightweight ASGI-to-WSGI adapter)
try:
    from a2wsgi import ASGIMiddleware
    application = ASGIMiddleware(fastapi_app)
except ImportError:
    pass

# Method 2: If a2wsgi not available, try uvicorn's WSGI wrapper
if 'application' not in dir() or application is fastapi_app:
    try:
        from a2wsgi import ASGIMiddleware
        application = ASGIMiddleware(fastapi_app)
    except ImportError:
        # Fallback: direct ASGI app (works if server supports it)
        application = fastapi_app
