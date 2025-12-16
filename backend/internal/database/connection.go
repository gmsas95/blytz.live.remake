package database

import (
	"context"
	"fmt"
	"strings"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// NewConnection creates a new database connection
func NewConnection(databaseURL string) (*gorm.DB, error) {
	var db *gorm.DB
	var err error

	if strings.HasPrefix(databaseURL, "sqlite:") {
		// SQLite connection for demo
		db, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
	} else {
		// PostgreSQL connection for production
		db, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
	}
	
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return db, nil
}

// NewRedisClient creates a new Redis client
func NewRedisClient(redisURL string) *redis.Client {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		// Return a nil client with error logged elsewhere
		return nil
	}

	client := redis.NewClient(opt)
	
	// Test connection
	ctx := context.Background()
	_, err = client.Ping(ctx).Result()
	if err != nil {
		return nil
	}
	
	return client
}

// TestConnection tests database connectivity
func TestConnection(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	
	return sqlDB.Ping()
}