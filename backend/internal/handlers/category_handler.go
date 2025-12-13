package handlers

import (
	"github.com/akhdanrgya/telu-hub/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CategoryHandler struct {
	DB *gorm.DB
}

func NewCategoryHandler(db *gorm.DB) *CategoryHandler {
	return &CategoryHandler{DB: db}
}

// GET /api/v1/categories
func (h *CategoryHandler) GetAllCategories(c *fiber.Ctx) error {
	var categories []models.Category

	// Ambil semua kategori, urutin dari ID biar rapi
	if err := h.DB.Order("id asc").Find(&categories).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengambil data kategori",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   categories,
	})
}