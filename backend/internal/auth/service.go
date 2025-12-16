package auth

import (
	"fmt"
	"time"

	"github.com/blytz.live.remake/backend/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Service handles authentication business logic
type Service struct {
	db         *gorm.DB
	jwtManager *JWTManager
}

// NewService creates a new authentication service
func NewService(db *gorm.DB, jwtManager *JWTManager) *Service {
	return &Service{
		db:         db,
		jwtManager: jwtManager,
	}
}

// Register creates a new user account
func (s *Service) Register(req UserRegisterRequest) (*UserResponse, error) {
	// Check if user already exists
	var existingUser models.User
	if err := s.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return nil, fmt.Errorf("user with email %s already exists", req.Email)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Role:         "buyer", // Default role
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Phone:        req.Phone,
		EmailVerified: false,
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return s.toUserResponse(&user), nil
}

// Login authenticates a user and returns tokens
func (s *Service) Login(req UserLoginRequest) (*AuthResponse, error) {
	// Find user by email
	var user models.User
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("invalid email or password")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	if err := s.db.Save(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to update last login: %w", err)
	}

	// Generate tokens
	accessToken, refreshToken, err := s.jwtManager.Generate(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &AuthResponse{
		User:         *s.toUserResponse(&user),
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    3600, // 1 hour in seconds
	}, nil
}

// RefreshToken generates a new access token from refresh token
func (s *Service) RefreshToken(refreshToken string) (*AuthResponse, error) {
	// Validate refresh token and get claims
	claims, err := s.jwtManager.Validate(refreshToken)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// Find user
	var user models.User
	if err := s.db.Where("id = ?", claims.UserID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Generate new tokens
	accessToken, newRefreshToken, err := s.jwtManager.Generate(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, fmt.Errorf("failed to generate new tokens: %w", err)
	}

	return &AuthResponse{
		User:         *s.toUserResponse(&user),
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    3600, // 1 hour in seconds
	}, nil
}

// GetUserByID retrieves a user by ID
func (s *Service) GetUserByID(userID uuid.UUID) (*UserResponse, error) {
	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return s.toUserResponse(&user), nil
}

// ChangePassword changes a user's password
func (s *Service) ChangePassword(userID uuid.UUID, req ChangePasswordRequest) error {
	// Find user
	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		return fmt.Errorf("current password is incorrect")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash new password: %w", err)
	}

	// Update password
	user.PasswordHash = string(hashedPassword)
	if err := s.db.Save(&user).Error; err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}

// toUserResponse converts a User model to UserResponse
func (s *Service) toUserResponse(user *models.User) *UserResponse {
	return &UserResponse{
		ID:           user.ID,
		Email:        user.Email,
		Role:         user.Role,
		FirstName:    user.FirstName,
		LastName:     user.LastName,
		AvatarURL:    user.AvatarURL,
		Phone:        user.Phone,
		EmailVerified: user.EmailVerified,
		LastLoginAt:  user.LastLoginAt,
		CreatedAt:    user.CreatedAt,
		UpdatedAt:    user.UpdatedAt,
	}
}