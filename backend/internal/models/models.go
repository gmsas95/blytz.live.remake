package models

import (
	"time"

	"github.com/blytz.live.remake/backend/internal/common"
	"github.com/google/uuid"
)

// User represents a user in system
type User struct {
	common.BaseModel
	Email         string  `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash  string  `gorm:"not null" json:"-"`
	Role          string  `gorm:"not null;default:'buyer'" json:"role"` // 'buyer', 'seller', 'admin'
	FirstName     *string `json:"first_name"`
	LastName      *string `json:"last_name"`
	AvatarURL     *string `json:"avatar_url"`
	Phone         *string `json:"phone"`
	EmailVerified bool      `gorm:"default:false" json:"email_verified"`
	LastLoginAt   *time.Time `json:"last_login_at"`
}

// Category represents a product category
type Category struct {
	common.BaseModel
	Name        string  `gorm:"not null" json:"name"`
	Slug        string  `gorm:"uniqueIndex;not null" json:"slug"`
	Description *string `json:"description"`
	ImageURL    *string `json:"image_url"`
	ParentID    *uuid.UUID `gorm:"references:ID" json:"parent_id"`
	Parent      *Category `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	SortOrder   int     `gorm:"default:0" json:"sort_order"`
	IsActive    bool    `gorm:"default:true" json:"is_active"`
	Categories  []Category `gorm:"foreignKey:ParentID" json:"categories,omitempty"`
}

// Product represents a product in marketplace
type Product struct {
	common.BaseModel
	SellerID      uuid.UUID `gorm:"not null;references:ID" json:"seller_id"`
	Seller        User      `gorm:"foreignKey:SellerID" json:"seller,omitempty"`
	CategoryID    uuid.UUID `gorm:"not null;references:ID" json:"category_id"`
	Category      Category  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Title         string    `gorm:"not null" json:"title"`
	Description   *string   `json:"description"`
	Condition     *string   `json:"condition"` // 'new', 'like_new', 'good', 'fair'
	StartingPrice float64   `gorm:"not null" json:"starting_price"`
	ReservePrice  *float64  `json:"reserve_price"`
	BuyNowPrice   *float64  `json:"buy_now_price"`
	Images        *string   `gorm:"type:jsonb" json:"images"`       // JSON array of image URLs
	VideoURL      *string   `json:"video_url"`
	Specifications *string  `gorm:"type:jsonb" json:"specifications"` // JSON object
	ShippingInfo  *string   `gorm:"type:jsonb" json:"shipping_info"`   // JSON object
	Status        string    `gorm:"default:'draft'" json:"status"`     // 'draft', 'active', 'sold', 'cancelled'
	Featured      bool      `gorm:"default:false" json:"featured"`
	ViewCount     int       `gorm:"default:0" json:"view_count"`
}