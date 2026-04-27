"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ArrowLeft, Hash } from "lucide-react"
import Link from "next/link"

export default function JoinGroupPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function join() {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to join")
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
        <h1 className="text-2xl font-bold text-white">Join a Group</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-violet-400" />
          </div>
          <p className="text-slate-300 text-sm">Enter the invite code shared by the group owner</p>
        </div>
        <Input
          id="code"
          label="Invite Code"
          placeholder="e.g. X7K2P9"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          maxLength={10}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button className="w-full" size="lg" onClick={join} loading={loading} disabled={code.length < 4}>
          Join Group
        </Button>
      </div>
    </div>
  )
}
