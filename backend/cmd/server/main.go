package main

import (
	"log"
	"time"

	"github.com/blytz.live.remake/backend/internal/auth"
	"github.com/blytz.live.remake/backend/internal/common"
	"github.com/blytz.live.remake/backend/internal/config"
	"github.com/blytz.live.remake/backend/internal/database"
	"github.com/blytz.live.remake/backend/internal/middleware"
	"github.com/blytz.live.remake/backend/internal/models"
	"github.com/blytz.live.remake/backend/internal/products"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func stringPtr(s string) *string {
	return &s
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Initialize database (using SQLite for demo)
	var db *gorm.DB
	db, err = database.NewConnection(cfg.DatabaseURL)
	if err != nil {
		log.Printf("Warning: Failed to connect to database: %v", err)
		db = nil
	} else {
		log.Println("✅ Database connected")
		
		// Auto-migrate all models
		if db != nil {
			err = db.AutoMigrate(
				&models.User{},
				&models.Category{},
				&models.Product{},
			)
			if err != nil {
				log.Printf("Warning: Failed to auto-migrate database: %v", err)
				db = nil
			} else {
				log.Println("✅ Database migration completed")
				
				// Seed a test category if none exists
				var categoryCount int64
				if err := db.Model(&models.Category{}).Count(&categoryCount).Error; err == nil && categoryCount == 0 {
					testCategory := models.Category{
						BaseModel: common.BaseModel{
							ID: uuid.MustParse("550e8400-e29b-41d4-a716-446655440000"),
						},
						Name:        "Test Category",
						Slug:        "test-category",
						Description: stringPtr("A test category for product management testing"),
						IsActive:    true,
					}
					if err := db.Create(&testCategory).Error; err != nil {
						log.Printf("Warning: Failed to create test category: %v", err)
					} else {
						log.Println("✅ Test category created")
					}
				}
			}
		}
	}

	// Initialize Redis (optional for demo)
	var redisClient *redis.Client
	redisClient = database.NewRedisClient(cfg.RedisURL)
	if redisClient == nil {
		log.Println("Warning: Failed to connect to Redis (continuing without cache)")
	}

	// Set Gin mode based on environment
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	router := gin.Default()

	// Add middleware
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())
	router.Use(middleware.Recovery())
	router.Use(middleware.GeneralRateLimit())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		dbStatus := "disconnected"
		redisStatus := "disconnected"
		
		if db != nil {
			sqlDB, _ := db.DB()
			if sqlDB.Ping() == nil {
				dbStatus = "connected"
			}
		}
		
		if redisClient != nil {
			if _, err := redisClient.Ping(c).Result(); err == nil {
				redisStatus = "connected"
			}
		}
		
		c.JSON(200, gin.H{
			"status":    "ok",
			"database":  dbStatus,
			"redis":     redisStatus,
			"env":       cfg.Env,
		})
	})

	// Initialize auth components if database is available
	var authHandler *auth.Handler
	var productHandler *products.Handler
	if db != nil {
		log.Println("✅ Database available - Initializing authentication system")
		
		// Initialize JWT manager
		jwtManager := auth.NewJWTManager(cfg.JWTSecret, time.Hour)
		
		// Initialize auth service
		authService := auth.NewService(db, jwtManager)
		
		// Initialize auth handler
		authHandler = auth.NewHandler(authService, jwtManager)
		
		// Initialize product service and handler
		productService := products.NewService(db)
		productHandler = products.NewHandler(productService)

		// API v1 routes
		v1 := router.Group("/api/v1")
		
		// Public auth routes
		auth := v1.Group("/auth")
		auth.Use(middleware.AuthRateLimit()) // Stricter rate limiting for auth
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
		}

		// Public product routes
		productsGroup := v1.Group("/products")
		{
			productsGroup.GET("", productHandler.ListProducts)
			productsGroup.GET("/:id", productHandler.GetProduct)
		}

		// Protected routes
		protected := v1.Group("/")
		protected.Use(authHandler.RequireAuth())
		{
			auth := protected.Group("/auth")
			auth.GET("/profile", authHandler.GetProfile)
			auth.POST("/change-password", authHandler.ChangePassword)
			auth.POST("/logout", authHandler.Logout)
			
			// Protected product routes
			productsGroup = protected.Group("/products")
			{
				productsGroup.POST("", productHandler.CreateProduct)
				productsGroup.PUT("/:id", productHandler.UpdateProduct)
				productsGroup.DELETE("/:id", productHandler.DeleteProduct)
				productsGroup.GET("/my-products", productHandler.ListSellerProducts)
			}
		}

		// Seller-only routes
		sellerOnly := v1.Group("/")
		sellerOnly.Use(authHandler.RequireAuth())
		sellerOnly.Use(authHandler.RequireSellerOrAdmin())
		{
			// Additional seller-specific routes can be added here
		}
	} else {
		log.Println("⚠️  No database available - Authentication system disabled")
	}

	// Start server
	port := cfg.ServerPort
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s in %s mode", port, cfg.Env)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}