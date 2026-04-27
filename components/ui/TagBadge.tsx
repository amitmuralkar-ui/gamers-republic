interface TagBadgeProps {
  tag: { name: string; color: string }
  small?: boolean
}

export function TagBadge({ tag, small }: TagBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded font-bold ${small ? "px-1 py-px text-[9px]" : "px-2 py-0.5 text-xs"}`}
      style={{
        backgroundColor: tag.color + "28",
        color: tag.color,
        border: `1px solid ${tag.color}55`,
      }}
    >
      {tag.name}
    </span>
  )
}
