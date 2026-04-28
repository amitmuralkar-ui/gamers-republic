"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"

interface Target {
  id: number
  x: number
  y: number
}

interface Props {
  onWin: () => void
  onClose: () => void
}

const GOAL = 20
const DURATION = 15

export function ClickFrenzy({ onWin, onClose }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing" | "won" | "lost">("intro")
  const [targets, setTargets] = useState<Target[]>([])
  const [clicks, setClicks] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const nextId = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const spawnTarget = useCallback(() => {
    const id = nextId.current++
    const x = 10 + Math.random() * 80
    const y = 10 + Math.random() * 80
    setTargets((prev) => [...prev, { id, x, y }])
    setTimeout(() => setTargets((prev) => prev.filter((t) => t.id !== id)), 1200)
  }, [])

  function start() {
    setPhase("playing")
    setClicks(0)
    setTimeLeft(DURATION)

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          clearInterval(spawnRef.current!)
          setPhase((p) => (p === "playing" ? "lost" : p))
          return 0
        }
        return t - 1
      })
    }, 1000)

    spawnRef.current = setInterval(spawnTarget, 500)
    spawnTarget()
  }

  function hitTarget(id: number) {
    setTargets((prev) => prev.filter((t) => t.id !== id))
    setClicks((c) => {
      const next = c + 1
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
        <h2 className="text-white font-bold text-lg">Click Frenzy</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      {phase === "intro" && (
        <div className="text-center py-6">
          <p className="text-slate-300 mb-2">Click <strong className="text-yellow-400">{GOAL} targets</strong> in <strong className="text-yellow-400">{DURATION} seconds</strong>!</p>
          <p className="text-slate-500 text-sm mb-6">Targets appear and disappear quickly. Don't miss!</p>
          <button onClick={start} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-xl transition-colors">
            Start!
          </button>
        </div>
      )}

      {phase === "playing" && (
        <>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-yellow-400 font-bold">{clicks} / {GOAL}</span>
            <span className={`font-bold ${timeLeft <= 5 ? "text-red-400" : "text-white"}`}>{timeLeft}s</span>
          </div>
          <div className="relative bg-slate-800 rounded-xl overflow-hidden" style={{ height: 280 }}>
            {targets.map((t) => (
              <button
                key={t.id}
                onClick={() => hitTarget(t.id)}
                className="absolute w-10 h-10 rounded-full bg-yellow-400 hover:bg-yellow-300 transition-transform hover:scale-110 active:scale-95 border-2 border-yellow-300"
                style={{ left: `${t.x}%`, top: `${t.y}%`, transform: "translate(-50%, -50%)" }}
              />
            ))}
          </div>
        </>
      )}

      {phase === "won" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">🏆</p>
          <p className="text-green-400 font-bold text-lg mb-1">You did it!</p>
          <p className="text-slate-400 text-sm mb-6">Clicked {GOAL} targets. Gold Nameplate unlocked!</p>
          <button onClick={onWin} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
            Claim Reward
          </button>
        </div>
      )}

      {phase === "lost" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">⏰</p>
          <p className="text-red-400 font-bold text-lg mb-1">Time's up! ({clicks}/{GOAL})</p>
          <p className="text-slate-400 text-sm mb-6">Keep trying!</p>
          <div className="flex gap-3 justify-center">
            <button onClick={start} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-xl transition-colors">
              Retry
            </button>
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
