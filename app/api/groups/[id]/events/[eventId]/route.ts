import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

interface Props { params: Promise<{ id: string; eventId: string }> }

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { id, eventId } = await params
  const { userId } = await verifySession()

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event || event.groupId !== id) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const group = await prisma.group.findUnique({ where: { id } })
  if (event.creatorId !== userId && group?.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.event.delete({ where: { id: eventId } })
  return NextResponse.json({ ok: true })
}
