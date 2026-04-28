"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

const EMOJIS = ["🎮", "🕹️", "🏆", "⚔️", "🛡️", "💎", "🔥", "⚡"]

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

interface Props {
  onWin: () => void
  onClose: () => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function makeCards(): Card[] {
  return shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }))
}

export function MemoryMatch({ onWin, onClose }: Props) {
  const [cards, setCards] = useState<Card[]>(makeCards)
  const [selected, setSelected] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  function flip(id: number) {
    if (locked) return
    const card = cards.find((c) => c.id === id)
    if (!card || card.flipped || card.matched) return
    if (selected.length === 1 && selected[0] === id) return

    const nextSelected = [...selected, id]
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, flipped: true } : c))
    setSelected(nextSelected)

    if (nextSelected.length === 2) {
      setMoves((m) => m + 1)
      setLocked(true)
      const [a, b] = nextSelected.map((sid) => cards.find((c) => c.id === sid)!)
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          setCards((prev) => {
            const updated = prev.map((c) =>
              c.id === nextSelected[0] || c.id === nextSelected[1]
                ? { ...c, matched: true }
                : c
            )
            if (updated.every((c) => c.matched)) setWon(true)
            return updated
          })
          setSelected([])
          setLocked(false)
        }, 400)
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              nextSelected.includes(c.id) ? { ...c, flipped: false } : c
            )
          )
          setSelected([])
          setLocked(false)
        }, 900)
      }
    }
  }

  function restart() {
    setCards(makeCards())
    setSelected([])
    setLocked(false)
    setMoves(0)
    setWon(false)
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Memory Match</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <p className="text-slate-400 text-xs mb-4">Match all pairs to win! Moves: <span className="text-white font-bold">{moves}</span></p>

      {won ? (
        <div className="text-center py-4">
          <p className="text-4xl mb-2">⭐</p>
          <p className="text-green-400 font-bold text-lg mb-1">All matched in {moves} moves!</p>
          <p className="text-slate-400 text-sm mb-5">Star Frame unlocked!</p>
          <button onClick={onWin} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
            Claim Reward
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => flip(card.id)}
              className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
                card.matched
                  ? "bg-green-500/20 border border-green-500/30"
                  : card.flipped
                  ? "bg-blue-600/30 border border-blue-500/50"
                  : "bg-slate-800 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {card.flipped || card.matched ? card.emoji : "?"}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
