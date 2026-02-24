#!/bin/bash
# ============================================
# Nambac cPanel Deploy Script
# Usage: ./deploy-cpanel.sh
#
# cPanel 서버 구조:
#   ~/nambac/           ← 이 프로젝트 루트
#   ~/public_html/      ← 프론트엔드 빌드 결과물
#   ~/passenger_wsgi.py ← Passenger 진입점 (심볼릭 링크)
# ============================================
set -e

PROJECT_DIR="$HOME/nambac"
PUBLIC_HTML="$HOME/public_html"

echo "🚀 Nambac cPanel Deployment"
echo "==========================="

# 1. Pull latest code
echo "📥 1/6 — Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin main

# 2. Setup Python venv (첫 배포 시에만)
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "📦 2/6 — Installing Python dependencies..."
source venv/bin/activate
pip install -q -r backend/requirements.txt

# 3. Build Frontend
echo "🔨 3/6 — Building frontend..."
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build

# 4. Deploy frontend to public_html
echo "📂 4/6 — Deploying frontend to public_html..."
# Backup current public_html (keep .htaccess, .well-known)
rsync -av --delete \
    --exclude='.htaccess' \
    --exclude='.well-known' \
    --exclude='cgi-bin' \
    dist/ "$PUBLIC_HTML/"

# Copy .htaccess if not exists
if [ ! -f "$PUBLIC_HTML/.htaccess" ]; then
    cp cpanel/.htaccess "$PUBLIC_HTML/.htaccess"
    echo "   ✅ .htaccess copied"
fi

# 5. Setup Passenger WSGI link
echo "🔗 5/6 — Setting up Passenger WSGI..."
if [ ! -f "$HOME/passenger_wsgi.py" ]; then
    ln -sf "$PROJECT_DIR/passenger_wsgi.py" "$HOME/passenger_wsgi.py"
    echo "   ✅ passenger_wsgi.py linked"
fi

# 6. Copy images to public_html for direct serving
echo "🖼️  6/6 — Syncing images..."
mkdir -p "$PUBLIC_HTML/images"
if [ -d "backend/data/images" ]; then
    rsync -av backend/data/images/ "$PUBLIC_HTML/images/"
fi

# Restart Passenger
echo "🔄 Restarting Passenger..."
mkdir -p tmp
touch tmp/restart.txt

echo ""
echo "==========================="
echo "🎉 cPanel Deployment Complete!"
echo "   Site: https://nambac.xyz"
echo ""
echo "   Backend 확인: curl https://nambac.xyz/api/quizzes"
echo "   Frontend 확인: 브라우저에서 https://nambac.xyz 접속"
echo ""
echo "⚠️  첫 배포 시 추가 설정 (cPanel에서):"
echo "   1. Setup → Python App → Create Application"
echo "   2. Python version: 3.9+"
echo "   3. Application root: nambac"  
echo "   4. Application URL: nambac.xyz"
echo "   5. Application startup file: passenger_wsgi.py"
echo "   6. SSL: Let's Encrypt → AutoSSL 활성화"
echo "==========================="
