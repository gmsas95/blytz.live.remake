#!/bin/bash

echo "🧪 Running tests for Blytz.live Backend..."

# Run tests with coverage
echo "📊 Running unit tests with coverage..."
go test -v -coverprofile=coverage.out ./...

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    
    # Generate coverage report
    echo "📈 Generating coverage report..."
    go tool cover -html=coverage.out -o coverage.html
    
    # Get coverage percentage
    COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}')
    echo "📊 Total coverage: $COVERAGE"
    
    # Open coverage report in browser if on macOS
    if command -v open &> /dev/null; then
        open coverage.html
    fi
else
    echo "❌ Some tests failed!"
    exit 1
fi