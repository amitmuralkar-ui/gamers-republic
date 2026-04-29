import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

interface Props { params: Promise<{ channelId: string }> }

const senderSelect = {
  id: true, username: true, displayName: true, avatarUrl: true,
  tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
}

function serialize(m: { createdAt: Date; sender: { tags: { tag: { id: string; name: string; color: string } }[] }; [k: string]: unknown }) {
  return { ...m, createdAt: (m.createdAt as Date).toISOString(), sender: { ...m.sender, tags: m.sender.tags.map((ut) => ut.tag) } }
}

export async function GET(req: NextRequest, { params }: Props) {
  const { channelId } = await params
  const { userId } = await verifySession()

  const channel = await prisma.channel.findUnique({ where: { id: channelId } })
  if (!channel) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: channel.groupId, userId } },
  })
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const since = req.nextUrl.searchParams.get("since")

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ channelId }, { groupId: channel.groupId, channelId: null }],
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    include: { sender: { select: senderSelect } },
    orderBy: { createdAt: "asc" },
    take: 50,
  })

  return NextResponse.json(messages.map(serialize))
}

export async function POST(req: NextRequest, { params }: Props) {
  const { channelId } = await params
  const { userId } = await verifySession()

  const channel = await prisma.channel.findUnique({ where: { id: channelId } })
  if (!channel) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: channel.groupId, userId } },
  })
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 })

  const message = await prisma.message.create({
    data: { content: content.trim(), senderId: userId, channelId },
    include: { sender: { select: senderSelect } },
  })

  return NextResponse.json(serialize(message as Parameters<typeof serialize>[0]), { status: 201 })
}
