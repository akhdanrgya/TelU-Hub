package handlers

import (
	"log"
	"time"

	"github.com/akhdanrgya/telu-hub/internal/models"
	"github.com/akhdanrgya/telu-hub/internal/utils"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{DB: db}
}

type UserResponse struct {
	ID        uint   `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	ProfileImageURL string `json:"profile_image_url"`
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	type RegisterInput struct {
		Username string `json:"username" validate:"required,min=3"`
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required,min=6"`
	}
	
	input := new(RegisterInput)

	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Data request tidak valid",
		})
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memproses password",
		})
	}

	user := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: hashedPassword,
		Role:     "user", 
	}

	if result := h.DB.Create(&user); result.Error != nil {
		if gorm.ErrDuplicatedKey == result.Error {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "Username atau Email sudah terdaftar",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal mendaftarkan user",
		})
	}

	cart := models.Cart{UserID: user.ID}
	if err := h.DB.Create(&cart).Error; err != nil {
		log.Printf("Gagal bikin cart buat user %d: %v", user.ID, err)
	}

	response := UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}


func (h *AuthHandler) Login(c *fiber.Ctx) error {
	type LoginInput struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required"`
	}
	
	input := new(LoginInput)

	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Data request tidak valid"})
	}

	var user models.User
	if err := h.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Email atau Password salah"})
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Email atau Password salah"})
	}

	tokenString, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal membuat token"})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  time.Now().Add(72 * time.Hour),
		HTTPOnly: true, 
		Secure:   false, 
		SameSite: "Lax", 
	})

	response := UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		Secure:   false, 
		SameSite: "Lax",
	})
	
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Logout berhasil"})
}


func (h *AuthHandler) GetUserData(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Data user tidak ditemukan di context"})
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User tidak ditemukan"})
	}

	response := UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Role:      user.Role,
		ProfileImageURL: user.ProfileImageURL, 
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func (h *AuthHandler) PromoteUser(c *fiber.Ctx) error {
	targetUserID := c.Params("id")
	if targetUserID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID user target tidak boleh kosong"})
	}

	type PromoteInput struct {
		Role string `json:"role" validate:"required"`
	}
	input := new(PromoteInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Body request tidak valid"})
	}

	if input.Role != "seller" && input.Role != "user" && input.Role != "admin" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Role tidak valid. Hanya boleh 'user', 'seller', atau 'admin'"})
	}

	var user models.User
	if err := h.DB.First(&user, targetUserID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User target tidak ditemukan"})
	}

	user.Role = input.Role
	if err := h.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengupdate role user"})
	}

	response := UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
		ProfileImageURL: user.ProfileImageURL,
	}
	
	return c.Status(fiber.StatusOK).JSON(response)
}