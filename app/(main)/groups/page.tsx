import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { Users, Plus, Lock, Globe, ChevronRight } from "lucide-react"

export default async function GroupsPage() {
  const { userId } = await verifySession()

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: { group: { include: { _count: { select: { members: true } } } } },
    orderBy: { joinedAt: "desc" },
  })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Groups</h1>
        <div className="flex gap-2">
          <Link
            href="/groups/join"
            className="text-sm font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            Join
          </Link>
          <Link
            href="/groups/new"
            className="text-sm font-medium bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create
          </Link>
        </div>
      </div>

      {memberships.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-1">No groups yet</p>
          <p className="text-sm">Create one or join with an invite code</p>
        </div>
      ) : (
        <div className="space-y-2">
          {memberships.map(({ group }) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-2xl transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/20 flex items-center justify-center shrink-0">
                {group.iconUrl ? (
                  <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Users className="w-5 h-5 text-orange-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold truncate">{group.name}</p>
                  {group.isPublic ? (
                    <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </div>
                <p className="text-slate-400 text-sm">{group._count.members} members</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
