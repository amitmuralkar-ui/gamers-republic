import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"

const QUEST_REWARDS: Record<string, { type: string; name: string; style: string }> = {
  "click-frenzy": { type: "nameplate", name: "Gold Nameplate", style: "gold" },
  "memory-match": { type: "pfp-frame", name: "Star Frame", style: "star" },
  "snake-run": { type: "nameplate", name: "Flame Nameplate", style: "flame" },
  "word-blast": { type: "pfp-frame", name: "Lightning Frame", style: "lightning" },
}

interface Props { params: Promise<{ questId: string }> }

export async function POST(_req: NextRequest, { params }: Props) {
  const { questId } = await params
  const { userId } = await verifySession()

  const reward = QUEST_REWARDS[questId]
  if (!reward) return NextResponse.json({ error: "Unknown quest" }, { status: 404 })

  const existing = await prisma.questCompletion.findUnique({
    where: { userId_questId: { userId, questId } },
  })
  if (existing) return NextResponse.json({ error: "Already completed" }, { status: 409 })

  const [completion, decoration] = await prisma.$transaction([
    prisma.questCompletion.create({ data: { userId, questId } }),
    prisma.userDecoration.create({ data: { userId, ...reward } }),
  ])

  return NextResponse.json({
    completion: { ...completion, completedAt: completion.completedAt.toISOString() },
    decoration: { ...decoration, earnedAt: decoration.earnedAt.toISOString() },
  })
}
