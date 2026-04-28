import { NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

export async function GET() {
  const { userId } = await verifySession()

  const [completions, decorations] = await Promise.all([
    prisma.questCompletion.findMany({
      where: { userId },
      select: { questId: true, completedAt: true },
    }),
    prisma.userDecoration.findMany({
      where: { userId },
      select: { id: true, type: true, name: true, style: true, active: true, earnedAt: true },
    }),
  ])

  return NextResponse.json({
    completions: completions.map((c) => ({ ...c, completedAt: c.completedAt.toISOString() })),
    decorations: decorations.map((d) => ({ ...d, earnedAt: d.earnedAt.toISOString() })),
  })
}
