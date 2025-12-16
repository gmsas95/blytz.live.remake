# Backend Architecture Documentation

## Overview

The Blytz.live backend follows Clean Architecture principles with a well-structured monolith design. This architecture provides clear separation of concerns, testability, and the ability to extract microservices in the future if needed.

## Project Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # Application entry point
├── internal/                    # Private application code
│   ├── auth/                   # Authentication module
│   │   ├── handlers.go         # HTTP request handlers
│   │   ├── jwt.go             # JWT token management
│   │   ├── models.go          # Auth DTOs and request/response models
│   │   └── service.go         # Authentication business logic
│   ├── common/                 # Shared utilities
│   │   └── models.go         # Base models and common types
│   ├── config/                 # Configuration management
│   │   └── config.go         # Environment-based configuration
│   ├── database/               # Database layer
│   │   └── connection.go     # Database connections and setup
│   ├── middleware/             # HTTP middleware
│   │   ├── middleware.go      # General middleware (CORS, logging, recovery)
│   │   └── rate_limiter.go  # Rate limiting middleware
│   └── models/                # Data models
│       └── models.go         # Core domain models
├── pkg/                      # Public packages (future use)
├── tests/                    # Test files (future)
├── docker-compose.yml         # Development environment
├── Dockerfile               # Production container
├── go.mod                   # Go module definition
└── .env.example             # Environment template
```

## Architecture Layers

### 1. Presentation Layer (Handlers)
- **Location**: `internal/*/handlers.go`
- **Purpose**: HTTP request/response handling
- **Responsibilities**:
  - Parse incoming HTTP requests
  - Validate input data
  - Call appropriate service methods
  - Format HTTP responses
  - Handle HTTP-specific concerns (status codes, headers)

### 2. Business Logic Layer (Services)
- **Location**: `internal/*/service.go`
- **Purpose**: Core business logic implementation
- **Responsibilities**:
  - Implement business rules
  - Coordinate between different entities
  - Handle complex workflows
  - Maintain data integrity
  - Manage transactions

### 3. Data Access Layer (Models/Database)
- **Location**: `internal/models/`, `internal/database/`
- **Purpose**: Data persistence and retrieval
- **Responsibilities**:
  - Define data structures
  - Handle database operations
  - Manage data relationships
  - Ensure data consistency

### 4. Infrastructure Layer (Config/Middleware)
- **Location**: `internal/config/`, `internal/middleware/`
- **Purpose**: Cross-cutting concerns
- **Responsibilities**:
  - Configuration management
  - HTTP middleware (CORS, logging, rate limiting)
  - Third-party integrations

## Design Principles

### 1. Clean Architecture
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Business logic is isolated from external concerns
- **Independence**: Framework can be swapped without changing business logic

### 2. Domain-Driven Design
- **Ubiquitous Language**: Models reflect business terminology
- **Bounded Contexts**: Each module has clear boundaries
- **Rich Models**: Models contain both data and behavior

### 3. SOLID Principles
- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Clients shouldn't depend on unused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

## Data Flow

### Request Flow
1. **HTTP Request** → Middleware → Handler
2. **Handler** → Validation → Service
3. **Service** → Business Logic → Database
4. **Database** → GORM → Database Engine
5. **Response** flows back through the same layers

### Authentication Flow
1. Client sends credentials to `/auth/login`
2. Handler validates request format
3. Service verifies credentials against database
4. JWT manager generates tokens
5. Handler returns tokens to client
6. Client includes token in subsequent requests
7. Authentication middleware validates token
8. Request proceeds to protected handlers

## Technology Choices

### Go
- **Reasons**: Performance, concurrency, simplicity
- **Benefits**:
  - Strong typing and compiled performance
  - Built-in concurrency primitives
  - Excellent standard library
  - Fast compile times
  - Great ecosystem for web development

### Gin Framework
- **Reasons**: Performance, simplicity, middleware support
- **Benefits**:
  - Fast HTTP router
  - Extensive middleware ecosystem
  - JSON binding/validation
  - Error handling
  - Good documentation

### GORM ORM
- **Reasons**: Type safety, migrations, relationships
- **Benefits**:
  - Type-safe database operations
  - Auto-migration support
  - Relationship management
  - Soft delete support
  - Multiple database backends

### SQLite (Demo) / PostgreSQL (Production)
- **SQLite**: Easy development, no setup required
- **PostgreSQL**: Production-ready with advanced features
  - ACID compliance
  - Advanced indexing
  - JSON support
  - Full-text search
  - Replication support

### Redis
- **Uses**: Caching, rate limiting, future session management
- **Benefits**:
  - In-memory performance
  - Data structures support
  - Persistence options
  - Clustering support

## Security Architecture

### Authentication
- **JWT Tokens**: Stateless authentication with expiry
- **Password Hashing**: bcrypt with adaptive work factor
- **Role-Based Access**: Buyer, seller, admin roles
- **Token Refresh**: Secure refresh token flow

### Input Validation
- **Request Binding**: Gin's built-in validation
- **Sanitization**: SQL injection prevention via GORM
- **Rate Limiting**: IP-based request throttling

### Data Protection
- **Sensitive Fields**: Password hashes never exposed
- **HTTPS Required**: In production (enforced by reverse proxy)
- **Environment Variables**: All secrets in environment

## Database Schema

### Core Entities
```sql
users (id, email, password_hash, role, first_name, last_name, avatar_url, phone, email_verified, last_login_at, created_at, updated_at, deleted_at)

