import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { uploadFile } from "@/lib/s3"

const MAX_SIZE = 500 * 1024 * 1024 // 500 MB
const ALLOWED = ["video/mp4", "video/webm", "video/quicktime"]

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const cursor = searchParams.get("cursor")

  const clips = await prisma.clip.findMany({
    take: 20,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      uploader: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
    },
  })

  return NextResponse.json({
    clips,
    nextCursor: clips.length === 20 ? clips[clips.length - 1].id : null,
  })
}

export async function POST(req: NextRequest) {
  const { userId } = await verifySession()

  const form = await req.formData()
  const file = form.get("file") as File | null
  const title = (form.get("title") as string | null)?.trim()

  if (!file || !title) return NextResponse.json({ error: "File and title required" }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 500 MB)" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split(".").pop() ?? "mp4"
  const filename = `${userId}-${Date.now()}.${ext}`

  let videoUrl: string

  if (process.env.R2_ENDPOINT) {
    videoUrl = await uploadFile(`clips/${filename}`, buffer, file.type)
  } else {
    const dir = path.join(process.cwd(), "public", "uploads", "clips")
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), buffer)
    videoUrl = `/uploads/clips/${filename}`
  }

  const clip = await prisma.clip.create({
    data: { title, videoUrl, uploaderId: userId },
  })

  return NextResponse.json(clip, { status: 201 })
}
