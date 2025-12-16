package main

import (
	"fmt"
	"log"

	"github.com/blytz.live.remake/backend/internal/config"
	"github.com/blytz.live.remake/backend/internal/database"
	"github.com/blytz.live.remake/backend/internal/models"
)

func main() {
	fmt.Println("🔄 Running database migration...")
	
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config: ", err)
	}
	
	// Connect to database
	db, err := database.NewConnection(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}
	
	// Test connection
	if err := database.TestConnection(db); err != nil {
		log.Fatal("Database connection test failed: ", err)
	}
	
	fmt.Println("✅ Database connection established")
	
	// Auto-migrate all models
	err = db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Product{},
	)
	
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}
	
	fmt.Println("✅ Database migration completed successfully!")
	fmt.Println("📊 Tables created:")
	fmt.Println("   - users")
	fmt.Println("   - categories")
	fmt.Println("   - products")
}