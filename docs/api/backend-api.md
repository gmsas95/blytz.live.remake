# Backend API Documentation

## Overview

The Blytz.live backend is a RESTful API built with Go and Gin framework. It provides endpoints for authentication, user management, products, auctions, and more.

## Base URL

```
Development: http://localhost:8080/api/v1
Production: https://api.blytz.live/v1
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. There are two types of tokens:

- **Access Token**: Short-lived (1 hour) token for API requests
- **Refresh Token**: Long-lived (7 days) token for obtaining new access tokens

### Authentication Flow

1. Register or login to get tokens
2. Include access token in Authorization header for protected routes
3. Use refresh token to get new access token when expired
4. Logout to invalidate tokens

### Header Format

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response (201 Created)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "buyer",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "email_verified": false,
    "created_at": "2023-12-15T20:00:00Z",
    "updated_at": "2023-12-15T20:00:00Z"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "buyer",
    "first_name": "John",
    "last_name": "Doe",
    "email_verified": false,
    "last_login_at": "2023-12-15T20:00:00Z",
    "created_at": "2023-12-15T20:00:00Z",
    "updated_at": "2023-12-15T20:00:00Z"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_in": 3600
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "buyer"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_in": 3600
}
```

#### Get User Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "buyer",
    "first_name": "John",
    "last_name": "Doe",
    "email_verified": false,
    "created_at": "2023-12-15T20:00:00Z",
    "updated_at": "2023-12-15T20:00:00Z"
  }
}
```

#### Change Password (Protected)
```http
POST /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

**Response (200 OK)**:
```json
{
  "message": "Password changed successfully"
}
```

#### Logout (Protected)
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

### Health Check

#### Health Status
```http
GET /health
```

**Response (200 OK)**:
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "env": "development"
}
```

## Error Responses

All errors return JSON with consistent format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

### Rate Limits
- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1702682400
```

## Data Models

### User Model
```json
{
  "id": "uuid",
  "email": "string (unique)",
  "role": "buyer|seller|admin",
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "avatar_url": "string (optional)",
  "phone": "string (optional)",
  "email_verified": "boolean",
  "last_login_at": "datetime (optional)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Category Model
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string (unique)",
  "description": "string (optional)",
  "image_url": "string (optional)",
  "parent_id": "uuid (optional)",
  "sort_order": "integer",
  "is_active": "boolean",
  "categories": [Category],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Product Model
```json
{
  "id": "uuid",
  "seller_id": "uuid",
  "category_id": "uuid",
  "title": "string",
  "description": "string (optional)",
  "condition": "new|like_new|good|fair (optional)",
  "starting_price": "number",
  "reserve_price": "number (optional)",
  "buy_now_price": "number (optional)",
  "images": "array[string] (optional)",
  "video_url": "string (optional)",
  "specifications": "object (optional)",
  "shipping_info": "object (optional)",
  "status": "draft|active|sold|cancelled",
  "featured": "boolean",
  "view_count": "integer",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Security

### Password Requirements
- Minimum 8 characters
- No other restrictions currently (production should add more)

### Token Security
- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Tokens are signed with HMAC-SHA256
- Invalid tokens are rejected with 401 status

### Rate Limiting
- IP-based rate limiting
- Stricter limits for authentication endpoints
- Consider implementing Redis-based distributed rate limiting

## Pagination

List endpoints will support pagination using query parameters:

```
GET /products?page=1&page_size=20
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

## WebSockets (Planned)

Real-time features will use WebSockets for:
- Live auctions
- Bidding updates
- Chat messages
- Notifications

Connection details to be implemented in Phase 4.

## SDK/Client Libraries

### Official SDKs (Planned)
- JavaScript/TypeScript
- Swift (iOS)
- Kotlin (Android)
- Python

## Environment Variables

### Required
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT signing secret (must be secure)
- `REDIS_URL` - Redis connection string

### Optional
- `ENV` - Environment (development|production)
- `PORT` - Server port (default: 8080)
- `LOG_LEVEL` - Logging level (info|debug|error)

## Testing

### Authentication Test Script

```javascript
// Example using fetch API
async function testAuth() {
  // Register
  const register = await fetch('http://localhost:8080/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test'
    })
  });
  
  // Login
  const login = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });
  
  const loginData = await login.json();
  const token = loginData.access_token;
  
  // Access protected endpoint
  const profile = await fetch('http://localhost:8080/api/v1/auth/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}
```

## Changelog

### v0.1.0 (2025-12-15)
- Initial API release
- Authentication endpoints
- JWT token management
- Rate limiting
- Health check endpoint

### v0.2.0 (Planned)
- Product management endpoints
- Image upload support
- Search and filtering
- Pagination support

### v0.3.0 (Planned)
- Auction endpoints
- Bidding system
- WebSocket integration
- Real-time updates