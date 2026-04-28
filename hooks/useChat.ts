"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSocket } from "./useSocket"

export interface ChatMessage {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    tags: { id: string; name: string; color: string }[]
  }
}

export function useChat(
  roomId: string,
  initialMessages: ChatMessage[],
  roomType: "group" | "dm" | "channel"
) {
  const socket = useSocket()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!socket) return
    socket.emit("join-room", roomId)

    const onMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
    }
    const onTyping = (username: string) => {
      setTypingUser(username)
      if (typingTimer.current) clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => setTypingUser(null), 2000)
    }

    socket.on("new-message", onMessage)
    socket.on("user-typing", onTyping)

    return () => {
      socket.emit("leave-room", roomId)
      socket.off("new-message", onMessage)
      socket.off("user-typing", onTyping)
    }
  }, [socket, roomId])

  const sendMessage = useCallback(
    (content: string, senderId: string) => {
      if (!socket || !content.trim()) return
      socket.emit("send-message", { roomId, content, senderId, roomType })
    },
    [socket, roomId, roomType]
  )

  const emitTyping = useCallback(
    (username: string) => {
      if (!socket) return
      socket.emit("typing", { roomId, username })
    },
    [socket, roomId]
  )

  return { messages, typingUser, sendMessage, emitTyping }
}
