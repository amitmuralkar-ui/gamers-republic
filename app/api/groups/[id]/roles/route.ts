import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"
import { z } from "zod"

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params
  const { userId } = await verifySession()

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  })
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 })

  const roles = await prisma.groupRole.findMany({
    where: { groupId: id },
    include: { _count: { select: { assignments: true } } },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(roles)
}

const schema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#94a3b8"),
})

export async function POST(req: NextRequest, { params }: Props) {
  const { id } = await params
  const { userId } = await verifySession()

  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (group.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const role = await prisma.groupRole.create({
    data: { ...parsed.data, groupId: id },
    include: { _count: { select: { assignments: true } } },
  })
  return NextResponse.json(role, { status: 201 })
}
