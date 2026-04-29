import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

interface Props { params: Promise<{ id: string }> }

const senderSelect = {
  id: true, username: true, displayName: true, avatarUrl: true,
  tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
}

function serialize(m: { createdAt: Date; sender: { tags: { tag: { id: string; name: string; color: string } }[] }; [k: string]: unknown }) {
  return { ...m, createdAt: (m.createdAt as Date).toISOString(), sender: { ...m.sender, tags: m.sender.tags.map((ut) => ut.tag) } }
}

export async function GET(req: NextRequest, { params }: Props) {
  const { userId } = await verifySession()
  const { id } = await params

  const room = await prisma.directRoom.findUnique({ where: { id } })
  if (!room || (room.user1Id !== userId && room.user2Id !== userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const since = req.nextUrl.searchParams.get("since")

  const messages = await prisma.message.findMany({
    where: {
      directRoomId: id,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    include: { sender: { select: senderSelect } },
    orderBy: { createdAt: "asc" },
    take: 50,
  })

  return NextResponse.json(messages.map(serialize))
}

export async function POST(req: NextRequest, { params }: Props) {
  const { userId } = await verifySession()
  const { id } = await params

  const room = await prisma.directRoom.findUnique({ where: { id } })
  if (!room || (room.user1Id !== userId && room.user2Id !== userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 })

  const message = await prisma.message.create({
    data: { content: content.trim(), senderId: userId, directRoomId: id },
    include: { sender: { select: senderSelect } },
  })

  return NextResponse.json(serialize(message as Parameters<typeof serialize>[0]), { status: 201 })
}
