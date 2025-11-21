package notification

import (
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

type NotificationHub struct {
	Clients map[uint]*websocket.Conn

	mu sync.RWMutex

	Send chan BroadcastMessage
}

type BroadcastMessage struct {
	UserID  uint        
	Payload interface{}
}

func NewNotificationHub() *NotificationHub {
	return &NotificationHub{
		Clients: make(map[uint]*websocket.Conn),
		Send:    make(chan BroadcastMessage),
	}
}

func (h *NotificationHub) Run() {
	log.Println("[NOTIF-HUB] Kantor Pos Global siap beroperasi...")
	for {
		msg := <-h.Send
		
		h.mu.RLock()
		clientConn, ok := h.Clients[msg.UserID]
		h.mu.RUnlock()

		if ok && clientConn != nil {
			err := clientConn.WriteJSON(msg.Payload)
			if err != nil {
				log.Printf("[NOTIF-HUB] Gagal nganter ke User %d: %v", msg.UserID, err)
				h.Unregister(msg.UserID)
			} else {
				log.Printf("[NOTIF-HUB] Surat sukses diantar ke User %d", msg.UserID)
			}
		} else {
			log.Printf("[NOTIF-HUB] User %d offline, surat disimpan di arsip DB.", msg.UserID)
		}
	}
}

func (h *NotificationHub) Register(userID uint, conn *websocket.Conn) {
	h.mu.Lock()
	h.Clients[userID] = conn
	h.mu.Unlock()
	log.Printf("[NOTIF-HUB] User %d terdaftar (Online)", userID)
}

func (h *NotificationHub) Unregister(userID uint) {
	h.mu.Lock()
	if conn, ok := h.Clients[userID]; ok {
		conn.Close()
		delete(h.Clients, userID)
	}
	h.mu.Unlock()
	log.Printf("[NOTIF-HUB] User %d dicoret (Offline)", userID)
}