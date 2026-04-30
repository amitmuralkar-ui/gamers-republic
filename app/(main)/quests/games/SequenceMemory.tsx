"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

const COLORS = [
  { id: 0, name: "Red",    bg: "bg-red-500",    glow: "#ef4444" },
  { id: 1, name: "Blue",   bg: "bg-blue-500",   glow: "#3b82f6" },
  { id: 2, name: "Green",  bg: "bg-green-500",  glow: "#22c55e" },
  { id: 3, name: "Yellow", bg: "bg-yellow-400", glow: "#facc15" },
]
const WIN_LENGTH = 7

interface Props { onWin: () => void; onClose: () => void }

type Phase = "intro" | "showing" | "input" | "won" | "lost"

export function SequenceMemory({ onWin, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("intro")
  const [sequence, setSequence] = useState<number[]>([])
  const [userSeq, setUserSeq] = useState<number[]>([])
  const [lit, setLit] = useState<number | null>(null)
  const [round, setRound] = useState(0)

  function playSequence(seq: number[]) {
    setPhase("showing")
    setUserSeq([])
    let i = 0
    const next = () => {
      if (i >= seq.length) {
        setLit(null)
        setTimeout(() => setPhase("input"), 400)
        return
      }
      setLit(seq[i])
      i++
      setTimeout(() => { setLit(null); setTimeout(next, 300) }, 600)
    }
    setTimeout(next, 500)
  }

  function start() {
    const first = Math.floor(Math.random() * 4)
    const seq = [first]
    setSequence(seq)
    setRound(1)
    playSequence(seq)
  }

  function press(colorId: number) {
    if (phase !== "input") return
    const pos = userSeq.length
    if (colorId !== sequence[pos]) {
      setPhase("lost")
      return
    }
    const newUser = [...userSeq, colorId]
    setUserSeq(newUser)
    if (newUser.length === sequence.length) {
      if (sequence.length >= WIN_LENGTH) {
        setPhase("won")
        return
      }
      const next = [...sequence, Math.floor(Math.random() * 4)]
      setSequence(next)
      setRound((r) => r + 1)
      setTimeout(() => playSequence(next), 600)
    }
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Sequence Memory</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      {phase === "intro" && (
        <div className="text-center py-4">
          <p className="text-slate-300 mb-1">Watch the pattern, then repeat it.</p>
          <p className="text-slate-500 text-sm mb-6">Reach level <strong className="text-green-400">{WIN_LENGTH}</strong> to win.</p>
          <button onClick={start} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-xl">Start!</button>
        </div>
      )}

      {(phase === "showing" || phase === "input") && (
        <>
          <div className="flex justify-between text-xs mb-4">
            <span className="text-green-400 font-bold">Level {round} / {WIN_LENGTH}</span>
            <span className="text-slate-400">{phase === "showing" ? "Watch…" : `${userSeq.length}/${sequence.length} entered`}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => press(c.id)}
                disabled={phase === "showing"}
                className={`h-24 rounded-2xl font-bold text-white text-lg transition-all select-none ${c.bg} ${
                  lit === c.id ? "scale-105 brightness-150" : "opacity-60 hover:opacity-90"
                } ${phase === "input" ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default"}`}
                style={{ boxShadow: lit === c.id ? `0 0 24px ${c.glow}` : "none" }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "won" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">🧠</p>
          <p className="text-green-400 font-bold text-lg mb-1">Level {WIN_LENGTH} reached!</p>
          <p className="text-slate-400 text-sm mb-5">Pixel Nameplate unlocked!</p>
          <button onClick={onWin} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-xl">Claim Reward</button>
        </div>
      )}

      {phase === "lost" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">💀</p>
          <p className="text-red-400 font-bold text-lg mb-1">Wrong button at level {round}!</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={start} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-xl">Retry</button>
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
