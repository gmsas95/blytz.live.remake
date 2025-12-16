#!/bin/bash

# API Testing Script for Blytz.live Backend
# This script tests all the authentication endpoints

echo "🧪 Testing Blytz.live Authentication API"
echo "=================================="

BASE_URL="http://localhost:8080"

# Test 1: Health Check
echo "📊 Test 1: Health Check"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
echo "Health Status: $(echo $HEALTH_RESPONSE | jq -r '.status')"
echo "Database: $(echo $HEALTH_RESPONSE | jq -r '.database')"
echo "Redis: $(echo $HEALTH_RESPONSE | jq -r '.redis')"
echo ""

# Test 2: User Registration
echo "👤 Test 2: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "testpassword123",
    "first_name": "API",
    "last_name": "Test"
  }')

REGISTER_SUCCESS=$(echo $REGISTER_RESPONSE | jq -r '.user.email // .error')
echo "Registration Result: $REGISTER_SUCCESS"
echo ""

# Test 3: Login with new user
echo "🔐 Test 3: User Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "testpassword123"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token // empty')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refresh_token // empty')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.user.id // empty')

if [ ! -z "$ACCESS_TOKEN" ]; then
    echo "✅ Login successful"
    echo "Access Token: ${ACCESS_TOKEN:0:20}..."
    echo "User ID: $USER_ID"
else
    echo "❌ Login failed: $(echo $LOGIN_RESPONSE | jq -r '.error')"
fi
echo ""

# Test 4: Get Profile (Protected Endpoint)
echo "👤 Test 4: Get User Profile"
if [ ! -z "$ACCESS_TOKEN" ]; then
    PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/auth/profile" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    PROFILE_EMAIL=$(echo $PROFILE_RESPONSE | jq -r '.user.email // .error')
    echo "Profile Result: $PROFILE_EMAIL"
else
    echo "❌ Skipping profile test - no access token"
fi
echo ""

# Test 5: Change Password
echo "🔑 Test 5: Change Password"
if [ ! -z "$ACCESS_TOKEN" ]; then
    PASSWORD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/change-password" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "current_password": "testpassword123",
        "new_password": "newpassword456"
      }')
    
    PASSWORD_RESULT=$(echo $PASSWORD_RESPONSE | jq -r '.message // .error')
    echo "Password Change Result: $PASSWORD_RESULT"
else
    echo "❌ Skipping password change test - no access token"
fi
echo ""

# Test 6: Login with new password
echo "🔐 Test 6: Login with New Password"
NEW_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "newpassword456"
  }')

NEW_ACCESS_TOKEN=$(echo $NEW_LOGIN_RESPONSE | jq -r '.access_token // empty')

if [ ! -z "$NEW_ACCESS_TOKEN" ]; then
    echo "✅ Login with new password successful"
else
    echo "❌ Login with new password failed: $(echo $NEW_LOGIN_RESPONSE | jq -r '.error')"
fi
echo ""

# Test 7: Test Error Handling - Invalid Login
echo "❌ Test 7: Invalid Login Credentials"
INVALID_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "wrongpassword"
  }')

INVALID_LOGIN_ERROR=$(echo $INVALID_LOGIN_RESPONSE | jq -r '.error')
echo "Invalid Login Error: $INVALID_LOGIN_ERROR"
echo ""

# Test 8: Test Error Handling - Duplicate Registration
echo "❌ Test 8: Duplicate User Registration"
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "password123"
  }')

DUPLICATE_ERROR=$(echo $DUPLICATE_RESPONSE | jq -r '.error')
echo "Duplicate Registration Error: $DUPLICATE_ERROR"
echo ""

# Test 9: Test Protected Endpoint without Token
echo "🔒 Test 9: Protected Endpoint without Token"
NO_TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/auth/profile")
NO_TOKEN_ERROR=$(echo $NO_TOKEN_RESPONSE | jq -r '.error')
echo "No Token Error: $NO_TOKEN_ERROR"
echo ""

# Test 10: Test Protected Endpoint with Invalid Token
echo "🔒 Test 10: Protected Endpoint with Invalid Token"
INVALID_TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/auth/profile" \
  -H "Authorization: Bearer invalid-token")
INVALID_TOKEN_ERROR=$(echo $INVALID_TOKEN_RESPONSE | jq -r '.error')
echo "Invalid Token Error: $INVALID_TOKEN_ERROR"
echo ""

# Test 11: Logout
echo "🚪 Test 11: User Logout"
if [ ! -z "$NEW_ACCESS_TOKEN" ]; then
    LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/logout" \
      -H "Authorization: Bearer $NEW_ACCESS_TOKEN")
    
    LOGOUT_RESULT=$(echo $LOGOUT_RESPONSE | jq -r '.message // .error')
    echo "Logout Result: $LOGOUT_RESULT"
else
    echo "❌ Skipping logout test - no access token"
fi
echo ""

echo "🎉 API Testing Complete!"
echo "=================================="