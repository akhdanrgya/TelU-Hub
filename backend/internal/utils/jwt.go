// backend/internal/utils/jwt.go (VERSI BARU YANG BENER)

package utils

import (
	"time"

	"github.com/akhdanrgya/telu-hub/config"
	"github.com/golang-jwt/jwt/v5"
)
type JWTClaims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, role string) (string, error) {
	jwtSecret := config.GetJWTSecret()
	
	expirationTime := time.Now().Add(72 * time.Hour)

	claims := &JWTClaims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	t, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return t, nil
}