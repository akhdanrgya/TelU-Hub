package models

import "gorm.io/gorm"

// Ini adalah "Blueprint" buat tabel 'users'
type User struct {
	gorm.Model // Ini otomatis nambahin: ID, CreatedAt, UpdatedAt, DeletedAt

	Username string `gorm:"size:255;uniqueIndex;not null"` // Username gak boleh sama
	Email    string `gorm:"size:255;uniqueIndex;not null"` // Email gak boleh sama
	Password string `gorm:"size:255;not null"`           // Ini bakal nyimpen password yang udah di-HASH
    
    // Nanti kalo udah jelas, kita bisa tambahin relasi ke Channel, Message, dll
    // Messages   []Message 
	// Channels   []*Channel `gorm:"many2many:user_channels;"`
}