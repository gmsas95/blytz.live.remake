package config

import (
	"os"
	"strconv"
)

type Config struct {
	Env            string
	DatabaseURL    string
	RedisURL       string
	JWTSecret      string
	ServerPort     string
	LogLevel       string
	LiveKitAPIKey  string
	LiveKitSecret  string
	LiveKitHost    string
	AWSAccessKey   string
	AWSSecretKey   string
	AWSRegion      string
	AWSS3Bucket    string
}

func Load() (*Config, error) {
	return &Config{
		Env:           getEnv("ENV", "development"),
		DatabaseURL:   getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/blytz_dev"),
		RedisURL:      getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:     getEnv("JWT_SECRET", "your-secret-key"),
		ServerPort:    getEnv("PORT", "8080"),
		LogLevel:      getEnv("LOG_LEVEL", "info"),
		LiveKitAPIKey: getEnv("LIVEKIT_API_KEY", ""),
		LiveKitSecret: getEnv("LIVEKIT_API_SECRET", ""),
		LiveKitHost:   getEnv("LIVEKIT_HOST", ""),
		AWSAccessKey:  getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretKey:  getEnv("AWS_SECRET_ACCESS_KEY", ""),
		AWSRegion:     getEnv("AWS_REGION", "us-east-1"),
		AWSS3Bucket:   getEnv("AWS_S3_BUCKET", ""),
	}, nil
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