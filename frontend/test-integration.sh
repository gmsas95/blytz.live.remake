#!/bin/bash

echo "🧪 TESTING FRONTEND-BACKEND INTEGRATION"
echo "========================================"

# Test backend health
echo "1. Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s http://localhost:8080/health)
echo "Health Response: $HEALTH_RESPONSE"

# Test products endpoint
echo ""
echo "2. Testing Products Endpoint..."
PRODUCTS_RESPONSE=$(curl -s http://localhost:8080/api/v1/products)
echo "Products Response: $PRODUCTS_RESPONSE"

# Test cart endpoint
echo ""
echo "3. Testing Cart Endpoint..."
CART_RESPONSE=$(curl -s http://localhost:8080/api/v1/cart)
echo "Cart Response: $CART_RESPONSE"

# Test authentication
echo ""
echo "4. Testing Authentication..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@blytz.live",
    "password": "password123"
  }')
echo "Auth Response: $AUTH_RESPONSE"

# Extract token
TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Extracted Token: ${TOKEN:0:50}..."

# Test protected endpoint
echo ""
echo "5. Testing Protected Endpoint with Token..."
if [ ! -z "$TOKEN" ]; then
  PROFILE_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/auth/profile)
  echo "Profile Response: $PROFILE_RESPONSE"
else
  echo "❌ No token available"
fi

echo ""
echo "✅ Integration Test Complete!"