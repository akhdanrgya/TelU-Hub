package database

import (
	"log"

	"github.com/akhdanrgya/telu-hub/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedAdmin(db *gorm.DB) {
	var admin models.User

	adminEmail := "admin@admin.com"
	
	err := db.Where("email = ?", adminEmail).First(&admin).Error
	if err == nil {
		log.Println("✅ Admin udah ada, skip seeding.")
		return
	}

	log.Println("🌱 Admin belum ada, lagi dibuat...")

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)

	newAdmin := models.User{
		Username: "Admin Telu-Hub",
		Email:    adminEmail,
		Password: string(hashedPassword),
		Role:     "admin",
	}

	if err := db.Create(&newAdmin).Error; err != nil {
		log.Printf("❌ Gagal seeding admin: %v", err)
	} else {
		log.Println("🎉 Sukses! Akun Admin berhasil dibuat.")
		log.Println("📧 Email: admin@teluhub.com")
		log.Println("🔑 Pass : admin123")
	}
}