package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Env                 string
	DatabaseHost        string
	DatabasePort        string
	DatabaseUser        string
	DatabasePass        string
	DatabaseName        string
	DatabaseSSL         string
	RedisHost           string
	RedisPort           string
	RedisPass           string
	JWTSecret           string
	JWTExpiresIn        string
	ServerPort          string
	LogLevel            string
	CORSOrigins         string
	Environment         string
	GeminiAPIKey        string
	StripeSecretKey     string
	StripeWebhookSecret string
}

func Load() (*Config, error) {
	cfg := &Config{
		Env:                 getEnv("ENV", "development"),
		DatabaseHost:        getEnv("DB_HOST", "localhost"),
		DatabasePort:        getEnv("DB_PORT", "5432"),
		DatabaseUser:        getEnv("DB_USER", "postgres"),
		DatabasePass:        getEnv("DB_PASSWORD", ""),
		DatabaseName:        getEnv("DB_NAME", "blytz_marketplace"),
		DatabaseSSL:         getEnv("DB_SSL_MODE", "disable"),
		RedisHost:           getEnv("REDIS_HOST", "localhost"),
		RedisPort:           getEnv("REDIS_PORT", "6379"),
		RedisPass:           getEnv("REDIS_PASSWORD", ""),
		JWTSecret:           getEnvOrError("JWT_SECRET"),
		JWTExpiresIn:        getEnv("JWT_EXPIRES_IN", "1h"),
		ServerPort:          getEnv("PORT", "8080"),
		LogLevel:            getEnv("LOG_LEVEL", "info"),
		CORSOrigins:         getEnv("CORS_ORIGINS", "http://localhost:3000"),
		Environment:         getEnv("ENVIRONMENT", "development"),
		GeminiAPIKey:        getEnv("GEMINI_API_KEY", ""),
		StripeSecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
	}

	// Validate critical security settings in production
	if cfg.Env == "production" {
		if cfg.JWTSecret == "your-secret-key" || cfg.JWTSecret == "" {
			return nil, fmt.Errorf("JWT_SECRET must be set to a secure value in production")
		}
		if cfg.JWTSecret == "super_secret_jwt_key_change_in_production_2024" {
			return nil, fmt.Errorf("JWT_SECRET must be changed from default value in production")
		}
		if len(cfg.JWTSecret) < 32 {
			return nil, fmt.Errorf("JWT_SECRET must be at least 32 characters in production")
		}
		// Allow SSL disable for Docker deployments where DB is on same network
		// if cfg.DatabaseSSL == "disable" {
		// 	return nil, fmt.Errorf("Database SSL must be enabled in production")
		// }
		if cfg.DatabasePass == "" {
			return nil, fmt.Errorf("DB_PASSWORD must be set in production")
		}
		if cfg.DatabasePass == "secure_blytz_password_2024" || cfg.DatabasePass == "postgres" {
			return nil, fmt.Errorf("DB_PASSWORD must be changed from default value in production")
		}
		if cfg.RedisPass == "" {
			return nil, fmt.Errorf("REDIS_PASSWORD must be set in production")
		}
		if cfg.StripeSecretKey == "" {
			return nil, fmt.Errorf("STRIPE_SECRET_KEY must be set in production")
		}
		if cfg.StripeSecretKey == "sk_test_placeholder_change_in_production" {
			return nil, fmt.Errorf("STRIPE_SECRET_KEY must be changed from placeholder in production")
		}
	}

	return cfg, nil
}

func getEnvOrError(key string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	if os.Getenv("ENV") == "production" {
		panic(fmt.Sprintf("Environment variable %s is required in production", key))
	}
	return "your-secret-key" // Default for development only
}

// DatabaseURL returns the PostgreSQL connection string
func (c *Config) DatabaseURL() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		c.DatabaseUser, c.DatabasePass, c.DatabaseHost, c.DatabasePort, c.DatabaseName, c.DatabaseSSL)
}

// RedisURL returns the Redis connection string
func (c *Config) RedisURL() string {
	if c.RedisPass != "" {
		return fmt.Sprintf("redis://:%s@%s:%s", c.RedisPass, c.RedisHost, c.RedisPort)
	}
	return fmt.Sprintf("redis://%s:%s", c.RedisHost, c.RedisPort)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
