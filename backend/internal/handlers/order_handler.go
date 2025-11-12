package handlers

import (
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/akhdanrgya/telu-hub/config"
	"github.com/akhdanrgya/telu-hub/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
	"gorm.io/gorm"

	grpc_service "github.com/akhdanrgya/telu-hub/internal/grpc_service"
)

type OrderHandler struct {
	DB           *gorm.DB
	SnapClient   snap.Client
	StockService *grpc_service.StockService
}

type OrderProductResponse struct { // 👈 Ini BEDA sama 'CartProductResponse' (gak ada slug)
	ID       uint    `json:"id"`
	Name     string  `json:"name"`
	Price    float64 `json:"price"` // Kita pake 'Price' aja, bukan 'PriceAtTime'
	ImageURL string  `json:"image_url"`
}
type OrderItemResponse struct {
	ID          uint                 `json:"id"`
	Quantity    int                  `json:"quantity"`
	PriceAtTime float64              `json:"price_at_time"`
	Product     OrderProductResponse `json:"Product"`
}
type OrderResponse struct {
	ID          uint                `json:"id"`
	TotalAmount float64             `json:"total_amount"`
	Status      string              `json:"status"`
	CreatedAt   time.Time           `json:"created_at"`
	OrderItems  []OrderItemResponse `json:"OrderItems"`
}

func NewOrderHandler(db *gorm.DB, stockService *grpc_service.StockService) *OrderHandler {
	var handler OrderHandler
	handler.DB = db
	handler.SnapClient.New(midtrans.ServerKey, midtrans.Sandbox)
	handler.StockService = stockService
	return &handler
}

func (h *OrderHandler) CreateOrderAndPay(c *fiber.Ctx) error {
	userID, _ := c.Locals("user_id").(uint)

	var snapToken string
	var orderIDGorm uint

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		var cart models.Cart
		if err := tx.Preload("CartItems.Product").Where("user_id = ?", userID).First(&cart).Error; err != nil {
			return fiber.NewError(fiber.StatusNotFound, "Keranjang tidak ditemukan")
		}

		if len(cart.CartItems) == 0 {
			return fiber.NewError(fiber.StatusBadRequest, "Keranjang kosong")
		}

		var totalAmount float64
		var orderItems []models.OrderItem
		var midtransItems []midtrans.ItemDetails

		for _, item := range cart.CartItems {
			if item.Quantity > item.Product.Stock {
				return fiber.NewError(fiber.StatusBadRequest, "Stok untuk "+item.Product.Name+" tidak cukup")
			}
			price := item.Product.Price
			totalAmount += (float64(item.Quantity) * price)

			orderItems = append(orderItems, models.OrderItem{
				ProductID:   item.ProductID,
				Quantity:    item.Quantity,
				PriceAtTime: price,
			})

			midtransItems = append(midtransItems, midtrans.ItemDetails{
				ID:    strconv.FormatUint(uint64(item.ProductID), 10),
				Price: int64(price),
				Qty:   int32(item.Quantity),
				Name:  item.Product.Name,
			})
		}

		order := models.Order{
			UserID:      userID,
			TotalAmount: totalAmount,
			Status:      "pending",
			OrderItems:  orderItems,
		}
		if err := tx.Create(&order).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Gagal membuat order")
		}

		var user models.User
		tx.First(&user, userID)

		orderIDStr := "TELUHUB-" + strconv.FormatUint(uint64(order.ID), 10) + "-" + strconv.FormatInt(time.Now().Unix(), 10)

		snapReq := &snap.Request{
			TransactionDetails: midtrans.TransactionDetails{
				OrderID:  orderIDStr,
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
		"order_id":   orderIDGorm,
	})
}

type MidtransNotification struct {
	TransactionStatus string `json:"transaction_status"`
	TransactionID     string `json:"transaction_id"`
	OrderID           string `json:"order_id"`
	StatusCode        string `json:"status_code"`
	SignatureKey      string `json:"signature_key"`
	PaymentType       string `json:"payment_type"`
	GrossAmount       string `json:"gross_amount"`
}

