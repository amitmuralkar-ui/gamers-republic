import { getCurrentUser } from "@/lib/dal"
import { prisma } from "@/lib/db"
import { MessageSquare, Users, Play, UserPlus } from "lucide-react"
import Link from "next/link"
import { LokiTitle } from "@/components/ui/LokiTitle"

export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) return null

  const [groupCount, clipCount] = await Promise.all([
    prisma.groupMember.count({ where: { userId: user.id } }),
    prisma.clip.count({ where: { uploaderId: user.id } }),
  ])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center py-12 mb-10">
        <LokiTitle />
        <p className="text-slate-400 mt-4 text-lg text-center">One platform for all your squads</p>
        <p className="text-slate-500 mt-2 text-sm text-center">
          Welcome back, <span className="text-orange-400 font-semibold">{user.displayName ?? user.username}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Link href="/groups" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-orange-500/50 hover:bg-slate-800/50 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm font-medium">Groups</span>
            <Users className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-white">{groupCount}</p>
        </Link>
        <Link href="/clips" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 hover:bg-slate-800/50 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm font-medium">Clips</span>
            <Play className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-white">{clipCount}</p>
        </Link>
        <Link href="/messages" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-orange-500/50 hover:bg-slate-800/50 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm font-medium">Messages</span>
            <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-white">—</p>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/groups/new" className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-orange-500/10 border border-slate-700 hover:border-orange-500/50 rounded-xl transition-colors group">
            <div className="w-9 h-9 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
              <Users className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Create a Group</p>
              <p className="text-slate-400 text-xs">Bring your squad together</p>
            </div>
          </Link>
          <Link href="/clips/upload" className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-colors group">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <Play className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Upload a Clip</p>
              <p className="text-slate-400 text-xs">Share your best moments</p>
            </div>
          </Link>
          <Link href="/groups/join" className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-orange-500/10 border border-slate-700 hover:border-orange-500/50 rounded-xl transition-colors group">
            <div className="w-9 h-9 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
              <UserPlus className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Join a Group</p>
              <p className="text-slate-400 text-xs">Enter an invite code</p>
            </div>
          </Link>
          <Link href="/messages" className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-colors group">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <MessageSquare className="w-4 h-4 text-blue-400" />
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
