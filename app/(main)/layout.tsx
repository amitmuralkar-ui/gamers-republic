import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Sidebar } from "@/components/layout/Sidebar"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, avatarUrl: true, isAdmin: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="flex min-h-screen">
      <Sidebar userId={user.id} avatarUrl={user.avatarUrl} username={user.username} isAdmin={user.isAdmin} />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
    </div>
  )
}
