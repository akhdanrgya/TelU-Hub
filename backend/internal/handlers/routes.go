package handlers

import (
	"log"

	"github.com/akhdanrgya/telu-hub/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"gorm.io/gorm"
)

func SetupRoutes(app *fiber.App, db *gorm.DB) {

	authHandler := NewAuthHandler(db)

	api := app.Group("/api/v1")

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/logout", authHandler.Logout)

	me := api.Group("/me", middleware.Protected())
	me.Get("/", authHandler.GetUserData)
	// Nanti di sini:
	// me.Put("/", authHandler.UpdateUserData)
	// me.Put("/password", authHandler.UpdatePassword)


	// --- 7. Rute WebSocket (Buat Chat) ---
	// (Kita siapin jalurnya, tapi "Otak"-nya belom)
	// chatHub := chat.NewHub()
	// go chatHub.Run()
	
    // Pake middleware.Protected() juga biar cuma user yg login yg bisa chat
	app.Get("/ws/chat/:channel_id", middleware.Protected(), websocket.New(func(c *websocket.Conn) {
		log.Println("Koneksi WebSocket baru!")
        c.WriteJSON(fiber.Map{"message": "Welcome to Chat!"})
	}))

	// --- 8. Rute Produk (Nanti nyusul) ---
	// products := api.Group("/products")
	// products.Get("/", ...)
	// products.Post("/", middleware.Protected(), ...) // Cuma admin yg boleh
}