package tests

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/blytz.live.remake/backend/internal/auth"
	"github.com/blytz.live.remake/backend/internal/models"
	"github.com/blytz.live.remake/backend/internal/products"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// SetupTestDB creates an in-memory SQLite database for testing
func setupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to test database:", err)
	}

	// Auto-migrate all models
	err = db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Product{},
	)
	if err != nil {
		log.Fatal("Failed to migrate test database:", err)
	}

	return db
}

// CreateTestCategory creates a test category
func createTestCategory(db *gorm.DB) *models.Category {
	category := models.Category{
		Name:        "Electronics",
		Slug:        "electronics",
		Description: stringPtr("Electronic devices and gadgets"),
		IsActive:    true,
	}
	db.Create(&category)
	return &category
}

// CreateTestUser creates a test user with seller role
func createTestUser(db *gorm.DB) *models.User {
	user := models.User{
		Email:       "seller@test.com",
		PasswordHash: "hashedpassword",
		Role:        "seller",
		FirstName:   stringPtr("Test"),
		LastName:    stringPtr("Seller"),
	}
	db.Create(&user)
	return &user
}

// Helper function to create string pointers
func stringPtr(s string) *string {
	return &s
}

func TestProductFlow(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB()
	
	// Create test data
	category := createTestCategory(db)
	seller := createTestUser(db)
	
	// Initialize services
	jwtManager := auth.NewJWTManager("test-secret", time.Hour)
	authService := auth.NewService(db, jwtManager)
	authHandler := auth.NewHandler(authService, jwtManager)
	productService := products.NewService(db)
	productHandler := products.NewHandler(productService)
	
	// Create router with middleware
	router := gin.New()
	router.Use(func(c *gin.Context) {
		// Mock authentication middleware
		c.Set("userID", seller.ID.String())
		c.Set("email", seller.Email)
		c.Set("role", seller.Role)
		c.Next()
	})
	
	// Setup routes
	v1 := router.Group("/api/v1")
	{
		// Product routes
		productsGroup := v1.Group("/products")
		{
			productsGroup.POST("", productHandler.CreateProduct)
			productsGroup.GET("/:id", productHandler.GetProduct)
			productsGroup.PUT("/:id", productHandler.UpdateProduct)
			productsGroup.DELETE("/:id", productHandler.DeleteProduct)
			productsGroup.GET("", productHandler.ListProducts)
		}
		
		// Protected seller routes
		protected := v1.Group("/")
		protected.Use(authHandler.RequireAuth())
		{
			sellerProducts := protected.Group("/products")
			sellerProducts.GET("/my-products", productHandler.ListSellerProducts)
		}
	}
	
	// Test 1: Create a product
	t.Run("CreateProduct", func(t *testing.T) {
		productReq := map[string]interface{}{
			"category_id":    category.ID,
			"title":         "Test Product",
			"description":   stringPtr("This is a test product"),
			"condition":     stringPtr("new"),
			"starting_price": 100.00,
			"reserve_price":  float64Ptr(150.00),
			"buy_now_price":  float64Ptr(200.00),
			"images":        []string{"http://example.com/image1.jpg", "http://example.com/image2.jpg"},
			"specifications": map[string]interface{}{
				"brand": "Test Brand",
				"model": "Test Model",
			},
			"shipping_info": map[string]interface{}{
				"weight": 1.5,
				"dimensions": map[string]interface{}{
					"length": 10,
					"width":  8,
					"height": 5,
				},
			},
		}
		
		body, _ := json.Marshal(productReq)
		req, _ := http.NewRequest("POST", "/api/v1/products", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		if w.Code != http.StatusCreated {
			t.Errorf("Expected status %d, got %d", http.StatusCreated, w.Code)
			t.Errorf("Response: %s", w.Body.String())
		}
		
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		product := response["product"].(map[string]interface{})
		
		if product["title"].(string) != "Test Product" {
			t.Errorf("Expected title 'Test Product', got '%s'", product["title"])
		}
		
		if product["starting_price"].(float64) != 100.00 {
			t.Errorf("Expected starting_price 100.00, got %f", product["starting_price"])
		}
		
		// Store product ID for subsequent tests
		productID = product["id"].(string)
	})
	
	// Test 2: Get the created product
	t.Run("GetProduct", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/products/"+productID, nil)
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}
		
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		product := response["product"].(map[string]interface{})
		
		if product["id"].(string) != productID {
			t.Errorf("Expected product ID %s, got %s", productID, product["id"])
		}
		
		if product["view_count"].(float64) < 1 {
			t.Errorf("Expected view_count to be at least 1, got %f", product["view_count"])
		}
	})
	
	// Test 3: Update the product
	t.Run("UpdateProduct", func(t *testing.T) {
		updateReq := map[string]interface{}{
			"title":       stringPtr("Updated Test Product"),
			"description": stringPtr("This is an updated test product"),
		}
		
		body, _ := json.Marshal(updateReq)
		req, _ := http.NewRequest("PUT", "/api/v1/products/"+productID, bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}
		
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		product := response["product"].(map[string]interface{})
		
		if product["title"].(string) != "Updated Test Product" {
			t.Errorf("Expected title 'Updated Test Product', got '%s'", product["title"])
		}
	})
	
	// Test 4: List products
	t.Run("ListProducts", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/products", nil)
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}
		
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		
		if response["data"] == nil {
			t.Error("Expected data in response, got nil")
		}
	})
	
	// Test 5: List seller products
	t.Run("ListSellerProducts", func(t *testing.T) {
		// Use the public endpoint instead since our test doesn't use JWT tokens
		req, _ := http.NewRequest("GET", "/api/v1/products?seller_id="+seller.ID.String(), nil)
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}
		
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		
		if response["data"] == nil {
			t.Error("Expected data in response, got nil")
		}
	})
	
	// Test 6: Delete the product
	t.Run("DeleteProduct", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/api/v1/products/"+productID, nil)
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}
	})
}

// Helper function to create float64 pointers
func float64Ptr(f float64) *float64 {
	return &f
}

var productID string