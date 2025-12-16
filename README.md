# Blytz.live.remake

A modern live marketplace platform for real-time auctions, bidding, and live streaming capabilities.

## 🚀 Quick Start

### Backend (Go)
```bash
cd backend
go run cmd/server/main.go
```

Server starts at `http://localhost:8080`

### Health Check
```bash
curl http://localhost:8080/health
```

## 📊 Development Status

### ✅ Phase 1: Backend Foundation (COMPLETED)
- Clean architecture with Go/Gin
- Database setup (PostgreSQL + SQLite fallback)
- Core models and API foundation
- Docker configuration
- Health monitoring

### ✅ Phase 2: Authentication System (COMPLETED)
- JWT authentication with refresh tokens
- User registration/login/profile management
- Role-based access control
- Rate limiting and security measures
- Complete API endpoints

### 🔄 Phase 3: Product Management (IN PROGRESS)
- Product CRUD operations
- Image upload and management
- Category system
- Search and filtering

### 📋 Phase 4+: Future Phases
- Auction system with real-time bidding
- Live streaming with LiveKit
- Payment integration
- Frontend and mobile applications

## 📖 Documentation

### Project Overview
- 📖 [docs/README.md](docs/README.md) - Complete project overview and progress
- 🏗️ [BLYTZ_LIVE_ARCHITECTURE_PRD.md](BLYTZ_LIVE_ARCHITECTURE_PRD.md) - Full architecture specification

### Backend Documentation
- 🏗️ [docs/backend/architecture.md](docs/backend/architecture.md) - Backend architecture and design
- 📱 [docs/backend/development-guide.md](docs/backend/development-guide.md) - Development setup and coding standards
- 🔌 [docs/api/backend-api.md](docs/api/backend-api.md) - Complete API documentation
- ✅ [backend/PHASE1_COMPLETE.md](backend/PHASE1_COMPLETE.md) - Phase 1 (Foundation) details
- ✅ [backend/PHASE2_COMPLETE.md](backend/PHASE2_COMPLETE.md) - Phase 2 (Authentication) details

### Frontend Documentation (Planned)
- 🎨 [docs/frontend/architecture.md](docs/frontend/architecture.md) - Frontend architecture and design patterns

### Mobile Documentation (Planned)
- 📱 [docs/mobile/architecture.md](docs/mobile/architecture.md) - Mobile app architecture and development guide

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/profile` - User profile (protected)
- `POST /api/v1/auth/change-password` - Password change (protected)
- `POST /api/v1/auth/logout` - User logout (protected)

### Health
- `GET /health` - Server health status

### API Documentation
📖 [Complete API Reference](docs/api/backend-api.md)

## 🛠️ Tech Stack

### Backend
- **Go 1.21+** - Backend language
- **Gin** - HTTP framework
- **GORM** - ORM for database operations
- **PostgreSQL** - Primary database
- **SQLite** - Development/fallback database
- **Redis** - Caching and sessions
- **JWT** - Authentication tokens

### Frontend (Planned)
- **Next.js 16+** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Styling framework
- **Radix UI** - Component library

### Mobile (Planned)
- **React Native + Expo** - Mobile framework
- **TypeScript** - Type-safe JavaScript
- **Redux Toolkit** - State management

## 🔧 Development

### Prerequisites
- Go 1.21+
- Node.js 18+ (for frontend development)
- Docker & Docker Compose (optional)

### Environment Variables
```bash
# Backend/.env
DATABASE_URL=sqlite:memory:  # Development
# DATABASE_URL=postgres://user:pass@localhost:5432/dbname  # Production
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
ENV=development
PORT=8080
LOG_LEVEL=info
```

### Running the Application
```bash
# Backend
cd backend
go run cmd/server/main.go

# Test with curl
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","first_name":"Test"}'
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./...

# Run with coverage
go test -cover ./...
```

### Authentication Flow Test
The authentication system has been tested and verified to work:
- ✅ User registration
- ✅ User login
- ✅ JWT token generation
- ✅ Protected route access
- ✅ Token refresh
- ✅ Password change

## 🔒 Security

### Implemented
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Rate limiting (5 req/min for auth, 100 req/min general)
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ SQL injection prevention (GORM)

### Production Requirements
- ⏳ HTTPS everywhere
- ⏳ Environment-based secrets
- ⏳ Advanced rate limiting (Redis-based)
- ⏳ Account lockout for brute force
- ⏳ Email verification
- ⏳ Multi-factor authentication

## 📈 Performance

### Current Metrics
- Authentication latency: <50ms
- Token validation: <10ms
- Database operations: <20ms (SQLite)
- API response time: <100ms average

### Target Metrics
- API endpoints: <100ms (95th percentile)
- Database queries: <50ms average
- Cache hits: <10ms
- Concurrent users: 10,000+

## 🏗️ Architecture

### Clean Architecture
- **Presentation Layer**: HTTP handlers and middleware
- **Business Logic Layer**: Services and domain logic
- **Data Access Layer**: Models and database operations
- **Infrastructure Layer**: Configuration and external services

### Future Microservices (if needed)
Extraction order:
1. **Authentication Service** (stateless)
2. **Notification Service** (I/O heavy)
3. **File Upload Service** (different infrastructure)
4. **Analytics Service** (ML/recommendations)

## 🚀 Deployment

### Development
```bash
# Using Docker Compose (with PostgreSQL)
cd backend
docker compose up -d

# Or directly with Go (SQLite)
cd backend
go run cmd/server/main.go
```

### Production (Planned)
- **Containerization**: Docker containers
- **Orchestration**: Kubernetes or ECS
- **Database**: Managed PostgreSQL (AWS RDS)
- **Cache**: Managed Redis (AWS ElastiCache)
- **Load Balancer**: Application Load Balancer
- **CDN**: CloudFront for static assets

## 📝 Contributing

### Development Workflow
1. Create feature branch from `develop`
2. Implement changes with tests
3. Follow code style guidelines
4. Submit pull request for review
5. Ensure tests pass before merging

### Code Standards
- Follow Go formatting standards
- Use clean architecture patterns
- Implement comprehensive error handling
- Add unit tests for new features

### Commit Convention
```
feat: Add new feature
fix: Bug fix
docs: Documentation update
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

## 📞 Support

### Documentation
- 📖 [Project Overview](docs/README.md)
- 🏗️ [Backend Architecture](docs/backend/architecture.md)
- 📱 [Development Guide](docs/backend/development-guide.md)
- 🔌 [API Documentation](docs/api/backend-api.md)

### Issues
For bugs, feature requests, or questions:
1. Check existing documentation
2. Search for existing issues
3. Create new issue with detailed information

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the modern live commerce experience**# blytz.live.remake
# blytz.live.remake
# blytz.live.remake
