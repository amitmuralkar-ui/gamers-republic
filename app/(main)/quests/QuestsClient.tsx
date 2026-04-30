"use client"

import { useState } from "react"
import { Sword, Brain, Gamepad2, Zap, Timer, Crosshair, Layers, Palette, CheckCircle2, Trophy, Lock } from "lucide-react"
import { ClickFrenzy } from "./games/ClickFrenzy"
import { MemoryMatch } from "./games/MemoryMatch"
import { SnakeGame } from "./games/SnakeGame"
import { WordBlast } from "./games/WordBlast"
import { ReflexRush } from "./games/ReflexRush"
import { AimTrainer } from "./games/AimTrainer"
import { SequenceMemory } from "./games/SequenceMemory"
import { ColorMatch } from "./games/ColorMatch"

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
    difficulty: "Easy",
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
    difficulty: "Easy",
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
    difficulty: "Medium",
  },
  {
    id: "word-blast",
    name: "Word Blast",
    description: "Type 5 gaming words correctly in time.",
    rewardName: "Lightning Frame",
    rewardType: "pfp-frame",
    rewardStyle: "lightning",
    icon: Zap,
    color: "#60a5fa",
    difficulty: "Easy",
  },
  {
    id: "reflex-rush",
    name: "Reflex Rush",
    description: "React under 420ms when the light turns green.",
    rewardName: "Neon Nameplate",
    rewardType: "nameplate",
    rewardStyle: "neon",
    icon: Timer,
    color: "#22d3ee",
    difficulty: "Medium",
  },
  {
    id: "aim-trainer",
    name: "Aim Trainer",
    description: "Take down 15 moving targets in 20 seconds.",
    rewardName: "Crosshair Frame",
    rewardType: "pfp-frame",
    rewardStyle: "crosshair",
    icon: Crosshair,
    color: "#ef4444",
    difficulty: "Hard",
  },
  {
    id: "sequence-memory",
    name: "Sequence Memory",
    description: "Remember and repeat the colour pattern up to level 7.",
    rewardName: "Pixel Nameplate",
    rewardType: "nameplate",
    rewardStyle: "pixel",
    icon: Layers,
    color: "#22c55e",
    difficulty: "Hard",
  },
  {
    id: "color-match",
    name: "Color Match",
    description: "Click the word's meaning, not its ink colour. 10 correct!",
    rewardName: "Aurora Frame",
    rewardType: "pfp-frame",
    rewardStyle: "aurora",
    icon: Palette,
    color: "#a855f7",
    difficulty: "Medium",
  },
]

const GAME_MAP: Record<string, React.ComponentType<{ onWin: () => void; onClose: () => void }>> = {
  "click-frenzy":    ClickFrenzy,
  "memory-match":    MemoryMatch,
  "snake-run":       SnakeGame,
  "word-blast":      WordBlast,
  "reflex-rush":     ReflexRush,
  "aim-trainer":     AimTrainer,
  "sequence-memory": SequenceMemory,
  "color-match":     ColorMatch,
}

const DIFF_COLORS: Record<string, string> = {
  Easy:   "text-green-400 bg-green-400/10 border-green-400/30",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  Hard:   "text-red-400 bg-red-400/10 border-red-400/30",
}

