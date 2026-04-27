"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, Users, User } from "lucide-react"
import { Input } from "@/components/ui/Input"

interface UserResult { id: string; username: string; displayName: string | null; avatarUrl: string | null }
interface GroupResult { id: string; name: string; isPublic: boolean; _count: { members: number } }

export default function SearchPage() {
  const [q, setQ] = useState("")
  const [users, setUsers] = useState<UserResult[]>([])
  const [groups, setGroups] = useState<GroupResult[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (q.length < 2) { setUsers([]); setGroups([]); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setUsers(data.users ?? [])
      setGroups(data.groups ?? [])
      setLoading(false)
    }, 300)
  }, [q])

  const noResults = q.length >= 2 && !loading && users.length === 0 && groups.length === 0

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Search</h1>
      <Input
        id="search"
        placeholder="Search players and groups..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {loading && <p className="text-slate-500 text-sm mt-4">Searching...</p>}
      {noResults && <p className="text-slate-500 text-sm mt-4">No results for "{q}"</p>}

      {users.length > 0 && (
        <div className="mt-6">
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Players</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <Link key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 hover:border-violet-500/40 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0">
                  {u.avatarUrl ? <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                      {u.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{u.displayName ?? u.username}</p>
                  <p className="text-slate-400 text-xs">@{u.username}</p>
                </div>
                <User className="w-4 h-4 text-slate-600 ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {groups.length > 0 && (
        <div className="mt-6">
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Groups</h2>
          <div className="space-y-2">
            {groups.map((g) => (
              <Link key={g.id} href={`/groups/${g.id}`} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 hover:border-violet-500/40 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{g.name}</p>
                  <p className="text-slate-400 text-xs">{g._count.members} members</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
