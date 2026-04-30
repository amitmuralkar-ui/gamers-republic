"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

const ROUNDS = 3
const WIN_MS = 420

interface Props { onWin: () => void; onClose: () => void }

type Phase = "intro" | "wait" | "go" | "early" | "result" | "won" | "failed"

export function ReflexRush({ onWin, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("intro")
  const [round, setRound] = useState(0)
  const [times, setTimes] = useState<number[]>([])
  const [current, setCurrent] = useState(0)
  const startRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearT() { if (timerRef.current) clearTimeout(timerRef.current) }

  function beginRound() {
    setPhase("wait")
    clearT()
    timerRef.current = setTimeout(() => {
      startRef.current = Date.now()
      setPhase("go")
    }, 1000 + Math.random() * 3000)
  }

  function start() {
    setRound(1)
    setTimes([])
    beginRound()
  }

  function handleClick() {
    if (phase === "wait") {
      clearT()
      setPhase("early")
      return
    }
    if (phase !== "go") return
    const ms = Date.now() - startRef.current
    setCurrent(ms)
    const newTimes = [...times, ms]
    setTimes(newTimes)
    setPhase("result")

    if (newTimes.length >= ROUNDS) {
      const avg = newTimes.reduce((a, b) => a + b, 0) / newTimes.length
      setTimeout(() => setPhase(avg <= WIN_MS ? "won" : "failed"), 1200)
    } else {
      setTimeout(() => {
        setRound((r) => r + 1)
        beginRound()
      }, 1000)
    }
  }

  useEffect(() => () => clearT(), [])

  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null

  const bgColor =
    phase === "wait" ? "bg-red-950 border-red-800" :
    phase === "go" ? "bg-green-950 border-green-600" :
    phase === "early" ? "bg-orange-950 border-orange-700" :
    "bg-slate-800 border-slate-700"

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Reflex Rush</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      {phase === "intro" && (
        <div className="text-center py-6">
          <p className="text-slate-300 mb-1">Click the moment it turns <strong className="text-green-400">GREEN</strong>.</p>
          <p className="text-slate-500 text-sm mb-1">Don't click early! Average under <strong className="text-cyan-400">{WIN_MS}ms</strong> to win.</p>
          <p className="text-slate-500 text-sm mb-6">{ROUNDS} rounds total.</p>
          <button onClick={start} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-xl transition-colors">
            Start!
          </button>
        </div>
      )}

      {(phase === "wait" || phase === "go" || phase === "result" || phase === "early") && (
        <div>
          <div className="flex justify-between text-xs mb-3">
            <span className="text-cyan-400 font-bold">Round {round} / {ROUNDS}</span>
            {avg !== null && <span className="text-slate-400">Avg: {avg}ms</span>}
          </div>
          <button
            onClick={handleClick}
            className={`w-full h-44 rounded-2xl border-2 flex flex-col items-center justify-center transition-colors select-none ${bgColor}`}
          >
            {phase === "wait" && (
              <>
                <div className="w-4 h-4 rounded-full bg-red-500 mb-2 animate-pulse" />
                <span className="text-red-400 font-bold text-lg">Wait…</span>
              </>
            )}
            {phase === "go" && (
              <>
                <div className="w-4 h-4 rounded-full bg-green-400 mb-2" />
                <span className="text-green-300 font-bold text-2xl">CLICK!</span>
              </>
            )}
            {phase === "result" && (
              <span className={`font-bold text-2xl ${current <= WIN_MS ? "text-green-400" : "text-yellow-400"}`}>
                {current}ms {current <= WIN_MS ? "⚡" : ""}
              </span>
            )}
            {phase === "early" && (
              <span className="text-orange-400 font-bold text-xl">Too early! 😬</span>
            )}
          </button>
          {phase === "early" && (
            <button onClick={() => { setRound((r) => r + 1); beginRound() }} className="mt-3 w-full bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 rounded-xl transition-colors">
              Try again
            </button>
          )}
        </div>
      )}

      {phase === "won" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">⚡</p>
          <p className="text-green-400 font-bold text-lg mb-1">Avg: {avg}ms — Blazing fast!</p>
          <p className="text-slate-400 text-sm mb-5">Neon Nameplate unlocked!</p>
          <button onClick={onWin} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-xl">Claim Reward</button>
        </div>
      )}

      {phase === "failed" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">🐌</p>
          <p className="text-red-400 font-bold text-lg mb-1">Avg: {avg}ms — Too slow!</p>
          <p className="text-slate-400 text-sm mb-5">Need under {WIN_MS}ms average. Keep trying!</p>
          <div className="flex gap-3 justify-center">
            <button onClick={start} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-xl">Retry</button>
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
