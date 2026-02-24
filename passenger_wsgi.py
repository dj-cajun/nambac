import sys
import os

# cPanel Passenger WSGI Entry Point for FastAPI
# 이 파일은 cPanel의 public_html 상위 디렉토리에 위치해야 합니다

# Python path setup
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.insert(0, BACKEND_DIR)

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Import FastAPI app
from main import app

# Passenger expects 'application' variable
application = app
