# ============================================
# Stage 1: Build Frontend (React + Vite)
# ============================================
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Install dependencies first (cache layer)
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy source and build
COPY index.html vite.config.js tailwind.config.js postcss.config.js eslint.config.js ./
COPY src/ ./src/
COPY public/ ./public/

# Build with production env
COPY .env.production .env.production
RUN npm run build


# ============================================
# Stage 2: Runtime (Python + Nginx)
# ============================================
FROM python:3.11-slim

# Install Nginx and Supervisor
RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx supervisor curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Python Backend ---
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/

# Create data directories
RUN mkdir -p backend/data/images backend/data

# --- Frontend Static Files ---
COPY --from=frontend-build /app/dist /var/www/html

# --- Nginx Config ---
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# --- Supervisor Config (manages Nginx + Uvicorn) ---
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/api/ || exit 1

# Start Supervisor (manages both Nginx and Uvicorn)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
