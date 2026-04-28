"use client"

import { useEffect, useState } from "react"

const FONTS = [
  "'Georgia', serif",
  "'Impact', sans-serif",
  "'Courier New', monospace",
  "'Arial Black', sans-serif",
  "'Times New Roman', serif",
  "'Trebuchet MS', sans-serif",
  "'Palatino Linotype', serif",
  "'Verdana', sans-serif",
  "'Garamond', serif",
  "'Book Antiqua', serif",
  "'Copperplate', fantasy",
  "'Rockwell', serif",
]

const COLORS = [
  "#f97316",
  "#fb923c",
  "#3b82f6",
  "#60a5fa",
  "#ffffff",
  "#fbbf24",
  "#ea580c",
  "#2563eb",
  "#f59e0b",
  "#93c5fd",
  "#fdba74",
  "#1d4ed8",
]

export function LokiTitle() {
  const [style, setStyle] = useState({ font: FONTS[0], color: COLORS[0] })

  useEffect(() => {
    const id = setInterval(() => {
      setStyle({
        font: FONTS[Math.floor(Math.random() * FONTS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
    }, 200)
    return () => clearInterval(id)
  }, [])

  return (
    <h1
      className="text-5xl md:text-7xl font-bold tracking-tight text-center select-none"
      style={{ fontFamily: style.font, color: style.color }}
    >
      Gamers Republic
    </h1>
  )
}
