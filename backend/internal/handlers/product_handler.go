package handlers

import (
	"github.com/akhdanrgya/telu-hub/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ProductHandler struct {
	DB *gorm.DB
}

func NewProductHandler(db *gorm.DB) *ProductHandler {
	return &ProductHandler{DB: db}
}


type CreateProductInput struct {
	Name        string  `json:"name" validate:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" validate:"required,gt=0"`
	Stock       int     `json:"stock" validate:"required,gte=0"`
	ImageURL    string  `json:"image_url"`
}

type ProductResponse struct {
	ID          uint         `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Price       float64      `json:"price"`
	Stock       int          `json:"stock"`
	ImageURL    string       `json:"image_url"`
	Seller      UserResponse `json:"seller"`
}


func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	sellerID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized (Invalid user ID)"})
	}

	input := new(CreateProductInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Data request tidak valid"})
	}

	product := models.Product{
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		Stock:       input.Stock,
		ImageURL:    input.ImageURL,
		SellerID:    sellerID,
	}

	if err := h.DB.Create(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan produk"})
	}

	return c.Status(fiber.StatusCreated).JSON(product)
}

func (h *ProductHandler) GetAllProducts(c *fiber.Ctx) error {
	var products []models.Product
	if err := h.DB.Preload("Seller").Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengambil data produk"})
	}

	var response []ProductResponse
	for _, p := range products {
		response = append(response, ProductResponse{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Price:       p.Price,
			Stock:       p.Stock,
			ImageURL:    p.ImageURL,
			Seller: UserResponse{
				ID:       p.Seller.ID,
				Username: p.Seller.Username,
				Email:    p.Seller.Email,
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func (h *ProductHandler) GetProductByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID produk tidak boleh kosong"})
	}
    
	var product models.Product

	if err := h.DB.Preload("Seller").First(&product, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Produk tidak ditemukan"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengambil data produk"})
	}

	response := ProductResponse{
		ID:          product.ID,
		Name:        product.Name,
		Description: product.Description,
		Price:       product.Price,
		Stock:       product.Stock,
		ImageURL:    product.ImageURL,
		Seller: UserResponse{
			ID:       product.Seller.ID,
			Username: product.Seller.Username,
			Email:    product.Seller.Email,
		},
	}

	return c.Status(fiber.StatusOK).JSON(response)
}