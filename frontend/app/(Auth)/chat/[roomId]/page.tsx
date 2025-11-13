"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation"; 
import { useAuth } from "@/contexts/AuthContext"; 
import { Avatar } from "@heroui/avatar";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import useWebSocket, { ReadyState } from "react-use-websocket"; 
import { FiSend } from "react-icons/fi";
import clsx from "clsx";

interface ChatMessage {
  id: string; 
  sender: string; 
  avatar?: string; 
  content: string;
}

const ChatPage = () => {
  const params = useParams();
  const roomId = params.roomId as string; 
  const { user, loading: authLoading } = useAuth(); 

  const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([]); 
  const [messageInput, setMessageInput] = useState(""); 

  const socketUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8910/api/v1")
    .replace(/^http/, "ws") + `/ws/chat/${roomId}`;

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
  });

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        // 'lastMessage.data' itu string JSON, kita 'parse'
        const incomingMessage = JSON.parse(lastMessage.data) as ChatMessage;
        
        setMessageHistory((prev) => [...prev, incomingMessage]);
      } catch (e) {
        console.error("Gagal parse pesan WS:", e);
      }
    }
  }, [lastMessage, setMessageHistory]);

  const handleSend = () => {
    if (messageInput.trim() === "" || !user) return; 

    const chatMessage: ChatMessage = {
      id: new Date().toISOString(), 
      sender: user.username,
      avatar: user.profile_image_url,
      content: messageInput,
    };

    sendMessage(JSON.stringify(chatMessage));
    
    setMessageInput("");
  };


  const connectionStatus = {
    [ReadyState.CONNECTING]: "Nyambungin...",
    [ReadyState.OPEN]: "Tersambung (Online)",
    [ReadyState.CLOSING]: "Mutusin...",
    [ReadyState.CLOSED]: "Koneksi Putus (Offline)",
    [ReadyState.UNINSTANTIATED]: "Gak Nyambung",
  }[readyState];

  if (authLoading) {
    return <div className="text-center p-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] py-4"> 
      
      <div className="flex-shrink-0 p-4 border-b">
        <h1 className="text-2xl font-bold">Chat Room: {roomId}</h1>
        <p className="text-sm text-default-500">
          Status: <span className={readyState === ReadyState.OPEN ? "text-success" : "text-warning"}>
            {connectionStatus}
          </span>
        </p>
      </div>

      <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-content1 rounded-lg my-4">
        {messageHistory.map((msg) => (
          <div 
            key={msg.id} 
            className={clsx(
              "flex items-start gap-3",
              msg.sender === user?.username ? "justify-end" : "justify-start"
            )}
          >
            {msg.sender !== user?.username && (
              <Avatar 
                src={msg.avatar}
                name={msg.sender.charAt(0).toUpperCase()} 
                size="md"
              />
            )}
            
            <div 
              className={clsx(
                "max-w-xs md:max-w-md p-3 rounded-xl",
                msg.sender === user?.username 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-content2" 
              )}
            >
              {msg.sender !== user?.username && (
                <p className="text-xs font-bold text-primary mb-1">{msg.sender}</p>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-shrink-0 flex items-center gap-2 p-4 border-t">
        <Input
          fullWidth
          placeholder="Ketik pesan lo di sini, King..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button 
          isIconOnly 
          color="primary" 
          onPress={handleSend}
          disabled={readyState !== ReadyState.OPEN} 
        >
          <FiSend size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;