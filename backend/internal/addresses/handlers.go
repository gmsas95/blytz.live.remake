package addresses

import (
	"errors"
	"net/http"

	"github.com/blytz.live.remake/backend/internal/auth"
	pkghttp "github.com/blytz.live.remake/backend/pkg/http"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Handler handles address-related HTTP requests
type Handler struct {
	service *Service
}

// NewHandler creates a new address handler
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// RegisterRoutes registers address routes with router
func (h *Handler) RegisterRoutes(router *gin.RouterGroup, authHandler *auth.Handler) {
	// Public routes (none - all addresses require auth)

	// Protected routes
	protected := router.Group("/addresses")
	protected.Use(authHandler.RequireAuth())
	{
		protected.GET("", h.GetAddresses)
		protected.POST("", h.CreateAddress)
		protected.GET("/:id", h.GetAddress)
		protected.PUT("/:id", h.UpdateAddress)
		protected.DELETE("/:id", h.DeleteAddress)
		protected.PUT("/:id/default", h.SetDefaultAddress)
	}
}

// GetAddresses returns all addresses for the authenticated user
func (h *Handler) GetAddresses(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		pkghttp.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	id, err := uuid.Parse(userID.(string))
	if err != nil {
		pkghttp.Error(c, http.StatusInternalServerError, "Invalid user ID", err)
		return
	}

	addresses, err := h.service.GetAddresses(id)
	if err != nil {
		pkghttp.Error(c, http.StatusInternalServerError, "Failed to get addresses", err)
		return
	}

	// Convert to response format
	response := make([]AddressResponse, len(addresses))
	for i, addr := range addresses {
		response[i] = AddressResponse{
			ID:           addr.ID,
			UserID:       addr.UserID,
			Type:         addr.Type,
			Label:        addr.Label,
			FirstName:    addr.FirstName,
			LastName:     addr.LastName,
			Company:      addr.Company,
			AddressLine1: addr.AddressLine1,
			AddressLine2: addr.AddressLine2,
			City:         addr.City,
			State:        addr.State,
			PostalCode:   addr.PostalCode,
			Country:      addr.Country,
			Phone:        addr.Phone,
			IsDefault:    addr.IsDefault,
			CreatedAt:    addr.CreatedAt,
			UpdatedAt:    addr.UpdatedAt,
		}
	}

	pkghttp.Success(c, http.StatusOK, gin.H{
		"addresses": response,
		"total":     len(response),
	})
}

// GetAddress returns a specific address by ID
func (h *Handler) GetAddress(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		pkghttp.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		pkghttp.Error(c, http.StatusInternalServerError, "Invalid user ID", err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkghttp.Error(c, http.StatusBadRequest, "Invalid address ID", err)
		return
	}

	address, err := h.service.GetAddressByID(id, uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			pkghttp.Error(c, http.StatusNotFound, "Address not found", err)
			return
		}
		pkghttp.Error(c, http.StatusInternalServerError, "Failed to get address", err)
		return
	}

	response := AddressResponse{
		ID:           address.ID,
		UserID:       address.UserID,
		Type:         address.Type,
		Label:        address.Label,
		FirstName:    address.FirstName,
		LastName:     address.LastName,
		Company:      address.Company,
		AddressLine1: address.AddressLine1,
		AddressLine2: address.AddressLine2,
		City:         address.City,
		State:        address.State,
		PostalCode:   address.PostalCode,
		Country:      address.Country,
		Phone:        address.Phone,
		IsDefault:    address.IsDefault,
		CreatedAt:    address.CreatedAt,
		UpdatedAt:    address.UpdatedAt,
	}

	pkghttp.Success(c, http.StatusOK, response)
}

