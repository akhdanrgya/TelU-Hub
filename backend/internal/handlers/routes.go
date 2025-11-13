package handlers

import (
	"github.com/akhdanrgya/telu-hub/internal/chat"
	"github.com/akhdanrgya/telu-hub/internal/middleware" 
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"gorm.io/gorm"

	grpc_service "github.com/akhdanrgya/telu-hub/internal/grpc_service"
)

func SetupRoutes(app *fiber.App, db *gorm.DB, stockService *grpc_service.StockService, chatManager *chat.ChatManager) {

	authHandler := NewAuthHandler(db)
	productHandler := NewProductHandler(db)
	cartHandler := NewCartHandler(db)
	uploadHandler := NewUploadHandler()
	userHandler := NewUserHandler(db)
	orderHandler := NewOrderHandler(db, stockService)


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
		me.Get("/products", productHandler.GetMyProducts)
		me.Get("/", authHandler.GetUserData)
		me.Put("/", userHandler.UpdateUserProfile)

	admin := api.Group("/admin", middleware.Protected(), middleware.RoleRequired("admin"))
		admin.Post("/promote/:id", authHandler.PromoteUser)
		admin.Get("/users", authHandler.GetAllUsers)

	products := api.Group("/products")
		products.Get("/", productHandler.GetAllProducts)
		products.Get("/:slug", productHandler.GetProductBySlug)
		products.Get("/:id", productHandler.GetProductByID)
		products.Post("/", middleware.Protected(), middleware.RoleRequired("seller", "admin"), productHandler.CreateProduct)
		products.Put("/:id", middleware.Protected(), middleware.RoleRequired("seller", "admin"), productHandler.UpdateProduct)
		products.Delete("/:id", middleware.Protected(), middleware.RoleRequired("seller", "admin"), productHandler.DeleteProduct)
		
		
	cart := api.Group("/cart", middleware.Protected())
		cart.Get("/", cartHandler.GetCart) 
		cart.Post("/items", cartHandler.AddItemToCart)
		cart.Put("/items/:id", cartHandler.UpdateCartItem)
		cart.Delete("/items/:id", cartHandler.RemoveCartItem)
	
	api.Post("/upload/image", uploadHandler.UploadImage)
	api.Get("/users/:username", userHandler.GetUserPublicProfile)
	api.Get("/users/:username/products", userHandler.GetUserProducts)

	checkout := api.Group("/checkout", middleware.Protected())
	checkout.Post("/", orderHandler.CreateOrderAndPay)
	
	webhook := api.Group("/payments")
	webhook.Post("/webhook", orderHandler.HandleWebhook)

	orders := api.Group("/orders", middleware.Protected())
		orders.Get("/", orderHandler.GetMyOrders) 
		orders.Get("/:id", orderHandler.GetOrderByID)

	ws := api.Group("/ws", middleware.Protected())

	ws.Get("/chat/:roomId", websocket.New(chatManager.HandleConnection))
}