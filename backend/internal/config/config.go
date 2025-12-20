package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Env            string
	DatabaseHost   string
	DatabasePort   string
	DatabaseUser   string
	DatabasePass   string
	DatabaseName   string
	DatabaseSSL    string
	RedisHost      string
	RedisPort      string
	RedisPass      string
	JWTSecret      string
	JWTExpiresIn   string
	ServerPort     string
	LogLevel       string
	CORSOrigins    string
	Environment    string
	GeminiAPIKey   string
}

func Load() (*Config, error) {
	cfg := &Config{
		Env:           getEnv("ENV", "development"),
		DatabaseHost:   getEnv("DB_HOST", "localhost"),
		DatabasePort:   getEnv("DB_PORT", "5432"),
		DatabaseUser:   getEnv("DB_USER", "postgres"),
		DatabasePass:   getEnv("DB_PASSWORD", ""),
		DatabaseName:   getEnv("DB_NAME", "blytz_marketplace"),
		DatabaseSSL:    getEnv("DB_SSL_MODE", "disable"),
		RedisHost:      getEnv("REDIS_HOST", "localhost"),
		RedisPort:      getEnv("REDIS_PORT", "6379"),
		RedisPass:      getEnv("REDIS_PASSWORD", ""),
		JWTSecret:     getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpiresIn:  getEnv("JWT_EXPIRES_IN", "168h"),
		ServerPort:    getEnv("PORT", "8080"),
		LogLevel:       getEnv("LOG_LEVEL", "info"),
		CORSOrigins:   getEnv("CORS_ORIGINS", "http://localhost:3000"),
		Environment:    getEnv("ENVIRONMENT", "development"),
		GeminiAPIKey:  getEnv("GEMINI_API_KEY", ""),
	}

	return cfg, nil
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