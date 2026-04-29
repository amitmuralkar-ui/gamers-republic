"use client"

import { useState } from "react"
import { Sword, Brain, Gamepad2, Zap, CheckCircle2, Trophy } from "lucide-react"
import { ClickFrenzy } from "./games/ClickFrenzy"
import { MemoryMatch } from "./games/MemoryMatch"
import { SnakeGame } from "./games/SnakeGame"
import { WordBlast } from "./games/WordBlast"

export const QUESTS = [
  {
    id: "click-frenzy",
    name: "Click Frenzy",
    description: "Click 20 targets before time runs out!",
    rewardName: "Gold Nameplate",
    rewardType: "nameplate",
    rewardStyle: "gold",
    icon: Sword,
    color: "#f59e0b",
  },
  {
    id: "memory-match",
    name: "Memory Match",
    description: "Flip all the cards and find every pair.",
    rewardName: "Star Frame",
    rewardType: "pfp-frame",
    rewardStyle: "star",
    icon: Brain,
    color: "#3b82f6",
  },
  {
    id: "snake-run",
    name: "Snake Run",
    description: "Grow your snake to length 8 without crashing.",
    rewardName: "Flame Nameplate",
    rewardType: "nameplate",
    rewardStyle: "flame",
    icon: Gamepad2,
    color: "#f97316",
  },
  {
    id: "word-blast",
    name: "Word Blast",
    description: "Type 5 gaming words correctly in 3 seconds each.",
    rewardName: "Lightning Frame",
    rewardType: "pfp-frame",
    rewardStyle: "lightning",
    icon: Zap,
    color: "#60a5fa",
  },
]

const GAME_MAP: Record<string, React.ComponentType<{ onWin: () => void; onClose: () => void }>> = {
  "click-frenzy": ClickFrenzy,
  "memory-match": MemoryMatch,
  "snake-run": SnakeGame,
  "word-blast": WordBlast,
}

interface Props {
  completedQuestIds: string[]
  decorations: { type: string; name: string; style: string }[]
}

export function QuestsClient({ completedQuestIds: initial, decorations: initialDecs }: Props) {
  const [completed, setCompleted] = useState(new Set(initial))
  const [decorations, setDecorations] = useState(initialDecs)
  const [activeQuest, setActiveQuest] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [justWon, setJustWon] = useState<string | null>(null)

  async function handleWin(questId: string) {
    setClaiming(true)
    const res = await fetch(`/api/quests/${questId}/complete`, { method: "POST" })
    if (res.ok) {
      const { decoration } = await res.json()
      setCompleted((prev) => new Set([...prev, questId]))
      setDecorations((prev) => [...prev, decoration])
      setJustWon(questId)
    }
    setClaiming(false)
    setActiveQuest(null)
  }

  const ActiveGame = activeQuest ? GAME_MAP[activeQuest] : null

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 bg-orange-600/20 rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Avatar Quests</h1>
          <p className="text-slate-400 text-sm">Beat minigames to earn unique avatar decorations</p>
        </div>
      </div>

      {decorations.length > 0 && (
        <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Decorations</p>
          <div className="flex flex-wrap gap-2">
            {decorations.map((d, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  color: d.style === "gold" ? "#facc15" : d.style === "flame" ? "#fb923c" : d.style === "star" ? "#facc15" : "#60a5fa",
                  backgroundColor: d.style === "gold" || d.style === "star" ? "#facc1520" : d.style === "flame" ? "#fb923c20" : "#60a5fa20",
                  border: `1px solid currentColor`,
                }}
              >
                {d.type === "nameplate" ? (d.style === "flame" ? "🔥" : "✦") : (d.style === "star" ? "⭐" : "⚡")} {d.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUESTS.map((quest) => {
          const isDone = completed.has(quest.id)
          const Icon = quest.icon

          return (
            <div
              key={quest.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all duration-200 ${isDone ? "border-slate-700 opacity-75" : "border-slate-800 hover:border-orange-500/40 hover:-translate-y-0.5"}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: quest.color + "20" }}
                >
                  <Icon className="w-5 h-5" style={{ color: quest.color }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-sm">{quest.name}</h3>
                    {isDone && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{quest.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs">Reward</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: quest.color }}>
                    {quest.rewardType === "nameplate" ? "✦" : "⭐"} {quest.rewardName}
                  </p>
                </div>
                {isDone ? (
                  <span className="text-xs text-green-400 font-semibold bg-green-400/10 px-3 py-1.5 rounded-xl">
                    Completed!
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveQuest(quest.id)}
                    className="text-xs font-semibold px-4 py-1.5 rounded-xl transition-colors text-white"
                    style={{ backgroundColor: quest.color }}
                  >
                    Play
                  </button>
                )}
              </div>

              {justWon === quest.id && (
                <div className="mt-3 bg-green-400/10 border border-green-400/30 rounded-xl px-3 py-2">
                  <p className="text-green-400 text-xs font-semibold">🎉 You earned: {quest.rewardName}!</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {ActiveGame && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden w-full max-w-lg">
            {claiming ? (
              <div className="p-10 text-center text-slate-400">Claiming reward…</div>
            ) : (
              <ActiveGame
                onWin={() => handleWin(activeQuest!)}
                onClose={() => setActiveQuest(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
