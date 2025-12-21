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
	HasVariants   bool      `gorm:"default:false" json:"has_variants"`
	// Enhanced fields for Gemini3-mock integration
	Rating        float64   `gorm:"default:0" json:"rating"`
	ReviewCount   int       `gorm:"default:0" json:"review_count"`
	IsFlash       bool      `gorm:"default:false" json:"is_flash"`
	IsHot         bool      `gorm:"default:false" json:"is_hot"`
	FlashEnd      *time.Time `json:"flash_end,omitempty"`
}

// Review represents a product review
type Review struct {
	common.BaseModel
	ProductID uuid.UUID `gorm:"not null;references:ID;index" json:"product_id"`
	Product   Product  `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	UserID    uuid.UUID `gorm:"not null;references:ID;index" json:"user_id"`
	User      User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Rating    int       `gorm:"not null;check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment   string    `gorm:"type:text" json:"comment"`
	Status    string    `gorm:"default:'approved'" json:"status"` // 'pending', 'approved', 'rejected'
}

// Order represents a customer order
type Order struct {
	common.BaseModel
	UserID          uuid.UUID  `gorm:"not null;references:ID" json:"user_id"`
	Status          string     `gorm:"not null;default:'pending'" json:"status"` // pending, processing, shipped, delivered, cancelled
	TotalAmount     float64    `gorm:"not null" json:"total_amount"`
	Subtotal        float64    `gorm:"not null" json:"subtotal"`
	TaxAmount       float64    `gorm:"default:0" json:"tax_amount"`
	ShippingCost    float64    `gorm:"default:0" json:"shipping_cost"`
	DiscountAmount  float64    `gorm:"default:0" json:"discount_amount"`
	ShippingAddress *Address   `gorm:"embedded;embeddedPrefix:shipping_" json:"shipping_address"`
	BillingAddress  *Address   `gorm:"embedded;embeddedPrefix:billing_" json:"billing_address"`
	PaymentID       *uuid.UUID `gorm:"references:ID" json:"payment_id"`
	TrackingNumber  *string    `json:"tracking_number"`
	Notes           *string    `json:"notes"`
	Items          []OrderItem `gorm:"foreignKey:OrderID" json:"items,omitempty"`
}

