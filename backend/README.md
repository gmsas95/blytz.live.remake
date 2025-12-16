# Blytz.live Backend

## Overview

This is the backend for Blytz.live - a modern live marketplace platform for real-time auctions and bidding.

## Architecture

- **Framework**: Gin (HTTP framework)
- **Database**: PostgreSQL 17.7 with GORM
- **Cache**: Redis 8+ (for sessions and caching)
- **Authentication**: JWT with refresh tokens
- **Real-time**: Gorilla WebSocket (planned)

## Project Structure

```
backend/
├── cmd/
│   ├── server/          # Main application entry point
│   └── migrate/         # Database migration utility
├── internal/
│   ├── models/          # Data models
│   ├── config/          # Configuration management
│   ├── database/        # Database connections
│   ├── middleware/      # HTTP middleware
│   └── common/          # Shared utilities
├── pkg/                 # Public packages
│   ├── http/            # HTTP utilities
│   ├── logging/         # Logging setup
│   └── validation/      # Input validation
└── tests/              # Test files
```

## Setup

### Prerequisites

- Go 1.21+
- PostgreSQL 17.7
- Redis 8+

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and update values
3. Install dependencies:
   ```bash
   go mod tidy
   ```

### Database Setup

1. Create database:
   ```sql
   CREATE DATABASE blytz_dev;
   ```

2. Run migrations:
   ```bash
   go run cmd/migrate/main.go
   ```

### Running the Application

Development:
```bash
go run cmd/server/main.go
```

Build:
```bash
go build -o blytz-server cmd/server/main.go
./blytz-server
```

### Testing

Run all tests:
```bash
go test ./...
```

Run with coverage:
```bash
go test -cover ./...
```

## API Endpoints

- `GET /health` - Health check

## Environment Variables

See `.env.example` for required environment variables.

## Contributing

1. Follow Go coding standards
2. Write tests for new features
3. Ensure all tests pass before submitting PR