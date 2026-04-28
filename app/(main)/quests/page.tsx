import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { QuestsClient } from "./QuestsClient"

export default async function QuestsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [completions, decorations] = await Promise.all([
    prisma.questCompletion.findMany({
      where: { userId: session.user.id },
      select: { questId: true },
    }),
    prisma.userDecoration.findMany({
      where: { userId: session.user.id, active: true },
      select: { type: true, name: true, style: true },
    }),
  ])

  return (
    <QuestsClient
      completedQuestIds={completions.map((c) => c.questId)}
      decorations={decorations}
    />
  )
}
