import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { TagManager } from "@/components/admin/TagManager"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } })
  if (!user?.isAdmin) redirect("/home")

  const tags = await prisma.tag.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { users: true } } },
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-slate-400 text-sm mt-1">Create and assign colorful tags to users</p>
      </div>
      <TagManager initialTags={tags} />
    </div>
  )
}
