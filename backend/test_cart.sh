#!/bin/bash

# Test script for Shopping Cart API
# This script tests the complete cart functionality

API_BASE="http://localhost:8080/api/v1"

echo "🛒 Testing Shopping Cart API"
echo "=================================="

# 1. Register a test user
echo "1. Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cartuser@example.com",
    "password": "password123",
    "first_name": "Cart",
    "last_name": "User"
  }')

echo "Registration response: $REGISTER_RESPONSE"
echo ""

# 2. Login to get token
echo "2. Logging in to get token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cartuser@example.com",
    "password": "password123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "Token extracted: ${TOKEN:0:50}..."
echo ""

# 3. Create a test product
echo "3. Creating test product..."
PRODUCT_RESPONSE=$(curl -s -X POST "${API_BASE}/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "category_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Cart Test Product",
    "description": "Product for cart testing",
    "condition": "new",
    "starting_price": 99.99,
    "status": "active"
  }')

PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Product ID: $PRODUCT_ID"
echo ""

# 4. Create a cart
echo "4. Creating cart..."
CART_RESPONSE=$(curl -s -X POST "${API_BASE}/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}')

echo "Cart creation response: $CART_RESPONSE"
echo ""

# 5. Get cart details
echo "5. Getting cart details..."
curl -s -X GET "${API_BASE}/cart" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 6. Add item to cart
echo "6. Adding item to cart..."
if [ ! -z "$PRODUCT_ID" ]; then
    ADD_RESPONSE=$(curl -s -X POST "${API_BASE}/cart/items" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"product_id\": \"$PRODUCT_ID\",
        \"quantity\": 2
      }")
    echo "Add item response: $ADD_RESPONSE"
else
    echo "Product ID not found, skipping add item test"
fi
echo ""

# 7. Get cart with item
echo "7. Getting cart with item..."
curl -s -X GET "${API_BASE}/cart" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 8. Update item quantity
echo "8. Updating item quantity..."
if [ ! -z "$PRODUCT_ID" ]; then
    # Get item ID from cart response
    ITEM_ID=$(echo "$ADD_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ ! -z "$ITEM_ID" ]; then
        curl -s -X PUT "${API_BASE}/cart/items/$ITEM_ID" \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $TOKEN" \
          -d '{
            "quantity": 3
          }' | jq '.'
    else
        echo "Item ID not found, skipping update test"
    fi
fi
echo ""

# 9. Remove item from cart
echo "9. Removing item from cart..."
if [ ! -z "$ITEM_ID" ]; then
    curl -s -X DELETE "${API_BASE}/cart/items/$ITEM_ID" \
      -H "Authorization: Bearer $TOKEN" | jq '.'
else
    echo "Item ID not found, skipping remove test"
fi
echo ""

# 10. Clear cart
echo "10. Clearing cart..."
curl -s -X DELETE "${API_BASE}/cart" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 11. Test guest cart (without authentication)
echo "11. Testing guest cart (without authentication)..."
GUEST_CART_RESPONSE=$(curl -s -X POST "${API_BASE}/cart" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Guest cart response: $GUEST_CART_RESPONSE"
echo ""

# 12. Get guest cart details
echo "12. Getting guest cart details..."
curl -s -X GET "${API_BASE}/cart" | jq '.'
echo ""

echo "🎉 Cart API testing complete!"