import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  inviteCode: z.string().min(4).max(10),
})

export async function POST(req: NextRequest) {
  const { userId } = await verifySession()
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid code" }, { status: 400 })

  const group = await prisma.group.findUnique({
    where: { inviteCode: parsed.data.inviteCode.toUpperCase() },
  })
  if (!group) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId } },
  })
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 })

  await prisma.groupMember.create({ data: { groupId: group.id, userId, role: "member" } })
  return NextResponse.json(group)
}
