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

function apiPath(roomType: "group" | "dm" | "channel", roomId: string) {
  if (roomType === "channel") return `/api/channels/${roomId}/messages`
  if (roomType === "dm") return `/api/dm/${roomId}/messages`
  return `/api/groups/${roomId}/messages`
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
  const lastTimeRef = useRef(
    initialMessages.length > 0
      ? initialMessages[initialMessages.length - 1].createdAt
      : new Date(0).toISOString()
  )
  const url = apiPath(roomType, roomId)

  // Poll every 1.5 s for new messages (works on Vercel and local)
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${url}?since=${encodeURIComponent(lastTimeRef.current)}`)
        if (!res.ok) return
        const fresh: ChatMessage[] = await res.json()
        if (fresh.length === 0) return
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id))
          const added = fresh.filter((m) => !ids.has(m.id))
          if (added.length === 0) return prev
          lastTimeRef.current = added[added.length - 1].createdAt
          return [...prev, ...added]
        })
      } catch {}
    }
    // fire once immediately on mount so there's no initial wait
    poll()
    const id = setInterval(poll, 1500)
    return () => clearInterval(id)
  }, [url])

  // Socket real-time push (bonus when running locally)
  useEffect(() => {
    if (!socket) return
    socket.emit("join-room", roomId)

    const onMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        lastTimeRef.current = msg.createdAt
        return [...prev, msg]
      })
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
    async (content: string, senderId: string) => {
      if (!content.trim()) return

      // Use socket when available (local dev — instant broadcast to others)
      if (socket?.connected) {
        socket.emit("send-message", { roomId, content, senderId, roomType })
        return
      }

      // HTTP fallback (Vercel / when socket isn't running)
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
        if (!res.ok) return
        const msg: ChatMessage = await res.json()
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          lastTimeRef.current = msg.createdAt
          return [...prev, msg]
        })
      } catch {}
    },
    [socket, roomId, roomType, url]
  )

  const emitTyping = useCallback(
    (username: string) => {
      if (!socket?.connected) return
      socket.emit("typing", { roomId, username })
    },
    [socket, roomId]
  )

  return { messages, typingUser, sendMessage, emitTyping }
}