// OrderItem represents items in an order
type OrderItem struct {
	common.BaseModel
	OrderID     uuid.UUID `gorm:"not null;references:ID" json:"order_id"`
	ProductID   uuid.UUID `gorm:"not null;references:ID" json:"product_id"`
	Quantity    int        `gorm:"not null" json:"quantity"`
	UnitPrice   float64    `gorm:"not null" json:"unit_price"`
	Total       float64    `gorm:"not null" json:"total"`
	Product     Product    `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// Address represents shipping/billing address (embedded)
type Address struct {
	FirstName    string  `json:"first_name"`
	LastName     string  `json:"last_name"`
	Company      *string `json:"company"`
	AddressLine1 string  `json:"address_line1"`
	AddressLine2 *string `json:"address_line2"`
	City         string  `json:"city"`
	State        string  `json:"state"`
	PostalCode   string  `json:"postal_code"`
	Country      string  `json:"country"`
	Phone        *string `json:"phone"`
}

// Cart represents a shopping cart
type Cart struct {
	common.BaseModel
	UserID    *uuid.UUID `gorm:"references:ID" json:"user_id,omitempty"`
	Token      string     `gorm:"uniqueIndex" json:"token"`
	ExpiresAt  time.Time  `gorm:"not null" json:"expires_at"`
	Items      []CartItem `gorm:"foreignKey:CartID" json:"items,omitempty"`
}

// CartItem represents items in a cart
type CartItem struct {
	common.BaseModel
	CartID     uuid.UUID `gorm:"not null;references:ID" json:"cart_id"`
	ProductID  uuid.UUID `gorm:"not null;references:ID" json:"product_id"`
	VariantID  *uuid.UUID `gorm:"references:ID" json:"variant_id,omitempty"`
	Quantity   int        `gorm:"not null" json:"quantity"`
	AddedAt    time.Time  `gorm:"autoCreateTime" json:"added_at"`
	Product    Product    `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// ProductVariant represents product variants (size, color, etc.)
type ProductVariant struct {
	common.BaseModel
	ProductID    uuid.UUID  `gorm:"not null;references:ID" json:"product_id"`
	Sku          string     `gorm:"uniqueIndex;not null" json:"sku"`
	Title        string     `gorm:"not null" json:"title"`
	Price         float64    `gorm:"not null" json:"price"`
	ComparePrice *float64   `json:"compare_price"`
	CostPrice    *float64   `json:"cost_price"`
	Weight       *float64   `json:"weight,omitempty"`
	Barcode      *string    `json:"barcode,omitempty"`
	Inventory    int        `gorm:"default:0" json:"inventory"`
	IsActive     bool       `gorm:"default:true" json:"is_active"`
	Attributes   string     `gorm:"type:jsonb" json:"attributes"` // JSON: {"color": "Red", "size": "M"}
	ImageURL     *string    `json:"image_url,omitempty"`
	Position     int        `gorm:"default:0" json:"position"`
	Product      Product    `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// CategoryAttribute represents custom attributes for categories
type CategoryAttribute struct {
	common.BaseModel
	CategoryID  uuid.UUID  `gorm:"not null;references:ID" json:"category_id"`
	Name        string     `gorm:"not null" json:"name"`
	Type        string     `gorm:"not null" json:"type"` // text, number, boolean, select, multiselect
	Required    bool       `gorm:"default:false" json:"required"`
	Options     []string   `gorm:"type:jsonb" json:"options,omitempty"` // For select/multiselect
	DefaultValue *string    `json:"default_value,omitempty"`
	SortOrder   int        `gorm:"default:0" json:"sort_order"`
	Category    Category   `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

// ProductCollection represents product collections/groupings
type ProductCollection struct {
	common.BaseModel
	Name        string  `gorm:"not null" json:"name"`
	Slug        string  `gorm:"uniqueIndex;not null" json:"slug"`
	Description *string `json:"description"`
	ImageURL    *string `json:"image_url"`
	IsActive    bool    `gorm:"default:true" json:"is_active"`
	SortOrder   int     `gorm:"default:0" json:"sort_order"`
	ProductIDs  string  `gorm:"type:jsonb" json:"product_ids"` // Array of product UUIDs
}

// InventoryStock represents inventory tracking
type InventoryStock struct {
	common.BaseModel
	ProductID       uuid.UUID  `gorm:"not null;uniqueIndex;references:ID" json:"product_id"`
	VariantID       *uuid.UUID `gorm:"references:ID" json:"variant_id,omitempty"`
	Quantity        int        `gorm:"not null;default:0" json:"quantity"`
	Reserved        int        `gorm:"not null;default:0" json:"reserved"`
	Available       int        `gorm:"not null;default:0" json:"available"`
	LowStockAlert   int        `gorm:"default:10" json:"low_stock_alert"`
	TrackInventory  bool       `gorm:"default:true" json:"track_inventory"`
	AllowBackorder  bool       `gorm:"default:false" json:"allow_backorder"`
	WarehouseID     *uuid.UUID `json:"warehouse_id,omitempty"`
	LastUpdated     time.Time  `gorm:"autoUpdateTime" json:"last_updated"`
	Product         Product    `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Variant         *ProductVariant `gorm:"foreignKey:VariantID" json:"variant,omitempty"`
}

// StockMovement represents stock movement history
type StockMovement struct {
	common.BaseModel
	ProductID    uuid.UUID       `gorm:"not null;references:ID" json:"product_id"`
	VariantID    *uuid.UUID      `gorm:"references:ID" json:"variant_id,omitempty"`
	MovementType string          `gorm:"not null" json:"movement_type"` // in, out, adjustment, reserve, release
	Quantity     int             `gorm:"not null" json:"quantity"`
	Reference    *string         `json:"reference,omitempty"`
	Notes        *string         `json:"notes,omitempty"`
	WarehouseID  *uuid.UUID      `json:"warehouse_id,omitempty"`
	Product      Product         `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Variant      *ProductVariant `gorm:"foreignKey:VariantID" json:"variant,omitempty"`
}