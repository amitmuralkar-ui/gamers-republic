"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Play } from "lucide-react"

interface Clip {
  id: string
  title: string
  videoUrl: string
  thumbnailUrl?: string | null
  uploader: { id: string; username: string; displayName: string | null; avatarUrl: string | null }
  _count: { likes: number; comments: number }
  createdAt: string
}

interface ClipCardProps {
  clip: Clip
  currentUserId?: string
}

export function ClipCard({ clip, currentUserId }: ClipCardProps) {
  const [playing, setPlaying] = useState(false)
  const [likes, setLikes] = useState(clip._count.likes)
  const [liked, setLiked] = useState(false)

  async function toggleLike() {
    const res = await fetch(`/api/clips/${clip.id}/like`, { method: "POST" })
    const data = await res.json()
    setLiked(data.liked)
    setLikes((l) => (data.liked ? l + 1 : l - 1))
  }

  const name = clip.uploader.displayName ?? clip.uploader.username
  const timeAgo = new Date(clip.createdAt).toLocaleDateString()

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
      {/* Video */}
      <div
        className="relative aspect-video bg-slate-950 cursor-pointer group"
        onClick={() => setPlaying(true)}
      >
        {playing ? (
          <video
            src={clip.videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        ) : (
          <>
            {clip.thumbnailUrl ? (
              <img src={clip.thumbnailUrl} alt={clip.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-12 h-12 text-slate-600" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 rounded-full bg-violet-600/90 flex items-center justify-center">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-3 line-clamp-1">{clip.title}</h3>
        <div className="flex items-center justify-between">
          <Link
            href={`/profile/${clip.uploader.id}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-full bg-slate-700 overflow-hidden shrink-0">
              {clip.uploader.avatarUrl ? (
                <img src={clip.uploader.avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-slate-400 text-xs">{name}</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-red-400" : "text-slate-400 hover:text-red-400"}`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              {likes}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MessageCircle className="w-4 h-4" />
              {clip._count.comments}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-2">{timeAgo}</p>
      </div>
    </div>
  )
}
