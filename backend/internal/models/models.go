package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `gorm:"size:255;uniqueIndex;not null"`
	Email    string `gorm:"size:255;uniqueIndex;not null"`
	Password string `gorm:"size:255;not null"`
	Role     string `gorm:"size:50;not null;default:'user'"`
	ProfileImageURL string `gorm:"size:255"`

	Products []Product `gorm:"foreignKey:SellerID"`
	Cart     Cart      `gorm:"foreignKey:UserID"`
	Orders   []Order   `gorm:"foreignKey:UserID"`
}

type Product struct {
	gorm.Model
	Name        string  `gorm:"size:255;not null"`
	Description string  `gorm:"type:text"`
	Price       float64 `gorm:"not null"`
	Stock       int     `gorm:"not null;default:0"`
	ImageURL    string  `gorm:"size:255"`

	SellerID uint `gorm:"not null"`
	Seller *User `gorm:"foreignKey:SellerID"`
}


type Cart struct {
	gorm.Model
	UserID    uint `gorm:"uniqueIndex;not null"`
	CartItems []CartItem

	User *User `gorm:"foreignKey:UserID"`
}


type CartItem struct {
	gorm.Model
	CartID    uint `gorm:"not null"`
	ProductID uint `gorm:"not null"`
	Quantity  int  `gorm:"not null;default:1"`

	Cart    *Cart    `gorm:"foreignKey:CartID"`
	Product *Product `gorm:"foreignKey:ProductID"`
}


type Order struct {
	gorm.Model
	UserID      uint    `gorm:"not null"`
	TotalAmount float64 `gorm:"not null"`
	Status      string  `gorm:"size:50;not null;default:'pending'"`
	OrderItems  []OrderItem

	User *User `gorm:"foreignKey:UserID"`
}


type OrderItem struct {
	gorm.Model
	OrderID     uint    `gorm:"not null"`
	ProductID   uint    `gorm:"not null"`
	Quantity    int     `gorm:"not null"`
	PriceAtTime float64 `gorm:"not null"`

	Order   *Order   `gorm:"foreignKey:OrderID"`
	Product *Product `gorm:"foreignKey:ProductID"`
}