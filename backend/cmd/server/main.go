package main

import (
	"log"
	"net"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/midtrans/midtrans-go"

	"google.golang.org/grpc"

	grpc_service "github.com/akhdanrgya/telu-hub/internal/grpc_service"
	pb "github.com/akhdanrgya/telu-hub/pb"

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

	stockService := grpc_service.NewStockService(db)
	go runGrpcServer(stockService, ":50051")

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

func runGrpcServer(stockSvc *grpc_service.StockService, port string) {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("Gagal 'listen' gRPC: %v", err)
	}
	
	grpcServer := grpc.NewServer()
	
	pb.RegisterStockServiceServer(grpcServer, stockSvc)
	
	log.Printf("👽 Server gRPC (Internal) jalan di port %s", port)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Gagal 'serve' gRPC: %v", err)
	}
}