package orders

import (
	"time"

	"github.com/blytz.live.remake/backend/internal/models"
	"github.com/google/uuid"
)

// Order represents a customer order
type Order struct {
	ID              uuid.UUID  `json:"id"`
	UserID          uuid.UUID  `json:"user_id"`
	Status          string     `json:"status"` // pending, processing, shipped, delivered, cancelled
	TotalAmount     float64    `json:"total_amount"`
	Subtotal        float64    `json:"subtotal"`
	TaxAmount       float64    `json:"tax_amount"`
	ShippingCost    float64    `json:"shipping_cost"`
	DiscountAmount  float64    `json:"discount_amount"`
	ShippingAddress *Address   `json:"shipping_address"`
	BillingAddress  *Address   `json:"billing_address"`
	PaymentID       *uuid.UUID `json:"payment_id"`
	TrackingNumber  *string    `json:"tracking_number"`
	Notes           *string    `json:"notes"`
	Items          []OrderItem `json:"items"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
}

// OrderItem represents items in an order
type OrderItem struct {
	ID          uuid.UUID  `json:"id"`
	OrderID     uuid.UUID  `json:"order_id"`
	ProductID   uuid.UUID  `json:"product_id"`
	Quantity    int        `json:"quantity"`
	UnitPrice   float64    `json:"unit_price"`
	Total       float64    `json:"total"`
	Product     models.Product `json:"product"`  // GORM will preload this
	CreatedAt   time.Time   `json:"created_at"`
}

// Address represents shipping/billing address
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

// ProductResponse represents product information in order context
type ProductResponse struct {
	ID            uuid.UUID  `json:"id"`
	Title         string     `json:"title"`
	Description   *string    `json:"description"`
	Condition     *string    `json:"condition"`
	StartingPrice float64    `json:"starting_price"`
	ReservePrice  *float64   `json:"reserve_price"`
	BuyNowPrice   *float64   `json:"buy_now_price"`
	Images        []string   `json:"images"`
	Status        string     `json:"status"`
}

// OrderCreateRequest represents order creation request
type OrderCreateRequest struct {
	CartID          uuid.UUID `json:"cart_id" binding:"required"`
	ShippingAddress  Address    `json:"shipping_address" binding:"required"`
	BillingAddress   Address    `json:"billing_address"`
	PaymentMethod    string     `json:"payment_method" binding:"required"`
	Notes            *string    `json:"notes"`
}

// OrderItemResponse represents order item in response context
type OrderItemResponse struct {
	ID          uuid.UUID                `json:"id"`
	OrderID     uuid.UUID                `json:"order_id"`
	ProductID   uuid.UUID                `json:"product_id"`
	Quantity    int                      `json:"quantity"`
	UnitPrice   float64                  `json:"unit_price"`
	Total       float64                  `json:"total"`
	Product     ProductResponse          `json:"product"`
	CreatedAt   time.Time                `json:"created_at"`
}

// OrderResponse represents order response
type OrderResponse struct {
	ID              uuid.UUID           `json:"id"`
	UserID          uuid.UUID           `json:"user_id"`
	Status          string              `json:"status"`
	TotalAmount     float64             `json:"total_amount"`
	Subtotal        float64             `json:"subtotal"`
	TaxAmount       float64             `json:"tax_amount"`
	ShippingCost    float64             `json:"shipping_cost"`
	DiscountAmount  float64             `json:"discount_amount"`
	ShippingAddress *Address            `json:"shipping_address"`
	BillingAddress  *Address            `json:"billing_address"`
	PaymentID       *uuid.UUID          `json:"payment_id"`
	TrackingNumber  *string             `json:"tracking_number"`
	Notes           *string             `json:"notes"`
	Items          []OrderItemResponse `json:"items"`
	ItemCount      int                  `json:"item_count"`
	TotalQuantity   int                  `json:"total_quantity"`
	CreatedAt      time.Time            `json:"created_at"`
	UpdatedAt      time.Time            `json:"updated_at"`
}

// OrderListRequest represents order list query parameters
type OrderListRequest struct {
	Status      string `form:"status"`
	SortBy      string `form:"sort_by" binding:"omitempty,oneof=created_at updated_at total_amount"`
	SortDirection string `form:"sort_direction" binding:"omitempty,oneof=asc desc"`
	Search      string `form:"search"`
}

// UpdateOrderStatusRequest represents order status update request
type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending processing shipped delivered cancelled"`
	Notes  *string `json:"notes"`
}

// OrderStatistics represents order statistics
type OrderStatistics struct {
	TotalOrders      int     `json:"total_orders"`
	TotalRevenue     float64 `json:"total_revenue"`
	TotalItems       int     `json:"total_items"`
	AverageOrderValue float64 `json:"average_order_value"`
	PendingOrders    int     `json:"pending_orders"`
	ProcessingOrders int     `json:"processing_orders"`
	ShippedOrders    int     `json:"shipped_orders"`
	DeliveredOrders  int     `json:"delivered_orders"`
	CancelledOrders  int     `json:"cancelled_orders"`
}

// OrderSummary represents order summary for seller
type OrderSummary struct {
	OrderID     uuid.UUID `json:"order_id"`
	TotalAmount  float64   `json:"total_amount"`
	Status       string     `json:"status"`
	ItemCount    int        `json:"item_count"`
	CustomerName string     `json:"customer_name"`
	CustomerEmail string     `json:"customer_email"`
	CreatedAt    time.Time  `json:"created_at"`
}