package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/midtrans/midtrans-go"
	"google.golang.org/grpc"

	"github.com/akhdanrgya/telu-hub/config"
	"github.com/akhdanrgya/telu-hub/internal/database"
	"github.com/akhdanrgya/telu-hub/internal/handlers"
	grpc_service "github.com/akhdanrgya/telu-hub/internal/grpc_service"
)

func main() {
	// Load config
	if err := config.LoadConfig(); err != nil {
		log.Fatalf("❌ gagal load config: %v", err)
	}

	// Midtrans
	midtrans.ServerKey = config.GetMidtransServerKey()
	midtrans.ClientKey = config.GetMidtransClientKey()
	midtrans.Environment = midtrans.Sandbox

	// Database
	database.InitDB()
	db := database.DB

	// gRPC connection ke service stok 🔌
	conn, err := grpc.Dial("localhost:50051", grpc.WithInsecure()) // ubah port sesuai gRPC server lo
	if err != nil {
		log.Fatalf("❌ gagal connect ke gRPC server: %v", err)
	}
	defer conn.Close()

	stockClient := grpc_service.NewStockServiceClient(conn)

	// Fiber app setup
	app := fiber.New()
	app.Use(logger.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: true,
	}))

	app.Static("/uploads", "./uploads")

	// Setup routes
	handlers.SetupRoutes(app, db, stockClient) // tambahin parameter client di function SetupRoutes lo

	// Jalankan server
	port := config.GetAppPort()
	log.Printf("🔥 Server Fiber jalan di port %s", port)
	app.Listen(port)
}
