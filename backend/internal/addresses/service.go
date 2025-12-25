package addresses

import (
	"net/http"
	"time"

	"github.com/blytz.live.remake/backend/internal/common"
	pkghttp "github.com/blytz.live.remake/backend/pkg/http"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Address represents a user's shipping/billing address
type Address struct {
	ID           uuid.UUID `gorm:"primaryKey;type:uuid" json:"id"`
	UserID       uuid.UUID `gorm:"not null;references:ID;index" json:"user_id"`
	Type         string    `gorm:"not null" json:"type"`  // shipping, billing
	Label        string    `gorm:"not null" json:"label"` // Home, Work, etc.
	FirstName    string    `gorm:"not null" json:"first_name"`
	LastName     string    `gorm:"not null" json:"last_name"`
	Company      *string   `json:"company"`
	AddressLine1 string    `gorm:"not null" json:"address_line1"`
	AddressLine2 *string   `json:"address_line2"`
	City         string    `gorm:"not null" json:"city"`
	State        string    `gorm:"not null" json:"state"`
	PostalCode   string    `gorm:"not null" json:"postal_code"`
	Country      string    `gorm:"not null;default:'US'" json:"country"`
	Phone        *string   `json:"phone"`
	IsDefault    bool      `gorm:"default:false" json:"is_default"`
	common.BaseModel
}

// AddressRequest represents request body for address operations
type AddressRequest struct {
	Type         string  `json:"type" binding:"required"`
	Label        string  `json:"label" binding:"required"`
	FirstName    string  `json:"first_name" binding:"required"`
	LastName     string  `json:"last_name" binding:"required"`
	Company      *string `json:"company"`
	AddressLine1 string  `json:"address_line1" binding:"required"`
	AddressLine2 *string `json:"address_line2"`
	City         string  `json:"city" binding:"required"`
	State        string  `json:"state" binding:"required"`
	PostalCode   string  `json:"postal_code" binding:"required"`
	Country      string  `json:"country"`
	Phone        *string `json:"phone"`
	IsDefault    *bool   `json:"is_default"`
}

// AddressResponse represents response for address operations
type AddressResponse struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"user_id"`
	Type         string    `json:"type"`
	Label        string    `json:"label"`
	FirstName    string    `json:"first_name"`
	LastName     string    `json:"last_name"`
	Company      *string   `json:"company"`
	AddressLine1 string    `json:"address_line1"`
	AddressLine2 *string   `json:"address_line2"`
	City         string    `json:"city"`
	State        string    `json:"state"`
	PostalCode   string    `json:"postal_code"`
	Country      string    `json:"country"`
	Phone        *string   `json:"phone"`
	IsDefault    bool      `json:"is_default"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Service handles address business logic
type Service struct {
	db *gorm.DB
}

// NewService creates a new address service
func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

// GetAddresses returns all addresses for a user
func (s *Service) GetAddresses(userID uuid.UUID) ([]Address, error) {
	var addresses []Address
	err := s.db.Where("user_id = ?", userID).Find(&addresses).Error
	return addresses, err
}

// GetAddressByID returns a specific address by ID
func (s *Service) GetAddressByID(id, userID uuid.UUID) (*Address, error) {
	var address Address
	err := s.db.Where("id = ? AND user_id = ?", id, userID).First(&address).Error
	if err != nil {
		return nil, err
	}
	return &address, nil
}

// CreateAddress creates a new address
func (s *Service) CreateAddress(userID uuid.UUID, req *AddressRequest) (*Address, error) {
	// If this is set as default, unset all other default addresses of same type
	if req.IsDefault != nil && *req.IsDefault {
		s.db.Model(&Address{}).Where("user_id = ? AND type = ?", userID, req.Type).
			Update("is_default", false)
	}

	// Default country to US if not provided
	country := req.Country
	if country == "" {
		country = "US"
	}

	// Default is_default to false if not provided
	isDefault := false
	if req.IsDefault != nil {
		isDefault = *req.IsDefault
	}

	address := &Address{
		UserID:       userID,
		Type:         req.Type,
		Label:        req.Label,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Company:      req.Company,
		AddressLine1: req.AddressLine1,
		AddressLine2: req.AddressLine2,
		City:         req.City,
		State:        req.State,
		PostalCode:   req.PostalCode,
		Country:      country,
		Phone:        req.Phone,
		IsDefault:    isDefault,
	}

	err := s.db.Create(address).Error
	if err != nil {
		return nil, err
	}

	return address, nil
}

// UpdateAddress updates an existing address
func (s *Service) UpdateAddress(id, userID uuid.UUID, req *AddressRequest) (*Address, error) {
	// Check if address exists and belongs to user
	var existing Address
	err := s.db.Where("id = ? AND user_id = ?", id, userID).First(&existing).Error
	if err != nil {
		return nil, err
	}

	// If setting as default, unset other defaults of same type
	if req.IsDefault != nil && *req.IsDefault {
		s.db.Model(&Address{}).Where("user_id = ? AND type = ? AND id != ?", userID, req.Type, id).
			Update("is_default", false)
	}

	// Update fields
	updateData := map[string]interface{}{
		"type":          req.Type,
		"label":         req.Label,
		"first_name":    req.FirstName,
		"last_name":     req.LastName,
		"address_line1": req.AddressLine1,
		"address_line2": req.AddressLine2,
		"city":          req.City,
		"state":         req.State,
		"postal_code":   req.PostalCode,
	}

	if req.Company != nil {
		updateData["company"] = *req.Company
	}
	if req.AddressLine2 != nil {
		updateData["address_line2"] = *req.AddressLine2
	}
	if req.Phone != nil {
		updateData["phone"] = *req.Phone
	}
	if req.Country != "" {
		updateData["country"] = req.Country
	} else {
		updateData["country"] = "US"
	}
	if req.IsDefault != nil {
		updateData["is_default"] = *req.IsDefault
	}

	err = s.db.Model(&existing).Updates(updateData).Error
	if err != nil {
		return nil, err
	}

	return &existing, nil
}

// DeleteAddress deletes an address
func (s *Service) DeleteAddress(id, userID uuid.UUID) error {
	result := s.db.Where("id = ? AND user_id = ?", id, userID).Delete(&Address{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return pkghttp.NewHTTPError(http.StatusNotFound, "Address not found")
	}
	return nil
}

// SetDefaultAddress sets an address as default for its type
func (s *Service) SetDefaultAddress(id, userID uuid.UUID) (*Address, error) {
	// Get the address first
	var address Address
	err := s.db.Where("id = ? AND user_id = ?", id, userID).First(&address).Error
	if err != nil {
		return nil, err
	}

	// Unset all other defaults of same type
	s.db.Model(&Address{}).Where("user_id = ? AND type = ? AND id != ?", userID, address.Type, id).
		Update("is_default", false)

	// Set this address as default
	address.IsDefault = true
	err = s.db.Save(&address).Error
	if err != nil {
		return nil, err
	}

	return &address, nil
}

// GetDefaultAddress returns the default address of a specific type
func (s *Service) GetDefaultAddress(userID uuid.UUID, addressType string) (*Address, error) {
	var address Address
	err := s.db.Where("user_id = ? AND type = ? AND is_default = ?", userID, addressType, true).
		First(&address).Error
	if err != nil {
		return nil, err
	}
	return &address, nil
}
