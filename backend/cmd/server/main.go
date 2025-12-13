package main

import (
	"log"
	"net"
	"net/http"
	"os"

	"github.com/akhdanrgya/telu-hub/config"
	"github.com/akhdanrgya/telu-hub/internal/database"
	"github.com/akhdanrgya/telu-hub/internal/handlers"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/midtrans/midtrans-go"
    
	"github.com/akhdanrgya/telu-hub/internal/notification"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"google.golang.org/grpc"

	grpc_service "github.com/akhdanrgya/telu-hub/internal/grpc_service"
	pb "github.com/akhdanrgya/telu-hub/proto/stock"
)

func main() {
	err := config.LoadConfig()
	if err != nil {
		log.Fatalf("ERROR: Gagal nge-load config: %v", err)
	}

	clientURL := os.Getenv("CLIENT_URL")
	if clientURL == "" {
		clientURL = "http://localhost:3000"
	}
    log.Printf("🌍 Client URL set to: %s", clientURL)

	midtrans.ServerKey = config.GetMidtransServerKey()
	midtrans.ClientKey = config.GetMidtransClientKey()
	midtrans.Environment = midtrans.Sandbox

	database.InitDB()
	db := database.DB

	database.SeedAdmin(db)

	stockService := grpc_service.NewStockService()

	notifHub := notification.NewNotificationHub()
	go notifHub.Run()
	notifService := notification.NewService(db, notifHub)

	grpcServer := runGrpcServer(stockService, ":50051")
	
	go runGrpcWebServer(grpcServer, ":8081", clientURL) 

	app := fiber.New()
	app.Use(logger.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins:     clientURL,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, x-grpc-web",
		AllowCredentials: true,
		AllowMethods:     "GET, POST, PUT, DELETE, PATCH, OPTIONS",
	}))

	app.Static("/uploads", "./uploads")

	handlers.SetupRoutes(app, db, stockService, notifService)

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

func runGrpcWebServer(grpcServer *grpc.Server, port string, allowedOrigin string) {
	wrappedGrpc := grpcweb.WrapServer(
		grpcServer,
		grpcweb.WithOriginFunc(func(origin string) bool {
			return origin == allowedOrigin 
		}),
	)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, x-grpc-web, X-User-Agent, Authorization, grpc-timeout")
        w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		if wrappedGrpc.IsGrpcWebRequest(r) || wrappedGrpc.IsAcceptableGrpcCorsRequest(r) || wrappedGrpc.IsGrpcWebSocketRequest(r) {
			wrappedGrpc.ServeHTTP(w, r)
			return
		}

		http.NotFound(w, r)
	})

	httpServer := &http.Server{
		Addr:    port,
		Handler: handler,
	}

	log.Printf("👨‍🚀 Server gRPC-Web (Proxy) jalan di port %s, Allow Origin: %s", port, allowedOrigin)
	if err := httpServer.ListenAndServe(); err != nil {
		log.Fatalf("Gagal 'serve' gRPC-Web: %v", err)
	}
}