import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params
  const { userId } = await verifySession()

  const self = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  })
  if (!self) return NextResponse.json({ error: "Not a member" }, { status: 403 })

  const members = await prisma.groupMember.findMany({
    where: { groupId: id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
          decorations: { where: { active: true }, select: { id: true, type: true, name: true, style: true } },
          roleAssignments: {
            include: { role: { select: { id: true, name: true, color: true } } },
          },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  })

  return NextResponse.json(
    members.map((m) => ({
      ...m,
      joinedAt: m.joinedAt.toISOString(),
      user: {
        ...m.user,
        tags: m.user.tags.map((ut) => ut.tag),
        roles: m.user.roleAssignments
          .filter((ra) => ra.role)
          .map((ra) => ra.role),
      },
    }))
  )
}
