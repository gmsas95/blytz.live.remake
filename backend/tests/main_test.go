package tests

import (
	"log"
	"testing"

	"github.com/blytz.live.remake/backend/internal/config"
	"github.com/blytz.live.remake/backend/internal/common"
	"github.com/stretchr/testify/assert"
)

func TestConfigLoad(t *testing.T) {
	cfg, err := config.Load()
	assert.NoError(t, err)
	assert.NotNil(t, cfg)
	assert.Equal(t, "development", cfg.Env)
	assert.Equal(t, "postgres://postgres:postgres@localhost:5432/blytz_dev", cfg.DatabaseURL)
}

func TestPaginationRequest(t *testing.T) {
	pagination := common.DefaultPagination()
	assert.Equal(t, 1, pagination.Page)
	assert.Equal(t, 20, pagination.PageSize)
	assert.Equal(t, 0, pagination.GetOffset())
	
	pagination.Page = 2
	assert.Equal(t, 20, pagination.GetOffset())
}

func TestAPIResponse(t *testing.T) {
	response := common.APIResponse{
		Success: true,
		Data:    "test data",
		Message: "success",
	}
	
	assert.True(t, response.Success)
	assert.Equal(t, "test data", response.Data)
	assert.Equal(t, "success", response.Message)
}

func TestNewPaginatedResponse(t *testing.T) {
	data := []string{"item1", "item2", "item3"}
	response := common.NewPaginatedResponse(data, 50, 1, 20)
	
	assert.Equal(t, data, response.Data)
	assert.Equal(t, int64(50), response.Pagination.Total)
	assert.Equal(t, 1, response.Pagination.Page)
	assert.Equal(t, 20, response.Pagination.PageSize)
	assert.Equal(t, 3, response.Pagination.TotalPages)
}

func ExampleMain() {
	// This is an example of how to run the main function
	log.Println("Example of running main function")
	// In real usage, you would call main() directly
}