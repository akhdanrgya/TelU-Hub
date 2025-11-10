package handlers

import (
	"time"

	"github.com/akhdanrgya/telu-hub/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type PublicProfileResponse struct {
	ID              uint      `json:"id"`
	Username        string    `json:"username"`
	ProfileImageURL string    `json:"profile_image_url,omitempty"`
	Role            string    `json:"role"`
	JoinedAt        time.Time `json:"joined_at"`
}



type UserHandler struct {
	DB *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{DB: db}
}

type UpdateProfileInput struct {
	Username        string `json:"username"`
	ProfileImageURL string `json:"profile_image_url"`
}

func (h *UserHandler) UpdateUserProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var input UpdateProfileInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Data request tidak valid"})
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User tidak ditemukan"})
	}
	if input.Username != "" {
		user.Username = input.Username
	}
	if input.ProfileImageURL != "" {
		user.ProfileImageURL = input.ProfileImageURL
	}

	if err := h.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengupdate profil"})
	}

	response := UserResponse{
		ID:              user.ID,
		Username:        user.Username,
		Email:           user.Email,
		Role:            user.Role,
		ProfileImageURL: user.ProfileImageURL,
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func (h *UserHandler) GetUserPublicProfile(c *fiber.Ctx) error {
	username := c.Params("username")
	if username == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Username tidak boleh kosong"})
	}

	var user models.User
	if err := h.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User tidak ditemukan"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengambil data user"})
	}

	response := PublicProfileResponse{
		ID:              user.ID,
		Username:        user.Username,
		ProfileImageURL: user.ProfileImageURL,
		Role:            user.Role,
		JoinedAt:        user.CreatedAt,
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func (h *UserHandler) GetUserProducts(c *fiber.Ctx) error {
	username := c.Params("username")
	if username == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Username tidak boleh kosong"})
	}

	var user models.User
	if err := h.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User tidak ditemukan"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mencari user"})
	}

	var products []models.Product
	if err := h.DB.Preload("Seller").Where("seller_id = ?", user.ID).Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengambil produk user"})
	}
	var response []ProductResponse
	for _, p := range products {
		response = append(response, ProductResponse{
			ID:          p.ID,
			Name:        p.Name,
			Slug:        p.Slug,
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

	if response == nil {
		response = make([]ProductResponse, 0)
	}

	return c.Status(fiber.StatusOK).JSON(response)
}