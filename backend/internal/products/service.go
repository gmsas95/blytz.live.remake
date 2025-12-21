package products

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/blytz.live.remake/backend/internal/common"
	"github.com/blytz.live.remake/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Service handles product business logic
type Service struct {
	db *gorm.DB
}

// NewService creates a new product service
func NewService(db *gorm.DB) *Service {
	return &Service{
		db: db,
	}
}

// CreateProduct creates a new product
func (s *Service) CreateProduct(sellerID uuid.UUID, req ProductCreateRequest) (*ProductResponse, error) {
	// Verify category exists
	var category models.Category
	if err := s.db.First(&category, req.CategoryID).Error; err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}

	// Validate price relationships
	if req.ReservePrice != nil && *req.ReservePrice < req.StartingPrice {
		return nil, fmt.Errorf("reserve price cannot be lower than starting price")
	}
	if req.BuyNowPrice != nil && *req.BuyNowPrice <= req.StartingPrice {
		return nil, fmt.Errorf("buy now price must be higher than starting price")
	}

	// Convert images to JSON
	var imagesJSON []byte
	if len(req.Images) > 0 {
		var err error
		imagesJSON, err = json.Marshal(req.Images)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal images: %w", err)
		}
	}

	// Convert specifications to JSON
	var specsJSON []byte
	if len(req.Specifications) > 0 {
		var err error
		specsJSON, err = json.Marshal(req.Specifications)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal specifications: %w", err)
		}
	}

	// Convert shipping info to JSON
	var shippingJSON []byte
	if len(req.ShippingInfo) > 0 {
		var err error
		shippingJSON, err = json.Marshal(req.ShippingInfo)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal shipping info: %w", err)
		}
	}

	// Create product
	product := models.Product{
		SellerID:      sellerID,
		CategoryID:    req.CategoryID,
		Title:         req.Title,
		Description:   req.Description,
		Condition:     req.Condition,
		StartingPrice: req.StartingPrice,
		ReservePrice:  req.ReservePrice,
		BuyNowPrice:   req.BuyNowPrice,
		VideoURL:      req.VideoURL,
		Status:        "draft", // Default status
		Featured:      false,
		ViewCount:     0,
	}

	if imagesJSON != nil {
		imagesStr := string(imagesJSON)
		product.Images = &imagesStr
	}
	if specsJSON != nil {
		specsStr := string(specsJSON)
		product.Specifications = &specsStr
	}
	if shippingJSON != nil {
		shippingStr := string(shippingJSON)
		product.ShippingInfo = &shippingStr
	}

	if err := s.db.Create(&product).Error; err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}

	// Get product with associations
	return s.GetProductByID(product.ID, sellerID)
}

// GetProductByID retrieves a product by ID
func (s *Service) GetProductByID(productID, requestorID uuid.UUID) (*ProductResponse, error) {
	var product models.Product
	query := s.db.Preload("Seller").Preload("Category")

	err := query.First(&product, productID).Error
	if err != nil {
		return nil, fmt.Errorf("product not found: %w", err)
	}

	// Increment view count (only for non-owners)
	if requestorID != product.SellerID {
		s.db.Model(&product).UpdateColumn("view_count", gorm.Expr("view_count + ?", 1))
		product.ViewCount++
	}

	return s.toProductResponse(&product, true, true), nil
}

