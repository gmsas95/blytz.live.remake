package products

import (
	"time"
	
	"github.com/google/uuid"
)

// ProductCreateRequest represents product creation request payload
type ProductCreateRequest struct {
	CategoryID    uuid.UUID  `json:"category_id" binding:"required"`
	Title         string     `json:"title" binding:"required,min=3,max=200"`
	Description   *string    `json:"description,omitempty"`
	Condition     *string    `json:"condition,omitempty" binding:"omitempty,oneof=new like_new good fair"`
	StartingPrice float64    `json:"starting_price" binding:"required,gt=0"`
	ReservePrice  *float64   `json:"reserve_price,omitempty" binding:"omitempty,gt=0"`
	BuyNowPrice   *float64   `json:"buy_now_price,omitempty" binding:"omitempty,gt=0"`
	Images        []string   `json:"images,omitempty"`
	VideoURL      *string    `json:"video_url,omitempty"`
	Specifications map[string]interface{} `json:"specifications,omitempty"`
	ShippingInfo  map[string]interface{} `json:"shipping_info,omitempty"`
}

// ProductUpdateRequest represents product update request payload
type ProductUpdateRequest struct {
	CategoryID    *uuid.UUID  `json:"category_id,omitempty"`
	Title         *string     `json:"title,omitempty" binding:"omitempty,min=3,max=200"`
	Description   *string    `json:"description,omitempty"`
	Condition     *string    `json:"condition,omitempty" binding:"omitempty,oneof=new like_new good fair"`
	StartingPrice *float64   `json:"starting_price,omitempty" binding:"omitempty,gt=0"`
	ReservePrice  *float64   `json:"reserve_price,omitempty" binding:"omitempty,gt=0"`
	BuyNowPrice   *float64   `json:"buy_now_price,omitempty" binding:"omitempty,gt=0"`
	Images        []string   `json:"images,omitempty"`
	VideoURL      *string    `json:"video_url,omitempty"`
	Specifications map[string]interface{} `json:"specifications,omitempty"`
	ShippingInfo  map[string]interface{} `json:"shipping_info,omitempty"`
	Status        *string    `json:"status,omitempty" binding:"omitempty,oneof=draft active sold cancelled"`
	Featured      *bool      `json:"featured,omitempty"`
}

// ProductResponse represents product response payload
type ProductResponse struct {
	ID            uuid.UUID                  `json:"id"`
	SellerID      uuid.UUID                  `json:"seller_id"`
	Seller        *UserResponse              `json:"seller,omitempty"`
	CategoryID    uuid.UUID                  `json:"category_id"`
	Category      *CategoryResponse          `json:"category,omitempty"`
	Title         string                     `json:"title"`
	Description   *string                    `json:"description"`
	Condition     *string                    `json:"condition"`
	StartingPrice float64                    `json:"starting_price"`
	ReservePrice  *float64                   `json:"reserve_price"`
	BuyNowPrice   *float64                   `json:"buy_now_price"`
	Images        []string                   `json:"images"`
	VideoURL      *string                    `json:"video_url"`
	Specifications map[string]interface{}    `json:"specifications"`
	ShippingInfo  map[string]interface{}     `json:"shipping_info"`
	Status        string                     `json:"status"`
	Featured      bool                       `json:"featured"`
	ViewCount     int                        `json:"view_count"`
	CreatedAt     time.Time                  `json:"created_at"`
	UpdatedAt     time.Time                  `json:"updated_at"`
}

// ProductListRequest represents product list query parameters
type ProductListRequest struct {
	CategoryID    string    `form:"category_id"`
	SellerID      string    `form:"seller_id"`
	Status        string    `form:"status" binding:"omitempty,oneof=draft active sold cancelled"`
	Condition     string    `form:"condition" binding:"omitempty,oneof=new like_new good fair"`
	MinPrice      float64   `form:"min_price" binding:"omitempty,gte=0"`
	MaxPrice      float64   `form:"max_price" binding:"omitempty,gte=0"`
	Featured      bool      `form:"featured"`
	SortBy        string    `form:"sort_by" binding:"omitempty,oneof=created_at updated_at title starting_price view_count"`
	SortDirection string    `form:"sort_direction" binding:"omitempty,oneof=asc desc"`
	Search        string    `form:"search"`
}

// UserResponse represents user response in product context
type UserResponse struct {
	ID       uuid.UUID `json:"id"`
	Email    string    `json:"email"`
	Role     string    `json:"role"`
	FirstName *string  `json:"first_name"`
	LastName *string   `json:"last_name"`
	AvatarURL *string  `json:"avatar_url"`
}

// CategoryResponse represents category response in product context
type CategoryResponse struct {
	ID          uuid.UUID        `json:"id"`
	Name        string           `json:"name"`
	Slug        string           `json:"slug"`
	Description *string          `json:"description"`
	ImageURL    *string          `json:"image_url"`
	ParentID    *uuid.UUID       `json:"parent_id"`
	SortOrder   int              `json:"sort_order"`
	IsActive    bool             `json:"is_active"`
	Categories  []CategoryResponse `json:"categories,omitempty"`
}