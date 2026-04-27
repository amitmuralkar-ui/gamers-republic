import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } })
  return user?.isAdmin ? session.user.id : null
}

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { userId } = await params
  const { tagId } = await req.json()
  if (!tagId) return NextResponse.json({ error: "tagId required" }, { status: 400 })

  await prisma.userTag.upsert({
    where: { userId_tagId: { userId, tagId } },
    create: { userId, tagId },
    update: {},
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { userId } = await params
  const { searchParams } = new URL(req.url)
  const tagId = searchParams.get("tagId")
  if (!tagId) return NextResponse.json({ error: "tagId required" }, { status: 400 })

  await prisma.userTag.delete({ where: { userId_tagId: { userId, tagId } } })
  return new NextResponse(null, { status: 204 })
}
