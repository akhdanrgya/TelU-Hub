package handlers

import (
	// "log"
	"strconv"
	"time"

	// "github.com/akhdanrgya/telu-hub/internal/database"
	"github.com/akhdanrgya/telu-hub/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/midtrans/midtrans-go"
	// "github.com/midtrans/midtrans-go/coreapi"
	"github.com/midtrans/midtrans-go/snap"
	"gorm.io/gorm"
)

type OrderHandler struct {
	DB *gorm.DB
	SnapClient snap.Client
}

func NewOrderHandler(db *gorm.DB) *OrderHandler {
	var handler OrderHandler
	handler.DB = db
	handler.SnapClient.New(midtrans.ServerKey, midtrans.Sandbox) // Init Snap Client
	return &handler
}

// --- CREATE ORDER & GET SNAP TOKEN ---
// (POST /api/v1/checkout)
func (h *OrderHandler) CreateOrderAndPay(c *fiber.Ctx) error {
	userID, _ := c.Locals("user_id").(uint)

	// 1. 🚨 Transaksi Database (PENTING!)
	// Kita pake 'Transaction' biar aman. Kalo 1 gagal, semua di-rollback
	var snapToken string
	var orderIDGorm uint

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		// 1a. Ambil keranjang & barang-barangnya
		var cart models.Cart
		if err := tx.Preload("CartItems.Product").Where("user_id = ?", userID).First(&cart).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "Keranjang tidak ditemukan")
		}

		if len(cart.CartItems) == 0 {
			return fiber.NewError(fiber.StatusBadRequest, "Keranjang kosong")
		}

		// 1b. Hitung Total & Siapin Order Items (SERVER-SIDE)
		var totalAmount float64
		var orderItems []models.OrderItem
		var midtransItems []midtrans.ItemDetails

		for _, item := range cart.CartItems {
			// Cek stok (lagi)
			if item.Quantity > item.Product.Stock {
				return fiber.NewError(fiber.StatusBadRequest, "Stok untuk "+item.Product.Name+" tidak cukup")
			}
			
			price := item.Product.Price
			totalAmount += (float64(item.Quantity) * price)

			// Siapin buat dimasukin ke tabel 'order_items'
			orderItems = append(orderItems, models.OrderItem{
				ProductID:   item.ProductID,
				Quantity:    item.Quantity,
				PriceAtTime: price, // Catet harga pas dibeli
			})
			
			// Siapin buat dikirim ke Midtrans
			midtransItems = append(midtransItems, midtrans.ItemDetails{
				ID:    strconv.FormatUint(uint64(item.ProductID), 10),
				Price: int64(price),
				Qty:   int32(item.Quantity),
				Name:  item.Product.Name,
			})
		}

		// 1c. Bikin Order (di tabel 'orders')
		order := models.Order{
			UserID:      userID,
			TotalAmount: totalAmount,
			Status:      "pending", // Status awal
			OrderItems:  orderItems, // GORM pinter, ini bakal ke-create juga
		}
		if err := tx.Create(&order).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Gagal membuat order")
		}

		// 1d. Ambil ID user (buat Midtrans)
		var user models.User
		tx.First(&user, userID)

		// 1e. Ngomong ke Midtrans (Minta Snap Token)
		orderIDStr := "TELUHUB-" + strconv.FormatUint(uint64(order.ID), 10) + "-" + strconv.FormatInt(time.Now().Unix(), 10)
		snapReq := &snap.Request{
			TransactionDetails: midtrans.TransactionDetails{
				OrderID:  orderIDStr, // Order ID UNIK (kita + timestamp)
				GrossAmt: int64(totalAmount),
			},
			CustomerDetail: &midtrans.CustomerDetails{
				FName: user.Username,
				Email: user.Email,
			},
			Items: &midtransItems,
		}

		snapResp, snapErr := h.SnapClient.CreateTransaction(snapReq)
		if snapErr != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Gagal membuat transaksi Midtrans")
		}
		
		snapToken = snapResp.Token 
		orderIDGorm = order.ID

		if err := tx.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{}).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Gagal mengosongkan keranjang")
		}

		return nil
	})

	if err != nil {
		if fe, ok := err.(*fiber.Error); ok {
			return c.Status(fe.Code).JSON(fiber.Map{"error": fe.Message})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"snap_token": snapToken,
		"order_id": orderIDGorm,
	})
}

func (h *OrderHandler) HandleWebhook(c *fiber.Ctx) error {
	// ... (Ini logic buat nerima notifikasi dari Midtrans)
	// ... (Lo harus cek 'transaction_status' == 'settlement')
	// ... (Terus update order di DB lo jadi 'paid')
	// ... (Ini kompleks, kita skip dulu)
	
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Webhook diterima"})
}