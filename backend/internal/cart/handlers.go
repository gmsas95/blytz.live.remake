package cart

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Handler handles HTTP requests for cart

type Handler struct {
	service *Service
}

// NewHandler creates a new cart handler
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// GetCart handles cart retrieval
func (h *Handler) GetCart(c *gin.Context) {
	cartID, exists := c.Get("cart_id")
	if !exists || cartID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart not found"})
		return
	}

	cart, err := h.service.GetCartWithDetails(cartID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": cart})
}

// CreateCart handles cart creation
func (h *Handler) CreateCart(c *gin.Context) {
	var req CartCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context if authenticated
	var userID *uuid.UUID
	if id, exists := c.Get("userID"); exists {
		if uid, err := uuid.Parse(id.(string)); err == nil {
			userID = &uid
		}
	}

	cart, err := h.service.GetOrCreateCart(userID, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cart"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"cart": cart})
}

// AddItem handles adding item to cart
func (h *Handler) AddItem(c *gin.Context) {
	cartID, exists := c.Get("cart_id")
	if !exists || cartID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart not found"})
		return
	}

	var req AddItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cart, err := h.service.AddItem(cartID.(uuid.UUID), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": cart})
}

// UpdateItem handles updating cart item quantity
func (h *Handler) UpdateItem(c *gin.Context) {
	cartID, exists := c.Get("cart_id")
	if !exists || cartID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart not found"})
		return
	}

	itemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	var req UpdateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cart, err := h.service.UpdateItem(cartID.(uuid.UUID), itemID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": cart})
}

// RemoveItem handles removing item from cart
func (h *Handler) RemoveItem(c *gin.Context) {
	cartID, exists := c.Get("cart_id")
	if !exists || cartID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart not found"})
		return
	}

	itemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	cart, err := h.service.RemoveItem(cartID.(uuid.UUID), itemID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": cart})
}

// ClearCart handles clearing entire cart
func (h *Handler) ClearCart(c *gin.Context) {
	cartID, exists := c.Get("cart_id")
	if !exists || cartID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart not found"})
		return
	}

	if err := h.service.ClearCart(cartID.(uuid.UUID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
}

// MergeCart handles merging guest cart to user cart
func (h *Handler) MergeCart(c *gin.Context) {
	cartID, exists := c.Get("cart_id")
	if !exists || cartID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart not found"})
		return
	}

	var req MergeCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cart, err := h.service.MergeGuestCart(req.GuestToken, cartID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": cart})
}

// CartMiddleware extracts cart ID from cookie or creates new cart
func CartMiddleware(service *Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Try to get cart ID from cookie
		cartIDCookie, err := c.Cookie("cart_id")
		var cartID uuid.UUID

		if err == nil && cartIDCookie != "" {
			// Validate cart ID and check if it exists
			if _, parseErr := uuid.Parse(cartIDCookie); parseErr == nil {
				if _, cartErr := service.GetOrCreateCart(nil, &cartIDCookie); cartErr == nil {
					cartID = uuid.MustParse(cartIDCookie)
					c.Set("cart_id", cartID)
					c.Next()
					return
				}
			}
		}

		// No valid cart, check if user is authenticated
		if userID, exists := c.Get("userID"); exists {
			// Parse user ID from string
			uid, err := uuid.Parse(userID.(string))
			if err == nil {
				cart, err := service.GetOrCreateCart(&uid, nil)
				if err == nil {
					cartID = cart.ID
					c.SetCookie("cart_id", cartID.String(), 7*24*3600, "/", "", false, true)
				}
			}
		} else {
			// Create guest cart
			cart, err := service.GetOrCreateCart(nil, nil)
			if err == nil {
				cartID = cart.ID
				c.SetCookie("cart_id", cartID.String(), 7*24*3600, "/", "", false, true)
			}
		}

		// Always set cart_id in context
		c.Set("cart_id", cartID)

		c.Next()
	}
}