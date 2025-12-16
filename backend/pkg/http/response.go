package http

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// Response sends a standardized JSON response
func Response(c *gin.Context, statusCode int, success bool, data interface{}, message string) {
	response := gin.H{
		"success": success,
		"data":    data,
		"message": message,
	}

	c.JSON(statusCode, response)
}

// Success sends a success response
func Success(c *gin.Context, statusCode int, data interface{}) {
	Response(c, statusCode, true, data, "")
}

// SuccessWithMessage sends a success response with message
func SuccessWithMessage(c *gin.Context, statusCode int, data interface{}, message string) {
	Response(c, statusCode, true, data, message)
}

// Error sends an error response
func Error(c *gin.Context, statusCode int, message string) {
	Response(c, statusCode, false, nil, message)
}

// ValidationError sends validation error response
func ValidationError(c *gin.Context, err error) {
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "validation_failed",
			"details": validationErrors,
		})
		return
	}
	
	Error(c, http.StatusBadRequest, "Validation failed")
}

// PaginatedResponse sends paginated response
func PaginatedResponse(c *gin.Context, data interface{}, total int64, page, pageSize int) {
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))
	
	response := gin.H{
		"success": true,
		"data":    data,
		"pagination": gin.H{
			"page":        page,
			"page_size":   pageSize,
			"total":       total,
			"total_pages": totalPages,
		},
	}
	
	c.JSON(http.StatusOK, response)
}

// ParseJSON parses JSON request body
func ParseJSON(c *gin.Context, target interface{}) error {
	if err := c.ShouldBindJSON(target); err != nil {
		return err
	}
	return nil
}

// ParseQuery parses query parameters
func ParseQuery(c *gin.Context, target interface{}) error {
	if err := c.ShouldBindQuery(target); err != nil {
		return err
	}
	return nil
}

// GetUserID extracts user ID from context (set by auth middleware)
func GetUserID(c *gin.Context) (string, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return "", false
	}
	
	if id, ok := userID.(string); ok {
		return id, true
	}
	
	return "", false
}

// GetUserRole extracts user role from context (set by auth middleware)
func GetUserRole(c *gin.Context) (string, bool) {
	userRole, exists := c.Get("user_role")
	if !exists {
		return "", false
	}
	
	if role, ok := userRole.(string); ok {
		return role, true
	}
	
	return "", false
}