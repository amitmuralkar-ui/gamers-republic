import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const verifySession = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  return { userId: session.user.id }
})

export const getCurrentUser = cache(async () => {
  const { userId } = await verifySession()
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      phone: true,
      email: true,
      discordTag: true,
      createdAt: true,
    },
  })
})
