import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  await verifySession()
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 2) return NextResponse.json({ users: [], groups: [] })

  const [users, groups] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q } },
          { displayName: { contains: q } },
        ],
      },
      select: { id: true, username: true, displayName: true, avatarUrl: true },
      take: 10,
    }),
    prisma.group.findMany({
      where: { isPublic: true, name: { contains: q } },
      include: { _count: { select: { members: true } } },
      take: 10,
    }),
  ])

  return NextResponse.json({ users, groups })
}
