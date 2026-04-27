"use client"

import { useState } from "react"
import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
} from "@livekit/components-react"
import "@livekit/components-styles"
import { Video, X } from "lucide-react"

interface VideoCallModalProps {
  roomName: string
}

export function VideoCallModal({ roomName }: VideoCallModalProps) {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [serverUrl, setServerUrl] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  async function startCall() {
    const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}`)
    const data = await res.json()
    if (!res.ok) { setUnavailable(true); return }
    setToken(data.token)
    setServerUrl(data.url)
    setOpen(true)
  }

  if (unavailable) return null

  return (
    <>
      <button
        onClick={startCall}
        title="Start video call"
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Video className="w-5 h-5" />
      </button>

      {open && token && serverUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[80vh] bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-white font-semibold text-sm">Video Call</span>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <LiveKitRoom
                serverUrl={serverUrl}
                token={token}
                connect={true}
                audio={true}
                video={true}
                onDisconnected={() => setOpen(false)}
                className="h-full"
              >
                <VideoConference />
                <ControlBar />
              </LiveKitRoom>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
