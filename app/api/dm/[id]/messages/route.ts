import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession()
  const { id } = await params

  const room = await prisma.directRoom.findUnique({ where: { id } })
  if (!room || (room.user1Id !== userId && room.user2Id !== userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const messages = await prisma.message.findMany({
    where: { directRoomId: id },
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  })

  return NextResponse.json(messages)
}