const REWARD_PREVIEW: Record<string, React.ReactNode> = {
  gold:       <span className="text-xs font-bold text-yellow-400">✦ Nameplate</span>,
  flame:      <span className="text-xs font-bold text-orange-400">🔥 Nameplate</span>,
  neon:       <span className="text-xs font-bold text-cyan-400">◈ Nameplate</span>,
  pixel:      <span className="text-xs font-bold text-green-400 font-mono">▶ Nameplate</span>,
  star:       <span className="text-xs font-bold text-yellow-300">⭐ PFP Ring</span>,
  lightning:  <span className="text-xs font-bold text-blue-400">⚡ PFP Ring</span>,
  crosshair:  <span className="text-xs font-bold text-red-400">🎯 PFP Ring</span>,
  aurora:     <span className="text-xs font-bold text-purple-400">🌈 PFP Ring</span>,
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
    try {
      const res = await fetch(`/api/quests/${questId}/complete`, { method: "POST" })
      if (res.ok) {
        const { decoration } = await res.json()
        setCompleted((prev) => new Set([...prev, questId]))
        setDecorations((prev) => [...prev, decoration])
        setJustWon(questId)
      }
    } finally {
      setClaiming(false)
      setActiveQuest(null)
    }
  }

  const ActiveGame = activeQuest ? GAME_MAP[activeQuest] : null
  const doneCount = completed.size

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Avatar Quests</h1>
            <p className="text-slate-400 text-sm">Beat minigames · earn unique decorations</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-white">{doneCount}<span className="text-slate-500 text-lg font-normal">/{QUESTS.length}</span></p>
          <p className="text-slate-500 text-xs">completed</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-700"
          style={{ width: `${(doneCount / QUESTS.length) * 100}%` }}
        />
      </div>

      {/* Earned decorations */}
      {decorations.length > 0 && (
        <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Your Decorations</p>
          <div className="flex flex-wrap gap-2">
            {decorations.map((d, i) => (
              <span key={i} className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                d.style === "gold"      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" :
                d.style === "flame"     ? "text-orange-400 bg-orange-400/10 border-orange-400/30" :
                d.style === "neon"      ? "text-cyan-400 bg-cyan-400/10 border-cyan-400/30" :
                d.style === "pixel"     ? "text-green-400 bg-green-400/10 border-green-400/30 font-mono" :
                d.style === "star"      ? "text-yellow-300 bg-yellow-300/10 border-yellow-300/30" :
                d.style === "lightning" ? "text-blue-400 bg-blue-400/10 border-blue-400/30" :
                d.style === "crosshair" ? "text-red-400 bg-red-400/10 border-red-400/30" :
                                          "text-purple-400 bg-purple-400/10 border-purple-400/30"
              }`}>
                {d.type === "nameplate"
                  ? (d.style === "flame" ? "🔥" : d.style === "neon" ? "◈" : d.style === "pixel" ? "▶" : "✦")
                  : (d.style === "star" ? "⭐" : d.style === "lightning" ? "⚡" : d.style === "crosshair" ? "🎯" : "🌈")
                } {d.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quest grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUESTS.map((quest) => {
          const isDone = completed.has(quest.id)
          const Icon = quest.icon
          const isNew = justWon === quest.id

          return (
            <div
              key={quest.id}
              className="quest-card relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
              style={{ "--quest-glow": quest.color + "50" } as React.CSSProperties}
            >
              {/* Color accent bar */}
              <div className="h-1 w-full" style={{ background: isDone ? "#22c55e" : `linear-gradient(90deg, ${quest.color}, ${quest.color}80)` }} />

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: quest.color + "20" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: quest.color }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${DIFF_COLORS[quest.difficulty]}`}>
                      {quest.difficulty}
                    </span>
                    {isDone && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                  </div>
                </div>

                <h3 className="text-white font-bold text-sm mb-1">{quest.name}</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">{quest.description}</p>

                <div className="flex items-center justify-between">
                  <div>{REWARD_PREVIEW[quest.rewardStyle]}</div>
                  {isDone ? (
                    <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">Done!</span>
                  ) : (
                    <button
                      onClick={() => setActiveQuest(quest.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:brightness-110 active:scale-95 text-white"
                      style={{ backgroundColor: quest.color }}
                    >
                      Play
                    </button>
                  )}
                </div>

                {isNew && (
                  <div className="mt-2 bg-green-400/10 border border-green-400/20 rounded-xl px-2 py-1.5">
                    <p className="text-green-400 text-xs font-semibold">🎉 {quest.rewardName} earned!</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Game modal */}
      {ActiveGame && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl">
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
