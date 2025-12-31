# Nginx CORS Configuration for Blytz.live

## Issue
Frontend at `https://blytz.app` cannot access backend API at `/api` due to CORS issues.

## Solution
Add CORS headers to nginx configuration for the `/api` location.

## Add to nginx/prod.conf under `location /api {` block:

```nginx
# CORS Headers for API
add_header Access-Control-Allow-Origin https://blytz.app always;
add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
add_header Access-Control-Allow-Headers 'Authorization, Content-Type, X-Requested-With' always;
add_header Access-Control-Allow-Credentials true always;

# Handle OPTIONS preflight requests
if ($request_method = OPTIONS) {
    add_header Access-Control-Allow-Origin https://blytz.app always;
    add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header Access-Control-Allow-Headers 'Authorization, Content-Type, X-Requested-With' always;
    add_header Access-Control-Max-Age 86400;
    return 204;
}
```

## Complete updated location block should look like:

```nginx
location /api {
    limit_req zone=api burst=20 nodelay;
    
    # CORS Headers
    add_header Access-Control-Allow-Origin https://blytz.app always;
    add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header Access-Control-Allow-Headers 'Authorization, Content-Type, X-Requested-With' always;
    add_header Access-Control-Allow-Credentials true always;
    
    # Handle OPTIONS preflight
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin https://blytz.app always;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Authorization, Content-Type, X-Requested-With' always;
        add_header Access-Control-Max-Age 86400;
        return 204;
    }
    
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Proto $http_upgrade;
    proxy_cache_bypass $http_upgrade;
    
    # Disable cache for API
    proxy_no_cache 1;
    proxy_cache_bypass 1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    expires epoch;
    
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
}
```

## Backend CORS Configuration
Also ensure Go backend has CORS middleware enabled. Check `backend/internal/middleware/middleware.go` or create CORS middleware:

```go
import "github.com/gin-gonic/gin"

// Add CORS middleware to backend
func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    }
}
```

## Deployment Steps

### Option A: Change Docker Compose (Recommended)
```bash
# Edit docker-compose.yml
nano docker-compose.yml

# Find this line in frontend service:
VITE_API_URL: https://api.blytz.app/api/v1

# Change to:
VITE_API_URL: /api/v1

# Rebuild frontend container:
docker-compose down frontend
docker-compose up -d --build frontend
```

### Option B: Add CORS to Nginx
```bash
# Add CORS headers to nginx configuration
nano nginx/prod.conf

# Update location /api { block with CORS headers

# Reload nginx:
sudo nginx -t /etc/nginx/sites-available/blytz.live
sudo systemctl reload nginx
```

## Testing
After applying changes:

1. **Test API endpoint:**
```bash
curl -X OPTIONS https://blytz.app/api/v1/auth/login \
  -H "Origin: https://blytz.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

2. **Check CORS headers in browser DevTools:**
   - Open browser DevTools → Network tab
   - Try login/signup
   - Check OPTIONS request response headers
   - Should see: `Access-Control-Allow-Origin: https://blytz.app`

3. **Check nginx error logs:**
```bash
sudo tail -f /var/log/nginx/blytz.live.error.log
```

## Common Issues

### Issue 1: DNS Resolution
If `api.blytz.app` DNS is not resolving:
```bash
# Test DNS resolution
ping api.blytz.app
nslookup api.blytz.app

# If DNS fails, use local IP temporarily
VITE_API_URL: http://YOUR_SERVER_IP/api/v1
```

### Issue 2: SSL/TLS Certificate
If using HTTPS, ensure SSL certificate is valid:
```bash
# Check SSL certificate
sudo certbot certificates
sudo nginx -t

# Check certificate expiry
echo | openssl s_client -connect api.blytz.app:443 -servername api.blytz.app 2>/dev/null | openssl x509 -noout -dates
```

### Issue 3: Traefik Routing (If using Dokploy)
The docker-compose shows Traefik labels for load balancing. Ensure Traefik routes are configured correctly:
- Backend route: `api.blytz.app` → backend:8080
- Frontend route: `blytz.app` → frontend:3000
- WebSocket route: `/ws` → backend:8080

## Environment Variables Reference

### Frontend .env (Local Development)
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Blytz.app Live Auction Marketplace
VITE_APP_URL=http://localhost:5173
```

### Production (Docker Compose)
```yaml
environment:
  VITE_API_URL: /api/v1  # Relative path works with nginx
  VITE_APP_NAME: Blytz.app Live Auction Marketplace
  VITE_APP_URL: https://blytz.app
```

## Quick Fix (Immediate)

### Method 1: Rebuild with Relative URL
```bash
# Edit docker-compose.yml
sed -i 's|VITE_API_URL: https://api.blytz.app/api/v1|VITE_API_URL: /api/v1|g' docker-compose.yml

# Rebuild frontend
docker-compose down frontend
docker-compose up -d --build frontend
```

### Method 2: Add CORS (Alternative)
```bash
# Update nginx configuration with CORS headers
cat >> nginx/prod.conf <<'EOF'

location /api {
    # CORS Headers
    add_header Access-Control-Allow-Origin https://blytz.app always;
    add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header Access-Control-Allow-Headers 'Authorization, Content-Type' always;
    add_header Access-Control-Allow-Credentials true always;
    
    # ... rest of existing config ...
}
EOF

# Reload nginx
sudo systemctl reload nginx
```

## Verify Configuration

After applying changes, verify:

1. **Check frontend build includes correct API URL:**
```bash
# Check if frontend dist has correct API URL
grep -r "api.blytz.app" frontend/dist/
```

2. **Check nginx is routing correctly:**
```bash
# Check nginx is running
sudo systemctl status nginx

# Check nginx configuration syntax
sudo nginx -t

# Check nginx error logs
sudo tail -50 /var/log/nginx/blytz.live.error.log
```

3. **Check backend is accessible from nginx:**
```bash
# From container, test backend connectivity
docker-compose exec backend curl http://localhost:8080/health
docker-compose exec nginx curl http://localhost:8080/health
```

## Summary

The issue is that the frontend is configured to call `https://api.blytz.app/api/v1` but the API is only available at `http://localhost:8080` in the Docker network.

**Recommended Fix:**
1. Change `VITE_API_URL` to `/api/v1` (relative path) in docker-compose.yml
2. Add CORS headers to nginx configuration
3. Rebuild and redeploy containers

This will allow the frontend to communicate with the backend properly.
