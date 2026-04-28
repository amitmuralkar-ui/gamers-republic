"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { AvatarUpload } from "@/components/profile/AvatarUpload"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { LogOut, Save } from "lucide-react"

interface UserData {
  id: string
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  discordTag: string | null
  phone: string | null
  email: string | null
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!session?.user?.id) return
    fetch(`/api/user/me`)
      .then((r) => r.json())
      .then((data: UserData) => {
        setUser(data)
        setDisplayName(data.displayName ?? "")
        setUsername(data.username ?? "")
        setBio(data.bio ?? "")
      })
  }, [session])

  async function save() {
    setError("")
    setSaving(true)
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, username, bio }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to save")
      setUser((u) => u ? { ...u, ...data } : u)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Avatar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5">Profile Picture</h2>
        <AvatarUpload
          currentAvatarUrl={user.avatarUrl}
          username={user.username}
          onUploadComplete={(url) => setUser((u) => u ? { ...u, avatarUrl: url } : u)}
        />
      </div>

      {/* Profile info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Profile Info</h2>
        <Input
          id="displayName"
          label="Display Name"
          placeholder="How you appear to others"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Input
          id="username"
          label="Username"
          placeholder="your_username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
          <textarea
            placeholder="Tell people about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors resize-none"
          />
          <p className="text-xs text-slate-500 text-right mt-1">{bio.length}/200</p>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button onClick={save} loading={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Linked accounts */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h2 className="text-white font-semibold">Linked Accounts</h2>
        {[
          { label: "Discord", value: user.discordTag, color: "text-[#5865F2]" },
          { label: "Google", value: user.email, color: "text-blue-400" },
          { label: "Phone", value: user.phone, color: "text-green-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
            <span className="text-slate-300 text-sm">{label}</span>
            <span className={`text-sm font-medium ${value ? color : "text-slate-500"}`}>
              {value ?? "Not linked"}
            </span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <Button
        variant="danger"
        className="w-full"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  )
}
