package notification

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type Handler struct {
	Service *Service
}

func NewHandler(s *Service) *Handler {
	return &Handler{Service: s}
}

func (h *Handler) GetNotifications(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	notifs, err := h.Service.GetUserNotifications(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengambil notifikasi"})
	}
	return c.JSON(notifs)
}

func (h *Handler) MarkRead(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	notifID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID tidak valid"})
	}

	if err := h.Service.MarkAsRead(uint(notifID), userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal update status"})
	}
	return c.JSON(fiber.Map{"message": "Notifikasi ditandai sudah dibaca"})
}

func (h *Handler) HandleWSConnection(c *websocket.Conn) {
	userIDStr := c.Query("user_id")
	userIDU64, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil || userIDU64 == 0 {
		log.Println("[NOTIF-WS] Gagal konek: user_id tidak valid di query param")
		c.Close()
		return
	}
	userID := uint(userIDU64)

	h.Service.Hub.Register(userID, c)
	defer h.Service.Hub.Unregister(userID,c)

	for {
		_, _, err := c.ReadMessage()
		if err != nil {
			break
		}
	}
}