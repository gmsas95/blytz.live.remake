package tests

import (
	"testing"

	"github.com/blytz.live.remake/backend/internal/models"
	"github.com/stretchr/testify/assert"
)

func TestUserModel(t *testing.T) {
	user := models.User{
		Email:        "test@example.com",
		PasswordHash: "hashed_password",
		Role:         "buyer",
	}

	assert.Equal(t, "test@example.com", user.Email)
	assert.Equal(t, "buyer", user.Role)
	assert.Equal(t, "hashed_password", user.PasswordHash)
}

func TestCategoryModel(t *testing.T) {
	name := "Electronics"
	slug := "electronics"
	
	category := models.Category{
		Name:     name,
		Slug:     slug,
		IsActive: true,
	}

	assert.Equal(t, name, category.Name)
	assert.Equal(t, slug, category.Slug)
	assert.True(t, category.IsActive)
}

func TestProductModel(t *testing.T) {
	product := models.Product{
		Title:        "Test Product",
		StartingPrice: 99.99,
		Status:       "draft",
		Featured:     false,
		ViewCount:    0,
	}

	assert.Equal(t, "Test Product", product.Title)
	assert.Equal(t, 99.99, product.StartingPrice)
	assert.Equal(t, "draft", product.Status)
	assert.False(t, product.Featured)
	assert.Equal(t, 0, product.ViewCount)
}