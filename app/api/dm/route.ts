import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"
import { z } from "zod"

export async function GET() {
  const { userId } = await verifySession()
  const rooms = await prisma.directRoom.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { username: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(rooms)
}

const schema = z.object({ targetUserId: z.string() })

export async function POST(req: NextRequest) {
  const { userId } = await verifySession()
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const { targetUserId } = parsed.data
  if (targetUserId === userId) return NextResponse.json({ error: "Can't DM yourself" }, { status: 400 })

  const [u1, u2] = [userId, targetUserId].sort()
  const room = await prisma.directRoom.upsert({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    create: { user1Id: u1, user2Id: u2 },
    update: {},
  })
  return NextResponse.json(room)
}
