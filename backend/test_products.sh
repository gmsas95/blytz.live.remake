#!/bin/bash

# Test script for Product Management API
# Make sure the server is running on http://localhost:8080

API_BASE="http://localhost:8080/api/v1"

echo "=== Testing Product Management API ==="
echo

# 1. Register a seller user
echo "1. Registering a seller user..."
SELLER_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@example.com","password":"password123","first_name":"Test","last_name":"Seller"}')

echo "Response: $SELLER_RESPONSE"
echo

# 2. Login as seller
echo "2. Logging in as seller..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@example.com","password":"password123"}')

echo "Response: $LOGIN_RESPONSE"

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")
echo "Access Token: $ACCESS_TOKEN"
echo

# 3. Create a category first (for the product)
echo "3. Creating a test category (Note: This would require category management API)..."
# Note: Since we don't have category CRUD endpoints yet, we'll use a test category created in the database
echo "Assuming category exists with ID (test with existing category)..."
echo

# 4. Create a product
echo "4. Creating a product..."
PRODUCT_RESPONSE=$(curl -s -X POST "${API_BASE}/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "category_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Test Product",
    "description": "This is a test product for demonstration",
    "condition": "new",
    "starting_price": 100.00,
    "reserve_price": 150.00,
    "buy_now_price": 200.00,
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "specifications": {
      "brand": "Test Brand",
      "model": "Test Model",
      "color": "Black"
    },
    "shipping_info": {
      "weight": 1.5,
      "dimensions": {
        "length": 10,
        "width": 8,
        "height": 5
      }
    }
  }')

echo "Response: $PRODUCT_RESPONSE"

# Extract product ID for subsequent tests
PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('product', {}).get('id', ''))")
echo "Product ID: $PRODUCT_ID"
echo

# 5. Get the product details
if [ ! -z "$PRODUCT_ID" ]; then
  echo "5. Getting product details..."
  GET_PRODUCT_RESPONSE=$(curl -s -X GET "${API_BASE}/products/${PRODUCT_ID}")
  echo "Response: $GET_PRODUCT_RESPONSE"
  echo

  # 6. Update the product
  echo "6. Updating the product..."
  UPDATE_RESPONSE=$(curl -s -X PUT "${API_BASE}/products/${PRODUCT_ID}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
      "title": "Updated Test Product",
      "description": "This is an updated test product",
      "status": "active"
    }')

  echo "Response: $UPDATE_RESPONSE"
  echo

  # 7. List all products
  echo "7. Listing all products..."
  LIST_RESPONSE=$(curl -s -X GET "${API_BASE}/products")
  echo "Response: $LIST_RESPONSE"
  echo

  # 8. List seller's products
  echo "8. Listing seller's products..."
  MY_PRODUCTS_RESPONSE=$(curl -s -X GET "${API_BASE}/products/my-products" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  echo "Response: $MY_PRODUCTS_RESPONSE"
  echo

  # 9. Delete the product
  echo "9. Deleting the product..."
  DELETE_RESPONSE=$(curl -s -X DELETE "${API_BASE}/products/${PRODUCT_ID}" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  echo "Response: $DELETE_RESPONSE"
  echo
else
  echo "Failed to create product. Skipping subsequent tests."
fi

echo "=== Test Complete ==="