// UpdateProduct updates an existing product
func (s *Service) UpdateProduct(productID, sellerID uuid.UUID, req ProductUpdateRequest) (*ProductResponse, error) {
	var product models.Product
	err := s.db.First(&product, productID).Error
	if err != nil {
		return nil, fmt.Errorf("product not found: %w", err)
	}

	// Check ownership
	if product.SellerID != sellerID {
		return nil, fmt.Errorf("unauthorized: you don't own this product")
	}

	// Check if product can be updated (not sold)
	if product.Status == "sold" {
		return nil, fmt.Errorf("cannot update a sold product")
	}

	// Validate category if provided
	if req.CategoryID != nil {
		var category models.Category
		if err := s.db.First(&category, *req.CategoryID).Error; err != nil {
			return nil, fmt.Errorf("category not found: %w", err)
		}
		product.CategoryID = *req.CategoryID
	}

	// Update fields if provided
	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
		product.Title = *req.Title
	}
	if req.Description != nil {
		updates["description"] = *req.Description
		product.Description = req.Description
	}
	if req.Condition != nil {
		updates["condition"] = *req.Condition
		product.Condition = req.Condition
	}
	if req.StartingPrice != nil {
		updates["starting_price"] = *req.StartingPrice
		product.StartingPrice = *req.StartingPrice
	}
	if req.ReservePrice != nil {
		updates["reserve_price"] = *req.ReservePrice
		product.ReservePrice = req.ReservePrice
	}
	if req.BuyNowPrice != nil {
		updates["buy_now_price"] = *req.BuyNowPrice
		product.BuyNowPrice = req.BuyNowPrice
	}
	if req.Status != nil {
		updates["status"] = *req.Status
		product.Status = *req.Status
	}
	if req.Featured != nil {
		updates["featured"] = *req.Featured
		product.Featured = *req.Featured
	}
	if req.VideoURL != nil {
		updates["video_url"] = *req.VideoURL
		product.VideoURL = req.VideoURL
	}

	// Handle images
	if req.Images != nil {
		imagesJSON, err := json.Marshal(req.Images)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal images: %w", err)
		}
		imagesStr := string(imagesJSON)
		updates["images"] = imagesStr
		product.Images = &imagesStr
	}

	// Handle specifications
	if req.Specifications != nil {
		specsJSON, err := json.Marshal(req.Specifications)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal specifications: %w", err)
		}
		specsStr := string(specsJSON)
		updates["specifications"] = specsStr
		product.Specifications = &specsStr
	}

	// Handle shipping info
	if req.ShippingInfo != nil {
		shippingJSON, err := json.Marshal(req.ShippingInfo)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal shipping info: %w", err)
		}
		shippingStr := string(shippingJSON)
		updates["shipping_info"] = shippingStr
		product.ShippingInfo = &shippingStr
	}

	// Validate price relationships if they were updated
	if req.StartingPrice != nil || req.ReservePrice != nil {
		startPrice := product.StartingPrice
		if req.StartingPrice != nil {
			startPrice = *req.StartingPrice
		}

		reservePrice := product.ReservePrice
		if req.ReservePrice != nil {
			reservePrice = req.ReservePrice
		}

		if reservePrice != nil && *reservePrice < startPrice {
			return nil, fmt.Errorf("reserve price cannot be lower than starting price")
		}
	}

	if req.BuyNowPrice != nil || req.StartingPrice != nil {
		startPrice := product.StartingPrice
		if req.StartingPrice != nil {
			startPrice = *req.StartingPrice
		}

		buyNowPrice := product.BuyNowPrice
		if req.BuyNowPrice != nil {
			buyNowPrice = req.BuyNowPrice
		}

		if buyNowPrice != nil && *buyNowPrice <= startPrice {
			return nil, fmt.Errorf("buy now price must be higher than starting price")
		}
	}

	// Update product
	if err := s.db.Model(&product).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to update product: %w", err)
	}

	// Get updated product with associations
	return s.GetProductByID(productID, sellerID)
}

// DeleteProduct soft deletes a product
func (s *Service) DeleteProduct(productID, sellerID uuid.UUID) error {
	var product models.Product
	err := s.db.First(&product, productID).Error
	if err != nil {
		return fmt.Errorf("product not found: %w", err)
	}

	// Check ownership
	if product.SellerID != sellerID {
		return fmt.Errorf("unauthorized: you don't own this product")
	}

	// Check if product can be deleted (not sold)
	if product.Status == "sold" {
		return fmt.Errorf("cannot delete a sold product")
	}

	if err := s.db.Delete(&product).Error; err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}

	return nil
}

// ListProducts retrieves products with filtering and pagination
func (s *Service) ListProducts(req ProductListRequest, pagination common.PaginationRequest, requestorID *uuid.UUID) (*common.PaginatedResponse, error) {
	query := s.db.Model(&models.Product{}).
		Preload("Seller").
		Preload("Category")

	// Apply filters
	if req.CategoryID != "" {
		if categoryID, err := uuid.Parse(req.CategoryID); err == nil {
			query = query.Where("category_id = ?", categoryID)
		}
	}

	if req.SellerID != "" {
		if sellerID, err := uuid.Parse(req.SellerID); err == nil {
			query = query.Where("seller_id = ?", sellerID)
		}
	}

	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	} else {
		// By default, only show active products for non-owners
		if requestorID == nil {
			query = query.Where("status = ?", "active")
		}
	}

	if req.Condition != "" {
		query = query.Where("condition = ?", req.Condition)
	}

	if req.MinPrice > 0 {
		query = query.Where("starting_price >= ?", req.MinPrice)
	}

	if req.MaxPrice > 0 {
		query = query.Where("starting_price <= ?", req.MaxPrice)
	}

	if req.Featured {
		query = query.Where("featured = ?", true)
	}

	if req.Search != "" {
		searchPattern := "%" + req.Search + "%"
		// Use LIKE for cross-database compatibility (case-insensitive in most databases)
		query = query.Where("title LIKE ? OR description LIKE ?", searchPattern, searchPattern)
	}

	// Count total records
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count products: %w", err)
	}

	// Apply sorting
	sortBy := "created_at"
	if req.SortBy != "" {
		sortBy = req.SortBy
	}

	sortDirection := "desc"
	if req.SortDirection != "" {
		sortDirection = req.SortDirection
	}

	query = query.Order(sortBy + " " + sortDirection)

	// Apply pagination
	if err := query.Offset(pagination.GetOffset()).Limit(pagination.PageSize).Find(&[]models.Product{}).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch products: %w", err)
	}

	// Fetch paginated results
	var products []models.Product
	if err := query.Offset(pagination.GetOffset()).Limit(pagination.PageSize).Find(&products).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch products: %w", err)
	}

	// Convert to response
	productResponses := make([]*ProductResponse, len(products))
	for i, product := range products {
		productResponses[i] = s.toProductResponse(&product, true, true)
	}

	return common.NewPaginatedResponse(productResponses, total, pagination.Page, pagination.PageSize), nil
}

