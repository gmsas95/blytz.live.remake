# Backend Development Guide

## Quick Start

### Prerequisites
- Go 1.21+ installed
- Git for version control
- Optional: Docker & Docker Compose for development environment

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd blytz.live.remake/backend

# Install dependencies
go mod tidy

# Copy environment configuration
cp .env.example .env

# Run the server
go run cmd/server/main.go
```

The server will start on `http://localhost:8080`

### Development Workflow
```bash
# Add new dependencies
go get <package-name>

# Run tests
go test ./...

# Build for production
go build -o blytz-server cmd/server/main.go

# Format code
go fmt ./...

# Vet for potential issues
go vet ./...
```

## Project Structure

### Core Directories
- `cmd/server/` - Application entry point
- `internal/` - Private application code
  - `auth/` - Authentication module
  - `models/` - Data models
  - `database/` - Database layer
  - `middleware/` - HTTP middleware
  - `config/` - Configuration management
  - `common/` - Shared utilities
- `pkg/` - Public packages (future use)
- `tests/` - Test files

### Code Organization Principles
- **Clean Architecture**: Clear separation between layers
- **Package by Feature**: Group related functionality
- **Dependency Injection**: Pass dependencies explicitly
- **Interface-based**: Define interfaces for testing

## Adding New Features

### 1. Create Models (if needed)
```go
// internal/models/models.go
type NewModel struct {
    common.BaseModel
    Field1 string `gorm:"not null" json:"field1"`
    Field2 int    `gorm:"default:0" json:"field2"`
}
```

### 2. Add Service Layer
```go
// internal/newfeature/service.go
type Service struct {
    db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
    return &Service{db: db}
}

func (s *Service) Create(req CreateRequest) (*NewModel, error) {
    // Business logic here
}
```

### 3. Add Handlers
```go
// internal/newfeature/handlers.go
type Handler struct {
    service *Service
}

func NewHandler(service *Service) *Handler {
    return &Handler{service: service}
}

func (h *Handler) Create(c *gin.Context) {
    var req CreateRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    result, err := h.service.Create(req)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to create"})
        return
    }
    
    c.JSON(201, gin.H{"data": result})
}
```

### 4. Add Routes
```go
// cmd/server/main.go
newFeatureService := newfeature.NewService(db)
newFeatureHandler := newfeature.NewHandler(newFeatureService)

v1 := router.Group("/api/v1")
{
    v1.POST("/new-feature", newFeatureHandler.Create)
    v1.GET("/new-feature/:id", newFeatureHandler.GetByID)
}
```

## Database Operations

### Running Migrations
```bash
# Auto-migrate runs on server start
# Or run manually:
go run cmd/migrate/main.go
```

### Database Queries
```go
// Find single record
var user models.User
result := db.First(&user, "email = ?", email)

// Find multiple records
var products []models.Product
result := db.Where("status = ?", "active").Find(&products)

// Create record
user := models.User{Email: email}
result := db.Create(&user)

// Update record
result := db.Model(&user).Update("last_login_at", time.Now())

// Delete (soft delete)
result := db.Delete(&user)
```

### Database Connections
- **Development**: SQLite in-memory database
- **Production**: PostgreSQL with connection pooling
- **Configurable**: Via DATABASE_URL environment variable

## Testing

### Unit Testing
```go
// internal/auth/service_test.go
func TestService_Register(t *testing.T) {
    // Setup test database
    db := setupTestDB()
    service := auth.NewService(db, jwtManager)
    
    // Test case
    req := auth.UserRegisterRequest{
        Email: "test@example.com",
        Password: "password123",
    }
    
    user, err := service.Register(req)
    
    // Assertions
    assert.NoError(t, err)
    assert.Equal(t, "test@example.com", user.Email)
}
```

### Integration Testing
```go
// tests/integration/auth_test.go
func TestAuthFlow(t *testing.T) {
    // Setup test server
    server := setupTestServer()
    defer server.Close()
    
    // Register user
    resp, err := http.Post(server.URL+"/api/v1/auth/register", 
        "application/json", 
        strings.NewReader(`{"email":"test@example.com","password":"password123"}`))
    
    // Test login
    loginResp := loginUser(t, server.URL)
    
    // Test protected endpoint
    accessProfile(t, server.URL, loginResp.AccessToken)
}
```

### Running Tests
```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific test
go test ./internal/auth -v

# Run benchmark tests
go test -bench ./...
```

## API Design Guidelines

### RESTful Conventions
- **GET** `/resources` - List resources
- **POST** `/resources` - Create resource
- **GET** `/resources/:id` - Get specific resource
- **PUT** `/resources/:id` - Update entire resource
- **PATCH** `/resources/:id` - Partial update
- **DELETE** `/resources/:id` - Delete resource

### Response Format
```json
{
  "data": {...},        // Main response data
  "message": "...",     // Success message (optional)
  "error": "...",       // Error message (optional)
  "pagination": {...}   // Pagination metadata (lists)
}
```

