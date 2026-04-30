"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"

const GOAL = 15
const DURATION = 20
const TARGET_LIFE = 1400

interface Target { id: number; x: number; y: number; size: number }

interface Props { onWin: () => void; onClose: () => void }

export function AimTrainer({ onWin, onClose }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing" | "won" | "failed">("intro")
  const [targets, setTargets] = useState<Target[]>([])
  const [hits, setHits] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const nextId = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const spawn = useCallback(() => {
    const id = nextId.current++
    const size = 28 + Math.random() * 24
    const x = 5 + Math.random() * 88
    const y = 5 + Math.random() * 88
    setTargets((p) => [...p, { id, x, y, size }])
    setTimeout(() => setTargets((p) => p.filter((t) => t.id !== id)), TARGET_LIFE)
  }, [])

  function start() {
    setPhase("playing")
    setHits(0)
    setTimeLeft(DURATION)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          clearInterval(spawnRef.current!)
          setPhase((p) => (p === "playing" ? "failed" : p))
          return 0
        }
        return t - 1
      })
    }, 1000)
    spawnRef.current = setInterval(spawn, 700)
    spawn()
  }

  function hit(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    setTargets((p) => p.filter((t) => t.id !== id))
    setHits((h) => {
      const next = h + 1
      if (next >= GOAL) {
        clearInterval(timerRef.current!)
        clearInterval(spawnRef.current!)
        setPhase("won")
      }
      return next
    })
  }

  useEffect(() => () => {
    clearInterval(timerRef.current!)
    clearInterval(spawnRef.current!)
  }, [])

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Aim Trainer</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      {phase === "intro" && (
        <div className="text-center py-6">
          <p className="text-slate-300 mb-1">Click <strong className="text-red-400">{GOAL} targets</strong> before they vanish!</p>
          <p className="text-slate-500 text-sm mb-6">You have {DURATION} seconds. Targets disappear after ~1.4s.</p>
          <button onClick={start} className="bg-red-500 hover:bg-red-400 text-white font-bold px-6 py-2.5 rounded-xl">Start!</button>
        </div>
      )}

      {phase === "playing" && (
        <>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-red-400 font-bold">{hits} / {GOAL}</span>
            <span className={`font-bold ${timeLeft <= 5 ? "text-red-400" : "text-white"}`}>{timeLeft}s</span>
          </div>
          <div className="relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 select-none" style={{ height: 300 }}>
            {targets.map((t) => (
              <button
                key={t.id}
                onClick={(e) => hit(t.id, e)}
                className="absolute rounded-full bg-red-500 hover:bg-red-400 border-2 border-red-300 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.size, height: t.size, transform: "translate(-50%,-50%)" }}
              >
                <div className="w-2 h-2 rounded-full bg-white/60" />
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "won" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">🎯</p>
          <p className="text-green-400 font-bold text-lg mb-1">All {GOAL} targets down!</p>
          <p className="text-slate-400 text-sm mb-5">Crosshair Frame unlocked!</p>
          <button onClick={onWin} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-xl">Claim Reward</button>
        </div>
      )}

      {phase === "failed" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">💨</p>
          <p className="text-red-400 font-bold text-lg mb-1">Time's up! Got {hits}/{GOAL}</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={start} className="bg-red-500 hover:bg-red-400 text-white font-bold px-6 py-2.5 rounded-xl">Retry</button>
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
