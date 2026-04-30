interface Decoration {
  type: string
  style: string
  name?: string
}

interface Props {
  username: string
  avatarUrl?: string | null
  decorations?: Decoration[]
  size?: "sm" | "md" | "lg"
}

const SIZE_MAP = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-sm" }

const PLAIN_RINGS: Record<string, string> = {
  star: "ring-2 ring-yellow-400 ring-offset-1 ring-offset-slate-900",
  lightning: "ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-900 animate-pulse",
  crosshair: "ring-2 ring-red-500 ring-offset-1 ring-offset-slate-900",
}

export function DecorationAvatar({ username, avatarUrl, decorations = [], size = "md" }: Props) {
  const frame = decorations.find((d) => d.type === "pfp-frame")
  const sizeClass = SIZE_MAP[size]

  const inner = (
    <div className={`rounded-full overflow-hidden bg-slate-700 shrink-0 ${sizeClass} ${frame && PLAIN_RINGS[frame.style] ? PLAIN_RINGS[frame.style] : ""}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
          {username.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )

  if (frame?.style === "aurora") {
    return (
      <div className={`relative shrink-0 aurora-ring ${sizeClass}`} style={{ borderRadius: "9999px" }}>
        {inner}
      </div>
    )
  }

  return inner
}

interface NameplateProps { style: string; name: string }

export function NameplateBadge({ style, name }: NameplateProps) {
  if (style === "gold") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 nameplate-shimmer">
        ✦ {name}
      </span>
    )
  }
  if (style === "flame") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-400/10 border border-orange-400/30 nameplate-flame">
        🔥 {name}
      </span>
    )
  }
  if (style === "neon") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 nameplate-neon">
        ◈ {name}
      </span>
    )
  }
  if (style === "pixel") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-sm bg-green-400/10 border border-green-400/30 text-green-400 font-mono tracking-wider">
        ▶ {name}
      </span>
    )
  }
  return null
}
