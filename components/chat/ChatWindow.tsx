"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useChat, type ChatMessage } from "@/hooks/useChat"
import { MessageInput } from "./MessageInput"
import { TagBadge } from "@/components/ui/TagBadge"

interface ChatWindowProps {
  roomId: string
  roomType: "group" | "dm"
  initialMessages: ChatMessage[]
}

function Avatar({ user }: { user: ChatMessage["sender"] }) {
  return (
    <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0">
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
          {user.username.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}

function MessageBubble({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const name = msg.sender.displayName ?? msg.sender.username

  return (
    <div className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : ""}`}>
      {!isOwn && <Avatar user={msg.sender} />}
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {!isOwn && (
          <div className="flex items-center gap-1.5 flex-wrap px-1">
            <span className="text-xs text-slate-400">{name}</span>
            {msg.sender.tags?.map((tag) => <TagBadge key={tag.id} tag={tag} small />)}
          </div>
        )}
        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? "bg-orange-600 text-white rounded-tr-sm"
              : "bg-slate-800 text-slate-100 rounded-tl-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-xs text-slate-600 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {time}
        </span>
      </div>
    </div>
  )
}

export function ChatWindow({ roomId, roomType, initialMessages }: ChatWindowProps) {
  const { data: session } = useSession()
  const { messages, typingUser, sendMessage, emitTyping } = useChat(roomId, initialMessages, roomType)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSend(content: string) {
    if (!session?.user?.id) return
    sendMessage(content, session.user.id)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            <p className="text-lg mb-1">No messages yet</p>
            <p className="text-sm">Be the first to say something!</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.sender.id === session?.user?.id}
          />
        ))}
        {typingUser && (
          <p className="text-xs text-slate-500 italic px-1">{typingUser} is typing...</p>
        )}
        <div ref={bottomRef} />
      </div>
      <MessageInput
        onSend={handleSend}
        onTyping={() => {
          if (session?.user?.name) emitTyping(session.user.name)
        }}
      />
    </div>
  )
}
