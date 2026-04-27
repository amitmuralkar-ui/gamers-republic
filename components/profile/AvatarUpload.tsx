"use client"

import { useRef, useState, useCallback } from "react"
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Camera, X, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  username: string
  onUploadComplete: (url: string) => void
}

function getCroppedBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  canvas.width = crop.width
  canvas.height = crop.height
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0, crop.width, crop.height
  )
  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.92))
}

export function AvatarUpload({ currentAvatarUrl, username, onUploadComplete }: AvatarUploadProps) {
  const [imgSrc, setImgSrc] = useState("")
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [uploading, setUploading] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImgSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    const c = centerCrop(makeAspectCrop({ unit: "%", width: 90 }, 1, width, height), width, height)
    setCrop(c)
  }

  const handleUpload = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return
    setUploading(true)
    try {
      const blob = await getCroppedBlob(imgRef.current, completedCrop)
      const form = new FormData()
      form.append("file", blob, "avatar.jpg")
      const res = await fetch("/api/upload/avatar", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUploadComplete(data.url)
      setImgSrc("")
    } finally {
      setUploading(false)
    }
  }, [completedCrop, onUploadComplete])

  return (
    <div className="flex flex-col items-center gap-4">
      {imgSrc ? (
        <div className="flex flex-col items-center gap-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
            className="max-w-xs rounded-xl overflow-hidden"
          >
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-w-xs"
            />
          </ReactCrop>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setImgSrc("")}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleUpload} loading={uploading}>
              <Check className="w-4 h-4 mr-1" /> Save Avatar
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden">
            {currentAvatarUrl ? (
              <img src={currentAvatarUrl} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-bold">
                {username.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileSelect}
      />
      {!imgSrc && (
        <button
          onClick={() => inputRef.current?.click()}
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          Change avatar
        </button>
      )}
    </div>
  )
}
