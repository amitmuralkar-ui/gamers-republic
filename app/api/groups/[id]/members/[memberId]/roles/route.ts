import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

interface Props { params: Promise<{ id: string; memberId: string }> }

export async function POST(req: NextRequest, { params }: Props) {
  const { id, memberId } = await params
  const { userId } = await verifySession()

  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (group.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { roleId } = await req.json()
  if (!roleId) return NextResponse.json({ error: "roleId required" }, { status: 400 })

  await prisma.groupRoleAssignment.upsert({
    where: { userId_roleId: { userId: memberId, roleId } },
    create: { userId: memberId, roleId },
    update: {},
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const { id, memberId } = await params
  const { userId } = await verifySession()

  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (group.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const roleId = searchParams.get("roleId")
  if (!roleId) return NextResponse.json({ error: "roleId required" }, { status: 400 })

  await prisma.groupRoleAssignment.delete({
    where: { userId_roleId: { userId: memberId, roleId } },
  })
  return NextResponse.json({ ok: true })
}
