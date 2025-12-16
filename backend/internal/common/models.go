package common

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BaseModel provides common fields for all models
type BaseModel struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid" json:"id"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate will generate UUID if not set
func (b *BaseModel) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

// PaginationRequest represents pagination parameters
type PaginationRequest struct {
	Page     int `form:"page" binding:"min=1"`
	PageSize int `form:"page_size" binding:"min=1,max=100"`
}

// DefaultPagination returns default pagination values
func DefaultPagination() PaginationRequest {
	return PaginationRequest{
		Page:     1,
		PageSize: 20,
	}
}

// GetOffset calculates offset for database queries
func (p PaginationRequest) GetOffset() int {
	return (p.Page - 1) * p.PageSize
}

// APIResponse represents standard API response structure
type APIResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Message   string      `json:"message,omitempty"`
	Error     string      `json:"error,omitempty"`
	Meta      interface{} `json:"meta,omitempty"`
}

// PaginatedResponse represents paginated API response
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
}

// Pagination represents pagination metadata
type Pagination struct {
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	Total      int64 `json:"total"`
	TotalPages int  `json:"total_pages"`
}

// NewPaginatedResponse creates a paginated response
func NewPaginatedResponse(data interface{}, total int64, page, pageSize int) *PaginatedResponse {
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))
	
	return &PaginatedResponse{
		Data: data,
		Pagination: Pagination{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
		},
	}
}