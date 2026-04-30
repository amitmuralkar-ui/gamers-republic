"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

const COLORS = [
  { name: "RED",    hex: "#ef4444" },
  { name: "BLUE",   hex: "#3b82f6" },
  { name: "GREEN",  hex: "#22c55e" },
  { name: "YELLOW", hex: "#facc15" },
  { name: "PURPLE", hex: "#a855f7" },
  { name: "ORANGE", hex: "#f97316" },
]

const GOAL = 10
const DURATION = 22

function getRound() {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)]
  let ink = COLORS[Math.floor(Math.random() * COLORS.length)]
  while (ink.name === word.name) ink = COLORS[Math.floor(Math.random() * COLORS.length)]
  return { word, ink }
}

interface Props { onWin: () => void; onClose: () => void }

export function ColorMatch({ onWin, onClose }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing" | "won" | "failed">("intro")
  const [current, setCurrent] = useState(getRound())
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function start() {
    setCurrent(getRound())
    setScore(0)
    setTimeLeft(DURATION)
    setFlash(null)
    setPhase("playing")
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setPhase((p) => (p === "playing" ? "failed" : p))
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  function pick(colorName: string) {
    if (phase !== "playing") return
    const correct = colorName === current.word.name
    setFlash(correct ? "correct" : "wrong")
    if (correct) {
      const next = score + 1
      setScore(next)
      if (next >= GOAL) {
        clearInterval(timerRef.current!)
        setPhase("won")
        return
      }
    }
    setTimeout(() => { setCurrent(getRound()); setFlash(null) }, 300)
  }

  useEffect(() => () => clearInterval(timerRef.current!), [])

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Color Match</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      {phase === "intro" && (
        <div className="text-center py-4">
          <p className="text-slate-300 mb-2">Click the button that matches the <strong className="text-white">word</strong>, not its color!</p>
          <p className="text-slate-500 text-xs mb-1">Example: if you see <strong style={{ color: "#3b82f6" }}>RED</strong> — click <strong className="text-red-400">RED</strong></p>
          <p className="text-slate-500 text-sm mb-6">Get {GOAL} correct in {DURATION}s.</p>
          <button onClick={start} className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-2.5 rounded-xl">Start!</button>
        </div>
      )}

      {phase === "playing" && (
        <div>
          <div className="flex justify-between text-xs mb-4">
            <span className="text-purple-400 font-bold">{score} / {GOAL}</span>
            <span className={`font-bold ${timeLeft <= 5 ? "text-red-400" : "text-white"}`}>{timeLeft}s</span>
          </div>

          <div
            className={`flex items-center justify-center h-20 rounded-2xl mb-4 transition-colors ${flash === "correct" ? "bg-green-500/20" : flash === "wrong" ? "bg-red-500/20" : "bg-slate-800"}`}
          >
            <span
              className="text-4xl font-black tracking-widest select-none"
              style={{ color: current.ink.hex }}
            >
              {current.word.name}
            </span>
          </div>

          <p className="text-center text-slate-500 text-xs mb-3">Click the colour that matches the <strong className="text-white">word</strong></p>

          <div className="grid grid-cols-3 gap-2">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => pick(c.name)}
                className="py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 text-white"
                style={{ backgroundColor: c.hex + "30", border: `2px solid ${c.hex}60`, color: c.hex }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "won" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">🌈</p>
          <p className="text-green-400 font-bold text-lg mb-1">{GOAL} correct!</p>
          <p className="text-slate-400 text-sm mb-5">Aurora Frame unlocked!</p>
          <button onClick={onWin} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-xl">Claim Reward</button>
        </div>
      )}

      {phase === "failed" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">🎨</p>
          <p className="text-red-400 font-bold text-lg mb-1">Time's up! Got {score}/{GOAL}</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={start} className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-2.5 rounded-xl">Retry</button>
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
