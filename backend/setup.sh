#!/bin/bash

# Blytz.live Backend Setup Script

echo "🚀 Setting up Blytz.live Backend..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21+ and try again."
    echo "Visit https://go.dev/doc/install for installation instructions."
    exit 1
fi

# Check Go version
GO_VERSION=$(go version | cut -d' ' -f3 | sed 's/go//')
echo "✅ Found Go version: $GO_VERSION"

# Create environment file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your actual configuration values"
fi

# Install dependencies
echo "📦 Installing Go dependencies..."
go mod tidy

# Create logs directory
mkdir -p logs

# Create binaries directory
mkdir -p bin

echo "✅ Backend setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database configuration"
echo "2. Start PostgreSQL and Redis services"
echo "3. Run migrations: go run cmd/migrate/main.go"
echo "4. Start server: go run cmd/server/main.go"
echo ""
echo "Or use Docker:"
echo "docker-compose up -d"