package handlers

import (
	"log"

	"github.com/akhdanrgya/telu-hub/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CartHandler struct {
	DB *gorm.DB
}

func NewCartHandler(db *gorm.DB) *CartHandler {
	return &CartHandler{DB: db}
}

type AddItemInput struct {
	ProductID uint `json:"product_id" validate:"required"`
	Quantity  int  `json:"quantity" validate:"required,min=1"`
}

type CartProductResponse struct {
	ID       uint    `json:"id"`
	Name     string  `json:"name"`
	Slug     string  `json:"slug"`
	Price    float64 `json:"price"`
	ImageURL string  `json:"image_url"`
}

type CartItemResponse struct {
	ID        uint                `json:"id"`
	Quantity  int                 `json:"quantity"`
	ProductID uint                `json:"product_id"`
	Product   CartProductResponse `json:"Product"`
}

type CartResponse struct {
	ID        uint               `json:"id"`
	UserID    uint               `json:"user_id"`
	CartItems []CartItemResponse `json:"CartItems"`
}

func (h *CartHandler) GetCart(c *fiber.Ctx) error {
	userID, _ := c.Locals("user_id").(uint)

	var cart models.Cart
	err := h.DB.Preload("CartItems.Product").Where("user_id = ?", userID).First(&cart).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("Keranjang buat User ID %d gak ketemu, bikin baru...", userID)
			
			newCart := models.Cart{
				UserID:    userID,
				CartItems: []models.CartItem{},
			}
			if errCreate := h.DB.Create(&newCart).Error; errCreate != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal membuat keranjang baru"})
			}
			
			cart = newCart 
		
		} else {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengambil keranjang"})
		}
	}
	cartItemsResponse := []CartItemResponse{}
	for _, item := range cart.CartItems {
		cartItemsResponse = append(cartItemsResponse, CartItemResponse{
			ID:        item.ID,
			Quantity:  item.Quantity,
			ProductID: item.ProductID,
			Product: CartProductResponse{ 
				ID:       item.Product.ID,
				Name:     item.Product.Name,
				Slug:     item.Product.Slug,
				Price:    item.Product.Price,
				ImageURL: item.Product.ImageURL,
			},
		})
	}
	
	response := CartResponse{
		ID:        cart.ID,
		UserID:    cart.UserID,
		CartItems: cartItemsResponse, 
	}

	return c.Status(fiber.StatusOK).JSON(response)
}


func (h *CartHandler) AddItemToCart(c *fiber.Ctx) error {
	userID, _ := c.Locals("user_id").(uint)
	input := new(AddItemInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Data request tidak valid"})
	}
	if input.Quantity <= 0 { input.Quantity = 1 }

	var product models.Product
	if err := h.DB.First(&product, input.ProductID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Produk tidak ditemukan"})
	}
	
	var cart models.Cart
	if err := h.DB.Where("user_id = ?", userID).First(&cart).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Keranjang user tidak ditemukan"})
	}

	var existingItem models.CartItem
	err := h.DB.Where("cart_id = ? AND product_id = ?", cart.ID, input.ProductID).First(&existingItem).Error

	if err == gorm.ErrRecordNotFound {
		if input.Quantity > product.Stock {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Stok tidak cukup!"})
		}
		newItem := models.CartItem{
			CartID:    cart.ID,
			ProductID: input.ProductID,
			Quantity:  input.Quantity,
		}
		if err := h.DB.Create(&newItem).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menambah item ke keranjang"})
		}
		return c.Status(fiber.StatusCreated).JSON(newItem)
	
	} else if err == nil {
		newQuantity := existingItem.Quantity + input.Quantity
		if newQuantity > product.Stock {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Stok tidak cukup!"})
		}
		existingItem.Quantity = newQuantity
		if err := h.DB.Save(&existingItem).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengupdate quantity item"})
		}
		return c.Status(fiber.StatusOK).JSON(existingItem)
	
	} else {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error mencari item di keranjang"})
	}
}

func (h *CartHandler) UpdateCartItem(c *fiber.Ctx) error {
	userID, _ := c.Locals("user_id").(uint)
	cartItemID := c.Params("id")
	if cartItemID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID item keranjang tidak boleh kosong"})
	}
	type UpdateQuantityInput struct { Quantity int `json:"quantity"` }
	var input UpdateQuantityInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Data request tidak valid"})
	}
	if input.Quantity <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Quantity minimal 1"})
	}
	var cart models.Cart
	if err := h.DB.Where("user_id = ?", userID).First(&cart).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Keranjang user tidak ditemukan"})
	}
	var cartItem models.CartItem
	err := h.DB.Preload("Product").Where("id = ? AND cart_id = ?", cartItemID, cart.ID).First(&cartItem).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Item di keranjang tidak ditemukan"})
	}
	if input.Quantity > cartItem.Product.Stock {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Stok tidak cukup!"})
	}
	cartItem.Quantity = input.Quantity
	if err := h.DB.Save(&cartItem).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengupdate quantity"})
	}
	return c.Status(fiber.StatusOK).JSON(cartItem)
}

func (h *CartHandler) RemoveCartItem(c *fiber.Ctx) error {
	userID, _ := c.Locals("user_id").(uint)
	cartItemID := c.Params("id")
	if cartItemID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID item keranjang tidak boleh kosong"})
	}
	var cart models.Cart
	if err := h.DB.Where("user_id = ?", userID).First(&cart).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Keranjang user tidak ditemukan"})
	}
	var cartItem models.CartItem
	err := h.DB.Where("id = ? AND cart_id = ?", cartItemID, cart.ID).First(&cartItem).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Item di keranjang tidak ditemukan"})
	}
	if err := h.DB.Delete(&cartItem).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menghapus item dari keranjang"})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Item berhasil dihapus"})
}