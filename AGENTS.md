# Blytz.live.remake - Agents Guide

## Project Overview

Blytz.live.remake is a modern live marketplace platform designed for real-time auctions, bidding, and live streaming capabilities. The platform connects buyers and sellers through interactive live sessions with real-time product demonstrations and instant bidding functionality.

### Business Objectives
- **Primary**: Create engaging live commerce experiences with real-time auctions
- **Secondary**: Build a scalable marketplace supporting high concurrent users
- **Tertiary**: Enable mobile-first experiences for on-the-go bidding

## Current Development Status

### Phase 1: Backend Foundation ✅ COMPLETED (2025-12-15)
- Project structure with clean architecture
- Docker configuration for development
- PostgreSQL + Redis database setup with SQLite fallback
- GORM ORM integration with UUID primary keys
- Core data models (User, Category, Product)
- API foundation with Gin framework
- CORS and middleware support
- Health check endpoint
- Environment configuration management
- Logging infrastructure with logrus

### Phase 2: Authentication System ✅ COMPLETED (2025-12-15)
- JWT token management (access + refresh tokens)
- User registration and login with email validation
- Secure password hashing with bcrypt
- Protected routes with middleware
- Role-based access control (buyer/seller/admin)
- Rate limiting (5 req/min for auth, 100 req/min general)
- Input validation and structured error handling
- User profile management
- Password change functionality
- SQLite in-memory database for demo

**API Endpoints Implemented:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/profile` - User profile (protected)
- `POST /api/v1/auth/change-password` - Password change (protected)
- `POST /api/v1/auth/logout` - User logout (protected)

### Phase 3: Product Management 🔄 IN PROGRESS
Target Start: TBD
Features to implement:
- Product CRUD operations
- Image upload and management
- Category associations
- Search and filtering

### Phase 4: Auction System 📋 PLANNED
Target Start: After Phase 3
- Live auction sessions
- Real-time bidding system
- WebSocket integration

### Phase 5: Live Streaming 📋 PLANNED
Target Start: After Phase 4
- LiveKit integration
- Video streaming capabilities
- Live chat during auctions

## Architecture Vision

### Target Architecture: Well-Structured Monolith with Future Extraction Points

The project avoids the distributed monolith anti-pattern by using a unified backend with proper module boundaries. This maintains simplicity while allowing future microservices extraction if business needs justify it.

### Backend (Go)
- **Framework**: Gin (confirmed from PRD)
- **Architecture**: Clean architecture with modular domains
- **Database**: PostgreSQL 17.7 with GORM
- **Cache**: Redis 8+ for sessions and caching
- **Real-time**: LiveKit for streaming, Gorilla WebSocket for messaging
- **Queue**: Redis Streams for async processing

### Frontend (Next.js)
- **Version**: Next.js 16+ with App Router (updated from PRD)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS
- **Components**: Radix UI + custom components
- **State**: React Query + Context API
- **Forms**: React Hook Form + Zod validation
- **Real-time**: Socket.IO client

### Mobile (React Native)
- **Framework**: React Native with Expo
- **State**: Redux Toolkit + RTK Query
- **Navigation**: React Navigation 6
- **UI Components**: React Native Elements or NativeBase
- **Push Notifications**: Firebase Cloud Messaging
- **Authentication**: Firebase Auth or custom JWT

## Expected Project Structure

```
blytz-live-latest/
├── backend/                          # Unified Go Backend
│   ├── cmd/
│   │   └── server/
│   │       └── main.go              # Single entry point
│   ├── internal/                    # Private packages
│   │   ├── auth/                   # Auth module
│   │   │   ├── handlers.go
│   │   │   ├── models.go
│   │   │   ├── repository.go
│   │   │   └── service.go
│   │   ├── products/
│   │   ├── orders/
│   │   ├── auctions/
│   │   ├── payments/
│   │   ├── chat/
│   │   ├── livekit/
│   │   ├── logistics/
│   │   ├── config/                  # Configuration
│   │   ├── middleware/              # HTTP middleware
│   │   ├── database/               # Database setup
│   │   └── common/                 # Shared utilities
│   ├── pkg/                       # Public packages
│   │   ├── http/                   # HTTP utilities
│   │   ├── logging/                # Logging setup
│   │   └── validation/            # Input validation
│   ├── migrations/                 # Database migrations
│   ├── tests/                     # Test files
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   └── README.md
├── frontend/                      # Next.js Web Application
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   ├── components/             # React components
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/                   # Utilities
│   │   └── types/                 # TypeScript types
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── mobile/                        # React Native Application
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── utils/
│   ├── android/
│   ├── ios/
│   ├── package.json
│   └── metro.config.js
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
├── README.md
└── ARCHITECTURE.md
```

## Development Commands (Planned)

### Backend
```bash
cd backend
go mod tidy                    # Install dependencies
go run cmd/server/main.go      # Run development server
go test ./...                  # Run all tests
go build ./cmd/server          # Build binary
```

### Frontend
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                    # Development server
npm run build                  # Production build
npm test                       # Run tests
npm run lint                   # Lint code
```

### Mobile
```bash
cd mobile
npm install                    # Install dependencies
npx expo start                 # Start development server
npx expo run android           # Run on Android
npx expo run ios               # Run on iOS
```

## Key Implementation Details

### Database Schema
The project uses a unified PostgreSQL database with the following core entities:
- Users and Authentication (with role-based access)
- Categories (hierarchical structure)
- Products (with condition, pricing, and media)
- Auction Sessions (with LiveKit integration)
- Bids (with auto-bid support)
- Orders and Payments (with multiple gateway support)
- Chat Messages (for auction interaction)
- User Sessions (for caching)

