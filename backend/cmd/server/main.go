package main

import (
	"log"
	"os"
	"time"

	"github.com/blytz.live.remake/backend/internal/addresses"
	"github.com/blytz.live.remake/backend/internal/auction"
	"github.com/blytz.live.remake/backend/internal/auth"
	"github.com/blytz.live.remake/backend/internal/cache"
	"github.com/blytz.live.remake/backend/internal/cart"
	"github.com/blytz.live.remake/backend/internal/catalog"
	"github.com/blytz.live.remake/backend/internal/common"
	"github.com/blytz.live.remake/backend/internal/config"
	"github.com/blytz.live.remake/backend/internal/database"
	"github.com/blytz.live.remake/backend/internal/middleware"
	"github.com/blytz.live.remake/backend/internal/models"
	"github.com/blytz.live.remake/backend/internal/orders"
	"github.com/blytz.live.remake/backend/internal/payments"
	"github.com/blytz.live.remake/backend/internal/products"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"github.com/gin-contrib/cors"
)

func stringPtr(s string) *string {
	return &s
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
	// Initialize configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Initialize database (using environment config)
	var db *gorm.DB
	db, err = database.NewConnection(cfg.DatabaseURL())
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
				&models.Cart{},
				&models.CartItem{},
				&models.Order{},
				&models.OrderItem{},
				&models.ProductVariant{},
				&models.CategoryAttribute{},
				&models.ProductCollection{},
				&models.InventoryStock{},
				&models.StockMovement{},
				&models.Auction{},
				&models.Bid{},
				&models.AutoBid{},
				&models.AuctionWatch{},
				&models.AuctionStats{},
				&models.LiveStream{},
				&models.ChatMessage{},
				&models.Payment{},
				&models.PaymentMethod{},
				&models.PaymentIntent{},
				&models.Refund{},
				&models.Transaction{},
				&models.Payout{},
				&models.Subscription{},
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

	// Initialize Redis (using environment config)
	var redisClient *redis.Client
	var cacheClient *cache.Cache

	redisClient = database.NewRedisClient(cfg.RedisURL())
	if redisClient == nil {
		log.Println("Warning: Failed to connect to Redis (continuing without cache)")
	} else {
		log.Println("✅ Redis connected")

		// Initialize cache client
		cacheClient, err = cache.NewCache(cfg.RedisURL())
		if err != nil {
			log.Printf("Warning: Failed to initialize cache client: %v (continuing without cache)", err)
			cacheClient = nil
		} else {
			log.Println("✅ Cache client initialized")
		}
	}

	// Set Gin mode based on environment
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	router := gin.Default()

	// Add CORS middleware
	cors := cors.New(cors.Config{
		AllowOrigins:     []string{"https://blytz.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type", "X-Requested-With"},
		AllowCredentials: true,
	})
	router.Use(cors)

	// Add middleware
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())
	router.Use(middleware.Recovery())
	router.Use(middleware.GeneralRateLimit())
	router.Use(middleware.SecurityHeaders())
	router.Use(middleware.HTTPSRedirect())

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
			"status":   "ok",
			"database": dbStatus,
			"redis":    redisStatus,
			"env":      cfg.Env,
		})
	})

	// Root endpoint for container health check
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Blytz.live Backend API",
			"version": "1.0.0",
			"status":  "running",
		})
	})

	// Initialize auth components if database is available
	var authHandler *auth.Handler
	var productHandler *products.Handler
	var cartHandler *cart.Handler
	var orderHandler *orders.Handler
	var catalogHandler *catalog.Handler
	var auctionHandler *auction.Handler
	var paymentHandler *payments.Handler
	var cartService *cart.Service
	var orderService *orders.Service
	var auctionService *auction.Service
	var paymentService *payments.Service
	var wsManager *auction.WebSocketManager
	if db != nil {
		log.Println("✅ Database available - Initializing authentication system")

		// Initialize JWT manager with cache support
		jwtManager := auth.NewJWTManager(cfg.JWTSecret, time.Hour, cacheClient)

		// Initialize auth service
		authService := auth.NewService(db, jwtManager)

		// Initialize auth handler
		authHandler = auth.NewHandler(authService, jwtManager)

		// Initialize product service and handler
		productService := products.NewService(db)
		productHandler = products.NewHandler(productService)

		// Initialize cart service and handler
		cartService = cart.NewService(db)
		cartHandler = cart.NewHandler(cartService)

		// Initialize order service and handler
		orderService = orders.NewService(db, cartService)
		orderHandler = orders.NewHandler(orderService)

		// Initialize catalog service and handler
		catalogService := catalog.NewService(db)
		catalogHandler = catalog.NewHandler(catalogService)

		// Initialize auction service and handler
		auctionService = auction.NewService(db)
		auctionHandler = auction.NewHandler(auctionService)

		// Initialize WebSocket manager for auctions
		wsManager = auction.NewWebSocketManager(db, auctionService)

		// Set WebSocket manager in auction service for notifications
		auctionService.SetWebSocketManager(wsManager)

		// Initialize payment service
		paymentService = payments.NewService(db, cfg.StripeSecretKey)
		paymentHandler = payments.NewHandler(paymentService)

		// Initialize address service
		addressService := addresses.NewService(db)
		addressHandler := addresses.NewHandler(addressService)

		// Set Stripe webhook secret in handler context (using a global variable for now)
		// router.Set("stripe_webhook_secret", cfg.StripeWebhookSecret)

		// Initialize LiveKit service
		// livekitService = livekit.NewService(db,
		// 	getEnv("LIVEKIT_HOST", "http://localhost:7880"),
		// 	getEnv("LIVEKIT_API_KEY", ""),
		// 	getEnv("LIVEKIT_API_SECRET", ""),
		// )
		// livekitHandler = livekit.NewHandler(livekitService)

		// API v1 routes
		v1 := router.Group("/api/v1")
		v1.Use(middleware.APISecurity())

		// Public auth routes
		auth := v1.Group("/auth")
		auth.Use(middleware.AuthRateLimit()) // Stricter rate limiting for auth
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
		}

		// Public product and catalog routes
		productsGroup := v1.Group("/products")
		{
			productsGroup.GET("", productHandler.ListProducts)
			productsGroup.GET("/:id", productHandler.GetProduct)
			productsGroup.GET("/flash", productHandler.GetFlashProducts)
			productsGroup.GET("/hot", productHandler.GetHotProducts)
		}

		// Public catalog routes
		catalogHandler.RegisterRoutes(v1.Group("/catalog"), authHandler)

		// Public auction routes
		auctionsGroup := v1.Group("/auctions")
		{
			auctionsGroup.GET("", auctionHandler.ListAuctions)
			auctionsGroup.GET("/live", auctionHandler.GetLiveAuctions)
			auctionsGroup.GET("/:id", auctionHandler.GetAuction)
			auctionsGroup.GET("/:id/bids", auctionHandler.GetAuctionBids)
			auctionsGroup.GET("/:id/stats", auctionHandler.GetAuctionStats)
		}

		// WebSocket route for auctions
		router.GET("/ws/auctions", wsManager.HandleWebSocket)

		// LiveKit streaming routes (temporarily disabled)
		// livekitGroup := v1.Group("/livekit")
		// {
		// 	livekitGroup.GET("/streams", livekitHandler.ListActiveStreams)
		// 	livekitGroup.GET("/auctions/:auction_id/stream", livekitHandler.GetStreamInfo)
		// 	livekitGroup.GET("/auctions/:auction_id/token/viewer", livekitHandler.GetViewerToken)
		// 	livekitGroup.GET("/auctions/:auction_id/recording", livekitHandler.GetStreamRecording)
		// }

		// Payment routes
		paymentsGroup := v1.Group("/payments")
		{
			paymentsGroup.GET("/methods", paymentHandler.GetPaymentMethods)
			paymentsGroup.POST("/intents", paymentHandler.CreatePaymentIntent)
			paymentsGroup.POST("/confirm", paymentHandler.ConfirmPayment)
		}

		// Webhook route for Stripe
		router.POST("/webhooks/stripe", paymentHandler.ProcessWebhook)

		// Public cart routes (with middleware)
		cartGroup := v1.Group("/cart")
		cartGroup.Use(cart.CartMiddleware(cartService))
		{
			cartGroup.GET("", cartHandler.GetCart)
			cartGroup.POST("", cartHandler.CreateCart)
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
			protectedProductGroup := protected.Group("/products")
			{
				protectedProductGroup.POST("", productHandler.CreateProduct)
				protectedProductGroup.PUT("/:id", productHandler.UpdateProduct)
				protectedProductGroup.DELETE("/:id", productHandler.DeleteProduct)
			}

			// Protected cart routes
			cartGroup = protected.Group("/cart")
			cartGroup.Use(cart.CartMiddleware(cartService))
			{
				cartGroup.POST("/items", cartHandler.AddItem)
				cartGroup.PUT("/items/:id", cartHandler.UpdateItem)
				cartGroup.DELETE("/items/:id", cartHandler.RemoveItem)
				cartGroup.DELETE("", cartHandler.ClearCart)
				cartGroup.POST("/merge", cartHandler.MergeCart)
			}

			// Protected auction routes
			protectedAuctionGroup := protected.Group("/auctions")
			{
				protectedAuctionGroup.POST("", auctionHandler.CreateAuction)
				protectedAuctionGroup.POST("/:id/bid", auctionHandler.PlaceBid)
				protectedAuctionGroup.POST("/:id/autobid", auctionHandler.SetAutoBid)
				protectedAuctionGroup.POST("/:id/join", auctionHandler.JoinAuction)
				protectedAuctionGroup.POST("/:id/leave", auctionHandler.LeaveAuction)
				protectedAuctionGroup.PUT("/:id/start", auctionHandler.StartAuction) // Seller/admin
				protectedAuctionGroup.PUT("/:id/end", auctionHandler.EndAuction)     // Seller/admin
			}

			// Order routes
			ordersGroup := protected.Group("/orders")
			{
				ordersGroup.POST("", orderHandler.CreateOrder)
				ordersGroup.GET("", orderHandler.ListOrders)
				ordersGroup.GET("/:id", orderHandler.GetOrder)
				ordersGroup.PUT("/:id/status", orderHandler.UpdateOrderStatus) // Admin/seller
				ordersGroup.DELETE("/:id", orderHandler.CancelOrder)
			}

			// Protected payment routes
			protectedPaymentGroup := protected.Group("/payments")
			{
				protectedPaymentGroup.GET("/methods", paymentHandler.GetUserPaymentMethods)
				protectedPaymentGroup.POST("/methods", paymentHandler.SavePaymentMethod)
				protectedPaymentGroup.GET("/:id", paymentHandler.GetPaymentIntent)
			}

			// Address routes
			addressHandler.RegisterRoutes(v1.Group("/"), authHandler)

			// Protected LiveKit routes (temporarily disabled)
			// protectedLivekitGroup := protected.Group("/livekit")
			// protectedLivekitGroup.Use(authHandler.RequireAuth())
			// protectedLivekitGroup.Use(authHandler.RequireSellerOrAdmin())
			// {
			// 	protectedLivekitGroup.POST("/auctions/:auction_id/rooms", livekitHandler.CreateAuctionRoom)
			// 	protectedLivekitGroup.GET("/auctions/:auction_id/token/host", livekitHandler.GetHostToken)
			// 	protectedLivekitGroup.POST("/auctions/:auction_id/start", livekitHandler.StartAuctionStream)
			// 	protectedLivekitGroup.POST("/auctions/:auction_id/end", livekitHandler.EndAuctionStream)
			// 	protectedLivekitGroup.POST("/auctions/:auction_id/record", livekitHandler.RecordStream)
			// 	protectedLivekitGroup.POST("/auctions/:auction_id/metrics", livekitHandler.UpdateStreamMetrics)
			// 	protectedLivekitGroup.GET("/auctions/:auction_id/recording-url", livekitHandler.GenerateStreamRecordingURL)
			// }

			// Admin routes
			admin := protected.Group("/admin")
			admin.Use(authHandler.RequireRole("admin"))
			{
				admin.GET("/orders/statistics", orderHandler.GetOrderStatistics)
				admin.POST("/payments/refund", paymentHandler.RefundPayment)
				admin.GET("/payments", paymentHandler.ListPayments)
				admin.GET("/payments/:id", paymentHandler.GetPayment)
			}
		}

		// Seller-only routes
		sellerOnly := v1.Group("/")
		sellerOnly.Use(authHandler.RequireAuth())
		sellerOnly.Use(authHandler.RequireSellerOrAdmin())
		{
			// Additional seller-specific routes can be added here
		}

		// Seller-only LiveKit routes (temporarily disabled)
		// sellerLivekitGroup := v1.Group("/livekit")
		// sellerLivekitGroup.Use(authHandler.RequireAuth())
		// sellerLivekitGroup.Use(authHandler.RequireSellerOrAdmin())
		// {
		// 	sellerLivekitGroup.GET("/auctions/:auction_id/participants", livekitHandler.GetRoomParticipants)
		// 	sellerLivekitGroup.DELETE("/auctions/:auction_id/participants/:participant_sid", livekitHandler.RemoveParticipant)
		// 	sellerLivekitGroup.PUT("/auctions/:auction_id/participants/:participant_sid/mute", livekitHandler.MuteParticipant)
		// }
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
