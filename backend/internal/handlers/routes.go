package handlers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
    
)

func SetupRoutes(app *fiber.App, db *gorm.DB) {

	api := app.Group("/api/v1")

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Welcome to TelU-Hub API! 🚀",
		})
	})
}