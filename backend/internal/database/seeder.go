package database

import (
	"log"
	"strings"
	"os"

	"github.com/akhdanrgya/telu-hub/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedAll(db *gorm.DB) {
	seedUsers(db)

	seedCategoriesAndProducts(db)
}

func seedUsers(db *gorm.DB) {
	users := []struct {
		Username string
		Email    string
		Password string
		Role     string
	}{
		{"Admin Telu-Hub", "admin@admin.com", "admin123", "admin"},
		
		{"King Akhdan", "akhdan@gmail.com", "akhdan123", "user"},
		{"Martha", "martha@gmail.com", "martha123", "user"},

		{"Rico Juragan Elektro", "rico@gmail.com", "rico123", "seller"},
		{"Nca Ratu Distro", "nca@gmail.com", "nca123", "seller"},
	}

	log.Println("🌱 Mulai nanem bibit User...")

	for _, u := range users {
		var existingUser models.User
		if err := db.Where("email = ?", u.Email).First(&existingUser).Error; err == nil {
			log.Printf("⏩ User %s udah ada, skip.", u.Username)
			continue
		}

		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		
		newUser := models.User{
			Username: u.Username,
			Email:    u.Email,
			Password: string(hashedPassword),
			Role:     u.Role,
		}

		if err := db.Create(&newUser).Error; err != nil {
			log.Printf("❌ Gagal bikin user %s: %v", u.Username, err)
		} else {
			log.Printf("✅ User %s (%s) berhasil dibuat! 🚀", u.Username, u.Role)
		}
	}
}

func seedCategoriesAndProducts(db *gorm.DB) {
	log.Println("📦 Mulai nyetok Kategori & Barang...")

	// --- STEP 1: BIKIN KATEGORI ---
	categories := []models.Category{
		{Name: "Electronics", Slug: "electronics"},
		{Name: "Clothing", Slug: "clothing"},
		{Name: "Furniture", Slug: "furniture"},
		{Name: "Food", Slug: "food"},
		{Name: "Toys", Slug: "toys"},
		{Name: "Books", Slug: "books"},
		{Name: "Sports", Slug: "sports"},
		{Name: "Beauty", Slug: "beauty"},
		{Name: "Jewelry", Slug: "jewelry"},
	}

	for _, c := range categories {
		if err := db.Where("slug = ?", c.Slug).First(&models.Category{}).Error; err != nil {
			db.Create(&c)
			log.Printf("✅ Kategori %s dibuat.", c.Name)
		}
	}

	var rico, nca models.User
	var catElek, catCloth models.Category

	db.Where("email = ?", "rico@gmail.com").First(&rico)
	db.Where("email = ?", "nca@gmail.com").First(&nca)
	db.Where("slug = ?", "electronics").First(&catElek)
	db.Where("slug = ?", "clothing").First(&catCloth)

	clientURL := os.Getenv("CLIENT_URL")

	baseURL := clientURL + "/uploads/"

	products := []models.Product{
		{
			Name: "Laptop Gaming Spek Dewa", Description: "Rata kanan minus lecet.", Price: 15000000, Stock: 5, ImageURL: baseURL + "laptop.jpg",
			SellerID: rico.ID, CategoryID: catElek.ID,
		},
		{
			Name: "Mouse Wireless RGB", Description: "Auto headshot.", Price: 250000, Stock: 50, ImageURL: baseURL + "mouse.jpg",
			SellerID: rico.ID, CategoryID: catElek.ID,
		},
		{
			Name: "Keyboard Mechanical", Description: "Cetak cetok.", Price: 500000, Stock: 20, ImageURL: baseURL + "keyboard.jpg",
			SellerID: rico.ID, CategoryID: catElek.ID,
		},

		{
			Name: "Kaos Polos Hitam", Description: "Adem banget.", Price: 75000, Stock: 100, ImageURL: baseURL + "kaos.jpg",
			SellerID: nca.ID, CategoryID: catCloth.ID,
		},
		{
			Name: "Hoodie Tel-U", Description: "Anak senja.", Price: 150000, Stock: 30, ImageURL: baseURL + "hoodie.jpg",
			SellerID: nca.ID, CategoryID: catCloth.ID,
		},
		{
			Name: "Celana Chino", Description: "Buat kuliah.", Price: 120000, Stock: 45, ImageURL: baseURL + "celana.jpg",
			SellerID: nca.ID, CategoryID: catCloth.ID,
		},
	}

	for _, p := range products {
		p.Slug = strings.ToLower(strings.ReplaceAll(p.Name, " ", "-"))

		var exist models.Product
		if err := db.Where("slug = ?", p.Slug).First(&exist).Error; err == nil {
			log.Printf("⏩ Produk %s skip (udah ada).", p.Name)
			continue
		}

		if err := db.Create(&p).Error; err != nil {
			log.Printf("❌ Gagal: %v", err)
		} else {
			log.Printf("✅ Produk %s created!", p.Name)
		}
	}
}