package database

import (
	"log"

	"github.com/akhdanrgya/telu-hub/config"  
	"github.com/akhdanrgya/telu-hub/internal/models" 

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error

	dsn := config.GetDBConnectionString()

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("ERROR: Gagal konek ke database: %v", err)
	}

	log.Println("Database connection successful! 🐘")

	log.Println("Menjalankan Auto Migration untuk User...")
	err = DB.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("ERROR: Gagal nge-migrate tabel User: %v", err)
	}

	log.Println("Migrasi tabel 'users' sukses!")
}