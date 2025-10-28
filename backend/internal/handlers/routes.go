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

	// --- 2. Rute Auth (Tidak perlu JWT) ---
	// Kita bikin "Handler"-nya di file lain nanti
	// authHandler := NewAuthHandler(db) // Nanti kita bikin ini
	// api.Post("/auth/register", authHandler.Register)
	// api.Post("/auth/login", authHandler.Login)
    
	// --- 3. Rute WebSocket (Buat Chat) ---
	// (Nanti kita bikin chatHub-nya)
	// chatHub := chat.NewHub()
	// go chatHub.Run()
	// app.Get("/ws/chat/:channel_id", websocket.New(chatHub.HandleConnection))

	// --- 4. Rute Terproteksi (Butuh JWT) ---
	// authRequired := api.Group("/users", middleware.Protected()) // Nanti kita bikin middleware
	// authRequired.Get("/me", func(c *fiber.Ctx) error { ... })
}