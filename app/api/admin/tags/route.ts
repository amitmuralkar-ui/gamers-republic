import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } })
  return user?.isAdmin ? session.user.id : null
}

export async function GET() {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const tags = await prisma.tag.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { users: true } } },
  })
  return NextResponse.json(tags)
}

export async function POST(req: Request) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { name, color } = await req.json()
  if (!name?.trim() || !color) return NextResponse.json({ error: "name and color required" }, { status: 400 })

  const tag = await prisma.tag.create({ data: { name: name.trim(), color } })
  return NextResponse.json(tag, { status: 201 })
}
