package notification

import (
	"github.com/akhdanrgya/telu-hub/internal/models"
	"gorm.io/gorm"
)

type Service struct {
	DB  *gorm.DB
	Hub *NotificationHub
}

func NewService(db *gorm.DB, hub *NotificationHub) *Service {
	return &Service{DB: db, Hub: hub}
}

func (s *Service) CreateAndSend(userID uint, notifType models.NotificationType, title, message string, refID uint) error {
	notif := models.Notification{
		UserID:      userID,
		Type:        notifType,
		Title:       title,
		Message:     message,
		ReferenceID: refID,
		IsRead:      false,
	}
	if err := s.DB.Create(&notif).Error; err != nil {
		return err
	}
	s.Hub.Send <- BroadcastMessage{
		UserID:  userID,
		Payload: notif,
	}

	return nil
}

func (s *Service) GetUserNotifications(userID uint) ([]models.Notification, error) {
	var notifs []models.Notification
	err := s.DB.Where("user_id = ?", userID).Order("created_at desc").Limit(20).Find(&notifs).Error
	return notifs, err
}

func (s *Service) MarkAsRead(notifID uint, userID uint) error {
	return s.DB.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notifID, userID).
		Update("is_read", true).Error
}