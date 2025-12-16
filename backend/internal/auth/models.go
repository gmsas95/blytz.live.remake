package auth

import (
	"time"

	"github.com/google/uuid"
)

// UserLoginRequest represents login request payload
type UserLoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// UserRegisterRequest represents registration request payload
type UserRegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName *string `json:"first_name,omitempty"`
	LastName  *string `json:"last_name,omitempty"`
	Phone     *string `json:"phone,omitempty"`
}

// UserResponse represents user response payload
type UserResponse struct {
	ID           uuid.UUID  `json:"id"`
	Email        string     `json:"email"`
	Role         string     `json:"role"`
	FirstName    *string    `json:"first_name"`
	LastName     *string    `json:"last_name"`
	AvatarURL    *string    `json:"avatar_url"`
	Phone        *string    `json:"phone"`
	EmailVerified bool       `json:"email_verified"`
	LastLoginAt  *time.Time `json:"last_login_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// AuthResponse represents authentication response with tokens
type AuthResponse struct {
	User         UserResponse `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresIn    int          `json:"expires_in"` // seconds
}

// RefreshTokenRequest represents refresh token request
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// ChangePasswordRequest represents password change request
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
}