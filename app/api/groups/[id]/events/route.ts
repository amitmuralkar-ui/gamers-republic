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

  const events = await prisma.event.findMany({
    where: { groupId: id },
    include: { creator: { select: { id: true, username: true, displayName: true } } },
    orderBy: { startAt: "asc" },
  })
  return NextResponse.json(events.map((e) => ({ ...e, startAt: e.startAt.toISOString(), createdAt: e.createdAt.toISOString() })))
}

const schema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(300).optional(),
  startAt: z.string().datetime(),
})

export async function POST(req: NextRequest, { params }: Props) {
  const { id } = await params
  const { userId } = await verifySession()

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  })
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const event = await prisma.event.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      startAt: new Date(parsed.data.startAt),
      groupId: id,
      creatorId: userId,
    },
    include: { creator: { select: { id: true, username: true, displayName: true } } },
  })
  return NextResponse.json({ ...event, startAt: event.startAt.toISOString(), createdAt: event.createdAt.toISOString() }, { status: 201 })
}
