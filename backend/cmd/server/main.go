package main

import (
	"log"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/akhdanrgya/telu-hub/internal/database"
	"github.com/akhdanrgya/telu-hub/config"
	"github.com/akhdanrgya/telu-hub/internal/handlers"
)

func main() {

	err := config.LoadConfig()
	if err != nil {
		log.Fatalf("ERROR: Gagal nge-load config: %v", err)
	}

	database.InitDB()
	db := database.DB

	port := config.GetAppPort()

	app := fiber.New()
    
    app.Use(logger.New())

	handlers.SetupRoutes(app, db)

    log.Println("🔥 Server Fiber jalan di port ", port)
	app.Listen(port)
}