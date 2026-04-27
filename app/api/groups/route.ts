import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"
import { generateInviteCode } from "@/lib/utils"
import { z } from "zod"

export async function GET() {
  const { userId } = await verifySession()
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: { _count: { select: { members: true } } },
      },
    },
    orderBy: { joinedAt: "desc" },
  })
  return NextResponse.json(memberships.map((m) => m.group))
}

const createSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  isPublic: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  const { userId } = await verifySession()
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const { name, description, isPublic } = parsed.data

  const group = await prisma.group.create({
    data: {
      name,
      description,
      isPublic,
      inviteCode: isPublic ? null : generateInviteCode(),
      ownerId: userId,
      members: { create: { userId, role: "owner" } },
    },
  })

  return NextResponse.json(group, { status: 201 })
}
