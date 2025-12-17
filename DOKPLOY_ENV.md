# Critical Environment Variables for Dokploy
# Copy these to your Dokploy environment variables

# ==============================
# REQUIRED - MUST SET THESE
# ==============================
DOMAIN=blytz.app
POSTGRES_PASSWORD=your_secure_database_password_here
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
REDIS_PASSWORD=your_secure_redis_password_here

# ==============================
# DATABASE CONFIGURATION
# ==============================
DB_USER=blytz_user
DB_NAME=blytz_marketplace
DB_SSL_MODE=disable

# ==============================
# JWT AUTHENTICATION
# ==============================
JWT_EXPIRES_IN=168h

# ==============================
# EMAIL CONFIGURATION (optional)
# ==============================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_app_password
SMTP_FROM=noreply@blytz.app

# ==============================
# CORS & API CONFIGURATION
# ==============================
CORS_ORIGINS=https://blytz.app,https://api.blytz.app
VITE_API_URL=https://api.blytz.app/api/v1
VITE_APP_NAME=Blytz.app Marketplace
VITE_APP_VERSION=1.0.0

# ==============================
# ENVIRONMENT SETTINGS
# ==============================
ENVIRONMENT=production

# ==============================
# AI FEATURES (optional)
# ==============================
GEMINI_API_KEY=your_gemini_ai_api_key_here

# ==============================
# MINIO S3 STORAGE (optional)
# ==============================
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadminpassword
AWS_BUCKET=blytz-marketplace
AWS_REGION=us-east-1
AWS_ENDPOINT=http://minio:9000