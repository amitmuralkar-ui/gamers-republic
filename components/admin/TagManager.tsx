"use client"

import { useState } from "react"
import { Plus, Trash2, UserPlus, X } from "lucide-react"
import { TagBadge } from "@/components/ui/TagBadge"

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f43f5e",
]

interface Tag {
  id: string
  name: string
  color: string
  _count: { users: number }
}

interface UserResult {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  tags: { id: string; name: string; color: string }[]
}

export function TagManager({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(PRESET_COLORS[5])
  const [creating, setCreating] = useState(false)

  const [userQuery, setUserQuery] = useState("")
  const [userResults, setUserResults] = useState<UserResult[]>([])
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null)
  const [searching, setSearching] = useState(false)

  async function createTag(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), color: newColor }),
    })
    if (res.ok) {
      const tag = await res.json()
      setTags((prev) => [...prev, { ...tag, _count: { users: 0 } }])
      setNewName("")
    }
    setCreating(false)
  }

  async function deleteTag(id: string) {
    await fetch(`/api/admin/tags/${id}`, { method: "DELETE" })
    setTags((prev) => prev.filter((t) => t.id !== id))
    if (selectedUser) {
      setSelectedUser((u) => u ? { ...u, tags: u.tags.filter((t) => t.id !== id) } : null)
    }
  }

  async function searchUsers(q: string) {
    setUserQuery(q)
    if (!q.trim()) { setUserResults([]); return }
    setSearching(true)
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`)
    if (res.ok) setUserResults(await res.json())
    setSearching(false)
  }

  async function assignTag(tagId: string) {
    if (!selectedUser) return
    const res = await fetch(`/api/admin/users/${selectedUser.id}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    })
    if (res.ok) {
      const tag = tags.find((t) => t.id === tagId)!
      setSelectedUser((u) => u ? { ...u, tags: [...u.tags, tag] } : null)
      setTags((prev) => prev.map((t) => t.id === tagId ? { ...t, _count: { users: t._count.users + 1 } } : t))
    }
  }

  async function removeTag(tagId: string) {
    if (!selectedUser) return
    await fetch(`/api/admin/users/${selectedUser.id}/tags?tagId=${tagId}`, { method: "DELETE" })
    setSelectedUser((u) => u ? { ...u, tags: u.tags.filter((t) => t.id !== tagId) } : null)
    setTags((prev) => prev.map((t) => t.id === tagId ? { ...t, _count: { users: Math.max(0, t._count.users - 1) } } : t))
  }

  const assignableTagIds = new Set(selectedUser?.tags.map((t) => t.id) ?? [])

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: manage tags */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Tags</h2>

          <form onSubmit={createTag} className="space-y-3 mb-5">
            <input
              type="text"
              placeholder="Tag name (e.g. Admin, MVP, Streamer)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2.5 rounded-xl outline-none focus:border-orange-500"
            />
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: newColor === c ? "white" : "transparent" }}
                />
              ))}
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                title="Custom color"
                className="w-7 h-7 rounded-full cursor-pointer bg-transparent border border-slate-600"
              />
            </div>
            {newName && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                Preview: <TagBadge tag={{ name: newName, color: newColor }} />
              </div>
            )}
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Create Tag
            </button>
          </form>

          <div className="space-y-2">
            {tags.length === 0 && <p className="text-slate-500 text-sm">No tags yet.</p>}
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <TagBadge tag={tag} />
                  <span className="text-slate-500 text-xs">{tag._count.users} user{tag._count.users !== 1 ? "s" : ""}</span>
                </div>
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: assign to users */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">Assign to User</h2>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search by username…"
            value={userQuery}
            onChange={(e) => searchUsers(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2.5 rounded-xl outline-none focus:border-orange-500"
          />
          {searching && <span className="absolute right-3 top-2.5 text-slate-500 text-xs">…</span>}
        </div>

        {!selectedUser && userResults.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {userResults.map((u) => (
              <button
                key={u.id}
                onClick={() => { setSelectedUser(u); setUserResults([]); setUserQuery("") }}
                className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-700 rounded-xl px-3 py-2.5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                      {u.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{u.displayName ?? u.username}</p>
                  <p className="text-slate-400 text-xs">@{u.username}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden shrink-0">
                  {selectedUser.avatarUrl ? (
                    <img src={selectedUser.avatarUrl} alt={selectedUser.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                      {selectedUser.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{selectedUser.displayName ?? selectedUser.username}</p>
                  <p className="text-slate-400 text-xs">@{selectedUser.username}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedUser.tags.length > 0 && (
              <div>
                <p className="text-slate-400 text-xs mb-2">Current tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.tags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-1">
                      <TagBadge tag={tag} />
                      <button onClick={() => removeTag(tag.id)} className="text-slate-600 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-slate-400 text-xs mb-2">Add tag</p>
              <div className="flex flex-wrap gap-2">
                {tags.filter((t) => !assignableTagIds.has(t.id)).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => assignTag(tag.id)}
                    className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                  >
                    <UserPlus className="w-3 h-3" style={{ color: tag.color }} />
                    <TagBadge tag={tag} />
                  </button>
                ))}
                {tags.filter((t) => !assignableTagIds.has(t.id)).length === 0 && (
                  <p className="text-slate-500 text-xs">All tags assigned.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedUser && userResults.length === 0 && userQuery === "" && (
          <div className="text-center py-8 text-slate-500">
            <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Search for a user to assign tags</p>
          </div>
        )}
      </div>
    </div>
  )
}
