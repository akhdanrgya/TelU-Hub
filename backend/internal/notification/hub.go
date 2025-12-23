package notification

import (
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

type NotificationHub struct {
	Clients map[uint]map[*websocket.Conn]bool 

	mu sync.RWMutex

	Send chan BroadcastMessage
}

type BroadcastMessage struct {
	UserID  uint
	Payload interface{}
}

func NewNotificationHub() *NotificationHub {
	return &NotificationHub{
		Clients: make(map[uint]map[*websocket.Conn]bool),
		Send:    make(chan BroadcastMessage),
	}
}

func (h *NotificationHub) Run() {
	log.Println("[NOTIF-HUB] Kantor Pos Global siap beroperasi (Multi-Device Support)...")
	for {
		msg := <-h.Send

		h.mu.RLock()

		conns, ok := h.Clients[msg.UserID]
		h.mu.RUnlock()

		if ok && len(conns) > 0 {
			log.Printf("[NOTIF-HUB] Mengirim pesan ke %d device milik User %d", len(conns), msg.UserID)
			
			for conn := range conns {
				go func(c *websocket.Conn) {
					if err := c.WriteJSON(msg.Payload); err != nil {
						log.Printf("[NOTIF-HUB] Gagal kirim ke salah satu device User %d: %v", msg.UserID, err)
						c.Close() 
					}
				}(conn)
			}
		} else {
		}
	}
}

func (h *NotificationHub) Register(userID uint, conn *websocket.Conn) {
	h.mu.Lock()
	if _, ok := h.Clients[userID]; !ok {
		h.Clients[userID] = make(map[*websocket.Conn]bool)
	}
	h.Clients[userID][conn] = true
	h.mu.Unlock()
	
	log.Printf("[NOTIF-HUB] User %d nambah koneksi baru (Online)", userID)
}

func (h *NotificationHub) Unregister(userID uint, conn *websocket.Conn) {
	h.mu.Lock()
	if userConns, ok := h.Clients[userID]; ok {
		if _, exists := userConns[conn]; exists {
			delete(userConns, conn)
			conn.Close()
		}
		
		if len(userConns) == 0 {
			delete(h.Clients, userID)
			log.Printf("[NOTIF-HUB] User %d beneran offline (Semua tab ditutup)", userID)
		} else {
			log.Printf("[NOTIF-HUB] User %d tutup satu tab, tapi masih online di device lain", userID)
		}
	}
	h.mu.Unlock()
}