func (h *OrderHandler) HandleWebhook(c *fiber.Ctx) error {
	var notification MidtransNotification

	if err := c.BodyParser(&notification); err != nil {
		log.Printf("[WEBHOOK] 400 Bad Request: Gagal parse body: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse request"})
	}

	serverKey := config.GetMidtransServerKey()
	strToHash := notification.OrderID + notification.StatusCode + notification.GrossAmount + serverKey
	hasher := sha512.New()
	hasher.Write([]byte(strToHash))
	ourHash := hex.EncodeToString(hasher.Sum(nil))
	if ourHash != notification.SignatureKey {
		log.Printf("[WEBHOOK] 401 Unauthorized: Signature key salah!")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid signature"})
	}

	if !strings.HasPrefix(notification.OrderID, "TELUHUB-") {
		log.Printf("[WEBHOOK] INFO: Notifikasi Tes (OrderID: %s) diterima dan di-skip.", notification.OrderID)
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Webhook Test Received and Skipped"})
	}

	log.Printf("[WEBHOOK] 200 OK: Notifikasi ASLI diterima untuk Order ID: %s, Status: %s", notification.OrderID, notification.TransactionStatus)

	orderIDParts := strings.Split(notification.OrderID, "-")
	if len(orderIDParts) < 3 {
		log.Printf("[WEBHOOK] 400 Bad Request: Format Order ID asli salah: %s", notification.OrderID)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Order ID format"})
	}

	realOrderID, err := strconv.ParseUint(orderIDParts[1], 10, 64)
	if err != nil {
		log.Printf("[WEBHOOK] 400 Bad Request: Gagal parse Order ID asli: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Order ID"})
	}

	var order models.Order
	if err := h.DB.First(&order, realOrderID).Error; err != nil {
		log.Printf("[WEBHOOK] 404 Not Found: Order %d tidak ditemukan di DB", realOrderID)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
	}

	if notification.TransactionStatus == "settlement" || notification.TransactionStatus == "capture" {
		if order.Status == "paid" {
			log.Printf("[WEBHOOK] INFO: Order %d udah 'paid', skip", realOrderID)
			return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Already processed"})
		}


		err := h.DB.Transaction(func(tx *gorm.DB) error {
			var orderItems []models.OrderItem
			if err := tx.Where("order_id = ?", realOrderID).Preload("Product").Find(&orderItems).Error; err != nil {
				return fmt.Errorf("gagal ambil order items: %v", err)
			}

			if len(orderItems) == 0 {
				return fmt.Errorf("order %d gak punya item", realOrderID)
			}

			for _, item := range orderItems {
				if item.Quantity > item.Product.Stock {
					return fmt.Errorf("stok tidak cukup untuk produk %s", item.Product.Name)
				}

				newStock := item.Product.Stock - item.Quantity
				if err := tx.Model(&item.Product).Where("id = ?", item.ProductID).Update("stock", newStock).Error; err != nil {
					return fmt.Errorf("gagal update stok: %v", err)
				}
				h.StockService.BroadcastStockUpdate(item.ProductID, newStock)
			}

			order.Status = "paid"
			if err := tx.Save(&order).Error; err != nil {
				return fmt.Errorf("gagal update status order: %v", err)
			}

			return nil
		})

		if err != nil {
			log.Printf("[WEBHOOK] 500 Server Error: Gagal proses transaksi 'paid': %v", err)
			order.Status = "failed"
			h.DB.Save(&order)

			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		// 3. KALO 'err == nil' (Sukses), BARU kita log
		log.Printf("[WEBHOOK] SUKSES: Order %d statusnya di-update jadi 'paid'", realOrderID)
	}

	if notification.TransactionStatus == "expire" || notification.TransactionStatus == "failure" || notification.TransactionStatus == "deny" {
		order.Status = "failed"
		h.DB.Save(&order)
		log.Printf("[WEBHOOK] INFO: Order %d statusnya di-update jadi 'failed'", realOrderID)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Webhook received and processed"})
}

func (h *OrderHandler) GetMyOrders(c *fiber.Ctx) error {
	userID, _ := c.Locals("user_id").(uint)

	var orders []models.Order
	// 1. Ambil semua order punya user ini
	// 2. Preload Item-nya
	// 3. Preload Produk di dalem Item-nya
	// 4. Urutin dari yg paling baru (Descending)
	err := h.DB.Preload("OrderItems.Product").
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&orders).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengambil data order"})
	}

	// 2. Transformasi datanya jadi 'Response'
	var response []OrderResponse
	for _, order := range orders {
		var orderItemsResponse []OrderItemResponse
		for _, item := range order.OrderItems {
			orderItemsResponse = append(orderItemsResponse, OrderItemResponse{
				ID:          item.ID,
				Quantity:    item.Quantity,
				PriceAtTime: item.PriceAtTime,
				Product: OrderProductResponse{
					ID:       item.Product.ID,
					Name:     item.Product.Name,
					Price:    item.Product.Price, // Harga produk saat ini
					ImageURL: item.Product.ImageURL,
				},
			})
		}

		response = append(response, OrderResponse{
			ID:          order.ID,
			TotalAmount: order.TotalAmount,
			Status:      order.Status,
			CreatedAt:   order.CreatedAt,
			OrderItems:  orderItemsResponse,
		})
	}

	// 3. Jaring pengaman (biar gak 'null')
	if response == nil {
		response = make([]OrderResponse, 0)
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func (h *OrderHandler) GetOrderByID(c *fiber.Ctx) error {
	userID, _ := c.Locals("user_id").(uint)
	orderID := c.Params("id")

	var order models.Order
	err := h.DB.Preload("OrderItems.Product").
		Where("id = ? AND user_id = ?", orderID, userID).
		First(&order).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order tidak ditemukan"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengambil data order"})
	}

	var orderItemsResponse []OrderItemResponse
	for _, item := range order.OrderItems {
		orderItemsResponse = append(orderItemsResponse, OrderItemResponse{
			ID:          item.ID,
			Quantity:    item.Quantity,
			PriceAtTime: item.PriceAtTime,
			Product: OrderProductResponse{
				ID:       item.Product.ID,
				Name:     item.Product.Name,
				Price:    item.Product.Price,
				ImageURL: item.Product.ImageURL,
			},
		})
	}

	response := OrderResponse{
		ID:          order.ID,
		TotalAmount: order.TotalAmount,
		Status:      order.Status,
		CreatedAt:   order.CreatedAt,
		OrderItems:  orderItemsResponse,
	}

	return c.Status(fiber.StatusOK).JSON(response)
}
