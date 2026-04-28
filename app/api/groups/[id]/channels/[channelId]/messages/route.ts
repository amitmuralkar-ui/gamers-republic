import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

interface Props { params: Promise<{ id: string; channelId: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { id, channelId } = await params
  const { userId } = await verifySession()

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  })
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 })

  const messages = await prisma.message.findMany({
    where: { channelId },
    include: {
      sender: {
        select: {
          id: true, username: true, displayName: true, avatarUrl: true,
          tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  })

  return NextResponse.json(
    messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      sender: { ...m.sender, tags: m.sender.tags.map((ut) => ut.tag) },
    }))
  )
}
