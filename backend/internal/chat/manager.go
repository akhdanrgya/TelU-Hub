package chat

import (
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

type ChatManager struct {
	Hubs map[string]*Hub
	
	mu sync.Mutex
}

func NewChatManager() *ChatManager {
	return &ChatManager{
		Hubs: make(map[string]*Hub),
	}
}

func (m *ChatManager) GetOrCreateHub(roomID string) *Hub {
	m.mu.Lock() 
	defer m.mu.Unlock() 

	hub, ok := m.Hubs[roomID]
	if !ok {
		log.Printf("[WS-MANAGER] Bikin Kamar Pesta baru: %s", roomID)
		hub = NewHub()
		m.Hubs[roomID] = hub
		
		go hub.Run() 
	}
	
	return hub
}

func (m *ChatManager) HandleConnection(c *websocket.Conn) {
	roomID := c.Params("roomId")
	if roomID == "" {
		log.Println("[WS-MANAGER] Gagal join: RoomID kosong")
		c.Close()
		return
	}
	
	hub := m.GetOrCreateHub(roomID)
	
	client := &Client{
		Hub:  hub,
		Conn: c,
		Send: make(chan []byte, 256),
	}
	
	client.Hub.Register <- client
	
	go client.WritePump()
	go client.ReadPump()
}