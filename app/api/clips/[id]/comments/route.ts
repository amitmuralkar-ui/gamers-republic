import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"
import { z } from "zod"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const comments = await prisma.clipComment.findMany({
    where: { clipId: id },
    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(comments)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession()
  const { id } = await params
  const body = await req.json()
  const parsed = z.object({ content: z.string().min(1).max(500) }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid content" }, { status: 400 })

  const comment = await prisma.clipComment.create({
    data: { clipId: id, userId, content: parsed.data.content },
    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
  })
  return NextResponse.json(comment, { status: 201 })
}