categories (id, name, slug, description, image_url, parent_id, sort_order, is_active, created_at, updated_at, deleted_at)

products (id, seller_id, category_id, title, description, condition, starting_price, reserve_price, buy_now_price, images, video_url, specifications, shipping_info, status, featured, view_count, created_at, updated_at, deleted_at)
```

### Relationships
- Users → Products (One-to-Many: seller)
- Categories → Categories (Self-referencing: parent/child)
- Categories → Products (One-to-Many)
- Users → Auctions (One-to-Many: participant/auctioneer)

### Indexes
- `users.email` (unique)
- `categories.slug` (unique)
- `products.seller_id`
- `products.category_id`
- `products.status`
- Soft delete indexes on all tables

## Performance Considerations

### Database Optimization
- **Connection Pooling**: GORM manages connection pool
- **Query Optimization**: Proper indexing strategy
- **Pagination**: Prevent large result sets
- **Eager Loading**: Avoid N+1 query problems

### Caching Strategy
- **Redis Layer**: Cache frequently accessed data
- **Session Storage**: User sessions in Redis
- **Rate Limiting**: Distributed rate limiting counters

### HTTP Performance
- **JSON Compression**: Gzip middleware
- **Static Assets**: CDN for images/files
- **HTTP/2**: Supported by reverse proxy

## Scalability Planning

### Current Monolith
- **Horizontal Scaling**: Multiple app instances
- **Database Scaling**: Read replicas, connection pooling
- **Load Balancing**: At reverse proxy level

### Future Microservices (if needed)
Extraction order:
1. **Authentication Service**: Stateless, well-defined boundaries
2. **Notification Service**: I/O heavy, different scaling needs
3. **File Upload Service**: Different infrastructure requirements
4. **Analytics Service**: ML/recommendations, different data patterns

### Database Scaling
- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: PgBouncer for connection management
- **Partitioning**: For large tables (products, auctions)

## Monitoring and Observability

### Logging
- **Structured Logging**: JSON format with logrus
- **Log Levels**: Debug, info, warn, error
- **Context Preservation**: Request IDs across services

### Metrics (Planned)
- **Prometheus**: Application metrics
- **Grafana**: Visualization dashboards
- **Health Checks**: Service health endpoints

### Error Tracking (Planned)
- **Sentry**: Error aggregation and alerting
- **Correlation IDs**: Track requests across services

## Testing Strategy

### Unit Tests
- **Service Layer**: Business logic testing
- **Model Layer**: Data validation testing
- **Utility Functions**: Pure function testing

### Integration Tests
- **API Endpoints**: Full request/response cycle
- **Database Operations**: With test database
- **Authentication**: Full auth flow testing

### Performance Tests
- **Load Testing**: Concurrent user simulation
- **Database Stress**: Large dataset operations
- **Memory Profiling**: Resource usage optimization

## Deployment Architecture

### Development
- **Docker Compose**: Local development environment
- **In-Memory Database**: SQLite for quick setup
- **Hot Reload**: Go's built-in reload capabilities

### Production (Planned)
- **Containerization**: Docker containers
- **Orchestration**: Kubernetes or ECS
- **Database**: Managed PostgreSQL (AWS RDS)
- **Cache**: Managed Redis (AWS ElastiCache)
- **Load Balancer**: Application Load Balancer
- **CDN**: CloudFront for static assets

## Configuration Management

### Environment Variables
- **Development**: `.env` file
- **Production**: Environment variables or secrets manager
- **Validation**: Required variables checked at startup

### Feature Flags (Planned)
- **Gradual Rollouts**: Feature toggles
- **A/B Testing**: Experimentation framework
- **Emergency Controls**: Kill switches for features

## Future Architecture Considerations

### Event-Driven Architecture
- **Message Queues**: Redis Streams or RabbitMQ
- **Event Sourcing**: For auction bidding history
- **CQRS**: Read/write model separation

### Real-Time Features
- **WebSockets**: Gorilla WebSocket for chat/bidding
- **LiveKit**: Video streaming integration
- **Server-Sent Events**: One-way real-time updates

### Third-Party Integrations
- **Payment Gateways**: Stripe, PayPal integration
- **File Storage**: AWS S3 or similar
- **Email Service**: SendGrid or AWS SES
- **SMS Service**: Twilio for notifications

This architecture provides a solid foundation for the Blytz.live marketplace while maintaining flexibility for future growth and evolution.