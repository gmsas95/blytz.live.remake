package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// JWTManager handles JWT token generation and validation
type JWTManager struct {
	secretKey     string
	tokenDuration time.Duration
}

// CustomClaims represents custom JWT claims
type CustomClaims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	Role   string    `json:"role"`
	jwt.RegisteredClaims
}

// NewJWTManager creates a new JWT manager
func NewJWTManager(secretKey string, tokenDuration time.Duration) *JWTManager {
	return &JWTManager{
		secretKey:     secretKey,
		tokenDuration: tokenDuration,
	}
}

// Generate generates a new JWT token pair (access and refresh)
func (manager *JWTManager) Generate(userID uuid.UUID, email, role string) (accessToken, refreshToken string, err error) {
	// Generate access token
	accessToken, err = manager.generateToken(userID, email, role, manager.tokenDuration)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate refresh token (longer expiry)
	refreshDuration := time.Hour * 24 * 7 // 7 days
	refreshToken, err = manager.generateToken(userID, email, role, refreshDuration)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return accessToken, refreshToken, nil
}

// generateToken generates a JWT token with specified duration
func (manager *JWTManager) generateToken(userID uuid.UUID, email, role string, duration time.Duration) (string, error) {
	claims := CustomClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "blytz.live",
			Subject:   userID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(manager.secretKey))
}

// Validate validates a JWT token and returns claims
func (manager *JWTManager) Validate(tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(manager.secretKey), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*CustomClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

// Refresh generates a new access token from a valid refresh token
func (manager *JWTManager) Refresh(refreshTokenString string) (string, error) {
	claims, err := manager.Validate(refreshTokenString)
	if err != nil {
		return "", fmt.Errorf("invalid refresh token: %w", err)
	}

	// Generate new access token
	return manager.generateToken(claims.UserID, claims.Email, claims.Role, manager.tokenDuration)
}