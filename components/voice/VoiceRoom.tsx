"use client"

import { useState, useEffect } from "react"
import {
  LiveKitRoom,
  AudioConference,
  RoomAudioRenderer,
  ControlBar,
} from "@livekit/components-react"
import "@livekit/components-styles"
import { Mic, X } from "lucide-react"

interface VoiceRoomProps {
  roomName: string
  displayName: string
}

export function VoiceRoom({ roomName, displayName }: VoiceRoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [serverUrl, setServerUrl] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  async function join() {
    const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}`)
    const data = await res.json()
    if (!res.ok) { setUnavailable(true); return }
    setToken(data.token)
    setServerUrl(data.url)
    setJoined(true)
  }

  if (unavailable) {
    return (
      <p className="text-xs text-slate-500 px-4 py-2">
        Voice not configured. Add LiveKit keys to .env.local to enable.
      </p>
    )
  }

  if (!joined) {
    return (
      <button
        onClick={join}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-xl transition-colors"
      >
        <Mic className="w-4 h-4" /> Join Voice
      </button>
    )
  }

  return (
    <div className="w-full">
      <LiveKitRoom
        serverUrl={serverUrl!}
        token={token!}
        connect={true}
        audio={true}
        video={false}
        onDisconnected={() => setJoined(false)}
        className="bg-slate-900"
      >
        <RoomAudioRenderer />
        <AudioConference />
        <div className="flex items-center justify-between px-4 py-2">
          <ControlBar variation="minimal" />
          <button
            onClick={() => setJoined(false)}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Leave
          </button>
        </div>
      </LiveKitRoom>
    </div>
  )
}
