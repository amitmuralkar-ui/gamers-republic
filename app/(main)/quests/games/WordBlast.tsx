"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

const WORDS = [
  "HEADSHOT", "RESPAWN", "LOADOUT", "KILLSTREAK", "CLUTCH",
  "RANKED", "ESPORTS", "NOSCOPE", "FLANK", "GRIND",
  "CLUTCHED", "GAMING", "LATENCY", "FRAG", "LOBBY",
]

const TIME_LIMIT = 4
const ROUNDS = 5

interface Props {
  onWin: () => void
  onClose: () => void
}

function getWord(exclude: string[]): string {
  const available = WORDS.filter((w) => !exclude.includes(w))
  return available[Math.floor(Math.random() * available.length)] ?? WORDS[Math.floor(Math.random() * WORDS.length)]
}

export function WordBlast({ onWin, onClose }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing" | "won" | "failed">("intro")
  const [round, setRound] = useState(0)
  const [word, setWord] = useState("")
  const [input, setInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [usedWords, setUsedWords] = useState<string[]>([])
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("")
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function nextRound(used: string[]) {
    const w = getWord(used)
    setWord(w)
    setInput("")
    setTimeLeft(TIME_LIMIT)
    setFeedback("")
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setPhase("failed")
          return 0
        }
        return t - 1
      })
    }, 1000)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function start() {
    setRound(1)
    setUsedWords([])
    setPhase("playing")
    const w = getWord([])
    setWord(w)
    setInput("")
    setTimeLeft(TIME_LIMIT)
    setFeedback("")
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setPhase("failed")
          return 0
        }
        return t - 1
      })
    }, 1000)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleInput(val: string) {
    setInput(val.toUpperCase())
    if (val.toUpperCase() === word) {
      clearInterval(timerRef.current!)
      setFeedback("correct")
      const newUsed = [...usedWords, word]
      setUsedWords(newUsed)
      if (round >= ROUNDS) {
        setTimeout(() => setPhase("won"), 600)
      } else {
        setTimeout(() => {
          setRound((r) => r + 1)
          nextRound(newUsed)
        }, 600)
      }
    }
  }

  useEffect(() => () => clearInterval(timerRef.current!), [])

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Word Blast</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      {phase === "intro" && (
        <div className="text-center py-5">
          <p className="text-slate-300 mb-1">Type each gaming word before the timer runs out.</p>
          <p className="text-slate-500 text-sm mb-5">{ROUNDS} rounds · {TIME_LIMIT}s each</p>
          <button onClick={start} className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
            Start!
          </button>
        </div>
      )}

      {phase === "playing" && (
        <div className="py-4">
          <div className="flex justify-between text-xs mb-5">
            <span className="text-blue-400 font-bold">Round {round} / {ROUNDS}</span>
            <span className={`font-bold ${timeLeft <= 1 ? "text-red-400" : "text-white"}`}>{timeLeft}s</span>
          </div>
          <div className="text-center mb-6">
            <p className="text-4xl font-black tracking-widest text-white" style={{ letterSpacing: "0.2em" }}>
              {word.split("").map((ch, i) => {
                const typed = input[i]
                const color = typed === undefined ? "text-slate-400" : typed === ch ? "text-green-400" : "text-red-400"
                return <span key={i} className={color}>{ch}</span>
              })}
            </p>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Type here…"
            className={`w-full text-center text-xl font-bold bg-slate-800 border rounded-xl px-4 py-3 text-white outline-none tracking-widest ${
              feedback === "correct" ? "border-green-500" : feedback === "wrong" ? "border-red-500" : "border-slate-700 focus:border-blue-500"
            }`}
            autoComplete="off"
            autoCapitalize="characters"
          />
          {feedback === "correct" && <p className="text-center text-green-400 text-sm mt-2 font-bold">✓ Correct!</p>}
        </div>
      )}

      {phase === "won" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">⚡</p>
          <p className="text-green-400 font-bold text-lg mb-1">All {ROUNDS} words nailed!</p>
          <p className="text-slate-400 text-sm mb-5">Lightning Frame unlocked!</p>
          <button onClick={onWin} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
            Claim Reward
          </button>
        </div>
      )}

      {phase === "failed" && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">⏰</p>
          <p className="text-red-400 font-bold text-lg mb-1">Too slow on round {round}!</p>
          <p className="text-slate-400 text-sm mb-5">The word was: <strong className="text-white">{word}</strong></p>
          <div className="flex gap-3 justify-center">
            <button onClick={start} className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
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
