"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Gamepad2, Phone, Terminal } from "lucide-react"
import { PhoneOTPForm } from "@/components/auth/PhoneOTPForm"

function DiscordIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function LoginPage() {
  const [showPhone, setShowPhone] = useState(false)
  const [devUsername, setDevUsername] = useState("")
  const [devLoading, setDevLoading] = useState(false)

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!devUsername.trim()) return
    setDevLoading(true)
    await signIn("dev", { username: devUsername.trim(), callbackUrl: "/home" })
    setDevLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-600 rounded-2xl mb-4 shadow-lg shadow-violet-600/30">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Gamers Republic</h1>
          <p className="text-slate-400 mt-2">One platform for all your squads</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {showPhone ? (
            <PhoneOTPForm onBack={() => setShowPhone(false)} />
          ) : (
            <div className="space-y-3">
              <h2 className="text-white font-semibold text-lg mb-6">Sign in to continue</h2>

              <button
                onClick={() => signIn("discord", { callbackUrl: "/home" })}
                className="w-full flex items-center gap-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold px-4 py-3 rounded-xl transition-colors"
              >
                <DiscordIcon />
                Continue with Discord
              </button>

              <button
                onClick={() => signIn("google", { callbackUrl: "/home" })}
                className="w-full flex items-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold px-4 py-3 rounded-xl transition-colors"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <button
                onClick={() => setShowPhone(true)}
                className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-3 rounded-xl transition-colors border border-slate-700"
              >
                <Phone className="w-5 h-5 shrink-0" />
                Continue with Phone
              </button>

              <p className="text-xs text-slate-500 text-center pt-2">
                By continuing, you agree to our Terms of Service
              </p>

              {process.env.NODE_ENV === "development" && (
                <form onSubmit={handleDevLogin} className="pt-4 border-t border-slate-700 space-y-2">
                  <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5" /> Dev login (local only)
                  </p>
                  <input
                    type="text"
                    placeholder="Pick any username"
                    value={devUsername}
                    onChange={(e) => setDevUsername(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2.5 rounded-xl outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={devLoading || !devUsername.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    {devLoading ? "Signing in…" : "Enter as dev user"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
