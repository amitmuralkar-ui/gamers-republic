"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ArrowLeft, Globe, Lock } from "lucide-react"
import Link from "next/link"

export default function NewGroupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function create() {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, isPublic }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create")
      router.push(`/groups/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/groups" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Create Group</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <Input id="name" label="Group Name" placeholder="e.g. Valorant Squad" value={name} onChange={(e) => setName(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (optional)</label>
          <textarea
            placeholder="What's this group about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Privacy</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: true, icon: Globe, label: "Public", desc: "Anyone can join" },
              { val: false, icon: Lock, label: "Private", desc: "Invite code required" },
            ].map(({ val, icon: Icon, label, desc }) => (
              <button
                key={label}
                onClick={() => setIsPublic(val)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                  isPublic === val
                    ? "border-orange-500 bg-orange-600/10 text-white"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button className="w-full" size="lg" onClick={create} loading={loading} disabled={name.length < 2}>
          Create Group
        </Button>
      </div>
    </div>
  )
}
