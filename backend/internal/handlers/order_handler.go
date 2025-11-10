package handlers

import (
	"crypto/sha512"
	"encoding/hex" 
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
)


type OrderHandler struct {
	DB *gorm.DB
	SnapClient snap.Client
}

func NewOrderHandler(db *gorm.DB) *OrderHandler {
	var handler OrderHandler
	handler.DB = db
	handler.SnapClient.New(midtrans.ServerKey, midtrans.Sandbox)
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
		"order_id": orderIDGorm,
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
		order.Status = "paid" 
		if err := h.DB.Save(&order).Error; err != nil {
			log.Printf("[WEBHOOK] 500 Server Error: Gagal update status order %d: %v", realOrderID, err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "DB update failed"})
		}
		log.Printf("[WEBHOOK] SUKSES: Order %d statusnya di-update jadi 'paid'", realOrderID)
	}

	if notification.TransactionStatus == "expire" || notification.TransactionStatus == "failure" || notification.TransactionStatus == "deny" {
		order.Status = "failed"
		h.DB.Save(&order)
		log.Printf("[WEBHOOK] INFO: Order %d statusnya di-update jadi 'failed'", realOrderID)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Webhook received and processed"})
}