package grpc_service

import (
	"log"
	"sync"

	pb "github.com/akhdanrgya/telu-hub/proto/stock"
)

type StockService struct {
	pb.UnimplementedStockServiceServer
	mu sync.Mutex 
	Hub map[uint32][]chan *pb.StockUpdateResponse 
}

func NewStockService() *StockService {
	return &StockService{
		Hub: make(map[uint32][]chan *pb.StockUpdateResponse),
	}
}


func (s *StockService) TrackStock(req *pb.TrackStockRequest, stream pb.StockService_TrackStockServer) error {
	productID := req.GetProductId()
	log.Printf("[gRPC] Penonton BARU terhubung untuk Produk ID: %d", productID)

	ch := make(chan *pb.StockUpdateResponse, 5)

	s.mu.Lock()
	s.Hub[productID] = append(s.Hub[productID], ch)
	s.mu.Unlock()

	defer func() {
		log.Printf("[gRPC] Penonton Produk ID: %d PUTUS", productID)
		s.mu.Lock()
		defer s.mu.Unlock()
		subscribers := s.Hub[productID]
		for i, sub := range subscribers {
			if sub == ch {
				s.Hub[productID] = append(subscribers[:i], subscribers[i+1:]...)
				break
			}
		}
		close(ch)
	}()

	for {
		select {
		case <-stream.Context().Done():
			return nil
		case update := <-ch:
			if err := stream.Send(update); err != nil {
				log.Printf("[gRPC] Error mengirim stream ke Produk ID %d: %v", productID, err)
				return err
			}
		}
	}
}

func (s *StockService) BroadcastStockUpdate(productID uint, newStock int) {
	update := &pb.StockUpdateResponse{
		ProductId: uint32(productID),
		NewStock:  int32(newStock),
	}
	log.Printf("[gRPC] SIARAN DIMULAI: Produk ID %d, Stok Baru %d", productID, newStock)

	s.mu.Lock()
	defer s.mu.Unlock()

	subscribers, ok := s.Hub[uint32(productID)]
	if !ok {
		return
	}

	for _, ch := range subscribers {
		select {
		case ch <- update:
		default:
		}
	}
}