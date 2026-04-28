import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  await verifySession()

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  const cursor = searchParams.get("cursor")

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q } },
            { displayName: { contains: q } },
          ],
        }
      : undefined,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      createdAt: true,
      tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
      decorations: { where: { active: true }, select: { type: true, name: true, style: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  return NextResponse.json(
    users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      tags: u.tags.map((ut) => ut.tag),
    }))
  )
}
