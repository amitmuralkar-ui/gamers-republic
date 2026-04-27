import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession()
  const { id } = await params

  const existing = await prisma.clipLike.findUnique({
    where: { clipId_userId: { clipId: id, userId } },
  })

  if (existing) {
    await prisma.clipLike.delete({ where: { clipId_userId: { clipId: id, userId } } })
    return NextResponse.json({ liked: false })
  }

  await prisma.clipLike.create({ data: { clipId: id, userId } })
  return NextResponse.json({ liked: true })
}
