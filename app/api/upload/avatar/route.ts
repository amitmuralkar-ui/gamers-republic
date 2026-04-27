import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { uploadFile, deleteFile } from "@/lib/s3"
import { prisma } from "@/lib/db"

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(req: NextRequest) {
  const { userId } = await verifySession()

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.type.split("/")[1]
  const key = `avatars/${userId}-${Date.now()}.${ext}`

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  })

  const url = await uploadFile(key, buffer, file.type)

  await prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } })

  if (user?.avatarUrl) {
    const oldKey = user.avatarUrl.split("/").slice(-1)[0]
    deleteFile(`avatars/${oldKey}`).catch(() => {})
  }

  return NextResponse.json({ url })
}
