package products

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// GetFlashProducts handles flash products endpoint
func (h *Handler) GetFlashProducts(c *gin.Context) {
	products, err := h.service.GetFlashProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch flash products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": products,
		"count": len(products),
	})
}

// GetHotProducts handles hot products endpoint
func (h *Handler) GetHotProducts(c *gin.Context) {
	products, err := h.service.GetHotProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch hot products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": products,
		"count": len(products),
	})
}
