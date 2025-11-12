package grpc_service

import (
	"context"
	"fmt"
	"log"

	"github.com/akhdanrgya/telu-hub/internal/models"
	pb "github.com/akhdanrgya/telu-hub/pb"
	"gorm.io/gorm"
)

// StockService (Otak Gudang)
// Dia butuh 'DB' buat ngomong ke Postgres
type StockService struct {
	pb.UnimplementedStockServiceServer // Wajib ada
	DB *gorm.DB
}

// NewStockService (Constructor)
func NewStockService(db *gorm.DB) *StockService {
	return &StockService{
		DB: db,
	}
}

// 2. 🚨 IMPLEMENTASI 'UpdateStock' (sesuai .proto lo)
func (s *StockService) UpdateStock(ctx context.Context, req *pb.UpdateStockRequest) (*pb.UpdateStockResponse, error) {
	productID := req.GetProductId()
	delta := req.GetDelta() // 'delta' (misal: -3 atau +10)
	
	log.Printf("[gRPC] Terima request UpdateStock: Produk ID %s, Delta %d", productID, delta)

	// 3. Kita butuh 'Transaction' biar aman
	err := s.DB.Transaction(func(tx *gorm.DB) error {
		// Cari produknya
		var product models.Product
		
		// 4. 🚨 PENTING: .proto lo pake 'string' buat product_id
		//    Tapi 'models.Product' lo pake 'uint'
		//    Kita harus 'First' pake 'string'
		if err := tx.Where("id = ?", productID).First(&product).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				log.Printf("[gRPC] Error: Produk ID %s tidak ditemukan", productID)
				return fmt.Errorf("produk ID %s tidak ditemukan", productID)
			}
			return err
		}
		
		// 5. Hitung stok baru
		// (Kita pake 'int64' biar cocok sama 'delta')
		newStock := int64(product.Stock) + delta
		
		if newStock < 0 {
			log.Printf("[gRPC] Error: Stok tidak cukup (mau %d, sisa %d)", delta, product.Stock)
			return fmt.Errorf("stok tidak cukup")
		}

		// 6. Update stok di DB
		product.Stock = int(newStock) // Balikin ke 'int'
		if err := tx.Save(&product).Error; err != nil {
			return err
		}
		
		return nil // Commit transaksi
	})

	// 7. Handle hasil transaksi
	if err != nil {
		return &pb.UpdateStockResponse{
			ProductId: productID,
			Ok:        false,
			Message:   err.Error(),
		}, nil // Di gRPC, kita balikin 'error'-nya di response, bukan di 'error'
	}

	// 8. Kalo SUKSES
	var updatedProduct models.Product
	s.DB.First(&updatedProduct, productID) // Ambil data baru
	
	return &pb.UpdateStockResponse{
		ProductId:   productID,
		NewQuantity: int64(updatedProduct.Stock),
		Ok:          true,
		Message:     "Stok berhasil di-update",
	}, nil
}