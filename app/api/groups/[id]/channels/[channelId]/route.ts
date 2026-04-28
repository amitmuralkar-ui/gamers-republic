import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

interface Props { params: Promise<{ id: string; channelId: string }> }

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { id, channelId } = await params
  const { userId } = await verifySession()

  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (group.ownerId !== userId) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId } },
    })
    if (member?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.channel.delete({ where: { id: channelId } })
  return NextResponse.json({ ok: true })
}
