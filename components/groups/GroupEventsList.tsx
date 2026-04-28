"use client"

import { useState } from "react"
import { Calendar, Plus, Trash2 } from "lucide-react"

interface GroupEvent {
  id: string
  title: string
  description: string | null
  startAt: string
  creator: { id: string; username: string; displayName: string | null }
}

interface Props {
  groupId: string
  initialEvents: GroupEvent[]
  currentUserId: string
  isOwner: boolean
}

export function GroupEventsList({ groupId, initialEvents, currentUserId, isOwner }: Props) {
  const [events, setEvents] = useState<GroupEvent[]>(initialEvents)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startAt, setStartAt] = useState("")
  const [saving, setSaving] = useState(false)

  async function createEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startAt) return
    setSaving(true)
    const res = await fetch(`/api/groups/${groupId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, startAt: new Date(startAt).toISOString() }),
    })
    if (res.ok) {
      const ev = await res.json()
      setEvents((prev) => [...prev, ev].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()))
      setTitle("")
      setDescription("")
      setStartAt("")
      setCreating(false)
    }
    setSaving(false)
  }

  async function deleteEvent(id: string) {
    await fetch(`/api/groups/${groupId}/events/${id}`, { method: "DELETE" })
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const upcoming = events.filter((e) => new Date(e.startAt) >= new Date())
  const past = events.filter((e) => new Date(e.startAt) < new Date())

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-400" />
          Events
        </h3>
        <button
          onClick={() => setCreating((v) => !v)}
          className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule
        </button>
      </div>

      {creating && (
        <form onSubmit={createEvent} className="space-y-2 mb-4 bg-slate-800 rounded-xl p-3">
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
          />
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full bg-slate-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-1.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <p className="text-slate-500 text-xs">No events yet.</p>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-2">
          {upcoming.map((ev) => (
            <EventRow key={ev.id} event={ev} canDelete={isOwner || ev.creator.id === currentUserId} onDelete={deleteEvent} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-slate-600 mb-1.5">Past</p>
          <div className="space-y-1.5 opacity-50">
            {past.map((ev) => (
              <EventRow key={ev.id} event={ev} canDelete={isOwner || ev.creator.id === currentUserId} onDelete={deleteEvent} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EventRow({ event, canDelete, onDelete }: { event: GroupEvent; canDelete: boolean; onDelete: (id: string) => void }) {
  const date = new Date(event.startAt)
  return (
    <div className="flex items-start justify-between gap-2 bg-slate-800 rounded-xl px-3 py-2">
      <div className="min-w-0">
        <p className="text-white text-xs font-medium truncate">{event.title}</p>
        {event.description && <p className="text-slate-400 text-xs truncate">{event.description}</p>}
        <p className="text-orange-400 text-xs mt-0.5">
          {date.toLocaleDateString([], { month: "short", day: "numeric" })} at {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {canDelete && (
        <button onClick={() => onDelete(event.id)} className="text-slate-600 hover:text-red-400 shrink-0 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
