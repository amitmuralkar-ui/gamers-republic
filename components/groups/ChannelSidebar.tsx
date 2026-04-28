"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Hash, Volume2, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Channel {
  id: string
  name: string
  type: string
  order: number
}

interface Props {
  groupId: string
  channels: Channel[]
  selectedChannelId: string
  isOwner: boolean
}

export function ChannelSidebar({ groupId, channels: initial, selectedChannelId, isOwner }: Props) {
  const router = useRouter()
  const [channels, setChannels] = useState<Channel[]>(initial)
  const [creating, setCreating] = useState<"text" | "voice" | null>(null)
  const [newName, setNewName] = useState("")

  const textChannels = channels.filter((c) => c.type === "text")
  const voiceChannels = channels.filter((c) => c.type === "voice")

  async function createChannel(type: "text" | "voice") {
    if (!newName.trim()) return
    const res = await fetch(`/api/groups/${groupId}/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), type }),
    })
    if (res.ok) {
      const ch = await res.json()
      setChannels((prev) => [...prev, ch])
      if (type === "text") router.push(`/groups/${groupId}?channel=${ch.id}`)
    }
    setCreating(null)
    setNewName("")
  }

  async function deleteChannel(id: string) {
    await fetch(`/api/groups/${groupId}/channels/${id}`, { method: "DELETE" })
    setChannels((prev) => prev.filter((c) => c.id !== id))
    if (id === selectedChannelId && textChannels.length > 1) {
      const next = textChannels.find((c) => c.id !== id)
      if (next) router.push(`/groups/${groupId}?channel=${next.id}`)
    }
  }

  function selectChannel(ch: Channel) {
    if (ch.type === "text") {
      router.push(`/groups/${groupId}?channel=${ch.id}`)
    }
  }

  return (
    <aside className="w-52 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto">
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Text Channels</span>
          {isOwner && (
            <button onClick={() => setCreating("text")} className="text-slate-500 hover:text-white transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {creating === "text" && (
          <form
            onSubmit={(e) => { e.preventDefault(); createChannel("text") }}
            className="mb-2 flex gap-1"
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="channel-name"
              className="flex-1 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 min-w-0"
            />
            <button type="submit" className="text-orange-400 hover:text-orange-300 text-xs px-1">✓</button>
            <button type="button" onClick={() => { setCreating(null); setNewName("") }} className="text-slate-500 hover:text-white text-xs px-1">✕</button>
          </form>
        )}
        {textChannels.map((ch) => (
          <div
            key={ch.id}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer group transition-colors",
              ch.id === selectedChannelId
                ? "bg-orange-600/20 text-orange-400"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
            onClick={() => selectChannel(ch)}
          >
            <Hash className="w-3.5 h-3.5 shrink-0" />
            <span className="text-sm flex-1 truncate">{ch.name}</span>
            {isOwner && channels.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteChannel(ch.id) }}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="px-3 pt-2 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Voice Channels</span>
          {isOwner && (
            <button onClick={() => setCreating("voice")} className="text-slate-500 hover:text-white transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {creating === "voice" && (
          <form
            onSubmit={(e) => { e.preventDefault(); createChannel("voice") }}
            className="mb-2 flex gap-1"
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="voice-name"
              className="flex-1 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 min-w-0"
            />
            <button type="submit" className="text-orange-400 hover:text-orange-300 text-xs px-1">✓</button>
            <button type="button" onClick={() => { setCreating(null); setNewName("") }} className="text-slate-500 hover:text-white text-xs px-1">✕</button>
          </form>
        )}
        {voiceChannels.map((ch) => (
          <div key={ch.id} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors group">
            <Volume2 className="w-3.5 h-3.5 shrink-0" />
            <span className="text-sm flex-1 truncate">{ch.name}</span>
            {isOwner && (
              <button
                onClick={() => deleteChannel(ch.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
