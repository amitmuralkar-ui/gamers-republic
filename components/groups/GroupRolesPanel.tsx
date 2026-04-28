"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
]

interface GroupRole {
  id: string
  name: string
  color: string
  _count: { assignments: number }
}

interface Props {
  groupId: string
  initialRoles: GroupRole[]
}

export function GroupRolesPanel({ groupId, initialRoles }: Props) {
  const [roles, setRoles] = useState<GroupRole[]>(initialRoles)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(PRESET_COLORS[5])
  const [creating, setCreating] = useState(false)

  async function createRole(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch(`/api/groups/${groupId}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), color: newColor }),
    })
    if (res.ok) {
      const role = await res.json()
      setRoles((prev) => [...prev, role])
      setNewName("")
    }
    setCreating(false)
  }

  async function deleteRole(id: string) {
    await fetch(`/api/groups/${groupId}/roles/${id}`, { method: "DELETE" })
    setRoles((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <h3 className="text-white font-semibold text-sm mb-3">Group Roles</h3>

      <form onSubmit={createRole} className="space-y-2 mb-4">
        <input
          type="text"
          placeholder="Role name (e.g. Admin, Mod)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl outline-none focus:border-orange-500"
        />
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setNewColor(c)}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: c, borderColor: newColor === c ? "white" : "transparent" }}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="w-full flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Create Role
        </button>
      </form>

      <div className="space-y-1.5">
        {roles.length === 0 && <p className="text-slate-500 text-xs">No roles yet.</p>}
        {roles.map((role) => (
          <div key={role.id} className="flex items-center justify-between gap-2 bg-slate-800 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: role.color + "28", color: role.color, border: `1px solid ${role.color}50` }}
              >
                {role.name}
              </span>
              <span className="text-slate-500 text-xs">{role._count.assignments}</span>
            </div>
            <button
              onClick={() => deleteRole(role.id)}
              className="text-slate-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
