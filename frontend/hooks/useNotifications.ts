import { useState, useEffect, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import api from "@/libs/api";
import { Notification } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, fetchNotifications]);

  const socketUrl =
    isAuthenticated && user
      ? (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8910/api/v1")
          .replace(/^http/, "ws") + `/ws/notifications?user_id=${user.id}`
      : null;

  const { lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const newNotification = JSON.parse(lastMessage.data) as Notification;
        setNotifications((prev) => [newNotification, ...prev]);
        
      } catch (e) {
        console.error("Gagal parse notifikasi WS:", e);
      }
    }
  }, [lastMessage]);

  const markAsRead = async (notifId: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );

    try {
      await api.put(`/notifications/${notifId}/read`);
    } catch (error) {
      console.error("Gagal update status notifikasi:", error);
       setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: false } : n))
      );
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    fetchNotifications,
    isConnected: readyState === ReadyState.OPEN,
  };
};