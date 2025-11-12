package main

import (
	"log"
	"net"
	"net/http"

	"github.com/akhdanrgya/telu-hub/config"
	"github.com/akhdanrgya/telu-hub/internal/database"
	"github.com/akhdanrgya/telu-hub/internal/handlers"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/midtrans/midtrans-go"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"google.golang.org/grpc"
	rs_cors "github.com/rs/cors"

	grpc_service "github.com/akhdanrgya/telu-hub/internal/grpc_service"
	pb "github.com/akhdanrgya/telu-hub/proto/stock" 
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

	stockService := grpc_service.NewStockService()
    
	grpcServer := runGrpcServer(stockService, ":50051")
	go runGrpcWebServer(grpcServer, ":8081")

	app := fiber.New()
	
	app.Use(logger.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, x-grpc-web",
		AllowMethods:     "GET, POST, PUT, DELETE, PATCH, OPTIONS",
	}))

	app.Static("/uploads", "./uploads")

	handlers.SetupRoutes(app, db, stockService)

	port := config.GetAppPort()
	log.Printf("🔥 Server Fiber jalan di port %s", port)
	app.Listen(port)
}

func runGrpcServer(stockSvc *grpc_service.StockService, port string) *grpc.Server {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("Gagal 'listen' gRPC: %v", err)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterStockServiceServer(grpcServer, stockSvc)

	go func() {
		log.Printf("👽 Server gRPC (Internal) jalan di port %s", port)
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatalf("Gagal 'serve' gRPC: %v", err)
		}
	}()
	return grpcServer
}

func runGrpcWebServer(grpcServer *grpc.Server, port string) {
	wrappedGrpc := grpcweb.WrapServer(grpcServer,
		grpcweb.WithOriginFunc(func(origin string) bool { return true }),
	)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if wrappedGrpc.IsGrpcWebRequest(r) || wrappedGrpc.IsAcceptableGrpcCorsRequest(r) || wrappedGrpc.IsGrpcWebSocketRequest(r) {
			wrappedGrpc.ServeHTTP(w, r)
			return
		}
		http.NotFound(w, r)
	})

	c := rs_cors.New(rs_cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"POST", "GET", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "x-grpc-web", "Authorization"},
		AllowCredentials: true,
	})
	httpServer := &http.Server{
		Addr:    port,
		Handler: c.Handler(handler),
	}

	log.Printf("👨‍🚀 Server gRPC-Web (Proxy) jalan di port %s", port)
	if err := httpServer.ListenAndServe(); err != nil {
		log.Fatalf("Gagal 'serve' gRPC-Web: %v", err)
	}
}