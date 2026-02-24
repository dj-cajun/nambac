#!/bin/bash
# ============================================
# Nambac Deploy Script
# Usage: ./deploy.sh
# ============================================
set -e

echo "🚀 Nambac Deployment Starting..."
echo "================================"

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 2. Check .env exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "   Copy .env.example to .env and configure it."
    exit 1
fi

# 3. Build Docker image
echo "🔨 Building Docker image..."
docker compose build --no-cache

# 4. Stop old containers
echo "🛑 Stopping old containers..."
docker compose down

# 5. Start new containers
echo "🟢 Starting new containers..."
docker compose up -d

# 6. Wait for health check
echo "⏳ Waiting for health check..."
sleep 5

# 7. Verify
if curl -sf http://localhost/api/ > /dev/null 2>&1; then
    echo "✅ Backend API is healthy!"
else
    echo "⚠️  Backend API health check failed. Check logs:"
    echo "   docker compose logs web"
fi

if curl -sf http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend is serving!"
else
    echo "⚠️  Frontend health check failed."
fi

echo ""
echo "================================"
echo "🎉 Deployment Complete!"
echo "   Site: https://nambac.xyz"
echo "   Logs: docker compose logs -f web"
echo "================================"
