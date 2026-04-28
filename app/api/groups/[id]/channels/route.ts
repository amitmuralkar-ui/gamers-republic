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

  const channels = await prisma.channel.findMany({
    where: { groupId: id },
    orderBy: { order: "asc" },
  })
  return NextResponse.json(channels)
}

const schema = z.object({
  name: z.string().min(1).max(40),
  type: z.enum(["text", "voice"]).default("text"),
})

export async function POST(req: NextRequest, { params }: Props) {
  const { id } = await params
  const { userId } = await verifySession()

  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (group.ownerId !== userId) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId } },
    })
    if (member?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const count = await prisma.channel.count({ where: { groupId: id } })
  const channel = await prisma.channel.create({
    data: { ...parsed.data, groupId: id, order: count },
  })
  return NextResponse.json(channel, { status: 201 })
}