### API Design
RESTful API with `/api/v1` prefix and consistent patterns:
- Authentication endpoints: `/api/v1/auth/*`
- Product endpoints: `/api/v1/products/*`
- Auction endpoints: `/api/v1/auctions/*`
- All endpoints follow REST conventions with proper HTTP verbs

### Authentication
- JWT tokens with refresh token rotation
- Role-based access control (buyer, seller, admin)
- Multi-factor authentication for sensitive operations
- Session management with device tracking

### Real-time Features
- LiveKit for video streaming (room creation, token generation)
- Gorilla WebSocket for chat and bidding
- Socket.IO client for frontend connections
- Redis Streams for async processing

### Backend Module Structure
Each module follows clean architecture principles:
- Models (data structures with GORM tags)
- Services (business logic interfaces)
- Handlers (HTTP request handlers)
- Repositories (data access interfaces)

## Security Requirements
- HTTPS everywhere (Cloudflare SSL)
- Rate limiting per user/IP
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries
- XSS protection with proper escaping
- Password hashing with bcrypt
- Database encryption at rest and in transit
- Redis authentication and network isolation
- Container security with non-root users

## Performance Targets

### Response Time Targets
- API endpoints: <100ms (95th percentile)
- Database queries: <50ms average
- Cache hits: <10ms
- WebSocket messages: <20ms

### Concurrent User Targets
- Phase 1: 1,000 concurrent users
- Phase 2: 5,000 concurrent users  
- Phase 3: 10,000+ concurrent users

### Availability Targets
- Uptime: 99.9% (all services)
- Database: 99.95% uptime
- Redis: 99.99% uptime
- Live streaming: 99.5% uptime

## Implementation Phases

### Phase 1: Monolith Consolidation (0-3 months)
1. Merge existing services into unified backend
2. Implement single database with proper relations
3. Add comprehensive testing (unit + integration)
4. Deploy as single container for simplicity
5. Add monitoring and logging

### Phase 2: Performance Optimization (3-6 months)
1. Implement Redis caching layer
2. Add database indexing and query optimization
3. Implement CDN for static assets
4. Add background job processing for async tasks
5. Optimize mobile app performance

### Phase 3: Microservices Extraction (6-12 months, if needed)
Only split when business needs justify it:
- Team size > 15 engineers
- Different scaling requirements per domain
- Technology stack divergence needs
- Independent deployment requirements

#### Extraction Order:
1. Authentication Service (stateless)
2. Notification Service (I/O heavy)
3. File Upload Service (different infrastructure)
4. Analytics Service (ML/recommendations)

## Testing Strategy

### Backend
- Unit tests with Go's testing package
- Integration tests for API endpoints
- Database tests with test containers
- Target: 85%+ test coverage

### Frontend
- Jest + React Testing Library
- E2E tests with Cypress or Playwright
- Component testing with Storybook

### Mobile
- Jest for unit tests
- Detox for E2E testing

### Documentation Requirements
- GoDoc comments for all public functions
- TypeScript JSDoc for component props
- API documentation with OpenAPI/Swagger
- Database schema documentation
- README files for each major component

## Important Gotchas

1. **Single Database**: Avoid distributed monolith anti-pattern - use one unified database initially
2. **Future Extraction Points**: Design modules with clear boundaries for potential microservices extraction
3. **Real-time Complexity**: LiveKit integration requires careful handling of connections and room management
4. **Auction State Management**: Implement proper state transitions for auction lifecycle
5. **Bid Validation**: Prevent race conditions and ensure bid consistency
6. **WebSocket Scale**: Implement proper connection pooling for high-concurrency scenarios
7. **File Storage**: Use AWS S3 or equivalent for media files - don't store in database

## Environment Variables

Key environment variables to configure:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `LIVEKIT_API_KEY`: LiveKit API key
- `LIVEKIT_API_SECRET`: LiveKit API secret
- `NODE_ENV`: Development/production flag

## Infrastructure Stack

### Containerization
- Docker + Docker Compose
- Multi-stage builds for optimization
- Non-root user in containers

### Services
- PostgreSQL 17.7 (unified database)
- Redis 8+ (caching and sessions)
- Traefik (reverse proxy)
- Cloudflare (SSL/CDN)

### Monitoring & Logging
- Prometheus + Grafana (monitoring)
- ELK stack or Papertrail (logging)
- Health check endpoints for all services

## Code Conventions

### Go
- Follow standard Go formatting
- Use clean architecture patterns
- Interfaces in service layer
- Repository pattern for data access
- GORM tags for database models
- Proper error handling with wrapped errors

### TypeScript
- Strict TypeScript configuration
- Explicit return types
- Component props as interfaces
- Custom hooks for shared logic
- Zod schemas for validation

### Success Metrics

### Technical Metrics
- Code quality: 85%+ test coverage
- Performance: <100ms average response time
- Reliability: 99.9% uptime
- Security: Zero critical vulnerabilities

### Business Metrics
- User engagement: 10+ minutes average session
- Conversion rate: 5%+ auction participation
- Mobile adoption: 40%+ traffic from mobile
- Customer satisfaction: 4.5+ star rating

## Before You Start

1. Read the full architecture document (`BLYTZ_LIVE_ARCHITECTURE_PRD.md`)
2. Set up PostgreSQL 17.7 and Redis 8+ locally
3. Install Go 1.21+, Node.js 18+, and Docker
4. Consider creating a minimal proof-of-concept for the core auction functionality first
5. Plan for mobile-first responsive design