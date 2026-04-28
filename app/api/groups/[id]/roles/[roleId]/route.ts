import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

interface Props { params: Promise<{ id: string; roleId: string }> }

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { id, roleId } = await params
  const { userId } = await verifySession()

  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (group.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.groupRole.delete({ where: { id: roleId } })
  return NextResponse.json({ ok: true })
}
