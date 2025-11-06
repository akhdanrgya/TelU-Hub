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
	productHandler := NewProductHandler(db)

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

	admin := api.Group("/admin", middleware.Protected(), middleware.RoleRequired("admin"))

	admin.Post("/promote/:id", authHandler.PromoteUser)

	products := api.Group("/products")
	
	products.Get("/", productHandler.GetAllProducts)
	products.Get("/:id", productHandler.GetProductByID)
	products.Post("/", middleware.Protected(), middleware.RoleRequired("seller", "admin"), productHandler.CreateProduct)

	app.Get("/ws/chat/:channel_id", middleware.Protected(), websocket.New(func(c *websocket.Conn) {
		log.Println("Koneksi WebSocket baru!")
        c.WriteJSON(fiber.Map{"message": "Welcome to Chat!"})
	}))
}