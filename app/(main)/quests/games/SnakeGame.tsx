"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"

const COLS = 18
const ROWS = 14
const CELL = 22
const GOAL_LEN = 8

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT"
type Pos = [number, number]

function randomFood(snake: Pos[]): Pos {
  let pos: Pos
  do {
    pos = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)]
  } while (snake.some(([x, y]) => x === pos[0] && y === pos[1]))
  return pos
}

interface Props {
  onWin: () => void
  onClose: () => void
}

export function SnakeGame({ onWin, onClose }: Props) {
  const initSnake: Pos[] = [[4, 7], [3, 7], [2, 7]]
  const [phase, setPhase] = useState<"intro" | "playing" | "won" | "dead">("intro")
  const [snake, setSnake] = useState<Pos[]>(initSnake)
  const [food, setFood] = useState<Pos>([12, 7])
  const dir = useRef<Dir>("RIGHT")
  const nextDir = useRef<Dir>("RIGHT")
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const foodRef = useRef<Pos>([12, 7])

  function startGame() {
    const s: Pos[] = [[4, 7], [3, 7], [2, 7]]
    const f = randomFood(s)
    setSnake(s)
    setFood(f)
    foodRef.current = f
    dir.current = "RIGHT"
    nextDir.current = "RIGHT"
    setPhase("playing")
  }

  const tick = useCallback(() => {
    setSnake((prev) => {
      dir.current = nextDir.current
      const [hx, hy] = prev[0]
      const next: Pos =
        dir.current === "UP" ? [hx, hy - 1] :
        dir.current === "DOWN" ? [hx, hy + 1] :
        dir.current === "LEFT" ? [hx - 1, hy] :
        [hx + 1, hy]

      if (next[0] < 0 || next[0] >= COLS || next[1] < 0 || next[1] >= ROWS) {
        clearInterval(tickRef.current!)
        setPhase("dead")
        return prev
      }
      if (prev.some(([x, y]) => x === next[0] && y === next[1])) {
        clearInterval(tickRef.current!)
        setPhase("dead")
        return prev
      }

      const f = foodRef.current
      const ate = f[0] === next[0] && f[1] === next[1]
      const newSnake = ate ? [next, ...prev] : [next, ...prev.slice(0, -1)]

      if (ate) {
        if (newSnake.length >= GOAL_LEN) {
          clearInterval(tickRef.current!)
          setPhase("won")
        }
        const newFood = randomFood(newSnake)
        foodRef.current = newFood
        setFood(newFood)
      }

      return newSnake
    })
  }, [])

  useEffect(() => {
    if (phase !== "playing") return
    tickRef.current = setInterval(tick, 150)
    return () => clearInterval(tickRef.current!)
  }, [phase, tick])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase !== "playing") return
      const map: Record<string, Dir> = {
        ArrowUp: "UP", w: "UP", W: "UP",
        ArrowDown: "DOWN", s: "DOWN", S: "DOWN",
        ArrowLeft: "LEFT", a: "LEFT", A: "LEFT",
        ArrowRight: "RIGHT", d: "RIGHT", D: "RIGHT",
      }
      const d = map[e.key]
      if (!d) return
      const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" }
      if (opp[d] !== dir.current) nextDir.current = d
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [phase])


  const dpad = (d: Dir) => {
    const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" }
    if (opp[d] !== dir.current) nextDir.current = d
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-lg">Snake Run</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      {phase === "intro" && (
        <div className="text-center py-5">
          <p className="text-slate-300 mb-1">Grow to length <strong className="text-orange-400">{GOAL_LEN}</strong> without hitting walls or yourself.</p>
          <p className="text-slate-500 text-sm mb-5">Use arrow keys, WASD, or on-screen controls.</p>
          <button onClick={startGame} className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
            Start!
          </button>
        </div>
      )}

      {(phase === "playing" || phase === "won" || phase === "dead") && (
        <>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-orange-400 font-bold">Length: {snake.length} / {GOAL_LEN}</span>
          </div>
          <div
            className="relative bg-slate-800 rounded-xl overflow-hidden mx-auto border border-slate-700"
            style={{ width: COLS * CELL, height: ROWS * CELL }}
          >
            {snake.map(([x, y], i) => (
              <div
                key={i}
                className={`absolute rounded-sm ${i === 0 ? "bg-orange-400" : "bg-orange-600"}`}
                style={{ left: x * CELL + 1, top: y * CELL + 1, width: CELL - 2, height: CELL - 2 }}
              />
            ))}
            <div
              className="absolute rounded-full bg-green-400 flex items-center justify-center text-xs"
              style={{ left: food[0] * CELL + 2, top: food[1] * CELL + 2, width: CELL - 4, height: CELL - 4 }}
            >
              •
            </div>
          </div>

          {/* D-pad for mobile */}
          <div className="flex flex-col items-center mt-3 gap-1">
            <button onClick={() => dpad("UP")} className="w-10 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs">↑</button>
            <div className="flex gap-1">
              <button onClick={() => dpad("LEFT")} className="w-10 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs">←</button>
              <button onClick={() => dpad("DOWN")} className="w-10 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs">↓</button>
              <button onClick={() => dpad("RIGHT")} className="w-10 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs">→</button>
            </div>
          </div>
        </>
      )}

      {phase === "won" && (
        <div className="text-center mt-4">
          <p className="text-green-400 font-bold text-base mb-1">Length {snake.length} reached! 🔥</p>
          <button onClick={onWin} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2 rounded-xl transition-colors">
            Claim Flame Nameplate
          </button>
        </div>
      )}

      {phase === "dead" && (
        <div className="text-center mt-4">
          <p className="text-red-400 font-bold mb-3">Crashed! Length was {snake.length}.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={startGame} className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-5 py-2 rounded-xl transition-colors">
              Retry
            </button>
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
