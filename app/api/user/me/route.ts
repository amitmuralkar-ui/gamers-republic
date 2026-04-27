import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"
import { z } from "zod"

export async function GET() {
  const { userId } = await verifySession()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, username: true, displayName: true, bio: true,
      avatarUrl: true, discordTag: true, phone: true, email: true,
    },
  })
  return NextResponse.json(user)
}

const patchSchema = z.object({
  displayName: z.string().max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, { error: "Letters, numbers, underscores only" }).optional(),
  bio: z.string().max(200).optional(),
})

export async function PATCH(req: NextRequest) {
  const { userId } = await verifySession()
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input"
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  if (parsed.data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: parsed.data.username, NOT: { id: userId } },
    })
    if (existing) return NextResponse.json({ error: "Username already taken" }, { status: 409 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: { username: true, displayName: true, bio: true },
  })
  return NextResponse.json(user)
}