// CreateAddress creates a new address
func (h *Handler) CreateAddress(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		pkghttp.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		pkghttp.Error(c, http.StatusInternalServerError, "Invalid user ID", err)
		return
	}

	var req AddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkghttp.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Validate address type
	if req.Type != "shipping" && req.Type != "billing" {
		pkghttp.Error(c, http.StatusBadRequest, "Address type must be 'shipping' or 'billing'", nil)
		return
	}

	address, err := h.service.CreateAddress(uid, &req)
	if err != nil {
		pkghttp.Error(c, http.StatusInternalServerError, "Failed to create address", err)
		return
	}

	response := AddressResponse{
		ID:           address.ID,
		UserID:       address.UserID,
		Type:         address.Type,
		Label:        address.Label,
		FirstName:    address.FirstName,
		LastName:     address.LastName,
		Company:      address.Company,
		AddressLine1: address.AddressLine1,
		AddressLine2: address.AddressLine2,
		City:         address.City,
		State:        address.State,
		PostalCode:   address.PostalCode,
		Country:      address.Country,
		Phone:        address.Phone,
		IsDefault:    address.IsDefault,
		CreatedAt:    address.CreatedAt,
		UpdatedAt:    address.UpdatedAt,
	}

	pkghttp.Success(c, http.StatusCreated, response)
}

// UpdateAddress updates an existing address
func (h *Handler) UpdateAddress(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		pkghttp.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		pkghttp.Error(c, http.StatusInternalServerError, "Invalid user ID", err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkghttp.Error(c, http.StatusBadRequest, "Invalid address ID", err)
		return
	}

	var req AddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkghttp.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Validate address type
	if req.Type != "shipping" && req.Type != "billing" {
		pkghttp.Error(c, http.StatusBadRequest, "Address type must be 'shipping' or 'billing'", nil)
		return
	}

	address, err := h.service.UpdateAddress(id, uid, &req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			pkghttp.Error(c, http.StatusNotFound, "Address not found", err)
			return
		}
		pkghttp.Error(c, http.StatusInternalServerError, "Failed to update address", err)
		return
	}

	response := AddressResponse{
		ID:           address.ID,
		UserID:       address.UserID,
		Type:         address.Type,
		Label:        address.Label,
		FirstName:    address.FirstName,
		LastName:     address.LastName,
		Company:      address.Company,
		AddressLine1: address.AddressLine1,
		AddressLine2: address.AddressLine2,
		City:         address.City,
		State:        address.State,
		PostalCode:   address.PostalCode,
		Country:      address.Country,
		Phone:        address.Phone,
		IsDefault:    address.IsDefault,
		CreatedAt:    address.CreatedAt,
		UpdatedAt:    address.UpdatedAt,
	}

	pkghttp.Success(c, http.StatusOK, response)
}

// DeleteAddress deletes an address
func (h *Handler) DeleteAddress(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		pkghttp.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		pkghttp.Error(c, http.StatusInternalServerError, "Invalid user ID", err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkghttp.Error(c, http.StatusBadRequest, "Invalid address ID", err)
		return
	}

	err = h.service.DeleteAddress(id, uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			pkghttp.Error(c, http.StatusNotFound, "Address not found", err)
			return
		}
		pkghttp.Error(c, http.StatusInternalServerError, "Failed to delete address", err)
		return
	}

	pkghttp.Success(c, http.StatusOK, gin.H{
		"message": "Address deleted successfully",
	})
}

// SetDefaultAddress sets an address as default
func (h *Handler) SetDefaultAddress(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		pkghttp.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		pkghttp.Error(c, http.StatusInternalServerError, "Invalid user ID", err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		pkghttp.Error(c, http.StatusBadRequest, "Invalid address ID", err)
		return
	}

	address, err := h.service.SetDefaultAddress(id, uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			pkghttp.Error(c, http.StatusNotFound, "Address not found", err)
			return
		}
		pkghttp.Error(c, http.StatusInternalServerError, "Failed to set default address", err)
		return
	}

	response := AddressResponse{
		ID:           address.ID,
		UserID:       address.UserID,
		Type:         address.Type,
		Label:        address.Label,
		FirstName:    address.FirstName,
		LastName:     address.LastName,
		Company:      address.Company,
		AddressLine1: address.AddressLine1,
		AddressLine2: address.AddressLine2,
		City:         address.City,
		State:        address.State,
		PostalCode:   address.PostalCode,
		Country:      address.Country,
		Phone:        address.Phone,
		IsDefault:    address.IsDefault,
		CreatedAt:    address.CreatedAt,
		UpdatedAt:    address.UpdatedAt,
	}

	pkghttp.Success(c, http.StatusOK, response)
}
