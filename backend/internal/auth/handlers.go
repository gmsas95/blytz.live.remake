package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Handler handles HTTP requests for authentication
type Handler struct {
	service    *Service
	jwtManager *JWTManager
}

// NewHandler creates a new authentication handler
func NewHandler(service *Service, jwtManager *JWTManager) *Handler {
	return &Handler{
		service:    service,
		jwtManager: jwtManager,
	}
}

// Register handles user registration
func (h *Handler) Register(c *gin.Context) {
	var req UserRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.service.Register(req)
	if err != nil {
		if strings.Contains(err.Error(), "already exists") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"user": user})
}

// Login handles user login
func (h *Handler) Login(c *gin.Context) {
	var req UserLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	authResponse, err := h.service.Login(req)
	if err != nil {
		if strings.Contains(err.Error(), "invalid email or password") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Login failed"})
		return
	}

	c.JSON(http.StatusOK, authResponse)
}

// RefreshToken handles token refresh
func (h *Handler) RefreshToken(c *gin.Context) {
	var req RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	authResponse, err := h.service.RefreshToken(req.RefreshToken)
	if err != nil {
		if strings.Contains(err.Error(), "invalid refresh token") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to refresh token"})
		return
	}

	c.JSON(http.StatusOK, authResponse)
}

// GetProfile handles getting user profile
func (h *Handler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Parse user ID from string to UUID
	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := h.service.GetUserByID(uid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// ChangePassword handles password change
func (h *Handler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse user ID from string to UUID
	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	err = h.service.ChangePassword(uid, req)
	if err != nil {
		if strings.Contains(err.Error(), "current password is incorrect") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to change password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

// Logout handles user logout
func (h *Handler) Logout(c *gin.Context) {
	// In a production environment, you might want to:
	// 1. Invalidate the refresh token (store in Redis with TTL)
	// 2. Add the token to a blacklist
	// 3. Clear any server-side session data
	
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// RequireAuth is middleware that validates JWT token
func (h *Handler) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := tokenParts[1]
		claims, err := h.jwtManager.Validate(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Add user info to context
		c.Set("userID", claims.UserID.String())
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// RequireRole is middleware that checks if user has required role
func (h *Handler) RequireRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User role not found"})
			c.Abort()
			return
		}

		// Admin can access everything
		if userRole.(string) == "admin" {
			c.Next()
			return
		}

		if userRole.(string) != requiredRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireSellerOrAdmin is middleware that checks if user is seller or admin
func (h *Handler) RequireSellerOrAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User role not found"})
			c.Abort()
			return
		}

		role := userRole.(string)
		if role != "seller" && role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Seller or admin permissions required"})
			c.Abort()
			return
		}

		c.Next()
	}
}