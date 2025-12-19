# Blytz.live - Docker Deployment

## 🚀 Quick Start

```bash
# Clone and build
git clone https://github.com/gmsas95/blytz.live.remake.git
cd blytz.live.remake
docker-compose up -d

# Access your cyberpunk marketplace:
# Local: http://localhost
# API: http://api.localhost  
# Admin: http://localhost:9000 (Traefik dashboard)
```

## 📋 Architecture

- **Frontend**: React 19.2.3 + TypeScript + Tailwind CSS
- **Backend**: Go API + PostgreSQL + Redis
- **Proxy**: Traefik v3.0 (Load balancer + SSL)
- **Infrastructure**: Docker containers with health checks

## 🌐 Services

| Service | URL | Description |
|----------|------|-------------|
| Frontend | `https://blytz.app` | Cyberpunk marketplace |
| API | `https://api.blytz.app` | REST API backend |
| Admin | `https://traefik.blytz.app` | Traefik dashboard |

## ⚙️ Environment Variables

Edit `.env` file:

```bash
# Domain Configuration
DOMAIN=blytz.app
ACME_EMAIL=admin@blytz.app

# Database
DB_USER=blytz_user
DB_PASSWORD=your_secure_password
DB_NAME=blytz_marketplace

# Redis
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=168h

# Application
VITE_API_URL=https://api.blytz.app/api/v1
VITE_APP_NAME=Blytz.app Marketplace
CORS_ORIGINS=https://blytz.app,https://api.blytz.app

# Optional: AI Features
GEMINI_API_KEY=your-gemini-api-key
```

## 🔧 Development

```bash
# Development mode
docker-compose down
# Edit .env with DOMAIN=localhost
docker-compose up -d

# Access local: http://localhost
```

## 📝 Production Setup

1. **DNS Records**: Point `blytz.app` and `api.blytz.app` to your server IP
2. **Firewall**: Open ports 80 and 443
3. **Deploy**: `docker-compose up -d` (SSL auto-generated)

## 🛠️ Management

```bash
# View logs
docker-compose logs -f traefik
docker-compose logs -f frontend
docker-compose logs -f backend

# Restart services
docker-compose restart

# Update application
git pull
docker-compose build
docker-compose up -d

# Backup database
docker-compose exec postgres pg_dump -U blytz_user blytz_marketplace > backup.sql
```

## 🔍 Troubleshooting

**504 Gateway Timeout**:
- Check DNS: `nslookup blytz.app`
- Verify firewall: open ports 80/443
- Check logs: `docker-compose logs traefik`

**SSL Certificate Issues**:
- Verify domain ownership
- Check ACME email in .env
- Monitor: `docker-compose logs traefik | grep acme`

**Service Unhealthy**:
- Check resource usage: `docker stats`
- Restart service: `docker-compose restart frontend`
- View detailed logs: `docker logs blytz-frontend`

## 📊 Monitoring

- **Traefik Dashboard**: `http://localhost:9000`
- **Health Checks**: Automatic container health monitoring
- **Logs**: Centralized logging with timestamps

## 🔄 Updates

```bash
# Update entire stack
git pull origin main
docker-compose build
docker-compose up -d --force-recreate
```

## 🗑️ Cleanup

```bash
# Stop and remove all containers
docker-compose down -v
# Remove images
docker system prune -a
```