### Error Handling
```go
// Consistent error responses
c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
c.JSON(http.StatusNotFound, gin.H{"error": "Resource not found"})
c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
```

## Authentication & Authorization

### Protected Routes
```go
// Require authentication
protected := v1.Group("/")
protected.Use(authHandler.RequireAuth())
{
    protected.GET("/profile", authHandler.GetProfile)
}

// Require specific role
sellerOnly := protected.Group("/")
sellerOnly.Use(authHandler.RequireRole("seller"))
{
    sellerOnly.POST("/products", productHandler.Create)
}

// Require multiple roles
sellerOrAdmin := protected.Group("/")
sellerOrAdmin.Use(authHandler.RequireSellerOrAdmin())
{
    sellerOrAdmin.PUT("/products/:id", productHandler.Update)
}
```

### Getting User Context
```go
func (h *Handler) MyEndpoint(c *gin.Context) {
    userID := c.GetString("userID")
    email := c.GetString("email")
    role := c.GetString("role")
    
    // Use user context...
}
```

## Configuration

### Environment Variables
```bash
# .env file
ENV=development
PORT=8080
DATABASE_URL=sqlite:memory:
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
LOG_LEVEL=info
```

### Configuration Usage
```go
// internal/config/config.go
func Load() (*Config, error) {
    return &Config{
        Env:        getEnv("ENV", "development"),
        Port:       getEnv("PORT", "8080"),
        DatabaseURL: getEnv("DATABASE_URL", "sqlite:memory:"),
    }, nil
}
```

## Logging

### Structured Logging
```go
import "github.com/sirupsen/logrus"

log.WithFields(logrus.Fields{
    "user_id": userID,
    "action":  "login",
    "ip":      c.ClientIP(),
}).Info("User logged in")
```

### Log Levels
- **Debug**: Detailed debugging information
- **Info**: General information (default)
- **Warn**: Warning messages
- **Error**: Error messages

## Performance Optimization

### Database Optimization
- Use proper indexes for frequent queries
- Avoid N+1 query problems with eager loading
- Implement pagination for large result sets
- Use connection pooling

### Caching Strategy
- Cache frequently accessed data in Redis
- Use appropriate cache TTL values
- Implement cache invalidation strategies
- Consider CDN for static assets

### HTTP Optimization
- Enable gzip compression
- Minimize JSON payloads
- Use appropriate HTTP status codes
- Implement rate limiting

## Security Best Practices

### Input Validation
```go
type Request struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=8"`
    Age      int    `json:"age" binding:"min=18,max=120"`
}
```

### SQL Injection Prevention
- Always use parameterized queries (GORM handles this)
- Never concatenate SQL strings with user input
- Validate all input before database operations

### Password Security
- Use bcrypt for password hashing
- Minimum 8 character password requirement
- Consider adding password complexity requirements
- Implement password reset functionality

### Token Security
- Use strong JWT secrets (random strings)
- Set appropriate token expiration times
- Implement token refresh mechanism
- Consider token blacklisting for logout

## Debugging

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug go run cmd/server/main.go
```

### Database Debugging
```go
// Enable GORM debug mode
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
    Logger: logger.Default.LogMode(logger.Info),
})
```

### HTTP Debugging
- Use browser dev tools for API calls
- Use curl for testing endpoints
- Consider adding request/response logging middleware

## Common Issues & Solutions

### Database Connection Issues
- Check DATABASE_URL format
- Verify database is running
- Check network connectivity
- Validate credentials

### CORS Issues
- Ensure CORS middleware is configured
- Check allowed origins in production
- Verify preflight request handling

### Token Issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper Authorization header format
- Validate token claims structure

### Rate Limiting Issues
- Adjust rate limits for development
- Check Redis connectivity for distributed limiting
- Verify IP detection logic

## Production Deployment

### Building for Production
```bash
# Build optimized binary
CGO_ENABLED=0 go build -ldflags="-s -w" -o blytz-server cmd/server/main.go

# Build Docker image
docker build -t blytz-backend .
```

### Environment Configuration
- Use strong JWT_SECRET in production
- Set LOG_LEVEL=warn or error
- Configure proper DATABASE_URL with PostgreSQL
- Set up Redis cluster for caching

### Monitoring (Planned)
- Implement health check endpoints
- Add application metrics
- Set up log aggregation
- Configure alerting

## Contributing Guidelines

### Code Style
- Follow Go formatting standards (`go fmt`)
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Git Workflow
- Create feature branches from `develop`
- Use descriptive commit messages
- Submit pull requests for review
- Ensure tests pass before merging

### Code Review Checklist
- [ ] Code follows project style
- [ ] Tests are added/updated
- [ ] Documentation is updated
- [ ] No sensitive data exposed
- [ ] Error handling is proper
- [ ] Performance considered

This guide should help you get started with backend development on the Blytz.live platform. For more specific information, refer to the architecture documentation and API reference.