import { getCurrentUser } from "@/lib/dal"
import { prisma } from "@/lib/db"
import { MessageSquare, Users, Play, UserPlus } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) return null

  const [groupCount, clipCount] = await Promise.all([
    prisma.groupMember.count({ where: { userId: user.id } }),
    prisma.clip.count({ where: { uploaderId: user.id } }),
  ])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user.displayName ?? user.username} 👋
        </h1>
        <p className="text-slate-400 mt-1">What are you playing today?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Groups", value: groupCount, icon: Users, href: "/groups" },
          { label: "Clips", value: clipCount, icon: Play, href: "/clips" },
          { label: "Messages", value: "—", icon: MessageSquare, href: "/messages" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-violet-500/50 hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm font-medium">{label}</span>
              <Icon className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/groups/new"
            className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-violet-600/20 border border-slate-700 hover:border-violet-500/50 rounded-xl transition-colors group"
          >
            <div className="w-9 h-9 bg-violet-600/20 rounded-lg flex items-center justify-center group-hover:bg-violet-600/40 transition-colors">
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Create a Group</p>
              <p className="text-slate-400 text-xs">Bring your squad together</p>
            </div>
          </Link>

          <Link
            href="/clips/upload"
            className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-violet-600/20 border border-slate-700 hover:border-violet-500/50 rounded-xl transition-colors group"
          >
            <div className="w-9 h-9 bg-violet-600/20 rounded-lg flex items-center justify-center group-hover:bg-violet-600/40 transition-colors">
              <Play className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Upload a Clip</p>
              <p className="text-slate-400 text-xs">Share your best moments</p>
            </div>
          </Link>

          <Link
            href="/groups/join"
            className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-violet-600/20 border border-slate-700 hover:border-violet-500/50 rounded-xl transition-colors group"
          >
            <div className="w-9 h-9 bg-violet-600/20 rounded-lg flex items-center justify-center group-hover:bg-violet-600/40 transition-colors">
              <UserPlus className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Join a Group</p>
              <p className="text-slate-400 text-xs">Enter an invite code</p>
            </div>
          </Link>

          <Link
            href="/messages"
            className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-violet-600/20 border border-slate-700 hover:border-violet-500/50 rounded-xl transition-colors group"
          >
            <div className="w-9 h-9 bg-violet-600/20 rounded-lg flex items-center justify-center group-hover:bg-violet-600/40 transition-colors">
              <MessageSquare className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Start a DM</p>
              <p className="text-slate-400 text-xs">Message a friend directly</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
