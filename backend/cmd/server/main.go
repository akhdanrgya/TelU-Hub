package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/midtrans/midtrans-go"

	"github.com/akhdanrgya/telu-hub/config"
	"github.com/akhdanrgya/telu-hub/internal/database"
	"github.com/akhdanrgya/telu-hub/internal/handlers"
	
)

func main() {
	err := config.LoadConfig()
	if err != nil {
		log.Fatalf("ERROR: Gagal nge-load config: %v", err)
	}

	midtrans.ServerKey = config.GetMidtransServerKey()
    midtrans.ClientKey = config.GetMidtransClientKey()
    midtrans.Environment = midtrans.Sandbox

	database.InitDB()
	db := database.DB

	app := fiber.New()
	
    app.Use(logger.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: true, 
	}))

	app.Static("/uploads", "./uploads");

	handlers.SetupRoutes(app, db)

	port := config.GetAppPort()
	log.Printf("🔥 Server Fiber jalan di port %s", port)
	app.Listen(port)
}