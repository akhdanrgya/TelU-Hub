package models

import "time"

type NotificationType string

const (
	NotificationTypeOrder NotificationType = "order"
	NotificationTypeChat  NotificationType = "chat"
	NotificationTypeInfo  NotificationType = "info"
)

type Notification struct {
	ID        uint             `gorm:"primaryKey" json:"id"`
	UserID    uint             `gorm:"not null;index" json:"user_id"` // Penerima surat
	User      User             `gorm:"foreignKey:UserID" json:"-"`
	Type      NotificationType `gorm:"type:varchar(20);not null" json:"type"` // Jenis surat
	Title     string           `gorm:"type:varchar(100);not null" json:"title"`
	Message   string           `gorm:"type:text;not null" json:"message"`
	ReferenceID uint           `json:"reference_id"` // Misal: OrderID atau ChatRoomID
	IsRead    bool             `gorm:"default:false" json:"is_read"` // Udah dibaca belum?
	CreatedAt time.Time        `json:"created_at"`
}