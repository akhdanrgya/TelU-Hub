package main

import (
	"log"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/akhdanrgya/telu-hub/config"
)

func main() {

	err := config.LoadConfig()
	if err != nil {
		log.Fatalf("ERROR: Gagal nge-load config: %v", err)
	}

	port := config.GetAppPort()

	app := fiber.New()
    
    app.Use(logger.New())

	app.Get("/api", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Welcome to TelU-Hub API! 🚀",
		})
	})

    log.Println("🔥 Server Fiber jalan di port ", port)
	app.Listen(port)
}