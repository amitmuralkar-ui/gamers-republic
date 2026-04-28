import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { Users, Search } from "lucide-react"
import { DecorationAvatar } from "@/components/ui/DecorationAvatar"
import { TagBadge } from "@/components/ui/TagBadge"

interface SearchProps { searchParams: Promise<{ q?: string }> }

export default async function UsersPage({ searchParams }: SearchProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { q } = await searchParams

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q } },
            { displayName: { contains: q } },
          ],
        }
      : undefined,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      createdAt: true,
      tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
      decorations: { where: { active: true }, select: { type: true, name: true, style: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm">Browse everyone on Gamers Republic</p>
        </div>
      </div>

      <form method="GET" className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by username or display name…"
            className="w-full bg-slate-900 border border-slate-800 text-white pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </form>

      {users.length === 0 && (
        <p className="text-slate-400 text-sm">
          {q ? `No users found for "${q}"` : "No users yet."}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {users.map((user) => {
          const tags = user.tags.map((ut) => ut.tag)
          const nameplate = user.decorations.find((d) => d.type === "nameplate")
          const displayName = user.displayName ?? user.username
          const joinedDaysAgo = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000)

          return (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex items-start gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-colors"
            >
              <DecorationAvatar
                username={user.username}
                avatarUrl={user.avatarUrl}
                decorations={user.decorations}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-white font-semibold text-sm truncate">{displayName}</span>
                  {nameplate && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        color: nameplate.style === "gold" ? "#facc15" : "#fb923c",
                        backgroundColor: nameplate.style === "gold" ? "#facc1520" : "#fb923c20",
                        border: `1px solid ${nameplate.style === "gold" ? "#facc1540" : "#fb923c40"}`,
                      }}
                    >
                      {nameplate.style === "gold" ? "✦" : "🔥"} {nameplate.name}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs">@{user.username}</p>
                <p className="text-slate-600 text-xs mt-0.5">
                  Joined {joinedDaysAgo < 1 ? "today" : `${joinedDaysAgo}d ago`}
                </p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tags.map((t) => <TagBadge key={t.id} tag={t} small />)}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
