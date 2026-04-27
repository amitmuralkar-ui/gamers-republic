import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"
import { generateLiveKitToken } from "@/lib/livekit"

export async function GET(req: NextRequest) {
  if (!process.env.LIVEKIT_API_KEY) {
    return NextResponse.json({ error: "Voice/video not configured" }, { status: 503 })
  }

  const { userId } = await verifySession()
  const { searchParams } = req.nextUrl
  const room = searchParams.get("room")

  if (!room) return NextResponse.json({ error: "room required" }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, displayName: true },
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const token = await generateLiveKitToken(
    room,
    userId,
    user.displayName ?? user.username
  )

  return NextResponse.json({ token, url: process.env.NEXT_PUBLIC_LIVEKIT_URL })
}
