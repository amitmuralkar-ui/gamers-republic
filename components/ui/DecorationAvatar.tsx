interface Decoration {
  type: string
  style: string
}

interface Props {
  username: string
  avatarUrl?: string | null
  decorations?: Decoration[]
  size?: "sm" | "md" | "lg"
}

const FRAME_STYLES: Record<string, string> = {
  star: "ring-2 ring-yellow-400 ring-offset-1 ring-offset-slate-900",
  lightning: "ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-900",
}

const SIZE_MAP = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-sm",
}

export function DecorationAvatar({ username, avatarUrl, decorations = [], size = "md" }: Props) {
  const frame = decorations.find((d) => d.type === "pfp-frame")
  const frameClass = frame ? (FRAME_STYLES[frame.style] ?? "") : ""
  const sizeClass = SIZE_MAP[size]

  return (
    <div className={`rounded-full overflow-hidden bg-slate-700 shrink-0 ${sizeClass} ${frameClass}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
          {username.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}

interface NameplateProps {
  style: string
  name: string
}

export function NameplateBadge({ style, name }: NameplateProps) {
  if (style === "gold") {
    return (
      <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-1.5 py-0.5 rounded-full">
        ✦ {name}
      </span>
    )
  }
  if (style === "flame") {
    return (
      <span className="text-xs font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/30 px-1.5 py-0.5 rounded-full">
        🔥 {name}
      </span>
    )
  }
  return null
}