// ListSellerProducts retrieves products for a specific seller
func (s *Service) ListSellerProducts(sellerID uuid.UUID, pagination common.PaginationRequest) (*common.PaginatedResponse, error) {
	query := s.db.Model(&models.Product{}).
		Preload("Category").
		Where("seller_id = ?", sellerID)

	// Count total records
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count seller products: %w", err)
	}

	// Fetch paginated results
	var products []models.Product
	if err := query.Offset(pagination.GetOffset()).
		Limit(pagination.PageSize).
		Order("created_at desc").
		Find(&products).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch seller products: %w", err)
	}

	// Convert to response
	productResponses := make([]*ProductResponse, len(products))
	for i, product := range products {
		productResponses[i] = s.toProductResponse(&product, false, true)
	}

	return common.NewPaginatedResponse(productResponses, total, pagination.Page, pagination.PageSize), nil
}

// Helper function to convert model to response
func (s *Service) toProductResponse(product *models.Product, includeSeller bool, includeCategory bool) *ProductResponse {
	resp := &ProductResponse{
		ID:            product.ID,
		SellerID:      product.SellerID,
		CategoryID:    product.CategoryID,
		Title:         product.Title,
		Description:   product.Description,
		Condition:     product.Condition,
		StartingPrice: product.StartingPrice,
		ReservePrice:  product.ReservePrice,
		BuyNowPrice:   product.BuyNowPrice,
		VideoURL:      product.VideoURL,
		Status:        product.Status,
		Featured:      product.Featured,
		ViewCount:     product.ViewCount,
		CreatedAt:     product.CreatedAt,
		UpdatedAt:     product.UpdatedAt,
	}

	// Parse JSON fields
	if product.Images != nil {
		var images []string
		json.Unmarshal([]byte(*product.Images), &images)
		resp.Images = images
	}

	if product.Specifications != nil {
		var specs map[string]interface{}
		json.Unmarshal([]byte(*product.Specifications), &specs)
		resp.Specifications = specs
	}

	if product.ShippingInfo != nil {
		var shipping map[string]interface{}
		json.Unmarshal([]byte(*product.ShippingInfo), &shipping)
		resp.ShippingInfo = shipping
	}

	// Include associations
	if includeSeller {
		resp.Seller = &UserResponse{
			ID:         product.Seller.ID,
			Email:      product.Seller.Email,
			Role:       product.Seller.Role,
			FirstName:  product.Seller.FirstName,
			LastName:   product.Seller.LastName,
			AvatarURL:  product.Seller.AvatarURL,
		}
	}

	if includeCategory {
		resp.Category = &CategoryResponse{
			ID:          product.Category.ID,
			Name:        product.Category.Name,
			Slug:        product.Category.Slug,
			Description: product.Category.Description,
			ImageURL:    product.Category.ImageURL,
			ParentID:    product.Category.ParentID,
			SortOrder:   product.Category.SortOrder,
			IsActive:    product.Category.IsActive,
		}

		// Include subcategories if they exist
		if len(product.Category.Categories) > 0 {
			subCategories := make([]CategoryResponse, len(product.Category.Categories))
			for i, cat := range product.Category.Categories {
				subCategories[i] = CategoryResponse{
					ID:          cat.ID,
					Name:        cat.Name,
					Slug:        cat.Slug,
					Description: cat.Description,
					ImageURL:    cat.ImageURL,
					ParentID:    cat.ParentID,
					SortOrder:   cat.SortOrder,
					IsActive:    cat.IsActive,
				}
			}
			resp.Category.Categories = subCategories
		}
	}

	return resp
}

// GetFlashProducts retrieves all active flash sale products
func (s *Service) GetFlashProducts() ([]ProductResponse, error) {
	var products []models.Product
	err := s.db.Where("is_flash = ? AND flash_end > ?", true, time.Now()).
		Preload("Seller").
		Preload("Category").
		Order("created_at DESC").
		Limit(20).
		Find(&products).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to fetch flash products: %w", err)
	}

	responses := make([]ProductResponse, len(products))
	for i, product := range products {
		responses[i] = s.mapToProductResponse(&product)
	}

	return responses, nil
}

// GetHotProducts retrieves all hot products
func (s *Service) GetHotProducts() ([]ProductResponse, error) {
	var products []models.Product
	err := s.db.Where("is_hot = ?", true).
		Preload("Seller").
		Preload("Category").
		Order("created_at DESC").
		Limit(20).
		Find(&products).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to fetch hot products: %w", err)
	}

	responses := make([]ProductResponse, len(products))
	for i, product := range products {
		responses[i] = s.mapToProductResponse(&product)
	}

	return responses, nil
}