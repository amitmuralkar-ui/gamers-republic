"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ArrowLeft, Upload, Play, X } from "lucide-react"
import Link from "next/link"

const MAX_DURATION = 300 // 5 minutes in seconds

export default function UploadClipPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setError("")

    const url = URL.createObjectURL(f)
    const video = document.createElement("video")
    video.src = url
    video.onloadedmetadata = () => {
      if (video.duration > MAX_DURATION) {
        setError(`Clip must be 5 minutes or less (yours is ${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, "0")})`)
        URL.revokeObjectURL(url)
        return
      }
      setDuration(video.duration)
      setFile(f)
      setPreview(url)
    }
  }

  async function upload() {
    if (!file || !title.trim()) return
    setError("")
    setLoading(true)
    setProgress(10)

    try {
      const form = new FormData()
      form.append("file", file)
      form.append("title", title.trim())

      setProgress(40)
      const res = await fetch("/api/clips", { method: "POST", body: form })
      setProgress(90)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")
      router.push("/clips")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed")
      setLoading(false)
      setProgress(0)
    }
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setDuration(null)
    setError("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const fmtDuration = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clips" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Upload Clip</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        {/* File picker */}
        {!file ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-violet-500 rounded-xl p-10 text-center cursor-pointer transition-colors group"
          >
            <Upload className="w-10 h-10 text-slate-500 group-hover:text-violet-400 mx-auto mb-3 transition-colors" />
            <p className="text-white font-medium">Click to select a clip</p>
            <p className="text-slate-500 text-sm mt-1">MP4, WebM · Max 5:00 minutes</p>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-slate-950">
            <video src={preview!} className="w-full aspect-video object-contain" controls />
            <button
              onClick={clear}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {duration && (
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                {fmtDuration(duration)}
              </span>
            )}
          </div>
        )}

        <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={onFileSelect} />

        <Input id="title" label="Title" placeholder="What's this clip about?" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />

        {loading && progress > 0 && (
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-violet-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button
          className="w-full"
          size="lg"
          onClick={upload}
          loading={loading}
          disabled={!file || !title.trim()}
        >
          <Play className="w-4 h-4 mr-2" />
          Upload Clip
        </Button>
      </div>
    </div>
  )
}
