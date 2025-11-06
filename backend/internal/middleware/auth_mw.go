package middleware

import (
	"log"

	"github.com/akhdanrgya/telu-hub/config"
	"github.com/akhdanrgya/telu-hub/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Cookies("token")

		if tokenString == "" {
			log.Println("Middleware Error: Cookie 'token' tidak ditemukan")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Token tidak ditemukan, silakan login",
			})
		}

		claims := &utils.JWTClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Signing method token salah")
			}
			return []byte(config.GetJWTSecret()), nil
		})

		if err != nil {
			log.Printf("Middleware Error: Token parse gagal: %v", err)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Token tidak valid atau sudah expired",
			})
		}

		if !token.Valid {
			log.Println("Middleware Error: Token tidak valid")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Token tidak valid",
			})
		}

		c.Locals("user_id", claims.UserID)
		c.Locals("user_role", claims.Role)

		return c.Next()
	}
}

func RoleRequired(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		role, ok := c.Locals("user_role").(string)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Forbidden",
				"message": "Role user tidak terdefinisi",
			})
		}

		for _, allowedRole := range allowedRoles {
			if role == allowedRole {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Forbidden",
			"message": "Anda tidak punya izin untuk mengakses sumber daya ini",
		})
	}
}