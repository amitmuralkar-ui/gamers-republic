import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const caller = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } })
  if (!caller?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""

  const users = await prisma.user.findMany({
    where: q ? { username: { contains: q } } : {},
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
    },
    take: 10,
    orderBy: { username: "asc" },
  })

  return NextResponse.json(users.map((u) => ({ ...u, tags: u.tags.map((ut) => ut.tag) })))
}
